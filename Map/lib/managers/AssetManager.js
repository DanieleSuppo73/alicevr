import {
    dispatcher
} from "../../../lib/dispatcher.js";
import Map from "../Map.js";
import Loader from "./Loader.js";
import Player from "./Player.js"



export default class AssetManager {

    static init() {

        zoomToAll();

        /* if there's only one video asset
        click it */
        if (Loader.root.asset.constructor.name === "Video") {
            navigatorButtonEnabled = false;
            Map.onReady.push(() => {
                const timeout = 2000;
                setTimeout(() => {
                    const entity = Loader.root.asset.entity;
                    AssetManager.OnClick_Video(entity);
                }, timeout)
            })
        }
        /* or, send message for root asset */
        else {
            dispatcher.sendMessage("rootAssetClicked", Loader.root.asset);
        }





        /* HOME button
        ***************/
        // $('#navigator-button-home').mouseenter(
        //     function () {
        //         $(this).attr('src', 'images/icon_home_on.svg');
        //     }
        // );
        // $('#navigator-button-home').mouseleave(
        //     function () {
        //         $(this).attr('src', 'images/icon_home_off.svg');
        //     }
        // );
        $('#homeButton').click(
            function () {
                $(this).fadeOut();
                selectedAsset.entityClicked.utils.setOpacity(0.01);
                reset(() => {
                    selectedAsset = null;
                    hoverAsset = null;
                    zoomToAll(true);
                    // hideNavigatorButtons();
                    // hideNavigatorMessage();
                })

                /* send message for root asset */
                dispatcher.sendMessage("rootAssetClicked", Loader.root.asset);
            }
        );


        // $('#navigator-button-play').mouseenter(
        //     function () {
        //         $(this).attr('src', 'images/icon_play_on.svg');
        //     }
        // );
        // $('#navigator-button-play').mouseleave(
        //     function () {
        //         $(this).attr('src', 'images/icon_play_off.svg');
        //     }
        // );
        // $('#navigator-button-play').click(
        //     function () {
        //         startPlay();
        //     }
        // );



        Map.onOverEntity.push((entity) => {
            switch (entity.id.category) {

                case "PLACEHOLDER-VIDEO":
                    console.log("ENTER VIDEO")
                    AssetManager.OnOver(entity);
                    break;

                case "PLACEHOLDER-VIDEO-CLICKED":
                    console.log("ENTER VIDEO PLAY")

                    break;
            }
        });



        Map.onExitEntity.push((entity) => {
            switch (entity.id.category) {

                case "PLACEHOLDER-VIDEO":
                    console.log("EXIT VIDEO")
                    AssetManager.OnExit(entity);
                    break;

                case "PLACEHOLDER-VIDEO-OVER":
                    console.log("EXIT VIDEO OVER")
                    AssetManager.OnExit(entity);
                    break;
            }
        });




        Map.onClickEntity.push((entity) => {
            console.log(entity)
            switch (entity.id.category) {

                case "PLACEHOLDER-VIDEO-OVER":
                    AssetManager.OnClick_Video(entity);
                    break;

                case "PLACEHOLDER-VIDEO-CLICKED":
                    AssetManager.OnClick_Video_Play(entity);
                    break;
            }
        });
    }


    static OnOver(entity) {
        const asset = Loader.root.getAssetById(entity.id.asset.id);
        if (asset !== hoverAsset && asset !== selectedAsset) {
            console.log("OVERRRRRRRRRRRRR")
            asset.entity.utils.fade(0.01);
            asset.entity.utils.zoom(1.2);
            asset.entityOver.utils.fade(1.0);
            asset.entityOver.utils.zoom(1.2);
            hoverAsset = asset;

            // showNavigatorMessage(hoverAsset);


            var htmlOverlay = document.getElementById('overlayLabel');
            var scratch = new Cesium.Cartesian2();
            Map.viewer.scene.preRender.addEventListener(function () {
                var position = asset.entity.position._value;
                var canvasPosition = Map.viewer.scene.cartesianToCanvasCoordinates(position, scratch);
                if (Cesium.defined(canvasPosition)) {
                    htmlOverlay.style.top = (canvasPosition.y + 20) + 'px';
                    htmlOverlay.style.left = (canvasPosition.x + 20) + 'px';


                    // htmlOverlay.innerHTML = asset.title + '<br/>' + asset.location;


                    $('#overlayLabel').find(".overlayLabel-bold").text(asset.title)
                    $('#overlayLabel').find(".overlayLabel-light").text(asset.location)
                }
            });




            $('#overlayLabel').fadeIn();
        }
    };


