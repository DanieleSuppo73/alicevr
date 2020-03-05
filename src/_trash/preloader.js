
preloader = {
    show: function(){
        $(".preloader").css("visibility", "visible")
        $(".wrapper").css("visibility", "hidden")

    },
    hide: function(){
        $(".preloader").fadeOut();
        $(".wrapper").css("visibility", "visible")
    }
}


preloader.show();

UI.onImageLoadedHandlers.push(preloader.hide);