"""Validate and store a request in the server's in-memory collection."""
import re
from uuid import uuid4


EMAIL_PATTERN = re.compile(r"[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+")


def create(payload, records):
    if not isinstance(payload, dict):
        return 422, {"error": "Provide a title and requester details."}

    requester = payload.get("requester")
    if not isinstance(requester, dict):
        return 422, {"error": "Requester must include a name and email."}

    values = {}
    for field, label, limit, source in (
        ("title", "Title", 80, payload),
        ("name", "Requester name", 60, requester),
    ):
        value = source.get(field)
        if not isinstance(value, str):
            return 422, {"error": f"{label} must be text."}
        value = value.strip()
        if not 1 <= len(value) <= limit:
            return 422, {"error": f"{label} must be between 1 and {limit} characters."}
        values[field] = value

    email = requester.get("email")
    if not isinstance(email, str) or not EMAIL_PATTERN.fullmatch(email.strip()):
        return 422, {"error": "Requester email must be a valid email address, such as arin@example.test."}

    record = {
        "id": str(uuid4()),
        "title": values["title"],
        "requester": {"name": values["name"], "email": email.strip()},
    }
    records.append(record)
    return 201, {"request": record}
