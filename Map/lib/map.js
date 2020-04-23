import {
    Maf
} from "../../lib/Maf.js"



export default class Map {

    /* GET ready */
    static get ready() {
        return Map._ready;
    };

    /* return height in Km */
    static get height() {
        let cartographic = new Cesium.Cartographic();
        let ellipsoid = Map.viewer.scene.mapProjection.ellipsoid;
        ellipsoid.cartesianToCartographic(Map.camera.positionWC, cartographic);
        return (cartographic.height * 0.001).toFixed(1);
    };

    /* return range in meters */
    static get range() {
        if (Map._range === 0) console.warn("range request too early");
        return Map._range;
    };

    /* it will not fire until map is ready */
    static updateRange(position = null, callback = null) {
        let p = position ? position : Map.getPointFromCamera();
        if (p === undefined) {
            p = new Cesium.Cartesian3(0, 0, 0);
            console.error("Get camera range error");
        }
        Map._range = Cesium.Cartesian3.distance(Map.camera.positionWC, p);
        if (callback) callback();
    };



    /* get a Cartesian3 point on the surface from canvas xy position */
    static getPointFromCamera(xCanvas = null, yCanvas = null) {
        const canvas = Map.viewer.scene.canvas;
        if (xCanvas === null || yCanvas === null) {
            xCanvas = canvas.clientWidth / 2;
            yCanvas = canvas.clientHeight / 2;
        }
        const ray = Map.camera.getPickRay(new Cesium.Cartesian2(
            xCanvas, yCanvas
        ));
        const point = Map.viewer.scene.globe.pick(ray, Map.viewer.scene);
        return point;
    };

    /* take an array of lon-lat and return Cartesian positions
    with the height sampled from the terrain plus @meters */
    static addHeightToCoordinatesAndReturnCartesians(lonLatArray, meters, callback) {
        let cartographics = [];
        for (let i = 0; i < lonLatArray.length; i += 2) {
            cartographics.push(Cesium.Cartographic.fromDegrees(lonLatArray[i], lonLatArray[i + 1]));
        }

        /// add height to the cartographics array
        let promise = Cesium.sampleTerrainMostDetailed(Map.viewer.terrainProvider, cartographics);
        Cesium.when(promise, function () {
            /// add the height from cartesian to the array of log lat coordinates
            let i = 0;
            let ii = 0;
            while (i <= lonLatArray.length) {
                i += 2;
                if (ii == cartographics.length) {
                    ii = cartographics.length - 1;
                }
                lonLatArray.splice(i, 0, cartographics[ii].height + meters);
                i++;
                ii++;
            }
            /// remove last element (...?)
            lonLatArray.pop();
            const cartesians = Cesium.Cartesian3.fromDegreesArrayHeights(lonLatArray);
            callback(cartesians);
        });
    };

    /* unlink the camera from a tracked entity */
    static unlinkCameraFromEntity(callback = null) {
        if (typeof Map.viewer.trackedEntity !== 'undefined') {
            Map.viewer.trackedEntity = null;
            Map.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            if (callback) callback();
        }
    };

    /* unfix the camera from reference frame */
    static unfixCamera() {
        Map.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    };

    /* fix the camera to reference frame */
    static fixCamera(position = null, callback = null) {
        let pos = position ? position : Map.getPointFromCamera();
        Map.updateRange(pos, () => {
            Map.camera.lookAt(pos,
                new Cesium.HeadingPitchRange(Map.camera.heading, Map.camera.pitch, Map.range));
            if (callback) callback();
        })
    };

    /* get heading & pitch as angles from 2 points */
    static getHeadingPitchFromPoints(p1, p2) {
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

        var headingAsDegree = Maf.rad2Deg(heading);

        if (Math.sign(headingAsDegree) === -1) {
            headingAsDegree = (180 - Math.abs(headingAsDegree)) + 180;
        }

        heading = Maf.deg2Rad(headingAsDegree);

        return heading;
    };



