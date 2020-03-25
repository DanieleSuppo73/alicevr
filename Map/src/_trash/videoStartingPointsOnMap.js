const xmlFolder = "../data/xml/";
const imgFolder = "images/";


let videoStartingPoints = []; /// the array for the billboards
let oldPickedObject = null;



function onThisHover(entity) {
    if (entity.id.name !== "videoStartingPoint") return;
    entity.id.billboard.width = videoStartingPointsOnMap.maxSize;
    entity.id.billboard.height = videoStartingPointsOnMap.maxSize;
    entity.id.billboard.image = videoStartingPointsOnMap.imageOver;
}

function onThisExit(entity) {
    if (entity.id.name !== "videoStartingPoint") return;
    entity.id.billboard.width = new Cesium.CallbackProperty(setSizeOnCameraHeight, false),
        entity.id.billboard.height = new Cesium.CallbackProperty(setSizeOnCameraHeight, false),
        entity.id.billboard.image = imgFolder + videoStartingPointsOnMap.image;
}

function onThisPicked(entity) {
    if (entity.id.name !== "videoStartingPoint") return;


    dispatcher.sendMessage({
        command: "videoPlayerSeek",
        time: entity.id.time
    });

    dispatcher.sendMessage({
        command: "videoPlayerPlay",
    })
}


/// create video starting points on the map
/// getting its longitude / latitude from gpx tracks
let index = -1;

function createFromGpx() {
    index++;
    if (index < videoStartingPoints.length) {

        let asset = videoStartingPointsOnMap.thisAsset;
        let dateTime = videoStartingPoints[index].dateTime;
        let isFound = false;

        /// get all 'track' assets nested into this asset
        getAssetRecursive(asset, false, 'track', false, (result) => {

            if (isFound) return;

            for (let i = 0; i < result.track.times.length - 1; i++) {

                if (dateTime >= result.track.times[i] &&
                    dateTime < result.track.times[i + 1]) {
                    isFound = true;
                    foundTrack = result.track;

                    /// choose between i and i+1    
                    let trackIndex = dateTime - result.track.times[i] <
                        result.track.times[i + 1] - dateTime ? i : i + 1;


                    let position = result.track.cartesianPositions[trackIndex];
                    let time = videoStartingPoints[index].time;
                    let heightReference = Cesium.HeightReference.NONE;

                    createVideoPoint(position, time, index, heightReference);

                    break;
                }
            }
        })

        /// return to check for next
        createFromGpx();
    }
}

let pointCameraHeight = 0;
let pointSize = 0;

function setSizeOnCameraHeight() {
    if (map.cameraHeight !== pointCameraHeight) {

        /// update the width
        pointCameraHeight = map.cameraHeight;

        let maxSize = 12;
        let minSize = 9;
        let minHeight = 1;
        let maxHeight = 11;

        let clampedHeight = Math.clamp(map.cameraHeight, minHeight, maxHeight);
        let mult = 1 - Math.inverseLerp(minHeight, maxHeight, clampedHeight);
        // console.log("widthMult " + widthMult)

        videoStartingPointsOnMap.size = Math.lerp(minSize, maxSize, mult);

    }
    return videoStartingPointsOnMap.size;
}



function createVideoPoint(position, time, index, heightReference) {
    let billboard = viewer.entities.add({
        position: position,
        billboard: {
            image: imgFolder + videoStartingPointsOnMap.image,

            width: new Cesium.CallbackProperty(setSizeOnCameraHeight, false),
            height: new Cesium.CallbackProperty(setSizeOnCameraHeight, false),

            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            heightReference: heightReference,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }
    });

    // let billboard = viewer.entities.add({
    //     position : position,
    //     point : {
    //         show : true, // default
    //         color : Cesium.Color.WHITE, // default: WHITE
    //         pixelSize : 7, // default: 1
    //         outlineColor : Cesium.Color.BLACK, // default: BLACK
    //         outlineWidth : 0, // default: 0
    //         heightReference: heightReference,
    //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
    //     }
    // });



    billboard.name = "videoStartingPoint";
    billboard.time = time;
    billboard.isOver = false;
    videoStartingPoints[index].entity = billboard;
}