    static OnExit(entity, forced = false) {
        const asset = typeof entity.asset === "undefined" ?
            Loader.root.getAssetById(entity.id.asset.id) :
            Loader.root.getAssetById(entity.asset.id);
        if (asset !== selectedAsset || forced) {
            console.log("EXITTTTTTTTT")
            console.log(asset)
            asset.entity.utils.fade(1);
            asset.entity.utils.zoom(1);
            asset.entityOver.utils.fade(0.1);
            asset.entityOver.utils.zoom(1, () => {
                hoverAsset = null;
            });

            // if (!forced) hideNavigatorMessage();

            $('#overlayLabel').fadeOut();
        }
    };


    static OnClick_Video(entity) {
        $("#homeButton").fadeIn();

        if (selectedAsset) {
            selectedAsset.entityClicked.utils.fade(0.01);
            reset();
        }
        if (hoverAsset) {
            $('#overlayLabel').fadeOut();
        }
        selectedAsset = typeof entity.asset === "undefined" ?
            Loader.root.getAssetById(entity.id.asset.id) :
            Loader.root.getAssetById(entity.asset.id);
        selectedAsset.entity.utils.setOpacity(0.01);
        selectedAsset.entityOver.utils.setOpacity(1);
        selectedAsset.entityOver.utils.setScale(1.2);
        selectedAsset.entityOver.utils.fade(0.01, null, 1000);
        selectedAsset.entityOver.utils.zoom(2, null, 1000);
       

        // /* show navigator */
        // if (!navigatorMessageVisible) showNavigatorMessage(selectedAsset);
        // showNavigatorButtons();

        /* initialize Player */
        Player.init(selectedAsset);

        /* fly there */
        Map.camera.flyToBoundingSphere(selectedAsset.boundingSphere, {
            offset: new Cesium.HeadingPitchRange(0, -0.5, selectedAsset.boundingSphere.radius * 2),
            complete: function () {
                console.log("FLYING COMPLETE");

                Player.showStartPoints();

                Map.fixCamera(selectedAsset.boundingSphere.center);
                startCameraRotation();

                selectedAsset.entityClicked.utils.fade(1);
            },
            duration: 8,
            easingFunction: Cesium.EasingFunction.QUADRACTIC_IN_OUT,
        });

        /* send message */
        dispatcher.sendMessage("videoAssetClicked", selectedAsset);
    };




    static OnClick_Video_Play(entity) {

        selectedAsset.entityClicked.utils.fade(0.01, null, 1000);

        /* send message */
        dispatcher.sendMessage("videoPlayerPlay");

    };



};

let selectedAsset = null;
let hoverAsset = null;
// let navigatorMessageVisible = false;
let navigatorButtonEnabled = true;


function reset(callback = null) {
    const entity = selectedAsset.entity;
    AssetManager.OnExit(entity, true);
    Player.hideStartPoints();
    stopCameraRotation();

    Player.reset(() => {
        if (callback) callback();
    });
}


function zoomToAll(slow) {

    stopCameraRotation();

    const duration = slow ? null : 0;
    const range = 140000;
    Map.camera.flyToBoundingSphere(Loader.root.asset.boundingSphere, {
        offset: new Cesium.HeadingPitchRange(0, -1.47, range),
        duration: duration,
    });
};


// function showNavigatorMessage(asset) {
//     $('#navigator-title').text(asset.title);
//     $('#navigator-location').text(asset.location);
//     $('#navigator-message').fadeIn();
//     navigatorMessageVisible = true;
// };

// function hideNavigatorMessage() {
//     if (!selectedAsset) {
//         $('#navigator-message').fadeOut();
//         navigatorMessageVisible = false;
//     }
//     else {
//         showNavigatorMessage(selectedAsset);
//     }
// };

// function showNavigatorButtons() {
//     if (navigatorButtonEnabled)
//         $('#navigator-buttons-container').fadeIn();
// };

// function hideNavigatorButtons() {
//     if (navigatorButtonEnabled)
//         $('#navigator-buttons-container').fadeOut();
// };




let rotateInterval = null;
function startCameraRotation() {
    rotateInterval = setInterval(function () {
        Map.camera.rotateLeft(0.0015);
    }, 50);
};

function stopCameraRotation() {
    if (rotateInterval) {
        Map.unfixCamera();
        clearInterval(rotateInterval);
        rotateInterval = null;
    }
};


Map.onDown.push(function () {
    stopCameraRotation();
})



/*****************
messages receivers
******************/
dispatcher.receiveMessage("playerStarted", () => {
    stopCameraRotation();
});
dispatcher.receiveMessage("playerEnded", () => {
    /* fly there */
    Map.camera.flyToBoundingSphere(selectedAsset.boundingSphere, {
        offset: new Cesium.HeadingPitchRange(0, -0.5, selectedAsset.boundingSphere.radius * 2),
        complete: function () {
            console.log("FLYING COMPLETE");

            Player.showStartPoints();

            Map.fixCamera(selectedAsset.boundingSphere.center);
            startCameraRotation();

            selectedAsset.entityClicked.utils.fade(1);
        },
        duration: 8,
        easingFunction: Cesium.EasingFunction.QUADRACTIC_IN_OUT,
    });
});