    /*******************************************************
    *********************** INIT ***************************
    *******************************************************/
    static init() {

        /* main */
        // Cesium.Ion.defaultAccessToken = getParameterFromIframe("token");
        Cesium.Ion.defaultAccessToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZDU1NWMyOC00YjFkLTQ5OTUtODg5Yy0zZDRlNGI1NTg3ZjciLCJpZCI6MTUxNTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjcyNDQ4NjR9.WDQmliwvLOArHiI9n4ET2TBELHRsGofW1unvSsbuyR8';
        Map.viewer = new Cesium.Viewer('cesiumContainer', {
            imageryProvider: Map.params.imageryProvider(),
            terrainProvider: Cesium.createWorldTerrain(),
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
        Map.camera = Map.viewer.scene.camera;
        Map.canvas = Map.viewer.scene.canvas;


        /* parameters */
        Map.viewer.scene.globe.depthTestAgainstTerrain = Map.params.occlusion;
        Map.viewer.scene.postProcessStages.fxaa.enabled = Map.params.fxaa;
        Map.viewer.scene.globe.maximumScreenSpaceError = Map.params.maxScreenSpaceError;
        Map.viewer.scene.skyAtmosphere.brightnessShift = Map.params.useMapbox ? 0.3 : 0;
        Map.viewer.scene.skyAtmosphere.hueShift = Map.params.useMapbox ? 0.04 : 0;
        Map.viewer.scene.skyAtmosphere.saturationShift = Map.params.useMapbox ? -0.01 : 0;

    



        /* credits */
        let credits = Map.params.useMapbox ?
            "Imagery data attribution Mapbox" :
            "Imagery data attribution Bing Maps";
        let id = document.getElementById("credits");
        if (id !== null && id.value == "") id.innerHTML = credits;


        /* call handlers on viewer defined */
        for (let i = 0; i < Map.onStarted.length; i++) {
            Map.onStarted[i]();
        };


        /// over / exit entity
        Map.viewer.screenSpaceEventHandler.setInputAction(function (movement) {

            let _entity = Map.viewer.scene.pick(movement.endPosition);
            if (Cesium.defined(_entity)) {

                if (!_entity.id.selectable) return;

                document.body.style.cursor = "pointer";
                
                if (Map.entity !== _entity) {
                    Map.entity = _entity;

                    // if (Map.entity) {
                    //     for (let i = 0; i < Map.onExitEntity.length; i++) {
                    //         Map.onExitEntity[i](Map.entity);
                    //     };
                    // }

                    /* wait a little to avoid rapid movement */
                    setTimeout(function(){
                        if (Map.entity){
                            for (let i = 0; i < Map.onOverEntity.length; i++) {
                                Map.onOverEntity[i](Map.entity);
                            };
                        }
                    }, 200);

                }
            } else {
                document.body.style.cursor = "default";

                if (Map.entity) {
                    console.log("---- Map - exit ----")
                    console.log(Map.entity)
                    for (let i = 0; i < Map.onExitEntity.length; i++) {
                        Map.onExitEntity[i](Map.entity);
                    };
                    Map.entity = null;
                }



            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


        /// click on entity
        Map.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            let _entity = Map.viewer.scene.pick(movement.position);
            if (Cesium.defined(_entity)) {
                Map.entity = _entity;
                for (let i = 0; i < Map.onClickEntity.length; i++) {
                    Map.onClickEntity[i](Map.entity);
                };
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        /// mouse down on the map
        Map.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            for (let i = 0; i < Map.onDown.length; i++) {
                Map.onDown[i]();
            };
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);


        //////////////////////////////
        /// check for ready
        //////////////////////////////
        Map.viewer.scene.globe.tileLoadProgressEvent.addEventListener((value) => {
            if (!Map._ready && value === 0) {
                Map._ready = true;
                // console.log("map is ready")

                ///update range immediately and call onReady functions
                Map.updateRange(null, () => {
                    for (let i = 0; i < Map.onReady.length; i++) {
                        Map.onReady[i]();
                    }
                });

                /// add listener to update range on camera changed
                Map.camera.changed.addEventListener(() => {
                    Map.updateRange();
                });
            }
        });
    }
}







Map.params = {
    useMapbox: true,
    fxaa: false,
    maxScreenSpaceError: 6,
    occlusion: false,
    useBrowserRecommendedResolution: false,
    imageryProvider: function () {
        return (
            this.useMapbox ?
                new Cesium.MapboxImageryProvider({
                    mapId: 'mapbox.satellite',
                    accessToken: 'pk.eyJ1IjoiZGFuaWVsZXN1cHBvIiwiYSI6ImNqb2owbHp2YjAwODYzcW8xaWdhcGp1ancifQ.JvNWYw_cL6rV7ymuEbeTCw'
                }) :
                null
        );
    },
};


Map._ready = false;
Map._range = 0;
Map.viewer = null;
Map.camera = null;
Map.canvas = null;
Map.entity = null;
// Map.oldEntity = null;
Map.onStarted = [];
Map.onReady = [];
Map.onDown = [];
Map.onOverEntity = [];
Map.onExitEntity = [];
Map.onClickEntity = [];

