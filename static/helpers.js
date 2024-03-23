function toMinSec(time) {
    time = Math.round(time);
    var seconds = time % 60;
    var minutes = (time - seconds)/60;

    return String(minutes) + "m " + String(seconds) + "s"
}

export {toMinSec}