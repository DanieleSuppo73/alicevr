///Convert timecode string to seconds
function convertTimeCodeToSeconds(timeString, framerate) {
    const timeArray = timeString.split(":");
    const hours = parseInt(timeArray[0]) * 60 * 60;
    const minutes = parseInt(timeArray[1]) * 60;
    const seconds = parseInt(timeArray[2]);
    const frames = parseInt(timeArray[3]) * (1 / framerate);
    return hours + minutes + seconds + frames;
}



///Wait for milliseconds
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function getSpeakTime(text) {
    const _speakingSpeed = 0.006;
    let st = text.split(" ");
    let seconds = (st.length * _speakingSpeed) * 60;
    return seconds;
}


function loadXml(url, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback(this);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}


///Subtitle object constructor
function subtitle(text, time) {
    this.text = text;
    this.time = time;
    this.pages = [];
}



function page(text, duration) {
    this.text = text;
    this.duration = duration;
}

let checkForSubtitle = null;

subt = {
    subtitlesFolder: "../data/xml/",
    load: function (url) {
        if (checkForSubtitle !== null) {
            clearInterval(checkForSubtitle);
            clearSubtitle();
        };
        if (url === null) return;

        loadXml(this.subtitlesFolder + url, function (xml) {
            let subtitles = [];
            let xmlDoc = xml.responseXML;
            let x = xmlDoc.getElementsByTagName("subtitle");
            for (let i = 0; i < x.length; i++) {
                let text = x[i].getElementsByTagName("text")[0].childNodes[0].nodeValue;
                let time = convertTimeCodeToSeconds(x[i].getElementsByTagName("time")[0].childNodes[0].nodeValue, 25);
                subtitles.push(new subtitle(text, time));
                // console.log(text);
            }


            ///Check for subtitles
            let oldIndex = -1;

            if (checkForSubtitle !== null) {
                clearInterval(checkForSubtitle);
                clearSubtitle();
            };
            checkForSubtitle = setInterval(function () {

                for (let ii = 0; ii < subtitles.length; ii++) {
                    if (videoPlayer.isPlaying || videoPlayer.isSeeking) {

                        ///reset when video is seeking
                        if (videoPlayer.isSeeking) {
                            clearSubtitle();
                            if (checkForSubtitlePage !== null) clearInterval(checkForSubtitlePage);
                            oldIndex = -1;
                        }

                        ///If a subtitle is reached

                        if (subtitles[ii].time <= videoPlayer.time && ii === subtitles.length - 1) {

                            if (oldIndex === ii) return;
                            oldIndex = ii;

                            splitIntoPages(subtitles[ii]);
                        }

                        else if (subtitles[ii].time <= videoPlayer.time && subtitles[ii + 1].time > videoPlayer.time) {

                            if (oldIndex === ii) return;
                            oldIndex = ii;

                            splitIntoPages(subtitles[ii]);
                        }
                    }
                }
            }, 500);
        });
    }
}


function splitIntoPages(sub){
    
    let pages = sub.text.match(/([^\.!\,]+[\.!\,]+)|([^\.!\,]+$)/g);
    for (let y = 0; y < pages.length; y++) {
        let text = pages[y];
        let duration = getSpeakTime(pages[y]);
        let p = new page(text, duration);
        sub.pages.push(p);
    }
    showPages(sub);
}


let checkForSubtitlePage = null;

function showPages(sub) {
    if (checkForSubtitlePage !== null) clearInterval(checkForSubtitlePage);
    let oldPage = -1;

    checkForSubtitlePage = setInterval(function () {

        let subStartTime = sub.time;
        let subEndTime = subStartTime + sub.pages[0].duration;

        for (let i = 0; i < sub.pages.length; i++) {

            /// if the page is reached
            if (videoPlayer.time >= subStartTime && videoPlayer.time < subEndTime) {

                if (oldPage === i) return;
                oldPage = i;

                ///Show page
                document.getElementById("subtitle").innerHTML = sub.pages[i].text;
                break;

            } else {
                ///Conclusion
                if (i == sub.pages.length - 1) {
                    clearInterval(checkForSubtitlePage);
                    clearSubtitle();
                } else {
                    ///Go to next page
                    subStartTime += sub.pages[i].duration; /// the previous sub duration
                    subEndTime = subStartTime + sub.pages[i + 1].duration;
                }
            }
        }
    }, 250);
}

function clearSubtitle() {
    document.getElementById("subtitle").innerHTML = "";
}


//////////////////////////////////////////////////////////
/// receiver
//////////////////////////////////////////////////////////
if (window.addEventListener) {
    // For standards-compliant web browsers
    window.addEventListener("message", onReceivedMessage_subtitle, false);
} else {
    window.attachEvent("onmessage", onReceivedMessage_subtitle);
}

function onReceivedMessage_subtitle(evt) {
    let message = evt.data;
    if (message.command === "onVideoAssetClicked") {
        subt.load(message.asset.subtitles);
    }
}