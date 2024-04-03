var startButton = document.getElementById("startButton");
var pauseButton = document.getElementById("pauseButton");
var progressBar = document.getElementsByClassName("progressbar")[0];
var percentage = document.getElementById("percentage");
var timeLeftText = document.getElementById("time-left-text");

var isPaused = true;

var counterInterval;


function toMinSec(time) {
    time = Math.round(time);
    var seconds = time % 60;
    var minutes = (time - seconds)/60;

    return String(minutes) + "m " + String(seconds) + "s";
}

// Where stats.timerType = 0 means a focus session, 1 means a rest session
// var stats = {timeLeft:time, time:time, restTime:restTime, cycles:cycles, focusCompleted:0, restCompleted:0, smoothCompletion:0, timeWorked:0, timeRested:0, timeBegin:0}
function startPomodoro(stats) {
    return new Promise((resolve, reject) => {

        startButton.classList.add("removed");
        pauseButton.classList.remove("removed");

        isPaused = false;

        if (stats.timerType == 0) {
            var totalTime = stats.time;
        }

        else {
            var totalTime = stats.restTime;
        }

        counterInterval = setInterval(function() {
            if (isPaused) {
                console.log("startpomodoro promise resolved");
                clearInterval(counterInterval);
                resolve();
            }
            
            else if (stats.timeLeft > 0) {
            
                stats.timeLeft -= 0.05;

                let smoothCompletion = ((1-(stats.timeLeft/totalTime)) *100);
                // console.log(stats.timeLeft);
                let completion = Math.floor(smoothCompletion);

                completion = Math.min(100, completion);

                // completion is from 0-100 and is the percentage completion of the progress bar
                percentage.innerHTML = completion + "%";

                progressBar.style.width = smoothCompletion*0.95+5 + "%";

                timeLeftText.innerHTML = toMinSec(stats.timeLeft);
                timeLeftText.classList.remove("invisible");
                }

            
            
            else {
                clearInterval(counterInterval);

                if (stats.timerType == 0) {
                    stats.focusCompleted += 1;
                    stats.timeLeft = stats.restTime;
                }
                else {
                    stats.restCompleted += 1;
                    stats.timeLeft = stats.time;
                }

                stats.timerType = 1 - stats.timerType;
                // console.log(stats.timerType);
                resolve();
            }

        },50);
    });
}

function pausePomodoro() {
    isPaused = true;
    startButton.classList.remove("removed");
    pauseButton.classList.add("removed");
}

function endPomodoro() {
    console.log("endPomodoro");
}

async function loadSettings() {
    const request = await fetch("api/request-settings");
    const settings = await request.json();

    const focus = settings[0]["focus_time"];
    const rest = settings[0]["rest_time"];
    const sessions = settings[0]["session_count"];

    document.getElementById(focus + "-focus").classList.add("selected-button");
    document.getElementById(rest + "-rest").classList.add("selected-button");
    document.getElementById(sessions + "-sessions").classList.add("selected-button");

    return {focus:focus, rest:rest, sessions:sessions};

}

async function sendSettings(stats) {
    try {
        const response = await fetch("api/request-settings", {method: "POST", headers:{"Content-Type":"application/json",}, body:JSON.stringify(stats),});

        const result = await response.json();
        console.log("response recieved", result)

    } catch (error) {
        console.log("sendSettings error")
    }
}

async function checkUsername(username, usernameElement, submitButton) {
    try {
        const response = await fetch("api/check-username", {method:"POST", headers:{"Content-Type":"application/json",}, body:JSON.stringify({username:username}),});

        const result = await response.json();
        console.log(result)
        // false when username is NOT IN database, true when username IS IN database
        if (result === false) {
            usernameElement.style.border = ("green solid");
            submitButton.disabled = false;
        }
        else {
            usernameElement.style.border = ("red solid")
            submitButton.disabled = true;
        }

    } catch (error) {
        console.log("checkUsername error")
        console.log(error)
    }
}

async function checkEmail(email, emailElement, submitButton) {
    try {
        const response = await fetch("api/check-email", {method:"POST", headers:{"Content-Type":"application/json",}, body:JSON.stringify({email:email}),});

        const result = await response.json();
        console.log(result);
        // false when username is NOT IN database, true when username IS IN database
        if (result === false) {
            emailElement.style.border = ("green solid");
            submitButton.disabled = false;
        }
        else {
            emailElement.style.border = ("red solid");
            submitButton.disabled = true;
        }

    } catch (error) {
        console.log("checkUsername error");
        console.log(error);
    }
}


function checkPass(confirm, pass) {
    if (pass.value === confirm.value) {
        confirm.style.border = ("green solid")
        submitButton.disabled = false;
    } else {
        confirm.style.border = ("red solid");
            submitButton.disabled = true;
    }
}


export {toMinSec, startPomodoro, pausePomodoro, endPomodoro, loadSettings, sendSettings, checkUsername, checkEmail, checkPass}