import os
import sqlite3

from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route('/')
def home():
    focusTimes = [15,20,25]
    restTimes = [5, 7, 10]
    sessionCounts = [1, 2, 3]
    countFocusTimes = len(focusTimes)
    countRestTimes = len(focusTimes)
    countSessionCounts = len(sessionCounts)
    return render_template("home.html", focusTimes = focusTimes, restTimes = restTimes, sessionCounts = sessionCounts, countFocusTimes = countFocusTimes, countRestTimes = countRestTimes, countSessionCounts = countSessionCounts)