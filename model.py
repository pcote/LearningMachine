from sqlalchemy import create_engine, MetaData, Table, Column, ForeignKey, Integer, VARCHAR, Text, TIMESTAMP, bindparam
from sqlalchemy.sql import select, and_
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
eng = create_engine(db_url)
meta = MetaData()

user_table = Table("users", meta,
                   Column("email", VARCHAR(255), primary_key=True),
                   Column("display_name", Text))

tag_table = Table("tags", meta,
                  Column("id", Integer, primary_key=True, autoincrement=True),
                  Column("name", VARCHAR(140)),
                  Column("user_id", ForeignKey("users.email")))

topic_table = Table("topics", meta,
                    Column("id", Integer, primary_key=True, autoincrement=True),
                    Column("name", VARCHAR(140)),
                    Column("user_id", ForeignKey("users.email")))



exercise_table = Table("exercises", meta,
                       Column("id", Integer, primary_key=True, autoincrement=True),
                       Column("question", Text),
                       Column("answer", Text),
                       Column("user_id", ForeignKey("users.email")))

attempt_table = Table("attempts", meta,
                      Column("id", Integer, primary_key=True, autoincrement=True),
                      Column("score", Integer),
                      Column("when_attempted", TIMESTAMP),
                      Column("exercise_id", ForeignKey("exercises.id")))


tag_by_topic_table = Table("tags_by_topic", meta,
                           Column("tag_id", ForeignKey("tags.id"), primary_key=True),
                           Column("topic_id", ForeignKey("topics.id"), primary_key=True))


exercise_by_topic_table = Table("exercises_by_topic", meta,
                                Column("exercise_id", ForeignKey("exercises.id"), primary_key=True),
                                Column("topic_id", ForeignKey("topics.id"), primary_key=True))


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

    result = conn.execute(query).fetchall()
    return True if result else False


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


def get_tags(user_id):
    """
    Get the full list of tags created by this user
    :param user_id: email address of the user to grab tags for.
    :return: A list of tags with their associated IDs
    """
    conn = eng.connect()

    query = select([tag_table.c.id, tag_table.c.name])\
            .where(tag_table.c.user_id == user_id)

    results = conn.execute(query).fetchall()
    tags = [{"id": id, "name": name} for id, name in results]
    return tags


def get_tag_id(tag_name, user_id):
    """
    Utility function to map tag names to tag id numbers.  Specific to a given user.
    :param tag_name: Name of the tag in question (case sensitve)
    :param user_id: Identifier for the user
    :return: Record number id associated with the tag in question for this user.
    """
    conn = eng.connect()

    query = select([tag_table.c.id])\
            .where(and_(
                        tag_table.c.name == tag_name,
                        tag_table.c.user_id == user_id))

    result, *_ = conn.execute(query).fetchone()
    return result


def get_tag_info(tag_id, user_id):
    conn = eng.connect()

    query = select([tag_table.c.id, tag_table.c.name])\
            .where(and_(
                        tag_table.c.id == bindparam("tag_id", type_=Integer),
                        tag_table.c.user_id == user_id))

    id, name = conn.execute(query, tag_id=tag_id).fetchone()
    return dict(id=id, name=name)


def get_topic_id(topic_name, user_id):
    """
    Utility function to map topic names to topic id numbers.  Specific to a given user.
    :param topic_name: Name of the topic in queestion. (case sensitive)
    :param user_id: Identifier for the user
    :return: Record number id associated with the topic name for the specified user.
    """
    conn = eng.connect()

    query = select([topic_table.c.id])\
            .where(and_(
                        topic_table.c.name == topic_name,
                        topic_table.c.user_id == user_id))

    result, *_ = conn.execute(query).fetchone()
    return result


