var startButton = document.getElementById("startButton");
var pauseButton = document.getElementById("pauseButton");
var progressBar = document.getElementsByClassName("progressbar")[0];
var percentage = document.getElementById("percentage");
var timeLeftText = document.getElementById("time-left-text");

var isPaused;

// 
var timeTracker = {focus:[], rest:[], pause:[]}

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

        

        if (stats.timerType == 0) {
            var totalTime = stats.time;
            var timerTypeText = "Focus"

            // this checks whether the focus starts from pause, from rest, or first start in order to handle data correctly
            if (isPaused === true) {
                console.log("focus start from pause")

                // to add a pause endtime
                timeTracker["pause"][timeTracker["pause"].length - 1]["endTime"] = new Date()
                // to start a new focus starttime
                timeTracker["focus"].push({startTime: new Date(), endTime: null})
            }

            else if (stats.focusCompleted === 0) {
                console.log("focus first start")
                timeTracker = {focus:[], rest:[], pause:[]}
                timeTracker["focus"].push({startTime: new Date(), endTime: null})
                console.log(timeTracker)
            }
            
            else {
                console.log("focus start from rest")
                timeTracker["rest"][timeTracker["rest"].length - 1]["endTime"] = new Date()
                timeTracker["focus"].push({startTime: new Date(), endTime: null})
            }
            
        }

        else {
            var totalTime = stats.restTime;
            var timerTypeText = "Rest"

            // this checks whether the rest starts from pause, from rest, or first start in order to handle data correctly
            if (isPaused === true) {
                console.log("rest start from pause");
                timeTracker["rest"].push({startTime: new Date(), endTime: null});
                timeTracker["pause"][timeTracker["pause"].length - 1]["endTime"] = new Date()
            }
            
            else {
                console.log("rest start from focus");
                timeTracker["rest"].push({startTime: new Date(), endTime: null});
                timeTracker["focus"][timeTracker["focus"].length - 1]["endTime"] = new Date()
            }

        }


        isPaused = false;

        counterInterval = setInterval(function() {
            if (isPaused) {
                // console.log("startpomodoro promise resolved");
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

                let totalCycleText = String(stats.cycles)
                let currentCycleText = String(stats.restCompleted + 1)

                timeLeftText.innerHTML = toMinSec(stats.timeLeft) + ",   " + timerTypeText + ",   " + currentCycleText + "/" + totalCycleText + " Cycles";
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

function pausePomodoro(stats) {
    isPaused = true;
    startButton.classList.remove("removed");
    pauseButton.classList.add("removed");
    // console.log("pause start helper")

    if (stats.timerType === 0) {
        console.log("pause start from focus");
        timeTracker["focus"][timeTracker["focus"].length - 1]["endTime"] = new Date();
        timeTracker["pause"].push({startTime: new Date(), endTime: null});
    }
    else {
        console.log("pause start from rest");
        timeTracker["rest"][timeTracker["rest"].length - 1]["endTime"] = new Date();
        timeTracker["pause"].push({startTime: new Date(), endTime: null});
    }
}

function endPomodoro() {
    console.log("endPomodoro");

    timeTracker["rest"][timeTracker["rest"].length - 1]["endTime"] = new Date();

    console.log(timeTracker);

    let totalFocusTime = 0;
    for (let i = 0; i<timeTracker["focus"].length;i+=1) {
        let et = timeTracker["focus"][i]["endTime"].getTime();
        let st = timeTracker["focus"][i]["startTime"].getTime();
        let t = et-st;
        totalFocusTime += t;
    }

    let totalRestTime = 0;
    for (let i = 0; i<timeTracker["rest"].length;i+=1) {
        let et = timeTracker["rest"][i]["endTime"].getTime();
        let st = timeTracker["rest"][i]["startTime"].getTime();
        let t = et-st;
        totalRestTime += t;
    }

    let totalPauseTime = 0;
    for (let i = 0; i<timeTracker["pause"].length;i+=1) {
        let et = timeTracker["pause"][i]["endTime"].getTime();
        let st = timeTracker["pause"][i]["startTime"].getTime();
        let t = et-st;
        totalPauseTime += t;
    }

    console.log(totalFocusTime);
    console.log(totalRestTime);
    console.log(totalPauseTime);

    let timerWrapper = document.getElementById("content-wrapper-timer");
    let finishWrapper = document.getElementById("content-wrapper-finish");

    timerWrapper.classList.add("removed");
    finishWrapper.classList.remove("removed");

    // add code to change the stats


}

async function loadSettings() {
    const request = await fetch("api/request-settings");
    const settings = await request.json();

    const focus = settings[0]["focus_time"];
    const rest = settings[0]["rest_time"];
    const sessions = settings[0]["session_count"];

    // TODO: try and catch if button doesnt exist
    document.getElementById(focus + "-focus").classList.add("selected-button");
    document.getElementById(rest + "-rest").classList.add("selected-button");
    document.getElementById(sessions + "-sessions").classList.add("selected-button");

    return {focus:focus, rest:rest, sessions:sessions};

}


export {toMinSec, startPomodoro, pausePomodoro, endPomodoro, loadSettings}