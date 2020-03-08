function loadFromUrl(url, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback(this);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}




function convertTimeCodeToSeconds(timeString, framerate) {
    const timeArray = timeString.split(":");
    const hours = parseInt(timeArray[0]) * 60 * 60;
    const minutes = parseInt(timeArray[1]) * 60;
    const seconds = parseInt(timeArray[2]);
    const frames = parseInt(timeArray[3]) * (1 / framerate);
    return hours + minutes + seconds + frames;
}




function flyAndLinkCameraToEntity(heading, pitch, range) {

    console.log("flyAndLinkCameraToEntity")

    /// show the placeholder
    // if (!videoMarkers.firstReached)
    //     mapPlaceholder.fadeIn();

    mapPlaceholder.fadeIn();

    /// create boundingsphere around billboard
    var billboardPos = mapPlaceholder.entity.position._value;
    var boundingSphere = new Cesium.BoundingSphere(billboardPos, 1000);

    let h = typeof heading === "undefined" ? viewer.scene.camera.heading : heading;

    let p;
    if (typeof pitch === "undefined") {
        p = videoMarkers.firstReached ? viewer.scene.camera.pitch : -0.52;
    } else p = pitch;

    let r;
    if (typeof range === "undefined") {
        r = videoMarkers.firstReached ? cameraProperties.range : 500;
    } else r = range;

    if (!videoMarkers.firstReached) videoMarkers.firstReached = true;

    viewer.trackedEntity = mapPlaceholder.entity;
    viewer.camera.flyToBoundingSphere(boundingSphere, {
        offset: new Cesium.HeadingPitchRange(h, p, r),

    });
}






/// wait for markers finished to load
function waitForMarkersLoaded(callback) {
    if (videoMarkers.isLoading === true) {
        setTimeout(function () {
            waitForMarkersLoaded(callback)
        }, 100);
    } else {
        callback();
    }
}


let lerp = null;


let videoPlayerStatus = null;
let videoPlayerTime = null;

let markerReached = false;

