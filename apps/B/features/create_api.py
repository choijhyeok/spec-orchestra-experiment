"""Validate and create requests in the server's in-memory collection."""
import re
from uuid import uuid4


EMAIL = re.compile(r"[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)+")


def create(payload, records):
    if not isinstance(payload, dict):
        return 422, {"error": "Provide a title and requester name and email."}

    requester = payload.get("requester")
    if not isinstance(requester, dict):
        return 422, {"error": "Provide requester name and email."}
    values = {}
    for field, value, label, limit in (
        ("title", payload.get("title"), "Title", 80),
        ("name", requester.get("name"), "Requester name", 60),
    ):
        if not isinstance(value, str) or not 1 <= len(value.strip()) <= limit:
            return 422, {"error": f"{label} must contain 1–{limit} characters."}
        values[field] = value.strip()

    email = requester.get("email")
    if not isinstance(email, str) or not EMAIL.fullmatch(email.strip()):
        return 422, {"error": "Enter a valid requester email, such as arin@example.test."}
    request = {
        "id": str(uuid4()),
        "title": values["title"],
        "requester": {"name": values["name"], "email": email.strip()},
    }
    records.append(request)
    return 201, {"request": request}
