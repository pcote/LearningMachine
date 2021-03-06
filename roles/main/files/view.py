from flask import Flask, session, request, redirect, jsonify, abort, make_response
from configparser import ConfigParser
import logging
from login import LoginHandler
import model
from functools import wraps
import sys
import re
from pdb import set_trace

parser = ConfigParser()
dir_path = __file__.rsplit("/", maxsplit=1)[0]
config_file_name = "{}/{}".format(dir_path, "config.ini")
parser.read(config_file_name)

nudir = lambda mod: [x for x in dir(mod) if not x.startswith("_")]

debug_mode = parser.getboolean("learningmachine", "debug_mode")
log_level = logging.DEBUG if debug_mode else logging.INFO

app = Flask(__name__)
app.debug = debug_mode
app.logger.setLevel(log_level)
app.logger.addHandler(logging.StreamHandler(stream=sys.stdout))
app.secret_key = parser["learningmachine"]["session_key"]
fm = model.FlashmarkModel(app)

def validate_json(*expected_args):
    """
    Decorator function to validate
    :param expected_args: Individual strings representing keys that are expected to exist and turn up values for the
    passed in JSON object.
    :return: Ultimately, a wrapped function that can validate json requests and spit 400 errors if things aren't there.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            json_ob = request.get_json()
            for expected_arg in expected_args:
                if expected_arg not in json_ob or json_ob.get(expected_arg) is None:
                    print("{} expected the JSON argument {} and didn't find it.".format(func.__name__, expected_arg))
                    abort(400)
            return func(*args, **kwargs)
        return wrapper
    return decorator


@app.route("/")
def welcome_page():
    """
    Simple redirect to a basic welcome page where the user will press a button
    to start the login process.
    :return: Nothing.
    """
    return redirect("/static/welcome.html")


@app.route("/login")
def login():
    """
    Log in the user to the system using Google oauth login.
    Note: What gets done here depends on what phase of the login process we are in.
    If this is the INITIAL PHASE, then send the user to the Google login.
    If we are COMING BACK from a Google login, use the code to get the email and display name set up for the user.
    :return: An appropriate redirect (depending on what step of the login process this is.
    """
    domain = parser["learningmachine"]["domain"]
    secrets_file = "{}/{}".format(dir_path, "client_secret.json")
    scope = "https://www.googleapis.com/auth/userinfo.email"
    redirect_uri = "http://{}/login".format(domain)
    login_handler = LoginHandler(secrets_file, scope, redirect_uri)

    if "code" in request.args:
        login_handler.setup_user_info(request.args["code"])
        session["email"] = login_handler.email
        session["display_name"] = login_handler.display_name

        if not fm.user_exists(login_handler.email):
            msg = "Adding user: {} with ID of {} to the database."\
                .format(login_handler.email, login_handler.display_name)
            fm.add_user(login_handler.email, login_handler.display_name)

        msg = "Sending user: {} to main page".format(login_handler.email)
        app.logger.info(msg)
        return redirect("/static/main.html")

    else:
        msg = "No login code yet.  Letting Google handle the login process at: {}"\
                .format(login_handler.auth_url)
        app.logger.info(msg)
        return redirect(login_handler.auth_url)


@app.route("/userinfo")
def get_user_info():
    """
    Grab user info and send it back as json.
    :return: Json data about the user or else an error message if the info isn't available.
    """
    if session and session.get("email") and session.get("display_name"):
        email = session.get("email")
        display_name = session.get("display_name")
        data = dict(email=email, displayName=display_name)
        app.logger.debug("Success in getting log information on user: {} at email: {}".format(display_name, email))
        return jsonify(data)
    else:
        return jsonify(dict(email="error", display_name="Could not get info for this user"))


@app.route("/exercises")
def get_exercises():
    """
    Get a list of exercises for a specific user.
    :return: A JSON list of the exercises for this user.
    """
    email = session.get("email")
    tag_arg = request.args.get("tag")
    exercises = fm.get_all_exercises(email, tag_arg)
    msg = "Found {} exercises for {}".format(len(exercises), email)
    app.logger.info(msg)
    return jsonify(dict(exercises=exercises))


@app.route("/addscore", methods=["POST"])
@validate_json("exercise_id", "score")
def add_score():
    """
    Add the score for an attempt at an exercise.
    Expects a json structure arg with an exercise id and score for that exercise
    :return: success message to let you know that adding the attempt to the db worked out.
    """
    json_data = request.get_json()
    exercise_id = json_data.get("exercise_id")
    score = json_data.get("score")
    user_id = session.get("email")
    fm.add_attempt(exercise_id, score, user_id)

    msg = "Attempt added.  Exercise ID: {} Score: {}"\
            .format(exercise_id, score)
    app.logger.info(msg)
    return jsonify(dict(result="success"))


@app.route("/addexercise", methods=["POST"])
@validate_json("new_question", "new_answer")
def add_exercise():
    """
    Add a new exercise to the system for the user for this session
    Expects a json structure having a new_question and new_answer.
    :return:A success message stating the exercise was added.
    """
    json_data = request.get_json()
    new_question = json_data.get("new_question")
    new_answer = json_data.get("new_answer")
    user_id = session.get("email")
    try:
        fm.add_exercise(new_question, new_answer, user_id)
        msg = "Exercise added for user: {}".format(user_id)
        app.logger.info(msg)
        return jsonify({"message": "add exercise call completed"})
    except Exception as e:
        msg = "The question or the answer to be added has exceeded the max char limit"
        app.logger.error(msg)
        abort(400)


@app.route("/deleteexercise", methods=["POST"])
def delete_exercise():
    json_ob = request.get_json()
    exercise_id = json_ob.get("exercise_id")
    user_id = session.get("email")
    msg = fm.delete_exercise(user_id, exercise_id)
    app.logger.info(msg)
    return ""


@app.route("/deleteresource", methods=["POST"])
def delete_resource():
    json_ob = request.get_json()
    resource_id = json_ob.get("resource_id")
    user_id = session.get("email")
    msg = fm.delete_resource(user_id, resource_id)
    return ""


@app.route("/exercisehistory")
def get_exercise_history():
    """
    Get the user's history of attempts made on exercises
    :return: A JSON structure of the history of the user's attempts.
    """
    user_id = session.get("email")

    history = fm.full_attempt_history(user_id)

    msg = "Attempt history found for user: {}.  {} records."\
            .format(user_id, len(history))
    app.logger.info(msg)
    return jsonify({"history": history})


@app.route("/resources")
def get_resources():
    """
    Get the resources for this user.
    :return: A json list of resources
    """
    user_id = session["email"]
    resources = fm.get_resources(user_id)
    returned_val = dict(resources=resources)
    return jsonify(returned_val)


@app.route("/resourcesforexercise/<exercise_id>")
def get_resources_for_exercise(exercise_id):
    """
    Get the resources associated with the specfied exercise
    :param exercise_id: Exercise to match resource associations to.
    :return: list of resources associated to the given exercise.
    """
    user_id = session.get("email")
    resources = fm.get_resources_for_exercise(exercise_id, user_id)
    returned_val = dict(resources=resources)
    return jsonify(returned_val)


@app.route("/addresource", methods=["POST"])
def add_resource():
    user_id = session["email"]
    json_data = request.get_json()
    new_caption = json_data["new_caption"]
    new_url = json_data["new_url"]
    exercise_id = json_data["exercise_id"]
    try:
        fm.add_resource(new_caption, new_url, user_id, exercise_id)
        return "FINISHED"
    except Exception as e:
        abort(400)


@app.route("/changetags", methods=["POST"])
def change_tags():
    try:
        user_id = session.get("email")
        json_data = request.get_json()
        if None in [user_id, json_data]:
            raise Exception("user id and/or json data required when changing tags.  One of these is missing")

        tag_list, exercise_id = json_data.get("tag_changes"), json_data.get("exercise_id")
        tag_list = tag_list if tag_list else ""

        if exercise_id is None:
            raise Exception("I find your lack of exercise id when trying to change tags disturbing!")

        fm.change_tags(tag_list, user_id, exercise_id)
        return "tag changes done."
    except Exception as e:
        reason, *_ = e.args
        response_400 = make_response(reason, 400)
        return response_400


@app.route("/suggestname", methods=["GET"])
def suggest_name():
    try:
        learning_resource_url = request.args.get("url")
        suggested_name = model.suggest_name(learning_resource_url)
        return suggested_name
    except Exception as e:
        err_reason, *_ = e.args
        err_msg = "/suggestname failed. reason: {}".format(err_reason)
        res = make_response(err_msg, 400)
        return res

if __name__ == '__main__':
    pass
    #app.run(debug=False)
