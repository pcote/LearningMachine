from sqlalchemy import create_engine, MetaData, Table, Column, ForeignKey, Integer, VARCHAR, Text, TIMESTAMP, String, bindparam, DateTime
from sqlalchemy.sql import select, and_, text
from tabledefs import user_table, exercise_table, attempt_table, resource_table, resource_by_exercise_table, meta
from configparser import ConfigParser
from collections import namedtuple

CHARACTER_LIMIT = 140

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

    if len(question) > CHARACTER_LIMIT or len(answer) > CHARACTER_LIMIT:
        msg = "Either the new question or new answer exceeded char limit of {} chars".format(CHARACTER_LIMIT)
        raise Exception(msg)

    conn = eng.connect()
    with conn.begin() as trans:
        diff = get_new_difficulty(conn, user_id)
        query = exercise_table.insert()\
                          .values(question=question, answer=answer, difficulty=diff, user_id=user_id)
        result = conn.execute(query)
        trans.commit()
    conn.close()


def get_all_exercises(user_id, tag_arg=None):
    """
    Get all the exercises along with the thing tags that are associated with them.
    :param user_id: The ID of the user we're looking up exercises for.
    :return:: A list of exercise info including all the tags that this exercise is connected to.
    """
    from itertools import groupby, tee

    query_str = """select e.id, e.question, e.answer, e.difficulty, group_concat(ebet.tag_name)
                    from exercises as e
                    left join exercises_by_exercise_tags as ebet
                    on e.id = ebet.exercise_id
                    where e.user_id = :uid
                    group by e.id
                    order by e.id"""
    query = text(query_str)
    conn = eng.connect()
    record_set = conn.execute(query, uid=user_id).fetchall()

    exercise_list = []
    for id, question, answer, difficulty, tag_group in record_set:
        tags = tag_group.split(",") if tag_group else []
        exercise = dict(id=id, question=question, answer=answer, difficulty=difficulty, tags=tags)
        exercise_list.append(exercise)

    if tag_arg:
        exercise_list = [exercise for exercise in exercise_list if tag_arg in exercise["tags"]]
    return exercise_list


def add_attempt(exercise_id, score, user_id):
    """
    Record how well the user did in attempting an exercise
    :param exercise_id: The ID of the exercise being attempted
    :param score: Score the user gave themselves
    :return: Nothing
    """
    BAD, OKAY, GOOD = 1, 2, 3
    conn = eng.connect()
    from datetime import datetime
    now = datetime.now()
    exercise_parm = bindparam("exercise_id", type_=Integer)
    score_parm = bindparam("score", type_=Integer)

    with conn.begin() as trans:
        query = attempt_table.insert()\
                             .values(exercise_id=exercise_parm, score=score_parm, when_attempted=now)
        conn.execute(query, exercise_id=exercise_id, score=score)

        if score == BAD:
            diff = get_new_difficulty(conn, user_id)
            query = text("update exercises set difficulty = :d where user_id = :uid and id = :eid")
            conn.execute(query, d=diff, uid=user_id, eid=exercise_id)

        trans.commit()

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

    exercise_parm = bindparam("exercise_id", type_=Integer)
    user_parm = bindparam("user_id", type_=String)

    query = select([exercise_table.c.id]).where(and_(
        exercise_table.c.id == exercise_parm,
        exercise_table.c.user_id == user_parm
    ))

    is_valid_user = conn.execute(query, exercise_id=exercise_id, user_id=user_id).fetchone()

    if is_valid_user:
        with conn.begin() as trans:
            query = attempt_table.delete().where(attempt_table.c.exercise_id == exercise_parm)
            conn.execute(query, exercise_id=exercise_id)

            query = resource_by_exercise_table.delete().where(resource_by_exercise_table.c.exercise_id == exercise_parm)
            conn.execute(query, exercise_id=exercise_id)

            query = exercise_table.delete().where(exercise_table.c.id == exercise_parm)
            conn.execute(query, exercise_id=exercise_id)
            trans.commit()

        msg = "Executed deleteion query on exercise: {} belonging to user: {}".format(exercise_id, user_id)
    else:
        msg = "User: {} not the owner of exercise: {}".format(user_id, exercise_id)

    conn.close()
    return msg


