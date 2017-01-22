"""
tabledefs.py

Collection of SQLAlchemy table definitions for database tables supporting Flashmark.
"""
from sqlalchemy import Column, Text, Integer, ForeignKey, TIMESTAMP, VARCHAR, Table, MetaData, ForeignKeyConstraint
meta = MetaData()


user_table = Table("users", meta,
                   Column("email", VARCHAR(255), primary_key=True),
                   Column("display_name", Text))


exercise_table = Table("exercises", meta,
                       Column("id", Integer, primary_key=True, autoincrement=True),
                       Column("question", Text),
                       Column("answer", Text),
                       Column("difficulty", Integer, default=0),
                       Column("user_id", ForeignKey("users.email")))


attempt_table = Table("attempts", meta,
                      Column("id", Integer, primary_key=True, autoincrement=True),
                      Column("score", Integer),
                      Column("when_attempted", TIMESTAMP),
                      Column("exercise_id", ForeignKey("exercises.id")))


resource_table = Table("resources", meta,
                       Column("id", Integer, primary_key=True, autoincrement=True),
                       Column("caption", Text),
                       Column("url", Text),
                       Column("user_id", ForeignKey("users.email")))


resource_by_exercise_table = Table("resources_by_exercise", meta,
                           Column("resource_id", Integer, ForeignKey("resources.id"), primary_key=True),
                           Column("exercise_id", Integer, ForeignKey("exercises.id"), primary_key=True))


exercise_tag_table = Table("exercise_tags", meta,
                           Column("name", VARCHAR(255), primary_key=True),
                           Column("user_id", ForeignKey("users.email"), primary_key=True))

exercise_by_exercise_tags_table = Table("exercises_by_exercise_tags", meta,
                                        Column("exercise_id", ForeignKey("exercises.id"), primary_key=True),
                                        Column("tag_name", VARCHAR(255), primary_key=True),
                                        Column("user_id", VARCHAR(255), primary_key=True),
                                        ForeignKeyConstraint(["tag_name", "user_id"], ["exercise_tags.name", "exercise_tags.user_id"]))
