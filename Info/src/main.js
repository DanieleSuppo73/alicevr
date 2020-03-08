import {
    statistics
} from "../lib/statistics.js";

import {
    journal
} from "../lib/journal.js";





//////////////////////////////////////////////////////////
/// receiver from Dispatcher.js
//////////////////////////////////////////////////////////
dispatcher.onMessage(function (msg) {
    // let message = msg.message;
    if (msg.command === "onVideoAssetClicked") {
        statistics(msg.asset);
        journal(msg.asset);
    }
});



