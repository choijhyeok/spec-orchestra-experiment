import unittest

from features.create_api import create


def payload(title="Valid", name="Jun", email="jun@example.test"):
    return {"title": title, "requester": {"name": name, "email": email}}


class CreateTests(unittest.TestCase):
    def test_creation_trims_v2_fields_generates_ids_and_retains_records(self):
        seed = {"id": "seed-1", **payload("Existing", "Mina", "mina@example.test")}
        records = [seed]
        first_status, first = create(payload(" New request ", " Jun ", " jun@example.test "), records)
        second_status, second = create(payload(), records)
        self.assertEqual((first_status, second_status), (201, 201))
        self.assertEqual(first["request"]["title"], "New request")
        self.assertEqual(first["request"]["requester"], {"name": "Jun", "email": "jun@example.test"})
        self.assertEqual(set(first["request"]), {"id", "title", "requester"})
        self.assertTrue(first["request"]["id"])
        self.assertNotEqual(first["request"]["id"], second["request"]["id"])
        self.assertEqual(records, [seed, first["request"], second["request"]])

    def test_boundary_lengths_unicode_and_html_remain_text(self):
        for title, name in (("a", "b"), ("한" * 80, "나" * 60), ('<img src=x onerror="alert(1)">', "<b>Jun</b>")):
            with self.subTest(title=title):
                status, body = create(payload(title, name), [])
                self.assertEqual(status, 201)
                self.assertEqual(body["request"]["title"], title)
                self.assertEqual(body["request"]["requester"]["name"], name)

    def test_invalid_v2_and_legacy_payloads_never_mutate_records(self):
        invalid = [None, [], "text", 1, True, {}, {"title": "ok"}, {"title": "Legacy", "contact": "Jun"}]
        for value in (None, [], "Jun", 1, True, {}):
            invalid.append({"title": "Valid", "requester": value})
        for field, limit in (("title", 80), ("name", 60)):
            for value in (None, 1, True, [], {}, "", " ", "x" * (limit + 1)):
                item = payload()
                if field == "title":
                    item["title"] = value
                else:
                    item["requester"]["name"] = value
                invalid.append(item)
        for value in (None, 1, True, [], {}, "", " ", "arin", "@example.test", "arin@", "arin@example", "a b@example.test", "arin@example .test", "a@@example.test", "a@.test", "a@example."):
            invalid.append(payload(email=value))
        for field in ("name", "email"):
            missing = payload()
            del missing["requester"][field]
            invalid.append(missing)
        for item in invalid:
            with self.subTest(payload=item):
                records = [{"id": "keep"}]
                status, body = create(item, records)
                self.assertEqual(status, 422)
                self.assertIsInstance(body["error"], str)
                self.assertTrue(body["error"])
                self.assertEqual(records, [{"id": "keep"}])


if __name__ == "__main__":
    unittest.main()