const videoMarkers = {
    folder: "../data/xml/",
    asset: null,
    markers: [],
    markerIndex: -1,
    elapsedTime: 0,
    isLoading: false,
    oldFoundTrack: null,
    firstReached: false,

    load: function (asset, callback = null) {

        /// if there's one (only one) previous asset that is loading the markers
        /// wait until it will finish (we are doing this just for Venezia that don't have GPX... :/)
        waitForMarkersLoaded(function () {

            /// reset
            if (lerp) clearInterval(lerp);

            videoMarkers.markers = [];
            videoMarkers.markerIndex = -1;
            videoMarkers.asset = asset;
            videoMarkers.isLoading = true;
            videoMarkers.firstReached = false;

            loadFromUrl(videoMarkers.folder + asset.videoMarkers, function (xml) {
                let i;
                let xmlDoc = xml.responseXML;
                let x = xmlDoc.getElementsByTagName("MARKER");

                for (i = 0; i < x.length; i++) {

                    let marker = {};

                    /// TIMECODE of the video is required
                    let timecode = x[i].getElementsByTagName("VIDEO_TIMECODE")[0].childNodes[0].nodeValue;
                    marker.time = convertTimeCodeToSeconds(timecode, 25);

                    /// we use DATE if we have one or more gpx files, with all waypoints and their dateTimes,
                    /// and we have extracted these dateTimes on the markers.xml of the video
                    if (x[i].getElementsByTagName("GPX_TIME").length !== 0) {
                        if (x[i].getElementsByTagName("GPX_TIME")[0].childNodes.length !== 0) {
                            let date = x[i].getElementsByTagName("GPX_TIME")[0].childNodes[0].nodeValue;
                            marker.date = new Date(Date.parse(date)).getTime();
                        }
                    }

                    /// optionally we gave a TITLE for each marker, to show somewhere
                    if (x[i].getElementsByTagName("TITLE").length !== 0) {
                        if (x[i].getElementsByTagName("TITLE")[0].childNodes.length !== 0) {
                            marker.title = x[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
                        }
                    }

                    /// we use LONGITUDE and LATITUDE only if we don't have a gpx file, to have a 'fake' position
                    /// on the map for each marker
                    if (x[i].getElementsByTagName("LONGITUDE").length !== 0) {
                        if (x[i].getElementsByTagName("LONGITUDE")[0].childNodes.length !== 0) {
                            marker.longitude = x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
                        }
                    }
                    if (x[i].getElementsByTagName("LATITUDE").length !== 0) {
                        if (x[i].getElementsByTagName("LATITUDE")[0].childNodes.length !== 0) {
                            marker.latitude = x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
                        }
                    }

                    /// IF, we have the track BUT has no GPX times (usually because the Gpx is provided later)
                    /// and we want the placeholder to follow the track however, we read the ID of the track object
                    if (x[i].getElementsByTagName("FOLLOW_TRACK").length !== 0) {
                        if (x[i].getElementsByTagName("FOLLOW_TRACK")[0].childNodes.length !== 0) {
                            marker.followTrack = x[i].getElementsByTagName("FOLLOW_TRACK")[0].childNodes[0].nodeValue;
                        }
                    }

                    videoMarkers.markers.push(marker);
                }

                if (callback) {
                    callback();
                } else {
                    videoMarkers.isLoading = false;
                }
            });
        })
    },


    /// create a boundingSphere from markers LONGITUDE / LATITUDE xml values
    /// (that's because we don't have a GPX associated to the asset)
    createBoundingSphereFromMarkers: function (callback) {

        main.boundingSphereToLoad++;

        /// Create the coordinates array from longitude/latitude 
        let coordinates = [];
        for (let i in this.markers) {
            coordinates.push(this.markers[i].longitude, this.markers[i].latitude); // push without elevation
        }

        /// get Cartesian3 positions from coordinates
        let cartesianPositions = Cesium.Cartesian3.fromDegreesArray(coordinates);

        /// create a boundingSphere from coordinates
        let boundingSphere = new Cesium.BoundingSphere.fromPoints(cartesianPositions);

        /// return the boundingSphere to the asset
        /// that called the Track loading
        callback(boundingSphere);

        this.isLoading = false;
    },


    check: function () {

        /// if there are no markers return
        if (videoMarkers.markers.length < 2) return;

        for (let i = 0; i < videoMarkers.markers.length; i++) {

            // console.log("---------------------------------")
            // console.log("i " + i);
            // console.log("videoMarkers.markerIndex " + videoMarkers.markerIndex);
            // console.log("videoPlayerTime " + videoPlayerTime)
            // console.log("videoMarkers.markers[i].time " + videoMarkers.markers[i].time)
            // console.log("videoMarkers.markers[i + 1].time " + videoMarkers.markers[i + 1].time)

            if (i < videoMarkers.markers.length - 1 && videoPlayerTime >= videoMarkers.markers[i].time &&
                videoPlayerTime < videoMarkers.markers[i + 1].time && videoMarkers.markerIndex !== i) {

                videoMarkers.markerIndex = i;
                videoMarkers.onNewMarkerReached();
                // console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC")
                break;

            } else if (i === videoMarkers.markers.length - 1 && videoPlayerTime >= videoMarkers.markers[i].time &&
                videoMarkers.markerIndex !== i) {

                videoMarkers.markerIndex = i;
                videoMarkers.onNewMarkerReached();
                break;
            }
        }
    },

    onNewMarkerReached: function () {

        markerReached = true;




        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////



        /// --> if theres's no DATE in the marker
        /// --> we will use LONGITUDE and LATITUDE values
        /// --> to place the placeholder in the right position
        if (typeof videoMarkers.markers[this.markerIndex].date === "undefined") {

            if (videoMarkers.markers[this.markerIndex].longitude &&
                videoMarkers.markers[this.markerIndex].latitude) {

                /// move the placeholder to the position
                /// specificed with LONGITUDE and LATITUDE values of the xml
                showOnlyMarkerPosition();


            } else {
                /// if there's no DATE, and neither LONGITUDE LATITUDE values
                /// report error
                console.error("ERROR: marker is defined, but with empty data")
            }
        }

        /// --> else, if there's DATE in the marker
        /// --> we will use DATE value to retrieve the right placeholder
        /// --> position from gpx waypoints
        else {
            /// get the track
            let markerDateTime = this.markers[this.markerIndex].date;

            getTrackFromDateTime(markerDateTime)
                .then(function (foundTrack) {

                    /// highlight the track
                    if (videoMarkers.oldFoundTrack && foundTrack !== videoMarkers.oldFoundTrack)
                        videoMarkers.oldFoundTrack.notHighlight();
                    foundTrack.highlight();
                    videoMarkers.oldFoundTrack = foundTrack;

                    /// get the gpx index
                    getGpxIndexFromPlayerTime(foundTrack)
                        .then(function (foundIndex) {

                            /// if the index is not found there's an error,
                            /// so return
                            if (foundIndex === null) {
                                console.error("ERROR: index can't be found")
                                return;
                            }

                            unlinkCameraFromEntity();

                            /// start to lerp the billboard position
                            lerpPoints(foundTrack, foundIndex, false)
                        });
                })
        }
    },
};



/// if the video asset has no subObjects it means that
/// has not GPX, so we use only the Longitude/Latitude from
/// marker.xml file
let showOnlyMarkerPosition = function () {
    // console.log('showOnlyMarkerPosition for marker #' + videoMarkers.markerIndex);

    /// turn off previuos higlighted track
    if (videoMarkers.oldFoundTrack) videoMarkers.oldFoundTrack.notHighlight();

    if (lerp) {
        clearInterval(lerp);
    }

    unlinkCameraFromEntity();

    let longitude = videoMarkers.markers[videoMarkers.markerIndex].longitude;
    let latitude = videoMarkers.markers[videoMarkers.markerIndex].latitude;

    let marker = {
        coordinates: []
    }
    marker.coordinates = [longitude, latitude];

    insertHeightInCoordinates(marker, (Obj) => {
        let height = Obj.coordinates[2];
        let markerPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, height);



        /// Now, if there's no track to follow, just set the placeholder position
        /// and link the camera
        if (typeof videoMarkers.markers[videoMarkers.markerIndex].followTrack === "undefined") {

            mapPlaceholder.entity.position = markerPos;
            mapPlaceholder.show();

            /// if it's unlinked fly and link camera to the placeholder
            if (cameraLinkButton.isLinked && !viewer.trackedEntity) {
                flyAndLinkCameraToEntity();
            }
        }

        /// instead, if there's a track to follow...
        else {
            lerpPlaceholderOnFollowTrack(markerPos);
        }
    });
}



