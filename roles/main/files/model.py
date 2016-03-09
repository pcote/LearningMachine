from sqlalchemy import create_engine, MetaData, Table, Column, ForeignKey, Integer, VARCHAR, Text, TIMESTAMP, bindparam
from sqlalchemy.sql import select, and_, text
from tabledefs import user_table, exercise_table, attempt_table, exercise_deletion_table, resource_table, meta
from configparser import ConfigParser
from collections import namedtuple

cp = ConfigParser()
dir_path = __file__.rsplit("/", maxsplit=1)[0]
config_file_name = "{}/{}".format(dir_path, "config.ini")
cp.read(config_file_name)

db_section = cp["learningmachine"]
user, password = db_section.get("user"), db_section.get("password")
host, db = db_section.get("host"), db_section.get("db")
db_url = "mysql+pymysql://{}:{}@{}/{}".format(user, password, host, db)
eng = create_engine(db_url, pool_recycle=14400)


meta.create_all(bind=eng)


def user_exists(email_arg):
    """
    Verify whether or not the user exists in the system.
    :param email_arg: email identifier for the user we want to lookup.
    :return: True if the user exists.  False otherwise.
    """
    conn = eng.connect()

    query = select([user_table])\
            .where(user_table.c.email == email_arg)

    user_found = True if conn.execute(query).fetchall() else False
    conn.close()
    return user_found


def add_user(email, display_name):
    """
    Add a new user to the database.
    :param email: Email address to have act as an id for the user.
    :param display_name: Full name of the user to be added.
    :return: Nothing
    """
    conn = eng.connect()

    query = user_table.insert()\
                      .values(email=email, display_name=display_name)

    conn.execute(query)
    conn.close()


def add_exercise(question, answer, user_id):
    """
    Add a question / answer pair for a given user's topic
    :param question: Text of the question
    :param answer: Text of the answer
    :param topic_id: id number for the topic to associate with this question.
    :param user_id: user id string
    :return: Nothing
    """
    conn = eng.connect()

    query = exercise_table.insert()\
                          .values(question=question, answer=answer, user_id=user_id)

    result = conn.execute(query)
    conn.close()


def get_all_exercises(user_id):
    """
    Get every exercise for a specified user
    :param user_id: The user id of the user to get exercises for
    :return: a list of all exercises for a given user.
    """
    conn = eng.connect()

    subquery = conn.execute(select([exercise_deletion_table.c.exercise_id])).fetchall()

    user_parm = bindparam("user_id")
    query = select([exercise_table.c.id, exercise_table.c.question, exercise_table.c.answer])\
            .where(and_(exercise_table.c.user_id == user_parm,
                        text("exercises.id not in ( select exercise_id from exercise_deletions )")))

    result_set = conn.execute(query, user_id=user_id).fetchall()
    exercise_list = [dict(id=id, question=question, answer=answer) for id, question, answer in result_set]
    conn.close()
    return exercise_list


def add_attempt(exercise_id, score):
    """
    Record how well the user did in attempting an exercise
    :param exercise_id: The ID of the exercise being attempted
    :param score: Score the user gave themselves
    :return: Nothing
    """
    conn = eng.connect()
    from datetime import datetime
    now = datetime.now()
    query = attempt_table.insert()\
                         .values(exercise_id=bindparam("exercise_id", type_=Integer), score=score, when_attempted=now)
    conn.execute(query, exercise_id=exercise_id)
    conn.close()


def get_attempts(exercise_id):
    """
    Grab attempts history as they pertain to attempts on a particular exercise
    :param exercise_id: ID number for the exercise in question
    :return: History of scores and dates attemptes for that exercise as a list of dictionaries.
    """
    conn = eng.connect()

    query = select([attempt_table.c.score, attempt_table.c.when_attempted])\
            .where(attempt_table.c.exercise_id == bindparam("exercise_id", type_=Integer))

    result_records = conn.execute(query, exercise_id=exercise_id).fetchall()
    attempts = [{"score": score, "when_attempted":when_attempted.isoformat()}
                    for score, when_attempted in result_records]
    conn.close()
    return attempts


def full_attempt_history(user_id):
    """
    Get a full history on all topics, all exercises under those topics, and all attempts made.
    :param user_id: The user whose history we're looking up.
    :return: A hierarchial history list in the form of topic -> exercise -> attempts
    """

    # pull basic topic information from the database for this user..
    conn = eng.connect()

    # new version.....
    # get all exercises
    exercises_with_attempts = get_all_exercises(user_id)

    # for each exercise get the attempts for that exercise
    for exercise in exercises_with_attempts:
        attempts = get_attempts(exercise.get("id"))
        exercise.update({"attempts": attempts})

    conn.close()
    return exercises_with_attempts


def delete_exercise(user_id, exercise_id):
    """
    Submit a request to have an exercise deleted.
    :param exercise_id: ID of the exercise we're requesting to have deleted
    :return: Nothing.
    """
    conn = eng.connect()

    query = select([exercise_table.c.id]).where(and_(
        exercise_table.c.id == exercise_id,
        exercise_table.c.user_id == user_id
    ))

    is_valid_user = conn.execute(query).fetchone()

    if is_valid_user:
        from datetime import datetime
        now = datetime.now()
        query = exercise_deletion_table.insert().values(exercise_id=exercise_id, deletion_time=now)
        conn.execute(query)
        msg = "Executed deleteion query on exercise: {} belonging to user: {}".format(exercise_id, user_id)
    else:
        msg = "User: {} not the owner of exercise: {}".format(user_id, exercise_id)

    conn.close()
    return msg


def add_resource(caption, url, user_id):
    """
    Add a clickable resource to the data store
    :param caption: The text to show up for the user to click on.
    :param url: Where clicking the text takes you.
    :param user_id: Who owns this link.
    :return: Nothing.
    """
    conn = eng.connect()

    query = resource_table.insert().values(caption=caption, url=url, user_id=user_id)
    conn.execute(query)
    conn.close()
    msg = ""
    return msg

def get_resources(user_id):
    """
    Get all resources connected to a specific user
    :param user_id: ID of the user whose resources we wish to find.
    :return: A list of all the exercises owned by this user
    """
    conn = eng.connect()
    user_id_parm = bindparam("user_id")
    query = select([resource_table])\
        .where(resource_table.c.user_id == user_id_parm)
    result = conn.execute(query, user_id=user_id)
    resources = [dict(resource_id=resource_id, user_id=user_id, caption=caption, url=url)
                    for resource_id, caption, url, user_id in result.fetchall()]
    conn.close()

    return resources

if __name__ == '__main__':
    pass