class videoStartingPoint {
    constructor(time, dateTime, lng, lat) {
        this.time = time;
        this.dateTime = dateTime;
        this.lng = lng;
        this.lat = lat;
        this.entity = null;
    }
}

const videoStartingPointsOnMap = {

    maxSize: 28,
    size: 0,
    // image: "videoPointOnMap.png",
    image: "whiteCircle.svg",
    // imageOver: "videoPointOnMap_over.svg",
    thisAsset: null,

    /// functions
    load: function (asset) {

        let waitForMapReady = setInterval(function () {
            if (map.isReady) {
                clearInterval(waitForMapReady);


                /// avoid empty asset
                if (typeof asset.videoMarkers === 'undefined') return;

                videoStartingPointsOnMap.thisAsset = asset;

                /// reset and create empty array
                for (let i = 0; i < videoStartingPoints.length; i++) {
                    viewer.entities.remove(videoStartingPoints[i].entity);
                }
                videoStartingPoints = [];

                /// read xml
                const xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {


                        /// function to execute after reading the xml file...
                        let xmlDoc = this.responseXML;
                        let x = xmlDoc.getElementsByTagName("MARKER");

                        /// for each 'MARKER' ...
                        for (let i = 0; i < x.length; i++) {

                            let lng = null;
                            let lat = null;
                            let dateTime = null;
                            let time = null;

                            /// the timecode is necessary!
                            let timecode = x[i].getElementsByTagName("VIDEO_TIMECODE")[0].childNodes[0].nodeValue;
                            time = convertTimeCodeToSeconds(timecode, 25);


                            if (x[i].getElementsByTagName("GPX_TIME").length !== 0) {
                                if (x[i].getElementsByTagName("GPX_TIME")[0].childNodes.length !== 0) {
                                    let date = x[i].getElementsByTagName("GPX_TIME")[0].childNodes[0].nodeValue;
                                    dateTime = new Date(Date.parse(date)).getTime();
                                }
                            }

                            if (x[i].getElementsByTagName("LATITUDE").length !== 0) {
                                if (x[i].getElementsByTagName("LATITUDE")[0].childNodes.length !== 0) {
                                    lat = x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
                                }
                            }

                            if (x[i].getElementsByTagName("LONGITUDE").length !== 0) {
                                if (x[i].getElementsByTagName("LONGITUDE")[0].childNodes.length !== 0) {
                                    lng = x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
                                }
                            }

                            let vs = new videoStartingPoint(time, dateTime, lng, lat);
                            videoStartingPoints.push(vs);
                        }


                        /// if the (video) asset has no subObjects it means that
                        /// has not GPX, so we use only the Longitude/Latitude from
                        /// marker.xml file
                        if (videoStartingPointsOnMap.thisAsset.subObj.length === 0) {

                            for (let i = 0; i < videoStartingPoints.length; i++) {
                                let lng = videoStartingPoints[i].lng;
                                let lat = videoStartingPoints[i].lat;
                                let position = new Cesium.Cartesian3.fromDegrees(lng, lat);
                                let time = videoStartingPoints[i].time;
                                let heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                                createVideoPoint(position, time, i, heightReference);
                            }

                        } else {
                            index = -1;
                            createFromGpx();
                            // setTimeout(function () {
                            //     createFromGpx();
                            // }, 1000)

                        }
                    }
                };
                xhttp.open("GET", xmlFolder + asset.videoMarkers, true);
                xhttp.send();


            }

        }, 100);
    }
}


/// subscribe to the handlers
onPicketAssetHandler.push(videoStartingPointsOnMap.load);
map.onOverEntityHandlers.push(onThisHover);
map.onExitEntityHandlers.push(onThisExit);
map.onLeftClickEntityHandlers.push(onThisPicked);

/// preload
videoStartingPointsOnMap.imageOver = new Image();
videoStartingPointsOnMap.imageOver.src = imgFolder + "videoPointOnMap_over.svg";