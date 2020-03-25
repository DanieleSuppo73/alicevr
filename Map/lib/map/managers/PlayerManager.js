import {
    dispatcher
} from "../../../../lib/dispatcher.js";
import Loader from "../managers/Loader.js";
import * as jsUtils from "../../../../lib/jsUtils.js";


export default class PlayerManager {
    static init() {
        let video = Loader.root.asset;
        let t = Loader.root.getAssetByClass("Track", video);
        PlayerManager.markers = jsUtils.arrayCloneIncrease(video.markers);
        PlayerManager.markers[PlayerManager.markers.length - 1].timecode += 100; /// add 100 sec to last marker
        PlayerManager.gpx = t.tracks;
        console.log(PlayerManager.markers)
    };
};





PlayerManager.markers = null;
PlayerManager.gpx = null;
PlayerManager.foundIndex = null;


var markers = null;
var foundIndex = null;
var gpx = null;



/* check for marker
everytime we get an input from player */
const check = time => {
    if (PlayerManager.markers) {
        const y = PlayerManager.foundIndex ? PlayerManager.foundIndex : 0;
        for (let i = y; i < PlayerManager.markers.length; i++) {
            // console.log(i)
            if (time >= PlayerManager.markers[i].timecode &&
                time < PlayerManager.markers[i + 1].timecode &&
                PlayerManager.foundIndex !== i)

            {
                /* when a marker is reached */
                PlayerManager.foundIndex = i;
                onFoundIndex(i);
                break;
            }
        };
    };
};



const onFoundIndex = i => {
    console.log("found index " + PlayerManager.foundIndex)


}







dispatcher.receiveMessage("playerPlaying", function (data) {
    check(data.time);
});


///////////////////////////////////////////////////////////////////////////////////////////////////////

var time = 0;
var samplerate = 1000;
var fakePlayer = () => {
    setInterval(() => {
        time += 1000 / samplerate;
        dispatcher.sendMessage("playerPlaying", {
            time: time,
            angle: 0,
        });
    }, samplerate);
};
fakePlayer();