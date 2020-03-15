///Convert timecode string to seconds
export function convertTimeCodeToSeconds(timeString, framerate) {
    const timeArray = timeString.split(":");
    const hours = parseInt(timeArray[0]) * 60 * 60;
    const minutes = parseInt(timeArray[1]) * 60;
    const seconds = parseInt(timeArray[2]);
    const frames = parseInt(timeArray[3]) * (1 / framerate);
    return hours + minutes + seconds + frames;
}