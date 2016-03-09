from sqlalchemy import Column, Text, Integer, ForeignKey, TIMESTAMP, VARCHAR, Table, MetaData
meta = MetaData()

user_table = Table("users", meta,
                   Column("email", VARCHAR(255), primary_key=True),
                   Column("display_name", Text))


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

exercise_deletion_table = Table("exercise_deletions", meta,
                                Column("id", Integer, primary_key=True, autoincrement=True),
                                Column("exercise_id", Integer),
                                Column("deletion_time", TIMESTAMP))

resource_table = Table("resources", meta,
                       Column("id", Integer, primary_key=True, autoincrement=True),
                       Column("caption", Text),
                       Column("url", Text),
                       Column("user_id", ForeignKey("users.email")))

