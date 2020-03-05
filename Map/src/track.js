/// Make a HttpRequest to load the GPX file
function gpxRequest(Obj, callback = null) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            if (callback) callback(Obj, this);
        }
    };
    xhttp.open("GET", Obj.filePath + Obj.url, true);
    xhttp.send();
}





let tracksWidth = 6;
let tracksOpacity = 1;

let AAAA = 0;









let updateTrack = setInterval(function () {

    /// must change this, because it keep working when the video is ended...
    if (cameraLinkButton.isLinked){
        if (map.cameraHeight !== AAAA) {

            /// update the tracks values
            AAAA = map.cameraHeight;
    
            let maxOpacity = 0.7;
            let minOpacity = 0;
    
            let maxWidth = 6;
            let minWidth = 5;
    
    
            let minHeight = 0;
            let maxHeight = 9;
    
            let clampedHeight = Math.clamp(map.cameraHeight, minHeight, maxHeight);
            let opMult = 1 - Math.inverseLerp(minHeight, maxHeight, clampedHeight);
            let wMult = 1 - opMult;
    
    
            tracksOpacity = Math.lerp(maxOpacity, minOpacity, opMult);
            // routesWidth = Math.lerp(minWidth, maxWidth, wMult);
            routesWidth = maxWidth;
    
        }
    }
    else{
        tracksOpacity = 0.7;
        AAAA = 0;
    }
    

    
}, 200)


/// Track Class to store all the track informations and methods
/// inside the object
class Track {
    constructor(Obj) {
        this.filePath = "../data/gpx/";
        this.callback = null;
        this.url = Obj.gpxUrl;
        this.coordinates = [];
        this.cartesianPositions = [];
        this.times = [];
        this.gpx = new gpxParser();
        this.duration = 0;
        this.distance = 0;
        this.maxSlope = null;
        this.difficulty = 0;
        this.averageSpeed = 0;
        this.placeholder = null;
        this.visibleTrack = null;
        this.boundingSphere = null;
        this.isHighlighted = false;
        this.oldHighlightState = null;
        this.opacity = 0;


        // this.defaultMaterial = new Cesium.PolylineOutlineMaterialProperty({
        //     color: new Cesium.CallbackProperty(function () {
        //         return new Cesium.Color(0.26, 0.52, 0.96, tracksOpacity)
        //     }),
        //     outlineWidth: 2,
        //     // outlineColor: new Cesium.Color(0.0, 0.0, 0.0, 0.5),
        //     outlineColor: new Cesium.CallbackProperty(function () {
        //         return new Cesium.Color(0, 0, 0, tracksOpacity)
        //     }),
        // });
    }


    /// load the GPX file
    load(callback) {

        // this.isVisibleAtStart = isTrackVisibleAtStart;
        this.callback = callback;
        main.boundingSphereToLoad++;

        gpxRequest(this, (Obj, xhttp) => {

            /// create a new GPX property for this object
            /// and parse it
            Obj.gpx.parse(xhttp.responseText);


            /// Add the coordinates from GPX file
            for (let i in Obj.gpx.waypoints) {
                if (i > 0) {
                    let pos1 = Cesium.Cartesian3.fromDegrees(Obj.gpx.waypoints[i].lon, Obj.gpx.waypoints[i].lat);
                    let pos2 = Cesium.Cartesian3.fromDegrees(Obj.gpx.waypoints[i - 1].lon, Obj.gpx.waypoints[i - 1].lat);
                    let dist = Cesium.Cartesian3.distance(pos1, pos2)

                    /// check if minimum waypoints distance is reached
                    if (dist > 5) {
                        Obj.coordinates.push(Obj.gpx.waypoints[i].lon, Obj.gpx.waypoints[i].lat); // push without elevation

                        if (Obj.gpx.waypoints[i].time) {
                            Obj.times.push(new Date(Date.parse(Obj.gpx.waypoints[i].time)).getTime());
                            // console.log(new Date(Date.parse(Obj.gpx.waypoints[i].time)));
                        }
                    }

                } else {
                    Obj.coordinates.push(Obj.gpx.waypoints[i].lon, Obj.gpx.waypoints[i].lat); // push without elevation

                    if (Obj.gpx.waypoints[i].time) {
                        Obj.times.push(new Date(Date.parse(Obj.gpx.waypoints[i].time)).getTime());
                    }
                }
            }



            /// add the height, sampled from the terrain
            insertHeightInCoordinates(Obj, () => {


                /// get Cartesian3 positions from coordinates
                Obj.cartesianPositions = Cesium.Cartesian3.fromDegreesArrayHeights(Obj.coordinates);

                /// create a boundingSphere from coordinates
                Obj.boundingSphere = new Cesium.BoundingSphere.fromPoints(Obj.cartesianPositions);


                /// draw the visible track
                Obj.drawTrack();


                /// return the boundingSphere to the asset
                /// that called the Track loading
                Obj.callback(Obj.boundingSphere);

            });
        });
    };



