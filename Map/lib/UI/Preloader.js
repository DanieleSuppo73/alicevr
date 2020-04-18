import Map from "../Map.js";

export default class Preloader {

    static init () {

        Map.viewer.scene.globe.tileLoadProgressEvent.addEventListener((valProgress) => {
            if (!Map.ready) {
                if (valProgress === 0) {
                    hide();
                } else {
                    if (!isProgressing) {

                        /// flag as started to download tiles
                        if (valProgress >= minProgress) {
                            isProgressing = true;
                            maxProgress = valProgress;
                        }
                    }
                    /// get the progress in percentage
                    if (isProgressing) {
                        if (valProgress > maxProgress) maxProgress = valProgress;
                        let mapLoadingPercent = (100 - (valProgress / maxProgress * 100)).toFixed(0);
                        $("#progressBar").css("right", (100 - mapLoadingPercent) + '%');
                    }
                }
            } 
        });
    };
}


const minProgress = 20; /// change only this for min requested tiles
let maxProgress = 0;
let isProgressing = false;



const hide = () => {
    $("#preloader").fadeOut();
};

