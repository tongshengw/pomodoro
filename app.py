
import os
import sqlite3
import json

from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import db_execute

from config import SECRET_KEY

app = Flask(__name__)

app.secret_key = SECRET_KEY
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)



@app.route("/")
def home():
    focusTimes = [15,20,25]
    restTimes = [5, 7, 10]
    sessionCounts = [1, 2, 3]
    countFocusTimes = len(focusTimes)
    countRestTimes = len(focusTimes)
    countSessionCounts = len(sessionCounts)
    
    # if session user id is empty, create a new user in the database.
    if "user_id" not in session.keys():
        db = sqlite3.connect("pomedoro.db")
        c = db.cursor()
        print("no saved session")
        c.execute("INSERT INTO users (guest) VALUES (?)", (1,))

        id = c.lastrowid

        c.execute("INSERT INTO settings (user_id, focus_time, rest_time, session_count) VALUES (?,?,?,?)", (id, 15, 5, 1))

        session["user_id"] = id

        db.commit()

        db.close()

    print("user_id:")
    print(session["user_id"])

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
    
@app.route("/login")
def login():
    return(render_template("login.html"))

@app.route("/register")
def register():
    if request.method == "POST":
        pass
    
    else:
        return(render_template("register.html"))
    
@app.route("/api/check-username", methods=["POST"])
def checkUsername():
    json = request.get_json()
    print(json)
    rows = db_execute("SELECT username FROM users WHERE username = ?",(json["username"],))
    if len(rows) == 0:
        return jsonify(False)
    else:
        return jsonify(True)
    
@app.route("/api/check-email", methods=["POST"])
def checkUsername():
    json = request.get_json()
    print(json)
    rows = db_execute("SELECT username FROM users WHERE username = ?",(json["username"],))
    if len(rows) == 0:
        return jsonify(False)
    else:
        return jsonify(True)