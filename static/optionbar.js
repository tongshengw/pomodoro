function focusListener(stats, started) {
    let focusButtons = document.getElementsByClassName("focus-times")
    Array.from(focusButtons).forEach(element => {
        element.addEventListener("click", function() {
            if (started.value === false) {
                Array.from(focusButtons).forEach(element => {
                    element.classList.remove("selected-button");
                });
                console.log(element.id);
                stats.time = element.id.split("-")[0] * 60;
                stats.timeLeft = stats.time;
                element.classList.add("selected-button");
                sendSettings(stats);
            }
        });
    });
}

function restListener(stats, started) {
    let restButtons = document.getElementsByClassName("rest-times")
        Array.from(restButtons).forEach(element => {
            element.addEventListener("click", function() {
                if (started.value === false) {
                    Array.from(restButtons).forEach(element => {
                        element.classList.remove("selected-button");
                    });
                    console.log(element.id);
                    stats.restTime = element.id.split("-")[0] * 60;
                    element.classList.add("selected-button");
                    sendSettings(stats);
                }
            });
        });
}

function sessionListener(stats, started) {
    let sessionButtons = document.getElementsByClassName("session-counts")
        Array.from(sessionButtons).forEach(element => {
            element.addEventListener("click", function() {
                if (started.value === false) {
                    Array.from(sessionButtons).forEach(element => {
                        element.classList.remove("selected-button");
                    });
                    console.log(element.id);
                    stats.cycles = parseInt(element.id.split("-")[0]);
                    element.classList.add("selected-button");
                    sendSettings(stats);
                }
            });
        });
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

export{sendSettings, focusListener, restListener, sessionListener}