def add_topic(topic_name, user_id, tags=None):
    """
    Make sure that the topic and whatever associated tags go in there are in the system.
    :param topic_name: The name of the topic to add to the database
    :param tags: A list of tag strings (if any)
    :return: Nothing.
    """

    def __tag_in_system(conn, tag, user_id):

        query = select([tag_table])\
                .where(and_(
                            tag_table.c.name == tag,
                            tag_table.c.user_id == user_id))

        return True if conn.execute(query).fetchall() else False

    def __add_tag(conn, tag, user_id):
        query = tag_table.insert()\
                         .values(name=tag, user_id=user_id)
        conn.execute(query)

    def __assoc_exists(conn, tag, topic):
        tag_id = get_tag_id(tag, user_id)
        topic_id = get_topic_id(topic, user_id)
        assoc_query = select([tag_by_topic_table.c.tag_id])\
                      .where(and_(
                                tag_by_topic_table.c.tag_id == tag_id,
                                tag_by_topic_table.c.topic_id == topic_id))

        result = conn.execute(assoc_query).fetchall()
        return True if result else False

    def __add_assoc(conn, tag_id, topic_id):
        query = tag_by_topic_table.insert()\
                                  .values(tag_id=tag_id, topic_id=topic_id)
        conn.execute(query)

    def __topic_exists(conn, topic, user_id):
        # find out if the topic is in the table already.
        query = select([topic_table])\
                .where(and_(topic_table.c.name == topic_name,
                        topic_table.c.user_id == user_id))

        topics_in_system = conn.execute(query).fetchall()
        return True if topics_in_system else False

    def __add_topic(topic_name, user_id):
        query = topic_table.insert()\
                           .values(name=topic_name, user_id=user_id)

        conn.execute(query)

    tags = [] if None else tags
    conn = eng.connect()

    # Put topic in topic table.
    if not __topic_exists(conn, topic_name, user_id):
        __add_topic(topic_name, user_id)

    # Put tags that AREN'T already in the tag table into the tag table.
    for tag in tags:
        if not __tag_in_system(conn, tag, user_id):
            __add_tag(conn, tag, user_id)

    # Enter the association into the system for cases where the association doesn't already exist.
    for tag in tags:
        if not __assoc_exists(conn, tag, topic_name):
            tag_id = get_tag_id(tag, user_id)
            topic_id = get_topic_id(topic_name, user_id)
            __add_assoc(conn, tag_id, topic_id)


def get_topics_by_tag(tag_id, user_id):
    """
    Get topics connected to a given tag as pertains to a specific user
    :param tag_id: ID number of the tag
    :param user_id: identifier for the user
    :return: A list of topics that are connected with a certain tag and user
    """
    conn = eng.connect()
    query = select([topic_table.c.id, topic_table.c.name])\
        .select_from(topic_table.join(tag_by_topic_table))\
        .where(and_(
                topic_table.c.user_id == user_id,
                tag_by_topic_table.c.tag_id == bindparam("tag_id", type_=Integer)))

    results = conn.execute(query, tag_id=tag_id).fetchall()
    topics = [dict(id=topic_id, name=topic_name) for topic_id, topic_name in results]
    return topics


def add_exercise(question, answer, topic_id, user_id):
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
    exercise_id = result.inserted_primary_key[0]

    assoc_query = exercise_by_topic_table.insert()\
                                         .values(exercise_id=exercise_id, topic_id=bindparam("topic_id", type_=Integer))
    conn.execute(assoc_query, topic_id=topic_id)
    return


def get_exercises(topic_id, user_id):
    """
    Get exercises that are setup for a given topic and user
    :param topic_id: Database id for the topic
    :param user_id: ID for the user
    :return: List of exercises complete with exercise id, question, and answer.
    """
    conn = eng.connect()

    # join between exercise and exercise-by-topic needed
    # to specify to only topic-relevant exercises
    query = select([exercise_table.c.id, exercise_table.c.question, exercise_table.c.answer])\
                    .select_from(exercise_table.join(exercise_by_topic_table))\
                        .where(and_(
                                exercise_by_topic_table.c.topic_id == bindparam("topic_id", type_=Integer),
                                exercise_table.c.user_id == user_id))

    result_set = conn.execute(query, topic_id=topic_id).fetchall()
    exercise_list = [dict(id=id, question=question, answer=answer)
                     for id, question, answer in result_set]
    return exercise_list


def get_all_exercises(user_id):
    """
    Get every exercise for a specified user
    :param user_id: The user id of the user to get exercises for
    :return: a list of all exercises for a given user.
    """
    conn = eng.connect()
    user_parm = bindparam("user_id")
    query = select([exercise_table.c.id, exercise_table.c.question, exercise_table.c.answer])\
            .where(exercise_table.c.user_id == user_parm)

    result_set = conn.execute(query, user_id=user_id).fetchall()
    exercise_list = [dict(id=id, question=question, answer=answer) for id, question, answer in result_set]
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


def get_topic_name(topic_id, user_id):
    """
    Get the name of the topic connected to the topic id for that user
    :param topic_id: id number of the topic
    :param user_id: id for the user. (there to ensure the user owns this topic)
    :return: topic name as a simple string
    """
    conn = eng.connect()
    query = select([topic_table.c.name])\
            .where(and_(topic_table.c.id == bindparam("topic_id", type_=Integer),
                        topic_table.c.user_id == user_id))

    results = conn.execute(query, topic_id=topic_id).fetchone()
    topic_name = list(results)[0]
    return topic_name


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
    attempts = [{"score": score, "when_attempted":when_attempted}
                    for score, when_attempted in result_records]
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

    return exercises_with_attempts


if __name__ == '__main__':
    pass