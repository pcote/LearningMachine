from sqlalchemy import create_engine, MetaData, Table, Column, ForeignKey, Integer, VARCHAR, Text, TIMESTAMP
from sqlalchemy.sql import select, and_
from configparser import ConfigParser
from collections import namedtuple

cp = ConfigParser()
cp.read("config.ini")
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

resource_table = Table("resources", meta,
                       Column("id", Integer, primary_key=True, autoincrement=True),
                       Column("name", VARCHAR(140)),
                       Column("url", VARCHAR(2048)),
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
                      Column("exercise_id", ForeignKey("exercises.id"))
                    )


tag_by_topic_table = Table("tags_by_topic", meta,
                           Column("tag_id", ForeignKey("tags.id"), primary_key=True),
                           Column("topic_id", ForeignKey("topics.id"), primary_key=True))

resource_by_topic_table = Table("resources_by_topic", meta,
                           Column("resource_id", ForeignKey("resources.id"), primary_key=True),
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
    query = user_table.insert().values(email=email, display_name=display_name)
    conn.execute(query)


def get_tags(user_id):
    """
    Get the full list of tags created by this user
    :param user_id: email address of the user to grab tags for.
    :return: A list of tags with their associated IDs
    """
    conn = eng.connect()
    query = select([tag_table.c.id, tag_table.c.name]).where(tag_table.c.user_id == user_id)
    results = conn.execute(query).fetchall()
    tags = [{"id": id, "name": name} for id, name in results]
    return tags


def get_tag_id(tag_name, user_id):
    conn = eng.connect()
    query = select([tag_table.c.id]).where(and_(tag_table.c.name==tag_name, tag_table.c.user_id==user_id))
    result, *_ = conn.execute(query).fetchone()
    return result


def get_topic_id(topic_name, user_id):
    conn = eng.connect()
    query = select([topic_table.c.id]).where(and_(topic_table.c.name==topic_name, topic_table.c.user_id==user_id))
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
            .where(and_(tag_table.c.name == tag, tag_table.c.user_id == user_id))

        return True if conn.execute(query).fetchall() else False


    def __add_tag(conn, tag, user_id):
        query = tag_table.insert().values(name=tag, user_id=user_id)
        conn.execute(query)


    def  __assoc_exists(conn, tag, topic):
        tag_id = get_tag_id(tag, user_id)
        topic_id = get_topic_id(topic, user_id)
        assoc_query = select([tag_by_topic_table.c.tag_id])\
                .where(and_(
                    tag_by_topic_table.c.tag_id == tag_id,
                    tag_by_topic_table.c.topic_id == topic_id
        ))

        result = conn.execute(assoc_query).fetchall()
        return True if result else False


    def __add_assoc(conn, tag_id, topic_id):
        query = tag_by_topic_table.insert().values(tag_id=tag_id, topic_id=topic_id)
        conn.execute(query)

    def __topic_exists(conn, topic, user_id):
        # find out if the topic is in the table already.
        query = select([topic_table])\
            .where(and_(topic_table.c.name == topic_name,
                        topic_table.c.user_id == user_id) )

        topics_in_system = conn.execute(query).fetchall()
        return True if topics_in_system else False

    def __add_topic(topic_name, user_id):
        query = topic_table.insert().values(name=topic_name, user_id=user_id)
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


if __name__ == '__main__':
    pass