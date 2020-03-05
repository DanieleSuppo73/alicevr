const alice_dispatcher = {
    panelId: ["alice_map", "alice_player", "alice_info"],
    panel: [],
    l: 0,
    queueMsg: [],
    ready: false,
    checkRoutine: null,
    start: function () {
        let Obj = this;
        document.onreadystatechange = function () {
            if (document.readyState === 'interactive') {
                for (let i in Obj.panelId) {
                    let p = document.getElementById(Obj.panelId[i]);
                    if (p) {
                        Obj.panel.push(p);
                    }
                }
                let check = setInterval(function () {
                    if (Obj.l === Obj.panel.length) {
                        Obj.ready = true;
                        console.log("******** DISPATCHER PRONTO! ********")
                        clearInterval(check);

                        if (Obj.queueMsg.length > 0){
                            for (let i in Obj.queueMsg){
                                Obj.sendMessage(Obj.queueMsg[i]);
                                console.log("*** >>> " + Obj.queueMsg[i]);
                            }
                        }
                    }
                }, 100)
            }
        }
    },
    onMessage: function (event) {
        let message = event.data.message;
        if (typeof message === "undefined"){
            console.error("ERROR IN DISPATCHER!! received undefined message...");
            console.log(event);
        }
        if (message.command === "iframeLoaded") {
            alice_dispatcher.l++;
        } else {
            if (!alice_dispatcher.ready) {
                alice_dispatcher.queueMsg.push(message);
                console.log("---- MESSAGGIO IN CODA: " + message.command)
            } else {
                alice_dispatcher.sendMessage(message);
            }
        }
    },
    sendMessage: function (message) {
        for (let i in this.panel) {
            this.panel[i].contentWindow.postMessage(message, "*");
        }
    }
}


if (window.addEventListener) {
    window.addEventListener("message", alice_dispatcher.onMessage, false);
} else if (window.attachEvent) {
    window.attachEvent("onmessage", alice_dispatcher.onMessage, false);
}


alice_dispatcher.start();
