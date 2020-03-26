/* wait to resolve for a key-value of an object */
export const waitObjectProperty = (object, key, value) =>
    new Promise(resolve => setTimeout(() => {
        if (object[key] === value) resolve();
        else {
            setTimeout(function () {
                resolve(waitObjectProperty(object, key, value));
            }, 0);
        }
    }, 50));



/* load xml file from url */
export function loadXml(url) {
    return new Promise(function (resolve) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                resolve(xhttp.responseXML);
            };
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    });
};


/* clone array of objects with and index more
---- require JQuery */
export function arrayOfObjectsCloneAndIncrease(array) {
    let a = $.extend(true, [], array);
    let newObj = $.extend(true, {}, array[array.length - 1]);
    a.push(newObj);
    return a;
};



/* Convert timecode string to seconds */
export function convertTimeCodeToSeconds(timecode, framerate = null) {
    const _framerate = framerate ? framerate : 25;
    const timeArray = timecode.split(":");
    const hours = parseInt(timeArray[0]) * 60 * 60;
    const minutes = parseInt(timeArray[1]) * 60;
    const seconds = parseInt(timeArray[2]);
    const frames = parseInt(timeArray[3]) * (1 / _framerate);
    return hours + minutes + seconds + frames;
}