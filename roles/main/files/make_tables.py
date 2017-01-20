#!/var/app/learningmachine/venv/bin/python3.4
"""
Ensures that the tables that need to exist do exist.
"""
from configparser import ConfigParser
from sqlalchemy import create_engine
from tabledefs import meta

if __name__ == '__main__':
    cp = ConfigParser()
    dir_path = __file__.rsplit("/", maxsplit=1)[0]
    config_file_name = "{}/{}".format(dir_path, "config.ini")
    cp.read(config_file_name)

    db_section = cp["learningmachine"]
    user, root_password = "root", db_section.get("root_password")
    host, db = db_section.get("host"), db_section.get("db")
    db_url = "mysql+pymysql://{}:{}@{}/{}".format(user, root_password, host, db)
    eng = create_engine(db_url)
    meta.create_all(bind=eng)
    print("all tables set up")