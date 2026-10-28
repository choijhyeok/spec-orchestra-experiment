"""Read and search the server's in-memory requests."""


def list_requests(query, records):
    """Return requests matching the first q parameter, preserving stored order."""
    search = query.get("q", [""])[0].casefold()
    matches = [
        record
        for record in records
        if search in record["title"].casefold()
        or search in record["requester"]["name"].casefold()
        or search in record["requester"]["email"].casefold()
    ]
    return 200, {"requests": matches}
