UI = {

    onImageLoadedHandlers: [],

    createList(list) {

        /// hide the default 
        $('#list-item_container').css('display', 'none');


        for (let i = 0; i < list.length; i++) {
            CreateDiv(list[i]);

            /// if any, create the sub-items
            if (list[i].subObj.length > 0) {
                for (let ii = 0; ii < list[i].subObj.length; ii++) {
                    CreateDiv(list[i].subObj[ii]);
                }
            }
        }



        /// collect all thumbnails images to preload
        let tmbToPreload = [];
        for (let i = 0; i < list.length; i++) {
            getAssetRecursive(list[i], true, 'video', false, (result) => {
                tmbToPreload.push("data/poster/" + result.poster);
            });
        }

        /// preload the thumbnails
        preloadImages(tmbToPreload, function () {

            console.log("ALL TMB LOADED !!!!")

            /// execute subscribed functions
            /// to the handlers
            for (let i in UI.onImageLoadedHandlers) UI.onImageLoadedHandlers[i]();


        })
    },

}


const CreateDiv = (obj) => {

    if (obj.type !== "video") return;


    /// clone the container
    let newId = obj.id + '_container';
    $('#list-item_container').clone().prop('id', newId).appendTo("#list-container");
    $('#' + newId).css({
        'display': 'flex'
    });

    let div = "#list-item_video";

    /// owner profile picture
    $(div).find('.list-item-ownerPicture').attr('src', 'images/profiles/' + obj.owner + ".jpg");

    /// title
    $(div).find('.list-item-title').text(obj.title);

    /// description
    // $(div).find('.list-item-description').text(obj.description);

    /// poster image
    let folder = 'data/poster/';
    $(div).find('.list-item-poster').attr('src', folder + obj.poster);



    /// append new item
    $(div).clone().prop('id', obj.id).appendTo("#" + newId);
    // $(div).prop('id', obj.id).appendTo("#" + newId);
    $('#' + obj.id).css({
        'display': 'flex'
    });

    // $('#' + obj.id).css({
    //     'opacity': '0.5'
    // });

    /// register handlers
    $('#' + obj.id).hover(function () {
        onListWidgetHover('#' + obj.id);
    }, function () {
        onListWidgetOut('#' + obj.id);
    });


    // $('#' + newId).fadeIn();
    // fade(obj.id, 'in', 5000);

}


function fade(id, io, tm) {
    console.log("fade:::: " + id)
    var el = document.getElementById(id);
    switch (io) {
        case "in":
            el.style.opacity = 1;
            break;
        case "out":
            el.style.opacity = 0;
            break;
    }
    el.style.transition = "opacity " + tm + "s";
    el.style.WebkitTransition = "opacity " + tm + "s";
}



const getIconByType = (type, selected = false) => {
    if (!selected) {
        if (type === 'event') return 'images/icon_placeholder-event.svg';
        if (type === 'video') return 'images/icon_placeholder-video.svg';
        if (type === 'track') return 'images/icon_placeholder-track.svg';
        return null;
    }
    /// get from preloaded images
    else {
        let name;
        if (type === 'event') name = 'icon_placeholder-event_selected.svg'
        if (type === 'video') name = 'icon_placeholder-video_selected.svg'
        let index = preload.urls.indexOf(name);
        return preload.images[index];
    }
}