
import os
import sqlite3
import json
import re

from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import db_execute, syncIdUsername

from config import SECRET_KEY

app = Flask(__name__)

app.secret_key = SECRET_KEY
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config['SESSION_COOKIE_SAMESITE'] = "Strict"
Session(app)

@app.before_request
def load_user():
    syncIdUsername(session)
    if "user_id" not in session:
        db = sqlite3.connect("pomodoro.db")
        c = db.cursor()
        print("no saved session")
        c.execute("INSERT INTO users (guest) VALUES (?)", (1,))

        id = c.lastrowid

        c.execute("INSERT INTO settings (user_id, focus_time, rest_time, session_count) VALUES (?,?,?,?)", (id, 15, 5, 1))

        session["user_id"] = id

        db.commit()

        db.close()


@app.route("/")
def home():
    focusTimes = [0.05,15,25]
    restTimes = [0.05, 5, 10]
    sessionCounts = [1, 2, 3]
    countFocusTimes = len(focusTimes)
    countRestTimes = len(focusTimes)
    countSessionCounts = len(sessionCounts)
    
    # if session user id is empty, create a new user in the database.
    if "user_id" not in session.keys():
        db = sqlite3.connect("pomodoro.db")
        c = db.cursor()
        print("no saved session")
        c.execute("INSERT INTO users (guest) VALUES (?)", (1,))

        id = c.lastrowid

        c.execute("INSERT INTO settings (user_id, focus_time, rest_time, session_count) VALUES (?,?,?,?)", (id, 15, 5, 1))

        session["user_id"] = id

        db.commit()

        db.close()

    print("userid:", session["user_id"])

    try:
        print("username: ", session["username"])
    except:
        print("no username")

    return render_template("home.html", focusTimes = focusTimes, restTimes = restTimes, sessionCounts = sessionCounts, countFocusTimes = countFocusTimes, countRestTimes = countRestTimes, countSessionCounts = countSessionCounts)

#TODO - create js code to fetch user setting data from this route and change optionbar button colour accordingly, make js code to create a post request to this route in order to change settings. remember to add something to check for current settings and change css and js right after page load.
@app.route("/api/request-settings", methods=["GET", "POST"])
def settings():
    if request.method == "GET":
        settings = db_execute("SELECT * FROM settings WHERE user_id = ?", (session["user_id"],))
        return jsonify(settings)
    
    else:
        json = request.get_json()
        print(json)
        db_execute("UPDATE settings SET focus_time = ?, rest_time = ?, session_count = ? WHERE user_id = ?", (json["time"]/60, json["restTime"]/60, json["cycles"], session["user_id"]))
        return json
    
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if not request.form.get("username"):
            return render_template("error.html", error = "no username")

        # Ensure password was submitted
        elif not request.form.get("password"):
            return render_template("error.html", error = "no password")

        # Query database for username
        rows = db_execute(
            "SELECT * FROM users WHERE username = ?", (request.form.get("username"),)
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["password_hash"], request.form.get("password")
        ):
            return render_template("error.html", error = "username or password incorrect")

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]
        session["username"] = rows[0]["username"]

        # Redirect user to home page
        return redirect("/")

    else:
        return(render_template("login.html"))
    
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        print("form req pass", password)
        hash = generate_password_hash(password)
        rows = db_execute("SELECT username, email FROM users WHERE username = ? ", (username,))
        rows1 = db_execute("SELECT username, email FROM users WHERE email = ? ", (email,))
        rows2 = db_execute("SELECT username, guest FROM users WHERE id = ? ", (session["user_id"],))

        print(rows)

        if len(rows) != 0 or username == "" or request.form.get("password") != request.form.get("confirm-password") or len(rows1) != 0 or rows2[0]["guest"] == 0 or len(username) >= 16 or len(password) >= 1000:
            return render_template("error.html", error="invalid register")

        db_execute("UPDATE users SET username = ?, password_hash = ?, email = ?, guest = 0 WHERE id = ?", (username, hash, email, session["user_id"]))
        session["username"] = username
        return redirect("/")
    
    else:
        return render_template("register.html")
    
