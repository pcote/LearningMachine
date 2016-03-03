#!/usr/bin/python3
from sqlalchemy import create_engine
from sqlalchemy.sql import select, text
from configparser import ConfigParser

if __name__ == '__main__':
    parser = ConfigParser()
    dir_path = __file__.rsplit("/", maxsplit=1)[0]
    config_file_name = "{}/{}".format(dir_path, "config.ini")
    parser.read(config_file_name)

    root_pw = parser["learningmachine"]["root_password"]
    ct_string = "mysql+pymysql://root:{}@localhost/learningmachine".format(root_pw)
    eng = create_engine(ct_string)
    conn = eng.connect()

    # clear the attempts
    query_string = "delete from attempts where exercise_id in (select exercise_id from exercise_deletions)"
    conn.execute(query_string)

    # clear the exercises
    query_string = "delete from exercises where id in (select exercise_id from exercise_deletions)"
    conn.execute(query_string)

    # clear the deletion queue
    query_string = "delete from exercise_deletions"
    conn.execute(query_string)
    conn.close()