//////////////////////////////////////////////////////////////////
////// this script is used to show
////// guide suggestions
////// N.B. IT READ FROM guide.html
//////////////////////////////////////////////////////////////////


const guide = {

    folder: "data/html/",
    oldGuideId: null,

    load: (asset) => {


        if (guide.oldGuideId) {
            $("#" + guide.oldGuideId).remove();
        }

        if (asset.guide) {

            let htmlToLoad = asset.guide;

            // htmlToLoad = "data/html/ViaDelleValli_guide.html";

            /// load and append external
            /// html file
            $('#journeyDetails').append($('<div>').load(guide.folder + htmlToLoad, function (responseTxt, statusTxt, xhr) {
                if (statusTxt == "success") {

                    guide.oldGuideId = htmlToLoad;
                }
            }));
        }





    }
}








/// subscribe to the handler
main.onSelectedAssetHandlers.push(guide.load);