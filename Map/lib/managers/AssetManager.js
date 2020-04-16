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
                    AssetManager.OnOver_Placeholder_Video(entity);
                    break;
            }
        });



        Map.onExitEntity.push((entity) => {
            switch (entity.id.category) {

                case "PLACEHOLDER-VIDEO":
                    AssetManager.OnExit_Placeholder_Video(entity);
                    break;
            }
        });




        Map.onClickEntity.push((entity) => {
            switch (entity.id.category) {

                case "PLACEHOLDER-VIDEO":
                    AssetManager.OnClick_Placeholder_Video(entity);
                    break;
            }
        });
    }


    static OnOver_Placeholder_Video(entity) {
        entity.id.utils.fade(0.1);
        entity.id.utils.zoom(1.2);
        entity.id.over.utils.fade(1.0);
        entity.id.over.utils.zoom(1.2);

        /* show message */
        const selectedAsset = Loader.root.getAssetById(entity.id.asset.id);
        showNavigatorMessage(selectedAsset);
    };


    static OnExit_Placeholder_Video(entity) {
        entity.id.utils.fade(1.0);
        entity.id.utils.zoom(1.0);
        entity.id.over.utils.fade(0.1);
        entity.id.over.utils.zoom(1.0);

        hideNavigatorMessage();
    };


    static OnClick_Placeholder_Video(entity) {
        AssetManager.selectedAsset = Loader.root.getAssetById(entity.id.asset.id);
        const selectedAsset = AssetManager.selectedAsset;
        // console.log(selectedAsset);

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

AssetManager.selectedAsset = null;




function zoomToAll(slow) {

    stopCameraRotation();

    let duration = slow ? null : 0;
    let range = 140000;
    Map.camera.flyToBoundingSphere(Loader.root.asset.boundingSphere, {
        offset: new Cesium.HeadingPitchRange(0, -1.47, range),
        duration: duration,
    });
};


function showNavigatorMessage(selectedAsset) {
    $('#navigator-title').text(selectedAsset.title);
    $('#navigator-location').text(selectedAsset.location);
    $('#navigator-message').fadeIn();
};

function hideNavigatorMessage() {
    if (!AssetManager.selectedAsset) {
        $('#navigator-message').fadeOut();
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


function stopPlay() {
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
}




