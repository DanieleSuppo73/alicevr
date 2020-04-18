import {
    getSpeakTime
} from "../../lib/getSpeakTime.js"
import {
    convertTimeCodeToSeconds
} from "../../lib/convertTimeCodeToSeconds.js"



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



function page(text, init, end) {
    this.text = text;
    this.initTime = init;
    this.endTime = end;
}





let sub = [];
let subTimes = [];
let index = null;
let oldIndex = null;
let pageIndex = null;
let timeout = null;
let subtitlesFolder = "../data/xml/";



function splitIntoPages() {
    let _subt = sub[index];
    if (_subt.pages.length === 0) {
        let pages = _subt.text.match(/([^\.!\,]+[\.!\,]+)|([^\.!\,]+$)/g);
        for (let i = 0; i < pages.length; i++) {
            let text = pages[i];
            let init = i === 0 ? _subt.time : _subt.pages[i - 1].endTime;
            let end = init + getSpeakTime(pages[i]);
            let p = new page(text, init, end);
            _subt.pages.push(p);
        }
    }
}



function clear() {
    document.getElementById("subtitle").innerHTML = "";

}



export function load(asset) {

    /// reset
    sub = [];
    subTimes = [];
    restart();


    if (typeof asset.subtitles_url !== "undefined" && asset.subtitles_url) {

        let url = asset.subtitles_url;

        loadXml(subtitlesFolder + url, function (xml) {
            let xmlDoc = xml.responseXML;
            let x = xmlDoc.getElementsByTagName("subtitle");
            for (let i = 0; i < x.length; i++) {
                let text = x[i].getElementsByTagName("text")[0].childNodes[0].nodeValue;
                let time = convertTimeCodeToSeconds(x[i].getElementsByTagName("time")[0].childNodes[0].nodeValue, 25);
                sub.push(new subtitle(text, time));
                // console.log(text);
            }

            /// copy times in new array
            for (let i = 0; i < sub.length; i++) {
                subTimes.push(sub[i].time);
            }
            /// add a last one from scratch 5 seconds more
            subTimes.push(subTimes[subTimes.length - 1] + 5);
        });
    }
}




export function restart() {
    clear();
    index = null;
    oldIndex = null;
    pageIndex = null;
    if (timeout){
        clearTimeout(timeout);
        timeout = null;
    }
}





export function check(time) {
    if (sub.length > 0) {

        /// check for a new subtitle
        for (let i = 0; i < sub.length; i++) {
            if (time >= subTimes[i] && time < subTimes[i + 1] && i !== oldIndex) {
                index = i;
                oldIndex = index;

                splitIntoPages();
                break;
            }
        }

        /// check for previously created or new pages
        /// for this subtitle[index]
        if (index !== null) {

            let _subtitle = sub[index];
            if (_subtitle.pages.length > 0) {

                /// check for pages
                for (let i = 0; i < _subtitle.pages.length; i++) {

                    let initTime = _subtitle.pages[i].initTime;
                    let endTime = _subtitle.pages[i].endTime;

                    if (time >= initTime && time < endTime && i !== pageIndex) {
                        pageIndex = i;

                        /// show text
                        let text = _subtitle.pages[pageIndex].text;
                        document.getElementById("subtitle").innerHTML = text;

                        /// if it's the last page
                        if (i == _subtitle.pages.length - 1) {

                            index = null;
                            pageIndex = null;

                            /// clear last page
                            if (timeout) clearTimeout(timeout);
                            timeout = setTimeout(function(){
                                clear();
                            }, (endTime - initTime) * 1000);
                        }
                    }
                }
            }
        }
    }
}