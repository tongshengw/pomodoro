import sqlite3

def db_execute(query, tuple):
    db = sqlite3.connect("pomedoro.db")
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