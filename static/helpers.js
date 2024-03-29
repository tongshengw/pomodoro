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

    return String(minutes) + "m " + String(seconds) + "s"
}

// Where stats.timerType = 0 means a focus session, 1 means a rest session
// var stats = {timeLeft:time, time:time, restTime:restTime, cycles:cycles, focusCompleted:0, restCompleted:0, smoothCompletion:0, timeWorked:0, timeRested:0, timeBegin:0}
function startPomedoro(stats) {
    return new Promise((resolve, reject) => {

        startButton.classList.add("removed")
        pauseButton.classList.remove("removed")

        isPaused = false;

        if (stats.timerType == 0) {
            var totalTime = stats.time;
        }

        else {
            var totalTime = stats.restTime;
        }

        counterInterval = setInterval(function() {
            if (isPaused) {
                console.log("startpomedoro promise resolved")
                clearInterval(counterInterval);
                resolve()
            }
            
            else if (stats.timeLeft > 0) {
            
                stats.timeLeft -= 0.05;

                let smoothCompletion = ((1-(stats.timeLeft/totalTime)) *100);
                // console.log(stats.timeLeft);
                let completion = Math.floor(smoothCompletion);

                completion = Math.min(100, completion)

                // completion is from 0-100 and is the percentage completion of the progress bar
                percentage.innerHTML = completion + "%";

                progressBar.style.width = smoothCompletion*0.95+5 + "%";

                timeLeftText.innerHTML = toMinSec(stats.timeLeft);
                timeLeftText.classList.remove("invisible");
                }

            
            
            else {
                clearInterval(counterInterval);

                if (stats.timerType == 0) {
                    stats.focusCompleted += 1
                    stats.timeLeft = stats.restTime;
                }
                else {
                    stats.restCompleted += 1
                    stats.timeLeft = stats.time;
                }

                stats.timerType = 1 - stats.timerType;
                // console.log(stats.timerType);
                resolve();
            }

        },50);
    });
}

function pausePomedoro() {
    isPaused = true;
    startButton.classList.remove("removed");
    pauseButton.classList.add("removed");
}

function endPomedoro() {
    console.log("endPomedoro");
}

async function loadSettings() {
    let request = await fetch("api/request-settings");
    let settings = await request.json();

    let focus = settings[0]["focus_time"];
    let rest = settings[0]["rest_time"];
    let sessions = settings[0]["session_count"];

    document.getElementById(focus + "-focus").classList.add("selected-button");
    document.getElementById(rest + "-rest").classList.add("selected-button");
    document.getElementById(sessions + "-sessions").classList.add("selected-button");

    return {focus:focus, rest:rest, sessions:sessions};

}

export {toMinSec, startPomedoro, pausePomedoro, endPomedoro, loadSettings}