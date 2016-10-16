from sqlalchemy import Column, Text, Integer, ForeignKey, TIMESTAMP, VARCHAR, Table, MetaData
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
                           Column("id", Integer, primary_key=True, autoincrement=True),
                           Column("resource_id", Integer, ForeignKey("resources.id")),
                           Column("exercise_id", Integer, ForeignKey("exercises.id")))