let lerpPlaceholderOnFollowTrack = function (markerPos) {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// --> if is specified a track that must be followed...
    let marker = videoMarkers.markers[videoMarkers.markerIndex];
    if (typeof marker.followTrack !== "undefined") {

        let id = marker.followTrack;
        let parentAsset = videoMarkers.asset;
        let trackToFollow = null;

        /// find all 'track' assets nested into the parent asset
        getAssetRecursive(parentAsset, false, 'track', false, (result) => {
            if (result.id === id) trackToFollow = result.track;
        })
        if (!trackToFollow) {
            console.error("track to follow not found!")
        } else {

            trackToFollow.highlight();
            videoMarkers.oldFoundTrack = trackToFollow;

            /// find the nearest waypoint
            let minDist = 9999999;
            let index;
            for (let i = 0; i < trackToFollow.cartesianPositions.length; i++) {
                let p1 = markerPos;
                let p2 = trackToFollow.cartesianPositions[i];
                let dist = Cesium.Cartesian3.distance(p1, p2);
                if (dist < minDist) {
                    minDist = dist;
                    index = i;
                }
            }


            lerpPoints(trackToFollow, index, true);
        }
    }
}





let getTrackFromDateTime = function (dateTime) {
    return new Promise(function (resolve) {
        let parentAsset = videoMarkers.asset;
        // let markerDateTime = videoMarkers.markers[videoMarkers.markerIndex].date;
        let isFound = false;
        let foundTrack;

        /// find all 'track' assets nested into the parent asset
        getAssetRecursive(parentAsset, false, 'track', false, (result) => {

            /// if we have already found the track don't continue
            if (isFound) return;

            for (let i = 0; i < result.track.times.length - 1; i++) {

                if (dateTime >= result.track.times[i] &&
                    dateTime < result.track.times[i + 1]) {
                    isFound = true;
                    foundTrack = result.track;
                    break;
                }
            }

            /// if the track is found resolve the promise
            /// with the found track
            if (isFound) {
                resolve(foundTrack);
            }
        })
    });
};






let getGpxIndexFromPlayerTime = function (track) {
    return new Promise(function (resolve, reject) {
        let index;
        let isFound = false;
        let markerTimeCode = videoMarkers.markers[videoMarkers.markerIndex].time;
        let markerDateTime = videoMarkers.markers[videoMarkers.markerIndex].date;

        /// get the actual dateTime that we'll use to retrieve
        /// the right gpx index in the track
        let actualDateTime = markerDateTime + ((videoPlayerTime - markerTimeCode) * 1000);

        for (let i = 0; i < track.times.length - 1; i++) {
            if (actualDateTime >= track.times[i] && actualDateTime < track.times[i + 1]) {

                isFound = true;
                index = actualDateTime - track.times[i] <
                    track.times[i + 1] - actualDateTime ? i : i + 1;
                break;
            }
        }

        if (isFound) {
            // console.log('>>>>>> FOUND GPX index n.' + index);
            resolve(index);
        } else {
            console.error('GPX index not found');
            reject(null);
        }
    });
};



