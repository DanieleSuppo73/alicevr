export let journal = function (asset) {

    let folder = "../data/html/";
    let id = "#journal";

    $(id).empty();

    if (asset.journal_url) {

        let htmlToLoad = asset.journal_url;

        /// load and append external html
        $(id).append($('<div>').load(folder + htmlToLoad, function (responseTxt, statusTxt, xhr) {
            if (statusTxt !== "success") {
                console.error("Something was wrong loading html...")
            }
        }));
    }
}
