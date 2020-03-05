import {
    statistics
} from "../lib/statistics.js";

import {
    journal
} from "../lib/journal.js";





//////////////////////////////////////////////////////////
/// send message to Dispatcher.js for iFrame ready
//////////////////////////////////////////////////////////
$(document).ready(function () {
    window.parent.postMessage({
        'message': {
            command: "iframeLoaded",
        }
    }, "*");
});




//////////////////////////////////////////////////////////
/// receiver from Dispatcher.js
//////////////////////////////////////////////////////////
if (window.addEventListener) window.addEventListener("message", onReceivedMessage, false);
else window.attachEvent("onmessage", onReceivedMessage);
function onReceivedMessage(evt) {
    let message = evt.data;
    if (message.command === "onVideoAssetClicked") {
        statistics(message.asset);
        journal(message.asset);
    }
}