    getDetails(callback) {

        /// get distance
        for (let i = 0; i < this.cartesianPositions.length - 1; i++) {
            let from = this.cartesianPositions[i];
            let to = this.cartesianPositions[i + 1];
            this.distance += Cesium.Cartesian3.distance(from, to);
        }
        this.distance /= 1000; /// km


        // /// get height
        // let allEle = [];
        // for (let i = 0; i < this.gpx.waypoints; i++) {
        //     allEle.push(this.gpx.waypoints[i].ele);
        // }
        // let minHeight = Math.min.apply(Math,allEle.map(function(o){return o}))
        // let maxHeight = Math.max.apply(Math,allEle.map(function(o){return o}))
        // console.log('min: ' + minHeight)
        // console.log('min: ' + minHeight)


        /// get maximim slope
        let rise = 0;
        let id = 0;
        /// we start from 8 because if we read the 'ele' gpx the first values seem to be incorrect
        /// we should use the real height instead... next time!
        for (let i = 8; i < this.gpx.waypoints.length - 1; i++) {
            if (!Number.isNaN(this.gpx.waypoints[i].ele)) {
                let diff = this.gpx.waypoints[i + 1].ele - this.gpx.waypoints[i].ele;
                if (diff > rise) {
                    rise = diff;
                    id = i;
                }
            } else {
                rise = null;
                break;
            }
        }
        if (rise !== null) {

            let posA = Cesium.Cartesian3.fromDegrees(this.gpx.waypoints[id].lon, this.gpx.waypoints[id].lat);
            let posB = Cesium.Cartesian3.fromDegrees(this.gpx.waypoints[id + 1].lon, this.gpx.waypoints[id + 1].lat);
            let dist = Cesium.Cartesian3.distance(posA, posB);
            this.maxSlope = (rise / dist) * 100;
        }


        /// get duration
        if (this.times.length !== 0) {
            let initTime = this.times[0];
            let endTime = this.times[this.times.length - 1];
            this.duration = ((endTime - initTime) / 1000) / 60; /// minutes
        }

        /// calculate other info
        this.difficulty = (this.duration / this.distance) * 15;
        this.averageSpeed = (this.distance / (this.duration / 60)).toFixed(0);

        let totDist = this.distance.toFixed(0);
        let totDuration = this.duration.toFixed(0);

        callback(totDist, totDuration, this.averageSpeed, this.maxSlope);
    };


    /// draw the track
    drawTrack() {
        this.visibleTrack = viewer.entities.add({
            polyline: {
                positions: this.cartesianPositions,
                clampToGround: false,

                width: new Cesium.CallbackProperty(function () {
                    return tracksWidth;
                }, false),


                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: new Cesium.CallbackProperty(function () {
                        return new Cesium.Color(0.26, 0.52, 0.96, tracksOpacity)
                    }),
                    outlineWidth: 2,
                    outlineColor: new Cesium.CallbackProperty(function () {
                        return new Cesium.Color(0, 0, 0, tracksOpacity)
                    }),
                }),

                show: main.isTrackVisible,
                // material: this.defaultMaterial,
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 25000), /// NOT WORKING ON MOBILE!
            }
        });
        this.visibleTrack.name = "gpxTrack";


    };


    highlight() {
        if (!this.isHighlighted) {
            this.isHighlighted = true;

            // this.visibleTrack.polyline.material = this.highlightedMaterial;
        }
    };

    notHighlight() {
        if (this.isHighlighted) {
            this.isHighlighted = false;

            // this.visibleTrack.polyline.material = this.defaultMaterial;
        }
    };
}
