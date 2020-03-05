
export let statistics = function(asset){


    
    return null;



    /// remove all previous info
    $('#journeyDetails').empty();


    let tracks = [];
    getAssetRecursive(asset, false, 'track', false, (result) => {
        tracks.push(result.track);
    });



    let totDistance = 0;
    let totDuration = 0;
    let totAverageSpeed = 0;
    
    let totMaxSlope = 0;

    if (tracks.length === 0) return;

    for (let i in tracks) {
        tracks[i].getDetails(function (distance, duration, averageSpeed, maxSlope) {
            totDistance += parseInt(distance);
            if (totDuration !== null) totDuration += parseInt(duration);
            totAverageSpeed += parseInt(averageSpeed);
            if (maxSlope !== null && maxSlope > totMaxSlope) totMaxSlope = maxSlope;
        });
    }


    /// load and append external
    /// html file
    $('#journeyDetails').append($('<div>').load("src/UI/journey.html", function (responseTxt, statusTxt, xhr) {
        if (statusTxt == "success") {

            /// check if there are tracks (called subObj, that are in fact gpx)
            /// inside this asset, if not show warning
            if (asset.subObj.length === 0) {
                $(".journeyDetailInfo").css("display", "none");
            }

            /// if instead there are tracks, show info
            else{
                $(".journeyDetailWarning").css("display", "none");
                $('#distanceText').text(totDistance);
                $('#slopeText').text(totMaxSlope.toFixed(0));
                $('#timeText').text(totDuration);
            }
        }
    }));
}







// const journey = {

//     /// show info about total journey of this video
//     showInfo: asset => {

//         /// remove all previous info
//         $('#journeyDetails').empty();


//         let tracks = [];
//         getAssetRecursive(asset, false, 'track', false, (result) => {
//             tracks.push(result.track);
//         });

//         let totDistance = 0;
//         let totDuration = 0;
//         let totAverageSpeed = 0;
//         let totMaxSlope = 0;

//         if (tracks.length === 0) return;

//         for (let i in tracks) {
//             tracks[i].getDetails(function (distance, duration, averageSpeed, maxSlope) {
//                 totDistance += parseInt(distance);
//                 if (totDuration !== null) totDuration += parseInt(duration);
//                 totAverageSpeed += parseInt(averageSpeed);
//                 if (maxSlope !== null && maxSlope > totMaxSlope) totMaxSlope = maxSlope;
//             });
//         }


//         /// load and append external
//         /// html file
//         $('#journeyDetails').append($('<div>').load("src/UI/journey.html", function (responseTxt, statusTxt, xhr) {
//             if (statusTxt == "success") {

//                 /// check if there are tracks (called subObj, that are in fact gpx)
//                 /// inside this asset, if not show warning
//                 if (asset.subObj.length === 0) {
//                     $(".journeyDetailInfo").css("display", "none");
//                 }

//                 /// if instead there are tracks, show info
//                 else{
//                     $(".journeyDetailWarning").css("display", "none");
//                     $('#distanceText').text(totDistance);
//                     $('#slopeText').text(totMaxSlope.toFixed(0));
//                     $('#timeText').text(totDuration);
//                 }
//             }
//         }));
//     }
// }