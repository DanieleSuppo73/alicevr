
function hideWelcomePanel(){
    // $(document).ready(function(){
    //     $("#welcomePanel").fadeOut();
    // });

    $("#background").css('display', 'none');
    $("#welcomePanel").css('display', 'none');
    $("#pagePlayer").css('visibility', 'initial');
}

function showWelcomePanel(){
    // $(document).ready(function(){
    //     $("#welcomePanel").fadeIn();

    //     videoPlayer.pause();
    // });


    $("#background").css('display', 'initial');
    $("#welcomePanel").css('display', 'initial');
    $("#pagePlayer").css('visibility', 'hidden');
    videoPlayer.pause();
}


