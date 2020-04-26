import {
    dispatcher
} from "../../lib/dispatcher.js";



/********************************************
Receive messages
********************************************/
dispatcher.receiveMessage("videoAssetClicked", function (asset) {
    init(asset);
});

dispatcher.receiveMessage("rootAssetClicked", function () {
    hide();
});

dispatcher.receiveMessage("showGuideWarningForNoTrack", function () {
    console.warn("--> showGuideWarningForNoTrack")
    showWarn();
});



/********************************************
constants
********************************************/
const folder = "../data/html/";
const id = "#journal";



/********************************************
functions
********************************************/
function init(asset) {
    $(id).empty();

        if(asset.journal_url) {
    
            let htmlToLoad = asset.journal_url;
    
            /// load and append external html
            $(id).append($('<div>').load(folder + htmlToLoad, function (responseTxt, statusTxt, xhr) {
                if (statusTxt !== "success") {
                    console.error("Something was wrong loading html...")
                }
            }));
        }
};

function hide() {
    $(id).empty();
}

function showWarn(){
    $('#warnMsg').show();
    setTimeout(function(){
        $('#warnMsg').fadeOut();
    }, 5000);
}


