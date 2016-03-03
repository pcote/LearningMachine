import unittest
from unittest.mock import MagicMock
from view import app
import json
from pdb import set_trace

class ViewTestCase(unittest.TestCase):
    def setUp(self):
        self.test_user_id = "dummyuser@somewhere.com"
        self.test_display_name = "Dummy User"


    def get_json(self, res):
        raw_data = res.data
        string_data = raw_data.decode()
        json_ob = json.loads(string_data)
        return json_ob


    def testWelcomePage(self):
        with app.test_client() as client:
            res = client.get("/")
            self.assertTrue("302" in res.status)


    def testUserInfo(self):

        with app.test_client() as client:
            with client.session_transaction() as sess:
                sess["email"] = self.test_user_id
                sess["display_name"] = self.test_display_name

            res = client.get("/userinfo")
            json_data = self.get_json(res)
            print(json_data)
            self.assertIn("displayName", json_data)
            self.assertIn("email", json_data)
            self.assertEqual(self.test_user_id, json_data["email"])
            self.assertEqual(self.test_display_name, json_data["displayName"])



    def testExerciseHistory(self):
        with app.test_client() as client:
            with client.session_transaction() as sess:
                sess["email"] = self.test_user_id

            result = client.get("/exercisehistory")
            json_data = self.get_json(result)
            print(json_data)
            self.assertIsNotNone(json_data, "There should be json data here, not a none value")
            self.assertTrue("history" in json_data, "There should be a history key in the json")

    def tearDown(self):
        pass

if __name__ == '__main__':
    unittest.main()
