import {
    dispatcher
} from "../../../../lib/dispatcher.js";
import Loader from "../managers/Loader.js";
import Ellipse from "../entity/Ellipse.js";
import * as jsUtils from "../../../../lib/jsUtils.js";




// PlayerManager.markers = null;
// PlayerManager.gpx = null;
// PlayerManager.foundIndex = null;


var markers = null;
var foundIndex = null;
var gpx = [];



/* check for marker
everytime we get an input from player */
const check = time => {
    if (markers) {
        const y = foundIndex ? foundIndex : 0;
        for (let i = y; i < markers.length; i++) {
            // console.log(i)
            if (time >= markers[i].timecode && time < markers[i + 1].timecode &&
                foundIndex !== i)

            {
                /* when a marker is reached */
                foundIndex = i;
                onFoundIndex(i);
                break;
            }
        };
    };
};



const onFoundIndex = i => {

    if (markers[i].gpxTime) {
        const gpxTime = markers[i].gpxTime;

        /* get the position from
        the array of gpx of the video */
        for (let i = 0; i < gpx.length; i++) {
            for (let ii = 0; ii < gpx[i].times.length - 1; ii++) {
                if (gpxTime >= gpx[i].times[ii] && gpxTime < gpx[i].times[ii + 1]) {

                    let gpxFound = gpx[i];
                    let wpIndex = gpxTime - gpxFound.times[ii] <
                        gpxFound.times[ii + 1] - gpxTime ?
                        ii : ii + 1;

                    console.log("INDEX: " + ii)
                    let position = gpxFound.positions[wpIndex];
                    console.log(position)

                    if (!PlayerManager.radar){
                        PlayerManager.radar = Ellipse.draw(position, "RADAR");
                    }
                    else{
                        PlayerManager.radar.position = position;
                    }
                    break;
                };
            };
        };


    } else {

    }


}







dispatcher.receiveMessage("playerPlaying", function (data) {
    check(data.time);
});




export default class PlayerManager {
    static init() {
        let video = Loader.root.asset;
        let t = Loader.root.getAssetByClass("Track", video);
        markers = jsUtils.arrayOfObjectsCloneAndIncrease(video.markers);
        markers[markers.length - 1].timecode += 1000; /// add 100 sec to last marker
        gpx = t.tracks;
    };
};
PlayerManager.radar = null;




///////////////////////////////////////////////////////////////////////////////////////////////////////
var play = true
var time = 0;
var samplerate = 1000;
var fakePlayer = () => {
    setInterval(() => {
        if (play) {
            time += 1000 / samplerate;
            dispatcher.sendMessage("playerPlaying", {
                time: time,
                angle: 0,
            });
        }
    }, samplerate);
};
fakePlayer();