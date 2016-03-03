import unittest
from unittest.mock import MagicMock
from view import app
import json

class ViewTestCase(unittest.TestCase):
    def setUp(self):
        pass

    def get_json(self, res):
        raw_data = res.data
        string_data = raw_data.decode()
        json_ob = json.loads(string_data)
        return json_ob


    def testExerciseHistory(self):
        test_user_id = "dummyuser@email.com"
        with app.test_client() as client:
            with client.session_transaction() as sess:
                sess["email"] = test_user_id

            result = client.get("/exercisehistory")
            json_data = self.get_json(result)
            print(json_data)
            self.assertIsNotNone(json_data, "There should be json data here, not a none value")
            self.assertTrue("history" in json_data, "There should be a history key in the json")

    def tearDown(self):
        pass

if __name__ == '__main__':
    unittest.main()