def delete_resource(user_id, resource_id):
    conn = eng.connect()

    user_parm = bindparam("user_id", type_=String)
    resource_parm = bindparam("resource_id", type_=Integer)

    query = select([resource_table.c.id]).where(and_(
        resource_table.c.id == resource_parm,
        resource_table.c.user_id == user_parm
    ))

    is_valid_user = conn.execute(query, user_id=user_id, resource_id=resource_id).fetchone()

    if is_valid_user:
        with conn.begin() as trans:
            query = resource_by_exercise_table.delete().where(resource_by_exercise_table.c.resource_id == resource_parm)
            conn.execute(query, resource_id=resource_id)

            query = resource_table.delete().where(resource_table.c.id == resource_parm)
            conn.execute(query, resource_id=resource_id)
            trans.commit()

    conn.close()
    return "FINISHED"

def add_resource(caption, url, user_id, exercise_id=None):
    """
    Add a clickable resource to the data store
    :param caption: The text to show up for the user to click on.
    :param url: Where clicking the text takes you.
    :param user_id: Who owns this link.
    :param exercise_id The exercise that this resource refers to.
    :return: Nothing.
    """

    if len(caption) > CHARACTER_LIMIT or len(url) > CHARACTER_LIMIT:
        msg = "Either new caption or new url exceeded char limit of {} chars".format(CHARACTER_LIMIT)
        raise Exception(msg)

    caption_parm = bindparam("caption", type_=String)
    url_parm = bindparam("url", type_=String)
    user_parm = bindparam("user_id", type_=String)
    exercise_parm = bindparam("exercise_id", type_=Integer)

    conn = eng.connect()

    with conn.begin() as trans:
        query = resource_table.insert().values(caption=caption_parm, url=url_parm, user_id=user_parm)
        result = conn.execute(query, caption=caption, url=url, user_id=user_id)
        new_resource_id = result.inserted_primary_key[0]

        query = resource_by_exercise_table.insert().values(exercise_id=exercise_parm, resource_id=new_resource_id)
        conn.execute(query, exercise_id=exercise_id, user_id=user_id)
        trans.commit()

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

def get_resources_for_exercise(exercise_id, user_id):
    """
    Get all resources connected to the given exercise
    :param exercise_id: ID of the exercise in question
    :param user_id: Owning user
    :return: A list the appropriate resources.
    """

    conn = eng.connect()
    user_id_parm = bindparam("user_id")
    exercise_parm = bindparam("exercise_id")

    query = select([resource_table.c.id, resource_table.c.caption, resource_table.c.url, resource_table.c.user_id])\
                .select_from(resource_table.join(resource_by_exercise_table ))\
                .where(and_(resource_table.c.user_id == user_id_parm,
                            resource_by_exercise_table.c.exercise_id == exercise_parm))

    result = conn.execute(query, user_id=user_id, exercise_id=exercise_id)
    resources = [dict(resource_id=resource_id, user_id=user_id, caption=caption, url=url)
                    for resource_id, caption, url, user_id in result.fetchall()]
    conn.close()

    return resources

def get_new_difficulty(conn, user_id):
    """
    Support function that comes up with a number higher than any difficulty rating on any question the user has.
    :param conn: The database connection.
    :param user_id: ID of the user
    :return:
    """
    query = text("select max(difficulty) from exercises where user_id = :uid")
    diff, *_ = conn.execute(query, uid=user_id).fetchall()[0]
    if diff:
        diff += 1
    else:
        diff = 1
    return diff