/// variation,
/// not used during playback!
let getGpxIndexFromDateTime = function (track, dateTime) {
    return new Promise(function (resolve, reject) {
        let index;
        let isFound = false;

        for (let i = 0; i < track.times.length - 1; i++) {
            if (dateTime >= track.times[i] && dateTime < track.times[i + 1]) {

                isFound = true;
                index = dateTime - track.times[i] <
                    track.times[i + 1] - dateTime ? i : i + 1;
                break;
            }
        }

        if (isFound) {
            resolve(index);
        } else {
            console.error('GPX index not found');
            reject(null);
        }
    });
};






function lerpPoints(track, initIndex, useConstantVelocity) {

    /// stop the lerp when we call it from outside
    /// of this loop
    if (lerp) {
        clearInterval(lerp);
    }
    if (initIndex === track.times.length - 1) return;

    let initPos = track.cartesianPositions[initIndex];
    let endPos = track.cartesianPositions[initIndex + 1];
    let newPos = new Cesium.Cartesian3();


    /// we want to update the placeholder rotation
    /// at least every time the lerp is started
    if (!markerReached)
        mapPlaceholder.heading = getHeadingPitchFromPoints(initPos, endPos);
    else markerReached = false;



    /// choose from regular velocity (from gpx times)
    /// or constant velocity (if gpx times are not provided)
    let lerpTime;
    if (useConstantVelocity) {
        let dist = Cesium.Cartesian3.distance(initPos, endPos);
        let speed = 240; /// milliseconds for 1 meter @ 15Km/h
        lerpTime = (speed * dist);
    } else {
        lerpTime = track.times[initIndex + 1] - track.times[initIndex];
    }


    let t = 0;
    let time = 0;
    let sampleInterval = 50;
    lerp = setInterval(function () {

        if (videoPlayerStatus === "playing") {

            // mapPlaceholder.heading = getHeadingPitchFromPoints(initPos, endPos);

            time += sampleInterval;

            let lerpValue = time / lerpTime;

            if (time < lerpTime) {

                /// move the billboard
                Cesium.Cartesian3.lerp(initPos, endPos, lerpValue, newPos)
                mapPlaceholder.entity.position = newPos;


                if (!viewer.trackedEntity) {

                    /// get the heading from initPos - endPos
                    let heading = getHeadingPitchFromPoints(initPos, endPos);
                    mapPlaceholder.heading = heading;

                    if (cameraLinkButton.isLinked) {
                        flyAndLinkCameraToEntity(heading);
                    }
                }



                /// this is when the player is paused, to reset
                /// to default values when it play again
                else if (viewer.trackedEntity && !videoMarkers.firstReached) {

                    let heading = getHeadingPitchFromPoints(initPos, endPos);
                    mapPlaceholder.heading = heading;

                    viewer.trackedEntity = null;
                    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                    flyAndLinkCameraToEntity(heading);
                }

            } else {
                clearInterval(lerp);
                lerp = null;

                /// loop the lerp infinitely
                lerpPoints(track, initIndex + 1, useConstantVelocity);
            }
        }
    }, sampleInterval)
}





/////////////////////////////////////////////////////////////////////////////////
/// start to check for markers
/////////////////////////////////////////////////////////////////////////////////
setInterval(function () {
    if (!videoMarkers.isLoading && videoPlayerStatus === "playing") {
        videoMarkers.check();
    }
}, 200);





//////////////////////////////////////////////////////////
/// receiver from Dispatcher.js
//////////////////////////////////////////////////////////
dispatcher.onMessage(function (msg) {

    if (msg.command === "onVideoPlayerStatus") {
        videoPlayerStatus = msg.status;
        videoPlayerTime = msg.time;

        if (videoPlayerStatus === "seeking")
            videoMarkers.markerIndex = -1

        if (videoPlayerStatus === "paused") {

            /// ok, questo resetta il parametro, e al prossimo giro di "flyAndLinkCameraToEntity"
            /// lo fa tornare al posto giusto, 
            /// ma non funziona ovviamente appena si rida' il play...
            videoMarkers.firstReached = false;
        }

    }
})