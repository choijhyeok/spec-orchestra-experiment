#!/usr/bin/env python3
"""Local synthetic fixture. No external dependencies or disk persistence."""
import argparse
import importlib
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
RECORDS = json.loads((ROOT / "seed.json").read_text())

class Handler(BaseHTTPRequestHandler):
    def json_response(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        route = urlparse(self.path)
        if route.path == "/api/requests":
            try:
                feature = importlib.import_module("features.list_api")
            except ModuleNotFoundError:
                return self.json_response(501, {"error": "List not implemented"})
            return self.json_response(*feature.list_requests(parse_qs(route.query), RECORDS))
        if route.path == "/":
            self.send_response(302)
            self.send_header("Location", "/requests")
            self.end_headers()
            return
        relative = route.path.lstrip("/")
        if relative in ("create", "requests", "baseline"):
            relative += ".html"
        path = (ROOT / "web" / relative).resolve()
        if not path.is_relative_to(ROOT / "web") or not path.is_file():
            return self.send_error(404)
        data = path.read_bytes()
        self.send_response(200)
        mime = {".html": "text/html", ".css": "text/css", ".js": "text/javascript"}.get(path.suffix, "application/octet-stream")
        self.send_header("Content-Type", mime + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if urlparse(self.path).path != "/api/requests":
            return self.send_error(404)
        try:
            payload = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
        except (ValueError, json.JSONDecodeError):
            return self.json_response(400, {"error": "Invalid JSON"})
        try:
            feature = importlib.import_module("features.create_api")
        except ModuleNotFoundError:
            return self.json_response(501, {"error": "Create not implemented"})
        return self.json_response(*feature.create(payload, RECORDS))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, required=True)
    args = parser.parse_args()
    server = HTTPServer(("127.0.0.1", args.port), Handler)
    print("Request Desk on http://127.0.0.1:%s" % args.port, flush=True)
    server.serve_forever()
