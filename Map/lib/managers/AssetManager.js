import {
    dispatcher
} from "../../../lib/dispatcher.js";
import Map from "../Map.js";
import Loader from "./Loader.js";
import Player from "./Player.js"



export default class AssetManager {

    static init() {

        zoomToAll();




        $('#navigator-button-home').mouseenter(
            function () {
                $(this).attr('src', 'images/icon_home_on.svg');
            }
        );
        $('#navigator-button-home').mouseleave(
            function () {
                $(this).attr('src', 'images/icon_home_off.svg');
            }
        );
        $('#navigator-button-home').click(
            function () {
                AssetManager.selectedAsset = null;
                // AssetManager.OnExit_Placeholder_Video(selectedEntity);

                selectedEntity.id.utils.fade(1.0);
                selectedEntity.id.utils.zoom(1.0);
                selectedEntity.id.over.utils.fade(0.1);
                selectedEntity.id.over.utils.zoom(1.0);


                selectedEntity = null;

                Player.hideStartPoints();

                stopCameraRotation();



                if (playInterval) {
                    clearInterval(playInterval);
                    playInterval = null;
                }
                if (Player.playing) {
                    Player.stop();
                }



                zoomToAll(true);



                hideNavigatorMessage();
                hideNavigatorButtons();
            }
        );


        $('#navigator-button-play').mouseenter(
            function () {
                $(this).attr('src', 'images/icon_play_on.svg');
            }
        );
        $('#navigator-button-play').mouseleave(
            function () {
                $(this).attr('src', 'images/icon_play_off.svg');
            }
        );
        $('#navigator-button-play').click(
            function () {
                startPlay();
            }
        );



        Map.onOverEntity.push((entity) => {
            switch (entity.id.category) {

                case "PLACEHOLDER-VIDEO":
                    AssetManager.OnOver(entity);
                    break;
            }
        });



        Map.onExitEntity.push((entity) => {
            switch (entity.id.category) {

                case "PLACEHOLDER-VIDEO-OVER":
                    AssetManager.OnExit(entity);
                    break;
            }
        });




        Map.onClickEntity.push((entity) => {
            switch (entity.id.category) {

                case "PLACEHOLDER-VIDEO-OVER":
                    console.log("EXIT")
                    AssetManager.OnClick_Video(entity);
                    break;

               
            }
        });
    }


    static OnOver(entity) {
        const asset = Loader.root.getAssetById(entity.id.asset.id);
        if (asset !== hoverAsset) {
            asset.entity.utils.fade(0.1);
            asset.entity.utils.zoom(1.2);
            asset.entityOver.utils.fade(1.0);
            asset.entityOver.utils.zoom(1.2);
            hoverAsset = asset;

            showNavigatorMessage(hoverAsset);
        }
    };


    static OnExit(entity) {
        const asset = Loader.root.getAssetById(entity.id.asset.id);
        asset.entity.utils.fade(1);
        asset.entity.utils.zoom(1);
        asset.entityOver.utils.fade(0.1);
        asset.entityOver.utils.zoom(1, () => {
            hoverAsset = null;
        });

        hideNavigatorMessage();
    };


    static OnClick_Video(entity) {
        selectedAsset = hoverAsset ? hoverAsset : Loader.root.getAssetById(entity.id.asset.id);
        // const selectedAsset = AssetManager.selectedAsset;
        // console.log(selectedAsset);

        /* show buttons */
        showNavigatorButtons();

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
            },
            duration: 8,
            easingFunction: Cesium.EasingFunction.QUADRACTIC_IN_OUT,
        });
    };
};

let selectedAsset = null;
let hoverAsset = null;

// let selectedEntity = null;


function zoomToAll(slow) {

    stopCameraRotation();

    let duration = slow ? null : 0;
    let range = 140000;
    Map.camera.flyToBoundingSphere(Loader.root.asset.boundingSphere, {
        offset: new Cesium.HeadingPitchRange(0, -1.47, range),
        duration: duration,
    });
};


function showNavigatorMessage(asset) {
    $('#navigator-title').text(asset.title);
    $('#navigator-location').text(asset.location);
    $('#navigator-message').fadeIn();
};

function hideNavigatorMessage() {
    if (!selectedAsset) {
        $('#navigator-message').fadeOut();
    }
    else {
        showNavigatorMessage(selectedAsset);
    }
};

function showNavigatorButtons() {
    $('#navigator-buttons-container').fadeIn();
};

function hideNavigatorButtons() {
    $('#navigator-buttons-container').fadeOut();
};




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



let playInterval = null;
function startPlay() {

    console.log("PLAY")
    Player.hideStartPoints();

    stopCameraRotation();



    /// fake player
    var time = 0;
    var samplerate = 250;
    playInterval = setInterval(() => {
        time += samplerate / 1000;
        dispatcher.sendMessage("playerPlaying", {
            time: time,
            angle: 0,
        });
    }, samplerate);
}


// function stopPlay() {
//     if (playInterval) {
//         clearInterval(playInterval);
//         playInterval = null;
//     }
// }




