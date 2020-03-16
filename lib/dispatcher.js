///////////////////////////////////////////////////////////////////////////
//// this plugin is intended to dispath messages between iframes,
//// but can be used in any situation
//// www.issimissimo.com
///////////////////////////////////////////////////////////////////////////



let handlersQueue = [];
let messagesQueue = [];

let handlersInterval = null;
let messagesInterval = null;

/// create the top window object just once,
/// since we have multiple instance of this script running
if (typeof window.parent.alice_dispatcher === "undefined") {

    window.parent.alice_dispatcher = {
        message: "",
        receivedMessageHandlers: [],
        topDocumentIsReady: false,
        iframesAreLoaded: false,
        toLoad: 0,
        loaded: 0,
    };
    init();
} else {
    waitForThisDoc();
}




export const dispatcher = {

    /// sender
    sendMessage: function (message, data = null) {

        let msg = {
            message: message,
            data: data
        }

        if (!window.parent.alice_dispatcher.iframesAreLoaded) {
            messagesQueue.push(msg);
            messagesQueueManager();

        } else {
            window.parent.alice_dispatcher.message = msg;
            onReceivedMessage();
        }
    },



    /// receiver - append the function that will be executed
    receiveMessage: function (message, func) {

        let msg = {
            message: message,
            func: func
        }

        if (!window.parent.alice_dispatcher.topDocumentIsReady) {
            handlersQueue.push(msg);
            handlersQueueManager();

        } else {
            window.parent.alice_dispatcher.receivedMessageHandlers.push(msg);
        }
    }
};





function onReceivedMessage() {
    let msg = window.parent.alice_dispatcher.message;
    for (let i in window.parent.alice_dispatcher.receivedMessageHandlers) {
        let handler = window.parent.alice_dispatcher.receivedMessageHandlers[i];
        if (handler.message === msg.message){
            handler.func(msg.data);
        }
    }
}




/// if the top document is not ready
/// manage the queue for receivedMessageHandlers
function handlersQueueManager() {
    console.log("--> called handlersQueueManager")

    if (handlersInterval) clearInterval(handlersInterval);
    handlersInterval = setInterval(function () {

        if (window.parent.alice_dispatcher.topDocumentIsReady) {
            clearInterval(handlersInterval);
            handlersInterval = null;

            for (let i in handlersQueue) {
                dispatcher.receiveMessage(handlersQueue[i].message, handlersQueue[i].func);
            }
            handlersQueue = [];
        }
    }, 100)
}



/// if iframes are not ready
/// manage the queue for messages
function messagesQueueManager() {
    console.log("---> called messagesQueueManager")

    if (messagesInterval) clearInterval(messagesInterval);
    messagesInterval = setInterval(function () {

        if (window.parent.alice_dispatcher.iframesAreLoaded) {

            clearInterval(messagesInterval);
            messagesInterval = null;

            for (let i in messagesQueue) {
                dispatcher.sendMessage(messagesQueue[i].message, messagesQueue[i].data);
            }
            messagesQueue = [];
        }
    }, 100)
}



/// wait for TOP document ready
function init() {
    let waitForTopDoc = setInterval(function () {

        if (top.document.readyState === 'interactive' || top.document.readyState === 'complete') {
            window.parent.alice_dispatcher.topDocumentIsReady = true;
            clearInterval(waitForTopDoc);
            // console.log("TOP DOC READY")

            /// get the number of iframes to be loaded
            let iframes = top.document.getElementsByClassName("alicevr");
            window.parent.alice_dispatcher.toLoad = iframes.length;


            waitForThisDoc();

            /// wait until the iframes loaded are the same number
            /// that should be loaded
            let interval = setInterval(function () {

                if (window.parent.alice_dispatcher.toLoad === window.parent.alice_dispatcher.loaded) {
                    clearInterval(interval);
                    window.parent.alice_dispatcher.iframesAreLoaded = true;
                    console.log("<--! all iframes loaded")
                }
            }, 50);
        }
    }, 20)
}


/// wait for THIS document loaded
function waitForThisDoc() {
    let interval = setInterval(function () {

        if (document.readyState === 'complete') {
            // console.log("IFRAME LOADED")
            clearInterval(interval);

            /// we wait a little to avoid conflict with handlers queue...
            setTimeout(function () {
                window.parent.alice_dispatcher.loaded++;
            }, 100)
        }
    }, 50);
}




