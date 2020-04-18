import {
    Maf
} from "../../lib/Maf.js"


let vp = null;


const poster = {
    id: "videoPlayer-poster",
    title: null,
    description: null,
    show: function () {

        /// wait for title loaded...
        if (!poster.title) {
            setTimeout(this.show, 250);
        } else {
            $("#" + poster.id).fadeIn();
            $('#poster-title').text(poster.title);
            if (poster.description)
                $('#poster-description').text(poster.description);
        }
    },
    hide: function () {
        $("#" + this.id).fadeOut();
    }
}


const icon360 = {
    id: "icon-360",
    show: function () {
        $("#" + this.id).fadeIn(0);
    },
    hide: function () {
        $("#" + this.id).fadeOut();
    }
}


const icon360big = {
    id: "icon-360-big",
    show: function () {
        $("#" + this.id).attr("src", "images/icon_360-anim-big.gif");
        $("#" + this.id).fadeIn();
        let _id = this.id;
        setTimeout(function () {
            $("#" + _id).fadeOut();
        }, 6000)
    },
    hide: function () {
        $("#" + this.id).fadeOut(0);
    }
}




export const viewAngle = {
    id: "videoPlayer_viewAngle",
    show: function () {
        $("#" + this.id).fadeIn();
    },
    hide: function () {
        $("#" + this.id).fadeOut(0);
    },

    over: {
        id: "videoPlayer_viewAngle-over",
        show: function () {
            $("#" + this.id).fadeIn();
        },
        hide: function () {
            $("#" + this.id).fadeOut();
        },
    },

    rotate: function (angle) {
        if (typeof vp.plugin360 !== "undefined") {
            let $viewCone = $("#videoPlayer_viewAngle-cone");

            // For webkit browsers: e.g. Chrome
            $viewCone.css({
                WebkitTransform: 'rotate(' + angle + 'deg)'
            });
            // For Mozilla browser: e.g. Firefox
            $viewCone.css({
                '-moz-transform': 'rotate(' + angle + 'deg)'
            });
        }
    },


    resetCamera: function () {
        let initTheta = vp.plugin360.viewer.controls.theta;
        let initPhi = vp.plugin360.viewer.controls.phi;

        if (initTheta === vp.defTheta && initPhi === vp.defPhi)
            return null;

        let lerpTime = 2000;
        let sampleInterval = lerpTime / 50;
        let initTime = 0;
        let lerp = setInterval(function () {

            initTime += sampleInterval;
            if (initTime < lerpTime) {

                let t = initTime / lerpTime;
                t = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

                let theta = Maf.lerp(initTheta, vp.defTheta, t);
                let phi = Maf.lerp(initPhi, vp.defPhi, t);

                vp.plugin360.viewer.controls.theta = theta;
                vp.plugin360.viewer.controls.phi = phi;

            } else {
                clearInterval(lerp);
                vp.plugin360.viewer.controls.theta = vp.defTheta;
                vp.plugin360.viewer.controls.phi = vp.defPhi;
            }
        }, sampleInterval)
    }
}





