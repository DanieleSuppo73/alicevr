import {
    Maf
} from "../../../lib/Maf.js"






const map = {

    /// startup parameters
    params: {
        useMapbox: false,
        fxaa: false,
        maxScreenSpaceError: 2,
        occlusion: false,
        brightness: 0.3,
        hue: 0.04,
        saturation: -0.01,
        useBrowserRecommendedResolution: false,
    },


    viewer: null,
    camera: null,
    canvas: null,
    _ready: false,
    get ready() {
        return this._ready;
    },
    entity: null,


    /// map handlers
    onStarted: [],
    onReady: [],

    /// entity handlers
    onDown: [], /// mouse down somewhere
    onOverEntity: [],
    onExitEntity: [],
    onClickEntity: [],



    /// return height in Km
    get height() {
        let cartographic = new Cesium.Cartographic();
        let ellipsoid = this.viewer.scene.mapProjection.ellipsoid;
        ellipsoid.cartesianToCartographic(this.camera.positionWC, cartographic);
        return (cartographic.height * 0.001).toFixed(1);
    },



    /// return range in meters
    _range: 0,
    /// it will not fire until map is ready
    updateRange(position = null, callback = null) {
        let p = position ? position : this.getPointFromCamera();
        if (p === undefined) {
            p = new Cesium.Cartesian3(0, 0, 0);
            console.error("Get camera range error");
        }
        this._range = Cesium.Cartesian3.distance(this.camera.positionWC, p);
        if (callback) callback();
    },
    get range() {
        if (this._range === 0) console.warn("range request too early");
        return this._range;
    },



    /// show image data attribution
    showCredits() {
        let credits = this.params.useMapbox ?
            "Imagery data attribution Mapbox" :
            "Imagery data attribution Bing Maps";
        let id = document.getElementById("credits");
        if (id !== null && id.value == "") id.innerHTML = credits;
    },



    /// get a Cartesian3 point on the surface from canvas xy position
    getPointFromCamera(xCanvas = null, yCanvas = null) {
        const canvas = this.viewer.scene.canvas;
        if (xCanvas === null || yCanvas === null) {
            xCanvas = canvas.clientWidth / 2;
            yCanvas = canvas.clientHeight / 2;
        }
        const ray = this.camera.getPickRay(new Cesium.Cartesian2(
            xCanvas, yCanvas
        ));
        const point = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        return point;
    },



    /// return the coordinates with the elevation sampled from the terrain
    insertHeightInCoordinates(Obj, callback) {
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

            callback(Obj);
        });
    },



    /// unlink the camera from a tracked entity
    unlinkCameraFromEntity(callback = null) {
        if (typeof this.viewer.trackedEntity !== 'undefined') {
            this.viewer.trackedEntity = null;
            this.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            if (callback) callback();
        }
    },


    /// unfix the camera from reference frame
    unlinkCamera() {
        this.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    },


    /// fix the camera to reference frame
    fixCamera(position = null, callback = null) {
        let pos = position ? position : this.getPointFromCamera();
        this.updateRange(pos, () => {
            this.camera.lookAt(pos,
                new Cesium.HeadingPitchRange(this.camera.heading, this.camera.pitch, this.range));
            if (callback) callback();
        })
    },


    enableCulling() {
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
    },


    disableCulling() {
        this.viewer.scene.globe.depthTestAgainstTerrain = false;
    },


    /// get heading & pitch as angles from 2 points
    getHeadingPitchFromPoints(p1, p2) {
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
    },



    //////////////////////////////
    ////////////////////// STARTUP
    //////////////////////////////
    init() {

        this.showCredits();

        //////////////////////////////
        /// create the viewer
        //////////////////////////////
        Cesium.Ion.defaultAccessToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZDU1NWMyOC00YjFkLTQ5OTUtODg5Yy0zZDRlNGI1NTg3ZjciLCJpZCI6MTUxNTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjcyNDQ4NjR9.WDQmliwvLOArHiI9n4ET2TBELHRsGofW1unvSsbuyR8';
        this.viewer = new Cesium.Viewer('cesiumContainer', {
            imageryProvider: new Cesium.MapboxImageryProvider({
                mapId: 'mapbox.satellite',
                accessToken: 'pk.eyJ1IjoiZGFuaWVsZXN1cHBvIiwiYSI6ImNqb2owbHp2YjAwODYzcW8xaWdhcGp1ancifQ.JvNWYw_cL6rV7ymuEbeTCw'
            }),
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
        this.camera = this.viewer.scene.camera;
        this.canvas = this.viewer.scene.canvas;


        /// call handlers on viewer defined
        for (let i = 0; i < this.onStarted.length; i++) {
            this.onStarted[i]();
        }



        //////////////////////////////
        /// setup parameters
        //////////////////////////////
        this.viewer.scene.globe.maximumScreenSpaceError = this.params.maxScreenSpaceError;
        this.viewer.scene.globe.depthTestAgainstTerrain = this.params.occlusion;
        this.viewer.scene.postProcessStages.fxaa.enabled = this.params.fxaa;
        this.viewer.scene.globe.maximumScreenSpaceError = this.params.maxScreenSpaceError;
        this.viewer.scene.skyAtmosphere.brightnessShift = this.params.brightness;
        this.viewer.scene.skyAtmosphere.hueShift = this.params.hue;
        this.viewer.scene.skyAtmosphere.saturationShift = this.params.saturation;





        //////////////////////////////
        /// register listeners
        //////////////////////////////

        // /// update range on camera changed
        // this.camera.changed.addEventListener(() => {
        //     this.updateRange();
        // });


        let _map = this;

        /// over / exit entity
        _map.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            let _entity = _map.viewer.scene.pick(movement.endPosition);
            if (Cesium.defined(_entity)) {
                if (_map.entity !== _entity) {

                    if (_map.entity) {
                        for (let i = 0; i < _map.onExitEntity.length; i++) {
                            _map.onExitEntity[i](_map.entity);
                        };
                    }
                    _map.entity = _entity;

                    for (let i = 0; i < _map.onOverEntity.length; i++) {
                        _map.onOverEntity[i](_map.entity);
                    };

                }
            } else {
                if (_map.entity) {
                    for (let i = 0; i < _map.onExitEntity.length; i++) {
                        _map.onExitEntity[i](_map.entity);
                    };
                    _map.entity = null;
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        /// click on entity
        _map.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            let _entity = _map.viewer.scene.pick(movement.position);
            if (Cesium.defined(_entity)) {
                _map.entity = _entity;
                for (let i = 0; i < _map.onClickEntity.length; i++) {
                    _map.onClickEntity[i](_map.entity);
                };
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        /// mouse down on the map
        _map.viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            for (let i = 0; i < _map.onDown.length; i++) {
                _map.onDown[i]();
            };
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);





        //////////////////////////////
        /// check for ready
        //////////////////////////////
        this.viewer.scene.globe.tileLoadProgressEvent.addEventListener((value) => {
            if (!this._ready && value === 0) {
                this._ready = true;
                // console.log("map is ready")

                ///update range immediately and call onReady functions
                this.updateRange(null, () => {
                    for (let i = 0; i < this.onReady.length; i++) {
                        this.onReady[i]();
                    }
                });

                /// add listener to update range on camera changed
                this.camera.changed.addEventListener(() => {
                    this.updateRange();
                });
            }
        });
    }
}



export default map;