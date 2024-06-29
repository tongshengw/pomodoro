import * as d3 from "https://cdn.skypack.dev/d3@7"; 

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
                timeTracker["pause"][timeTracker["pause"].length - 1]["endTime"] = performance.now()
                // to start a new focus starttime
                timeTracker["focus"].push({startTime: performance.now(), endTime: null})
                
            }

            else if (stats.focusCompleted === 0) {
                console.log("focus first start")
                // focus first start
                timeTracker = {focus:[], rest:[], pause:[]}
                timeTracker["focus"].push({startTime: performance.now(), endTime: null})
                console.log(timeTracker)
            }
            
            else {
                console.log("focus start from rest")
                timeTracker["rest"][timeTracker["rest"].length - 1]["endTime"] = performance.now()
                timeTracker["focus"].push({startTime: performance.now(), endTime: null})
            }
            
        }

        else {
            var totalTime = stats.restTime;
            var timerTypeText = "Rest"

            // this checks whether the rest starts from pause, from rest, or first start in order to handle data correctly
            if (isPaused === true) {
                console.log("rest start from pause");
                timeTracker["rest"].push({startTime: performance.now(), endTime: null});
                timeTracker["pause"][timeTracker["pause"].length - 1]["endTime"] = performance.now();
            }
            
            else {
                console.log("rest start from focus");
                timeTracker["rest"].push({startTime: performance.now(), endTime: null});
                timeTracker["focus"][timeTracker["focus"].length - 1]["endTime"] = performance.now();
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
        timeTracker["focus"][timeTracker["focus"].length - 1]["endTime"] = performance.now();
        timeTracker["pause"].push({startTime: performance.now(), endTime: null});
    }
    else {
        console.log("pause start from rest");
        timeTracker["rest"][timeTracker["rest"].length - 1]["endTime"] = performance.now();
        timeTracker["pause"].push({startTime: performance.now(), endTime: null});
    }
}

function endPomodoro() {
    console.log("endPomodoro");

    timeTracker["rest"][timeTracker["rest"].length - 1]["endTime"] = performance.now();

    console.log(timeTracker);

    let totalFocusTime = 0;
    for (let i = 0; i<timeTracker["focus"].length;i+=1) {
        let et = timeTracker["focus"][i]["endTime"];
        let st = timeTracker["focus"][i]["startTime"];
        let t = et-st;
        totalFocusTime += t;
    }

    let totalRestTime = 0;
    for (let i = 0; i<timeTracker["rest"].length;i+=1) {
        let et = timeTracker["rest"][i]["endTime"];
        let st = timeTracker["rest"][i]["startTime"];
        let t = et-st;
        totalRestTime += t;
    }

    let totalPauseTime = 0;
    for (let i = 0; i<timeTracker["pause"].length;i+=1) {
        let et = timeTracker["pause"][i]["endTime"];
        let st = timeTracker["pause"][i]["startTime"];
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

    let focusTimeText = document.getElementById("focus-time-text");
    let restTimeText = document.getElementById("rest-time-text");

    focusTimeText.innerHTML = Math.round(totalFocusTime/60000);
    restTimeText.innerHTML = Math.round(totalRestTime/60000);

    focusTimeText.ariaLabel = Math.floor(totalFocusTime/1000) + " seconds spent in focus";
    restTimeText.ariaLabel = Math.floor(totalRestTime/1000) + " seconds spent in rest";

    sendHistory(Math.floor(totalFocusTime/1000), Math.floor(totalRestTime/1000));


    const dataFocus = timeTracker["focus"];
    const dataRest = timeTracker["rest"];
    const dataPause = timeTracker["pause"];

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Combine all time data
    const absStart = dataFocus[0]["startTime"];

    // Define time scale
    const xScale = d3.scaleLinear()
    .domain([0, dataRest[dataRest.length - 1]["endTime"]- absStart])
    .range([0, width]);

    // Define y scale
    const yScale = d3.scaleBand()
      .domain(["Focus", "Rest", "Pause"])
      .range([0, height])
      .padding(0.5);

    // Draw rectangles for focus
    svg.selectAll(".focus")
      .data(dataFocus)
      .enter().append("rect")
      .attr("class", "focus")
      .attr("x", d => xScale(d.startTime - absStart))
      .attr("y", yScale("Focus"))
      .attr("width", d => xScale(d.endTime- absStart) - xScale(d.startTime- absStart))
      .attr("height", yScale.bandwidth())
      .style("fill", "steelblue");

    // Draw rectangles for pause
    svg.selectAll(".pause")
      .data(dataPause)
      .enter().append("rect")
      .attr("class", "pause")
      .attr("x", d => xScale(d.startTime- absStart))
      .attr("y", yScale("Pause"))
      .attr("width", d => xScale(d.endTime- absStart) - xScale(d.startTime- absStart))
      .attr("height", yScale.bandwidth())
      .style("fill", "orange");

    // Draw rectangles for rest
    svg.selectAll(".rest")
      .data(dataRest)
      .enter().append("rect")
      .attr("class", "rest")
      .attr("x", d => xScale(d.startTime- absStart))
      .attr("y", yScale("Rest"))
      .attr("width", d => xScale(d.endTime- absStart) - xScale(d.startTime- absStart))
      .attr("height", yScale.bandwidth())
      .style("fill", "lightgreen");

    // Add x-axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Add labels
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Activity");

    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .text("Time");


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

async function sendHistory(focus_time, rest_time) {
    try {
        const response = await fetch("api/add-history", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json' // Ensure headers are set to indicate JSON payload
            },
            body: JSON.stringify({"focus_time":focus_time, "rest_time":rest_time})
        });
    } catch (error) {
        console.error(error.message);
    }
}


export {toMinSec, startPomodoro, pausePomodoro, endPomodoro, loadSettings}