const viewArrows = {
    id: "videoPlayer_viewArrows",
    isActive: false,
    rotInterval: null,
    increment: 0,

    show: function () {
        if (this.isActive)
            $("#" + this.id).fadeIn();
    },

    hide: function (time) {
        $("#" + this.id).fadeOut(time);
    },

    right_ON: function (div) {
        $(div).find("img:first").fadeIn();
        if (this.rotInterval) {
            clearInterval(this.rotInterval);
            this.rotInterval = null;
        }

        /// smooth acceleration
        let t = 1;
        this.increment = 0;
        this.rotInterval = setInterval(() => {
            t += 0.00002;
            let t1 = (t * t) - 1;
            this.increment = Maf.clamp(t1, 0, 0.007)
            vp.plugin360.viewer.controls.theta -= this.increment;
        }, 10);
    },

    right_OFF: function (div) {
        $(div).find("img:first").fadeOut();
        if (this.rotInterval) {
            clearInterval(this.rotInterval);
            this.rotInterval = null;
        }

        /// smooth deceleration
        let lerpTime = 1000;
        let sampleInterval = lerpTime / 50;
        let initTime = 0;
        let lerp = setInterval(() => {
            initTime += sampleInterval;
            if (initTime < lerpTime) {
                let t = initTime / lerpTime;
                t = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                let inc = Maf.lerp(this.increment, 0, t);
                vp.plugin360.viewer.controls.theta -= inc;
            } else {
                clearInterval(lerp);
            }
        }, sampleInterval)

    },

    left_ON: function (div) {
        $(div).find("img:first").fadeIn();
        if (this.rotInterval) {
            clearInterval(this.rotInterval);
            this.rotInterval = null;
        }

        /// smooth acceleration
        let t = 1;
        this.increment = 0;
        this.rotInterval = setInterval(() => {
            t += 0.00002;
            let t1 = (t * t) - 1;
            this.increment = Maf.clamp(t1, 0, 0.007)
            vp.plugin360.viewer.controls.theta += this.increment;
        }, 10);
    },

    left_OFF: function (div) {
        $(div).find("img:first").fadeOut();
        if (this.rotInterval) {
            clearInterval(this.rotInterval);
            this.rotInterval = null;
        }

        /// smooth deceleration
        let lerpTime = 1000;
        let sampleInterval = lerpTime / 50;
        let initTime = 0;
        let lerp = setInterval(() => {
            initTime += sampleInterval;
            if (initTime < lerpTime) {
                let t = initTime / lerpTime;
                t = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                let inc = Maf.lerp(this.increment, 0, t);
                vp.plugin360.viewer.controls.theta += inc;
            } else {
                clearInterval(lerp);
            }
        }, sampleInterval)
    },
}



export function load(videoPlayer, asset) {
    vp = videoPlayer;
    poster.title = asset.title;
    poster.description = asset.description;
}


export function showOnReady() {
    poster.show();
    icon360.show();
    icon360big.hide();
    viewAngle.hide();
    viewAngle.over.hide();
    viewArrows.isActive = false;
    viewArrows.hide(0);
}


export function showOnPlay() {
    poster.hide();
    icon360.hide();
    icon360big.show();
    viewAngle.show();
    viewArrows.isActive = true;
}



export function slideShow(rootAsset) {
    console.log("SLIDESHOW")
    const posterFolder = "../data/poster/";
    let images = [];
    console.log("rootAsset")

    /* populate */
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



    function cycleImages() {
        var $active = $('#videoPlayer-slideshow .active');
        var $next = ($active.next().length > 0) ? $active.next() : $('#videoPlayer-slideshow img:first');
        $next.css('z-index', 1002);//move the next image up the pile
        $active.fadeOut(1500, function () {//fade out the top image
            $active.css('z-index', 1001).show().removeClass('active');//reset the z-index and unhide the image
            $next.css('z-index', 1003).addClass('active');//make the next image the top one
        });
    }

    $(document).ready(function () {
        $("#videoPlayer-preloader").fadeOut();
        // run every 7s
        setInterval(function(){
            cycleImages();
        }, 4000);
    })







    // var preloads = images;

    // $(preloads).each(function () {
    //     $('<img/>')[0].src = this;
    // });



    // let n1 = 0;
    // let n2 = 1;
    // const slide = function () {
    //     setTimeout(() => {

    //         if (n1 < images.length - 1) {
    //             n1++;
    //             if (n2 < images.length - 1) n2++;
    //             else {
    //                 n2 = 0;
    //             }
    //         }
    //         else {
    //             n1 = 0;
    //             n2 = 1;
    //         }

    //         $('#videoPlayer-slideshow img:nth-child(1)').fadeOut();


    //         // $('#videoPlayer-slideshow img:nth-child(1)').fadeOut(400, function () {
    //         //     $('#videoPlayer-slideshow img:nth-child(1)').attr('src', images[n1]);
    //         //     $('#videoPlayer-slideshow img:nth-child(1)').fadeIn();
    //         // })

    //         // slide();



    //     }, 4000)
    // }


    // $('#videoPlayer-slideshow img:nth-child(1)').attr('src', images[n1]);
    // $('#videoPlayer-slideshow img:nth-child(2)').attr('src', images[n2]);

    


    // slide();
}




/// expose for DOM
window.viewArrows = viewArrows;
window.viewAngle = viewAngle;