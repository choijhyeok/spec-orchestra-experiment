import copy
import unittest

from features.list_api import list_requests


class ListRequestsTests(unittest.TestCase):
    def setUp(self):
        self.records = [
            {"id": "one", "title": "Review welcome copy", "requester": {"name": "Mina Park", "email": "mina@example.test"}},
            {"id": "two", "title": "Check mobile menu", "requester": {"name": "Jun Lee", "email": "jun@example.test"}},
            {"id": "three", "title": "Straße <script>alert(1)</script>", "requester": {"name": "담당자", "email": "html@example.test"}},
        ]

    def test_missing_and_empty_query_return_all_in_order(self):
        for query in ({}, {"q": [""]}):
            with self.subTest(query=query):
                self.assertEqual(list_requests(query, self.records), (200, {"requests": self.records}))

    def test_title_name_and_email_substrings_ignore_case(self):
        for term, expected in (("WELCOME", 0), ("ina p", 0), ("MOBILE", 1), ("LEE", 1), ("MINA@EXAMPLE", 0), ("JUN@", 1), ("STRASSE", 2), ("담당", 2)):
            with self.subTest(term=term):
                self.assertEqual(list_requests({"q": [term]}, self.records), (200, {"requests": [self.records[expected]]}))

    def test_unmatched_and_empty_records(self):
        self.assertEqual(list_requests({"q": ["absent"]}, self.records), (200, {"requests": []}))
        self.assertEqual(list_requests({}, []), (200, {"requests": []}))

    def test_search_does_not_mutate_records_or_escape_data(self):
        original = copy.deepcopy(self.records)
        self.assertEqual(list_requests({"q": ["<script>"]}, self.records)[1]["requests"], [self.records[2]])
        self.assertEqual(self.records, original)

    def test_reads_current_shared_records(self):
        added = {"id": "four", "title": "New item", "requester": {"name": "Avery", "email": "avery@example.test"}}
        self.records.append(added)
        self.assertEqual(list_requests({"q": ["avery"]}, self.records), (200, {"requests": [added]}))

    def test_v2_response_has_requester_and_no_legacy_contact(self):
        status, payload = list_requests({}, self.records)
        self.assertEqual(status, 200)
        for record in payload["requests"]:
            self.assertNotIn("contact", record)
            self.assertEqual(set(record["requester"]), {"name", "email"})


if __name__ == "__main__":
    unittest.main()
