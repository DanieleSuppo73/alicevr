$(document).ready(function () {

    let id = "videoPlayer-preloader";

    $("#" + id).children('img').fadeIn();

    // let spinnerTimeout = setTimeout(function () {
    //     $("#" + id).children('img').fadeIn();
    // }, 1000);


    let preloaderInterval = setInterval(function () {
        if (typeof videoPlayer !== "undefined") {
            clearInterval(preloaderInterval);
            videoPlayer.onReadyHandlers.push(function () {
                $("#" + id).fadeOut();
            });
        }
    })
});