def set_exercise_most_difficult(exercise_id, user_id):
    """
    Designate this exercise as the one with the highest difficulty rating of all exercises the user has.
    :param exercise_id: Number of the exercise in question.
    :param user_id: The ID of the user.
    :return: Nothing.
    """
    conn = eng.connect()
    with conn.begin() as trans:
        diff = get_new_difficulty(conn, user_id)
        query = text("update exercises set difficulty = :d where user_id = :uid and id = :eid")
        conn.execute(query, d=diff, uid=user_id, eid=exercise_id)
        trans.commit()


def __get_stored_tags(conn, user_id=None, exercise_id=None):
    if user_id is None and exercise_id is None:
        raise Exception("Getting stored tags requires either a user or an exercise. Neither were given.")

    user_tags_query = text("select name from exercise_tags where user_id = :uid")
    exercise_tags_query = text("select tag_name from exercises_by_exercise_tags where exercise_id = :eid")

    if exercise_id:
        res = conn.execute(exercise_tags_query, eid=exercise_id)
    else:
        res = conn.execute(user_tags_query, uid=user_id)

    tag_list = [t for t, *_ in res]
    return tag_list


def __should_add_tag(conn, tag_name, user_id):
    """
    Determined whether to add the tag to the system based on whether or not it's already there.
    :param conn: The database connection.
    :param tag_name: The tag to look up.
    :param user_id: The ID of the user that we're looking up stored tags for.
    :return: True if the tag needs to be added or False if it's already in there.
    """
    query = text("select name from exercise_tags where user_id = :uid")
    res = conn.execute(query, uid=user_id)
    stored_tag_list = [tag for tag, *_ in res.fetchall()]
    if tag_name in stored_tag_list:
        return False
    else:
        return True


def __get_tags_to_change(conn, tag_list, exercise_id):
    """
    Gets tags to be removed and tags to be added for the exercise.
    :param conn: Database connection.
    :param tag_list: List of tags in list format.
    :param exercise_id: ID of the exercise in question.
    :return: 2 named tuples, one for tags to associate with the exercise and the other to un-associate.
    """
    stored_tags = __get_stored_tags(conn, exercise_id=exercise_id)
    tags_to_connect = list(set(tag_list).difference(set(stored_tags)))
    tags_to_disconnect = list(set(stored_tags).difference(set(tag_list)))

    TagsToChange = namedtuple("TagsToChange", ["tags_to_connect", "tags_to_disconnect"])
    return TagsToChange(tags_to_connect, tags_to_disconnect)


def change_tags(tag_list, user_id, exercise_id):
    """
    Change the tags that are to be associated with this exercise.
    :param tag_list: The new list of tags to be associated with the exercise.  Passed in in string format, NOT list.
    :param user_id: ID of the user that owns the exercise.
    :param exercise_id: ID of the exercise to have it's tag associations updated.
    :return: Nothing.
    """

    def __all_tags_valid(tag_candidates):
        import re
        patt = r"^\w+$"
        for tag in tag_candidates:
            if not re.match(patt, tag):
                return False
        return True

    tags = tag_list.split()
    if not __all_tags_valid(tags):
        raise Exception("Tags are supposed to be made up of only numbers, letters, and underscores")
    conn = eng.connect()

    with conn.begin() as trans:
        for tag in tags:
            if __should_add_tag(conn, tag, user_id):
                query = text("insert into exercise_tags values(:new_tag, :uid)")
                conn.execute(query, new_tag=tag, uid=user_id)

        tags_to_connect, tags_to_disconnect = __get_tags_to_change(conn, tags, exercise_id)

        for tag in tags_to_connect:
            query = text("insert into exercises_by_exercise_tags values( :eid, :tag, :uid)")
            conn.execute(query, eid=exercise_id, tag=tag, uid=user_id)

        for tag in tags_to_disconnect:
            query = text("delete from exercises_by_exercise_tags where exercise_id = :eid and tag_name = :tag and user_id = :uid")
            conn.execute(query, eid=exercise_id, tag=tag, uid=user_id)

        trans.commit()



if __name__ == '__main__':
    pass