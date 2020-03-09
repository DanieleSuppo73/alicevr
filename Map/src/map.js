
const map = {

    params: {
        useMapbox: false,
        fxaa: false,
        maxScreenSpaceError: 2,
        occlusion: true, // occlusion culling
        brightness: 0.3,
        hue: 0.04,
        saturation: -0.01,
        //defaultAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZDU1NWMyOC00YjFkLTQ5OTUtODg5Yy0zZDRlNGI1NTg3ZjciLCJpZCI6MTUxNTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjcyNDQ4NjR9.WDQmliwvLOArHiI9n4ET2TBELHRsGofW1unvSsbuyR8',
    },



    imageryProvider: function () {
        return (
            map.params.useMapbox ?
            new Cesium.MapboxImageryProvider({
                mapId: 'mapbox.satellite',
                accessToken: 'pk.eyJ1IjoiZGFuaWVsZXN1cHBvIiwiYSI6ImNqb2owbHp2YjAwODYzcW8xaWdhcGp1ancifQ.JvNWYw_cL6rV7ymuEbeTCw'
            }) :
            null
        );
    },

    initHeading: null,
    // initPitch: -1.52, //90°
    initPitch: -0.75,
    initRange: 0,

    /// handlers for subscribed functions
    onMapReadyHandlers: [],
    onMapHeightChangedHandlers: [],
    onOverEntityHandlers: [],
    onExitEntityHandlers: [],
    onLeftClickEntityHandlers: [],
    onLeftDownHandlers: [],


    isReady: false,
    set _isReady(value) {
        this.isReady = value;
        if (value) {
            console.log('map.isReady')
            for (let i in this.onMapReadyHandlers) this.onMapReadyHandlers[i]();

            let cameraHeight = Math.round(cameraProperties.height);
            for (let i in this.onMapHeightChangedHandlers) this.onMapHeightChangedHandlers[i](cameraHeight);

            map.cameraHeight = cameraHeight;
        }


    },
    focusEntity: undefined,
    oldFocusEntity: undefined,

    cameraHeight: null,





    /// function to execute when the mouse is over an entity
    onOverEntity: function () {
        if (this.focusEntity === this.oldFocusEntity) return;

        this.onExitEntity();
        this.oldFocusEntity = this.focusEntity;

        /// execute subscribed functions
        for (let i in this.onOverEntityHandlers) {
            this.onOverEntityHandlers[i](this.focusEntity);
        }
    },


    /// function to execute when the mouse exit
    /// from a previuous entity with mouse over
    onExitEntity: function () {
        if (typeof this.oldFocusEntity === 'undefined') return;

        /// execute subscribed functions
        for (let i in this.onExitEntityHandlers) {
            this.onExitEntityHandlers[i](this.oldFocusEntity);
        }
        this.oldFocusEntity = undefined;
    },


    /// function to execute on left click on entity
    onLeftClickEntity: function () {

        /// execute subscribed functions
        for (let i in this.onLeftClickEntityHandlers) {
            this.onLeftClickEntityHandlers[i](this.focusEntity);
        }
    },


    /// function to execute on left mouse down somewhere
    onLeftDown: function () {

        /// execute subscribed functions
        for (let i in this.onLeftDownHandlers) {
            this.onLeftDownHandlers[i]();
        }
    }
};


let useHighQuality = getParameterFromIframe("hq");
map.params.useMapbox = useHighQuality === "true" ? false : true;
map.params.maxScreenSpaceError = useHighQuality === "true" ? 2 : 4;



Cesium.Ion.defaultAccessToken = getParameterFromIframe("token");
const terrainProvider = Cesium.createWorldTerrain();
const viewer = new Cesium.Viewer('container', {
    imageryProvider: map.imageryProvider(),
    terrainProvider: terrainProvider,
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    useBrowserRecommendedResolution: false, /// change this to improve rendering speed on mobile
});


var scene = viewer.scene;
viewer.scene.globe.depthTestAgainstTerrain = map.params.occlusion;
viewer.scene.postProcessStages.fxaa.enabled = map.params.fxaa;
viewer.scene.globe.maximumScreenSpaceError = map.params.maxScreenSpaceError;
scene.skyAtmosphere.brightnessShift = map.params.brightness;
scene.skyAtmosphere.hueShift = map.params.hue;
scene.skyAtmosphere.saturationShift = map.params.saturation;


let credits = map.params.useMapbox ?
    "Imagery data attribution Mapbox" :
    "Imagery data attribution Bing Maps";
$("#credits").text(credits)


