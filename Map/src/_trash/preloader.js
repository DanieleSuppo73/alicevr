const preloader = {
    minProgress: 20, /// change only this for min requested tiles
    maxProgress: 0,
    isProgressing: false,

    onProgress: (valProgress) => {
        if (!map.isReady) {
            if (!preloader.isProgressing) {
                
                /// flag as started to download tiles
                if (valProgress >= preloader.minProgress) {
                    preloader.isProgressing = true;
                    preloader.maxProgress = valProgress;
                }
            }
            /// get the progress in percentage
            if (preloader.isProgressing) {
                if (valProgress > preloader.maxProgress) preloader.maxProgress = valProgress;
                let mapLoadingPercent = (100 - (valProgress / preloader.maxProgress * 100)).toFixed(0);
                $("#progressBar").css("right" , (100 - mapLoadingPercent) + '%');
            }
        }
        else{
            preloader.hideLoader();
        }
    },

    showLoader: () => {
        $("#preloader").css('display', 'block');
    },

    hideLoader: () => {
        $("#preloader").fadeOut();
    },
}


/// register the handler to catch the tile loading progress
viewer.scene.globe.tileLoadProgressEvent.addEventListener((valProgress) => {
    preloader.onProgress(valProgress);
});


/// initialize with the map loader visible
$(document).ready(preloader.showLoader());