import sqlite3
import re

def db_execute(query, tuple):
    db = sqlite3.connect("pomodoro.db")
    db.row_factory = sqlite3.Row
    c = db.cursor()
    c.execute(query, tuple)
    rows = c.fetchall()
    output = []
    for row in rows:
        output.append(dict(row))
    
    db.commit()
    db.close()

    return output

def syncIdUsername(session):
    if "user_id" in session.keys():
        rows = db_execute("SELECT username FROM users WHERE id = ?", (session["user_id"],))
        if len(rows) == 1:
            session["username"] = rows[0]["username"]