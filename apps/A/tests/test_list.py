import copy
import unittest
from urllib.parse import parse_qs

from features.list_api import list_requests


class ListRequestsTests(unittest.TestCase):
    def setUp(self):
        self.records = [
            {"id": "seed-1", "title": "Review welcome copy", "requester": {"name": "Mina Park", "email": "mina@example.test"}},
            {"id": "seed-2", "title": "Check mobile menu", "requester": {"name": "Jun Lee", "email": "jun@example.test"}},
        ]

    def test_missing_and_empty_query_return_all_in_order(self):
        for query in ({}, {"q": [""]}, parse_qs("q=")):
            with self.subTest(query=query):
                self.assertEqual(list_requests(query, self.records), (200, {"requests": self.records}))

    def test_title_name_and_email_match_case_insensitive_substrings(self):
        for query, expected_id in (("WELCOME", "seed-1"), ("na p", "seed-1"), ("MOBILE", "seed-2"), ("UN LE", "seed-2"), ("MINA@EXAMPLE", "seed-1"), ("JUN@", "seed-2")):
            with self.subTest(query=query):
                status, payload = list_requests({"q": [query]}, self.records)
                self.assertEqual(status, 200)
                self.assertEqual([record["id"] for record in payload["requests"]], [expected_id])

    def test_no_match_and_no_records(self):
        self.assertEqual(list_requests({"q": ["unmatched"]}, self.records), (200, {"requests": []}))
        self.assertEqual(list_requests({}, []), (200, {"requests": []}))

    def test_current_memory_records_are_visible_without_mutating_them(self):
        new_record = {"id": "new", "title": "<img src=x onerror=alert(1)>", "requester": {"name": "Straße", "email": "unicode@example.test"}}
        self.records.append(new_record)
        before = copy.deepcopy(self.records)
        self.assertEqual(list_requests({"q": ["STRASSE"]}, self.records), (200, {"requests": [new_record]}))
        self.assertEqual(self.records, before)

    def test_v2_response_contains_requester_without_legacy_contact(self):
        status, payload = list_requests({"q": ["@EXAMPLE.TEST"]}, self.records)
        self.assertEqual(status, 200)
        self.assertEqual(payload, {"requests": self.records})
        for record in payload["requests"]:
            self.assertNotIn("contact", record)
            self.assertEqual(set(record["requester"]), {"name", "email"})

    def test_encoded_and_repeated_query_use_first_value(self):
        status, payload = list_requests(parse_qs("q=Mina%20Park&q=Jun"), self.records)
        self.assertEqual(status, 200)
        self.assertEqual(payload["requests"], [self.records[0]])


if __name__ == "__main__":
    unittest.main()