//////////////////////////////////////////////////////////////////////////////////////////////////////
/// register the handler for over / exit entity
//////////////////////////////////////////////////////////////////////////////////////////////////////
viewer.screenSpaceEventHandler.setInputAction(function (movement) {
    map.focusEntity = scene.pick(movement.endPosition);
    if (Cesium.defined(map.focusEntity)) map.onOverEntity();
    else map.onExitEntity();
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



//////////////////////////////////////////////////////////////////////////////////////////////////////
/// register the handler for left click on entity
//////////////////////////////////////////////////////////////////////////////////////////////////////
viewer.screenSpaceEventHandler.setInputAction(function (movement) {
    map.focusEntity = viewer.scene.pick(movement.position);
    if (!Cesium.defined(map.focusEntity)) return;
    map.onLeftClickEntity();
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);



//////////////////////////////////////////////////////////////////////////////////////////////////////
/// register the handler for left mouse button down somewhere
//////////////////////////////////////////////////////////////////////////////////////////////////////
viewer.screenSpaceEventHandler.setInputAction(function (movement) {
    map.onLeftDown();
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);



//////////////////////////////////////////////////////////////////////////////////////////////////////
/// register the listener to place the overlayLabel on the map
//////////////////////////////////////////////////////////////////////////////////////////////////////
const overlayLabel = document.getElementById('overlayLabel');
let scratch = new Cesium.Cartesian2();
let offsetWidth = 0;
let offsetHeight = 0;
viewer.scene.preRender.addEventListener(function () {

    if (typeof map.oldFocusEntity === 'undefined') return;
    if (typeof map.oldFocusEntity.id.overlayLabel === 'undefined') return;

    /// manca height COME TERZO PARAMETRO!!!!
    let position = Cesium.Cartesian3.fromDegrees(map.oldFocusEntity.id.overlayLabel.lng, map.oldFocusEntity.id.overlayLabel.lat);
    let canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position, scratch);
    canvasPosition.x += offsetWidth;
    canvasPosition.y += offsetHeight;
    overlayLabel.style.top = canvasPosition.y + 'px';
    overlayLabel.style.left = canvasPosition.x + 'px';
});





//////////////////////////////////////////////////////////////////////////////////////////////////////
/// register the listener for map changed
//////////////////////////////////////////////////////////////////////////////////////////////////////
viewer.camera.changed.addEventListener(() => {
    if (map.isReady) {

        // let cameraHeight = Math.round(cameraProperties.height);
        let cameraHeight = cameraProperties.height;

        if (cameraHeight !== map.cameraHeight) {
            map.cameraHeight = cameraHeight;

            for (let i in map.onMapHeightChangedHandlers)
                map.onMapHeightChangedHandlers[i](map.cameraHeight);
        }
    }
});





//////////////////////////////////////////////////////////////////////////////////////////////////////
/// wait for map ready
//////////////////////////////////////////////////////////////////////////////////////////////////////
viewer.scene.globe.tileLoadProgressEvent.addEventListener((value) => {
    if (!map.isReady && value === 0) {
        map._isReady = true;
    }
});





//////////////////////////////////////////////////////////////////////////////////////////////////////
/// change map occlusion on camera height
//////////////////////////////////////////////////////////////////////////////////////////////////////
map.onMapHeightChangedHandlers.push(function (height) {
    map.params.occlusion = height > 2 ? false : true;
    viewer.scene.globe.depthTestAgainstTerrain = map.params.occlusion;
})




//////////////////////////////////////////////////////////////////////////////////////////////////////
/// return the Cartographic positions with height in meters
/// from an array of coodinates, with the elevation sampled from the terrain
//////////////////////////////////////////////////////////////////////////////////////////////////////
function getCartographicWithHeightFromCoordinates(coord, callback) {
    let positions = [];
    for (let i = 0; i < coord.length; i += 2) {
        positions.push(Cesium.Cartographic.fromDegrees(coord[i], coord[i + 1]));
    }

    let promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
    Cesium.when(promise, function (updatedPositions) {
        // positions[0].height and positions[1].height have been updated.
        // updatedPositions is just a reference to positions.

        callback(positions);
    });
}




//////////////////////////////////////////////////////////////////////////////////////////////////////
/// return the coordinates with the elevation sampled from the terrain
//////////////////////////////////////////////////////////////////////////////////////////////////////
function insertHeightInCoordinates(Obj, callback) {
    let positions = [];
    for (let i = 0; i < Obj.coordinates.length; i += 2) {
        positions.push(Cesium.Cartographic.fromDegrees(Obj.coordinates[i], Obj.coordinates[i + 1]));
    }

    let promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
    Cesium.when(promise, function (updatedPositions) {
        // positions[0].height and positions[1].height have been updated.
        // updatedPositions is just a reference to positions.

        /// add the height from cartesian to the array of log lat coordinates
        let i = 0;
        let ii = 0;
        while (i <= Obj.coordinates.length) {
            i += 2;
            if (ii == positions.length) {
                ii = positions.length - 1;
            }
            let metersToAddToHeight = 5;
            Obj.coordinates.splice(i, 0, positions[ii].height + metersToAddToHeight);
            i++;
            ii++;
        }

        /// remove last element (...?)
        Obj.coordinates.pop();

        /// callback
        callback(Obj);
    });
}




////////////////////////////////////////////////////////////
/// unlink the camera from a tracked entity
////////////////////////////////////////////////////////////
function unlinkCameraFromEntity(callback = null) {
    if (typeof viewer.trackedEntity !== 'undefined') {
        viewer.trackedEntity = null;
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        if (callback) callback();
    }
}




////////////////////////////////////////////////////////////
/// Return the Cartesian3 point that is the intersection
/// of a ray from the camera to the specified x and y canvas positions
/// and the 3d terrain
////////////////////////////////////////////////////////////
function getPointFromCamera(xCanvas = null, yCanvas = null) {
    const canvas = viewer.scene.canvas;
    if (xCanvas === null || yCanvas === null) {
        xCanvas = canvas.clientWidth / 2;
        yCanvas = canvas.clientHeight / 2;
    }
    const ray = viewer.camera.getPickRay(new Cesium.Cartesian2(
        Math.round(xCanvas), Math.round(yCanvas)
    ));

    const point = viewer.scene.globe.pick(ray, viewer.scene);
    return point;
}




////////////////////////////////////////////////////////////
/// fix the camera to reference frame,
/// prior to rotate it up and down
////////////////////////////////////////////////////////////
function fixCameraToReferenceFrame(callback = null) {
    let position = getPointFromCamera();
    viewer.camera.lookAt(position,
        new Cesium.HeadingPitchRange(viewer.camera.heading, viewer.camera.pitch, cameraProperties.range));

    if (callback) callback();
}




////////////////////////////////////////////////////////////
/// get camera properties
////////////////////////////////////////////////////////////
var _trackedEntity;


var camera = viewer.scene.camera;
var cameraProperties = {
    minHeight: 0.4, // in Km
    maxHeight: 35, // in Km
    zoomRate: 7,

    get height() { // in Km
        var cartographic = new Cesium.Cartographic();
        var ellipsoid = viewer.scene.mapProjection.ellipsoid;
        ellipsoid.cartesianToCartographic(camera.positionWC, cartographic);
        return (cartographic.height * 0.001).toFixed(1);
    },

    get range() { // in meters
        let p = getPointFromCamera();
        if (p === undefined) {
            p = new Cesium.Cartesian3(0, 0, 0);
            alert("Get camera range error!");
        }
        return Cesium.Cartesian3.distance(camera.positionWC, p);
    },
};




//////////////////////////////////////////////////////
/// get heading & pitch from 2 points
//////////////////////////////////////////////////////
function getHeadingPitchFromPoints(p1, p2) {
    //get 2 positions close together timewise
    var CC3 = Cesium.Cartesian3;
    var position1 = p1;
    var position2 = p2;

    //velocity in terms of Earth Fixed        
    var Wvelocity = CC3.subtract(position2, position1, new CC3());
    CC3.normalize(Wvelocity, Wvelocity);
    var Wup = new CC3();
    var Weast = new CC3();
    var Wnorth = new CC3();
    Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(position1, Wup);
    CC3.cross({
        x: 0,
        y: 0,
        z: 1
    }, Wup, Weast);
    CC3.cross(Wup, Weast, Wnorth);

    //velocity in terms of local ENU
    var Lvelocity = new CC3();
    Lvelocity.x = CC3.dot(Wvelocity, Weast);
    Lvelocity.y = CC3.dot(Wvelocity, Wnorth);
    Lvelocity.z = CC3.dot(Wvelocity, Wup);

    //angle of travel
    var Lup = new CC3(0, 0, 1);
    var Least = new CC3(1, 0, 0);
    var Lnorth = new CC3(0, 1, 0);
    var x = CC3.dot(Lvelocity, Least);
    var y = CC3.dot(Lvelocity, Lnorth);
    var z = CC3.dot(Lvelocity, Lup);
    var heading = Math.atan2(x, y); //math: y b4 x, heading: x b4 y
    var pitch = Math.asin(z); //make sure Lvelocity is unitized

    //angles offsets
    heading += 0 / 180 * Math.PI;
    pitch += -20 / 180 * Math.PI;

    var headingAsDegree = Math.radToDeg(heading);

    if (Math.sign(headingAsDegree) === -1) {
        headingAsDegree = (180 - Math.abs(headingAsDegree)) + 180;
    }

    heading = Math.degToRad(headingAsDegree);


    //console.log("angle: " + radToDeg(angle));
    //document.getElementById("angle").innerHTML = "angle: " + heading;

    return heading;
}





//////////////////////////////////////////////////////////
/// receiver from Dispatcher.js
//////////////////////////////////////////////////////////
dispatcher.onMessage(function (msg) {
    if (msg.command === "onVideoPlayerStatus") {

        /// when the video is ended
        if (msg.status === "ended") {
            console.log("ENDED")

            mapPlaceholder.linkedEntity = null;
            mapPlaceholder.fadeOut();

            if (videoMarkers.oldFoundTrack) videoMarkers.oldFoundTrack.notHighlight();

            /// unlink camera
            viewer.trackedEntity = null;
            viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

            /// turn off camera link button
            cameraLinkButton.isLinked = false
            cameraLinkButton.isActive = false;

            // console.log(main.selectedAsset)
            let offset = null;
            if (map.initHeading) offset =
                new Cesium.HeadingPitchRange(map.initHeading, map.initPitch, map.initRange);

            viewer.camera.flyToBoundingSphere(main.selectedAsset.boundingSphere, {
                offset: offset,
            });


            onVideoAssetClicked(main.selectedAsset);
        }

    }
});