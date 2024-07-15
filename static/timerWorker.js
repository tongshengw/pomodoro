let isPaused;
var stats;
let totalTime;

onmessage = (e) => {
    if (e.data[0] === 0) {
        stats = e.data[1];
        isPaused = e.data[2];
        totalTime = e.data[3];
    }
    else if (e.data[0] === 3) {
        // stats = e.data[1]
        isPaused = e.data[1];
    }
}

const counterInterval = setInterval(function() {
    if (isPaused) {
        // console.log("startpomodoro promise resolved");
        clearInterval(counterInterval);
        // resolve();
        postMessage([2, stats]);
        console.log(stats)
        postMessage('resolve');
    }
    
    else if (stats.timeLeft > 0) {
    
        stats.timeLeft -= 0.05;

        let smoothCompletion = ((1-(stats.timeLeft/totalTime)) *100);
        // console.log(stats.timeLeft);
        let completion = Math.floor(smoothCompletion);
        completion = Math.min(100, completion);

        let totalCycleText = String(stats.cycles);
        let currentCycleText = String(stats.restCompleted + 1);
        console.log('in setinterval')
        console.log(stats)
        postMessage([1, completion, smoothCompletion, totalCycleText, currentCycleText, stats.timeLeft]);

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
        postMessage([2, stats]);
        postMessage('resolve');
    }

},50);