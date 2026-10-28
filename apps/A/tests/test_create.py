import copy
import unittest

from features.create_api import create


class CreateRequestTests(unittest.TestCase):
    def setUp(self):
        self.seed = {"id": "seed-1", "title": "Existing request", "requester": {"name": "Mina Park", "email": "mina@example.test"}}
        self.records = [copy.deepcopy(self.seed)]

    def payload(self):
        return {"title": "Review copy", "requester": {"name": "Mina Park", "email": "mina@example.test"}}

    def assert_rejected(self, payload):
        status, body = create(payload, self.records)
        self.assertEqual(status, 422)
        self.assertIsInstance(body["error"], str)
        self.assertTrue(body["error"])
        self.assertEqual(self.records, [self.seed])

    def test_creates_trimmed_v2_request_with_server_generated_unique_id(self):
        payload = {"title": "  Review copy  ", "requester": {"name": " Mina Park ", "email": " mina@example.test "}, "id": "client-id", "contact": "Legacy ignored"}
        status, body = create(payload, self.records)
        self.assertEqual(status, 201)
        record = body["request"]
        self.assertEqual(record["title"], "Review copy")
        self.assertEqual(record["requester"], {"name": "Mina Park", "email": "mina@example.test"})
        self.assertEqual(set(record), {"id", "title", "requester"})
        self.assertIsInstance(record["id"], str)
        self.assertTrue(record["id"])
        self.assertNotIn(record["id"], ("client-id", "seed-1"))
        self.assertEqual(self.records, [self.seed, record])
        _, second = create(self.payload(), self.records)
        self.assertNotEqual(record["id"], second["request"]["id"])

    def test_accepts_inclusive_character_limits_and_unicode(self):
        for title, name in (("a", "b"), ("a" * 80, "b" * 60), ("😀" * 80, "박" * 60)):
            with self.subTest(title=title):
                payload = self.payload()
                payload["title"] = title
                payload["requester"]["name"] = name
                status, body = create(payload, self.records)
                self.assertEqual(status, 201)
                self.assertEqual(body["request"]["title"], title)
                self.assertEqual(body["request"]["requester"]["name"], name)

    def test_rejects_invalid_title_and_name_without_mutation(self):
        for field, limit in (("title", 80), ("name", 60)):
            for invalid in (None, 0, False, [], {}, "", " \t\n ", "x" * (limit + 1)):
                with self.subTest(field=field, value=invalid):
                    payload = self.payload()
                    source = payload if field == "title" else payload["requester"]
                    source[field] = invalid
                    self.assert_rejected(payload)

    def test_rejects_non_object_missing_nested_fields_and_legacy_payload(self):
        payloads = [None, [], "text", 42, True, {}, {"title": "Only title"}, {"title": "Old request", "contact": "Mina Park"}]
        for requester in (None, [], "Mina Park", 0, True, {}, {"name": "Mina Park"}, {"email": "mina@example.test"}):
            payloads.append({"title": "Valid title", "requester": requester})
        payloads.append({"requester": {"name": "Mina Park", "email": "mina@example.test"}})
        for payload in payloads:
            with self.subTest(payload=payload):
                self.assert_rejected(payload)

    def test_rejects_invalid_email_types_and_basic_shapes(self):
        for email in (None, 0, False, [], {}, "", " ", "arin", "@example.test", "arin@", "arin@example", "arin@@example.test", "arin @example.test", "arin@exam ple.test", "arin@example. test", "arin@.test", "arin@example.", "arin@example..test", "arin\n@example.test"):
            with self.subTest(email=email):
                payload = self.payload()
                payload["requester"]["email"] = email
                self.assert_rejected(payload)

    def test_accepts_basic_email_variants_and_trims_whitespace(self):
        for email in (" arin@example.test ", "a+b@sub.example.test", "Arin@EXAMPLE.TEST"):
            with self.subTest(email=email):
                payload = self.payload()
                payload["requester"]["email"] = email
                status, body = create(payload, self.records)
                self.assertEqual(status, 201)
                self.assertEqual(body["request"]["requester"]["email"], email.strip())

    def test_preserves_html_as_plain_data(self):
        payload = {"title": '<img src=x onerror="alert(1)">', "requester": {"name": '<script>alert(2)</script>', "email": "safe@example.test"}}
        status, body = create(payload, self.records)
        self.assertEqual(status, 201)
        self.assertEqual(body["request"]["title"], payload["title"])
        self.assertEqual(body["request"]["requester"], payload["requester"])


if __name__ == "__main__":
    unittest.main()
