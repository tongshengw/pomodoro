
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


@app.route("/")
def home():
    focusTimes = [0.1,20,25]
    restTimes = [0.1, 7, 10]
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