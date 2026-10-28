"""Read requests from the server's shared in-memory records."""


def list_requests(query, records):
    """Return all records or a title/requester substring match, ignoring case."""
    search = query.get("q", [""])[0].casefold()
    matches = [
        record for record in records
        if not search
        or search in record["title"].casefold()
        or search in record["requester"]["name"].casefold()
        or search in record["requester"]["email"].casefold()
    ]
    return 200, {"requests": matches}
