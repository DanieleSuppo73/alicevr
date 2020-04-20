/***********************************
 * the splash screen for the video player,
 * while there are some videos to show
 **************************************/



function slideShowCycle() {
    var $active = $('#videoPlayer-slideshow .active');
    var $next = ($active.next().length > 0) ? $active.next() : $('#videoPlayer-slideshow img:first');
    $next.css('z-index', 1002);//move the next image up the pile
    $active.fadeOut(1500, function () {//fade out the top image
        $active.css('z-index', 1001).show().removeClass('active');//reset the z-index and unhide the image
        $next.css('z-index', 1003).addClass('active');//make the next image the top one
    });
};



let created = false;
let cycle = null;


export default class SplashScreen {

    static show(rootAsset) {

        SplashScreen.enabled = true;

        $("#videoPlayer-slideshow").fadeIn();

        /* populate */
        if (!created) {
            created = true;
            const posterFolder = "../data/poster/";
            let images = [];
            for (let i = 0; i < rootAsset.children.length; i++) {
                if (rootAsset.children[i].asset.constructor.name === "Video") {
                    images[i] = posterFolder + rootAsset.children[i].asset.poster_url;
                    var $url = images[i];

                    if (i === 0) {
                        $('.active').attr('src', $url);
                    }
                    else {
                        $("#videoPlayer-slideshow").append("<img src='" + $url + "'></img>");
                    }
                }
            }

            $("#videoPlayer-preloader").fadeOut();
        }


        /* start cycle */
        cycle = setInterval(function () {
            slideShowCycle();
        }, 4000);

    };



    static hide() {
        if (cycle) {
            clearInterval(cycle);
            cycle = null;
        };
        $("#videoPlayer-slideshow").fadeOut();
    }
}

SplashScreen.enabled = false;






