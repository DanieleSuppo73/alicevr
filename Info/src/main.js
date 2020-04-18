import {
    statistics
} from "../lib/statistics.js";

import {
    journal
} from "../lib/journal.js";

import {
    dispatcher
} from "../../lib/dispatcher.js";



//////////////////////////////////////////////////////////
/// receiver from Dispatcher.js
//////////////////////////////////////////////////////////
dispatcher.receiveMessage("videoAssetClicked", function (asset) {
    journal(asset);
});