@app.route("/friends", methods=["GET", "POST"])
def friend():
    if "username" not in session:
        return redirect("/login")
    return render_template("friends.html", user_id = session["user_id"], username = session["username"])
    
@app.route("/api/check-username", methods=["POST"])
def checkUsername():
    json = request.get_json()
    print(json)
    rows = db_execute("SELECT username FROM users WHERE username = ?",(json["username"],))
    if len(rows) == 0 and json["username"] != "":
        return jsonify(False)
    else:
        return jsonify(True)
    
@app.route("/api/check-email", methods=["POST"])
def checkEmail():
    json = request.get_json()
    print(json)
    rows = db_execute("SELECT email FROM users WHERE email = ?",(json["email"],))
    if len(rows) == 0 and json["email"] != "" and re.match(r"[^@]+@[^@]+\.[^@]+", json["email"]):
        return jsonify(False)
    else:
        return jsonify(True)

@app.route("/api/add-history", methods=["POST"])
def addHistory():
    json = request.get_json()
    if "focus_time" in json and "rest_time" in json and session["username"] and session["user_id"]:
        db_execute("INSERT INTO history (user_id, focus_time, rest_time) VALUES (?, ?, ?)", (session["user_id"], json["focus_time"], json["rest_time"]))
        return "success"
    else:
        return "failed"

@app.route("/api/load-friends", methods = ["POST"])
def loadFriends():
    if not session["username"]:
        return redirect("/login")
    else:
        # TODO a bunch of friend stuff
        json = request.get_json()
        id = session["user_id"]
        print(id)
        friends1 = db_execute("SELECT user_id, focus_time, rest_time, timestamp FROM history WHERE user_id IN (SELECT user_id_1 FROM friends WHERE user_id_2 = ? AND relationship = 0) AND timestamp >= datetime('now', '-7 days');", (id,))
        friends2 = db_execute("SELECT user_id, focus_time, rest_time, timestamp FROM history WHERE user_id IN (SELECT user_id_2 FROM friends WHERE user_id_1 = ? AND relationship = 0) AND timestamp >= datetime('now', '-7 days');", (id,))

        friends = friends1 + friends2

        print(friends)

        tallyDict = {}

        for entry in friends:
            if entry["user_id"] not in tallyDict:
                tallyDict[entry["user_id"]] = {"totalFocus": entry["focus_time"], "totalRest": entry["rest_time"]}
            else:
                tallyDict[entry["user_id"]]["totalFocus"] += entry["focus_time"]
                tallyDict[entry["user_id"]]["totalRest"] += entry["rest_time"]

        print(tallyDict)

        return jsonify(tallyDict)



# relationship 0 is friends, 1 is user 1 requesting user 2, 2 is user 2 requesting user 1
@app.route("/api/add-friends", methods = ["POST"])
def addFriends():
    json = request.get_json()
    sender_id = session["user_id"]
    if "reciever_id" in json:
        if sender_id == json["reciever_id"]:
            return "failed"
        
        json["reciever_id"] = int(json["reciever_id"])
        
        if sender_id < json["reciever_id"]:
            userid1 = sender_id
            userid2 = json["reciever_id"]
            sender = 1
            reciever = 2
        else:
            userid2 = sender_id
            userid1 = json["reciever_id"]
            sender = 2
            reciever = 1
        
        rows = db_execute("SELECT * FROM friends WHERE user_id_1 = ? AND user_id_2 = ?", (userid1, userid2))

        print(userid1)
        print(userid2)

        if len(rows) == 0:
            db_execute("INSERT INTO friends (user_id_1, user_id_2, relationship) VALUES (?, ?, ?)", (userid1, userid2, sender))
        elif rows[0]["relationship"] == reciever:
            db_execute("UPDATE friends SET relationship = 0 WHERE user_id_1 = ? AND user_id_2 = ?", (userid1, userid2))

        return "success"
    else:
        return "failed"