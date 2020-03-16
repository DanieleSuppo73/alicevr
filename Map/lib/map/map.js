const map = {
    viewer: null,
    camera: null,
    canvas: null,

    ready: false,
    onReady: [],

    get height() { // in Km
        let cartographic = new Cesium.Cartographic();
        let ellipsoid = this.viewer.scene.mapProjection.ellipsoid;
        ellipsoid.cartesianToCartographic(this.camera.positionWC, cartographic);
        return (cartographic.height * 0.001).toFixed(1);
    },

    get range() { // in meters
        let p = this.getPointFromCamera();
        if (p === undefined) {
            p = new Cesium.Cartesian3(0, 0, 0);
            // alert("Get camera range error!");
        }
        return Cesium.Cartesian3.distance(this.camera.positionWC, p);
    },

    getPointFromCamera(xCanvas = null, yCanvas = null) {
        const canvas = this.viewer.scene.canvas;
        if (xCanvas === null || yCanvas === null) {
            xCanvas = canvas.clientWidth / 2;
            yCanvas = canvas.clientHeight / 2;
        }
        const ray = this.camera.getPickRay(new Cesium.Cartesian2(
            Math.round(xCanvas), Math.round(yCanvas)
        ));
        const point = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        return point;
    },

    init() {

        /// startup the viewer
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

        this.viewer.scene.globe.maximumScreenSpaceError = 4;
        this.camera = this.viewer.scene.camera;
        this.canvas = this.viewer.scene.canvas;


        /// check for ready
        this.viewer.scene.globe.tileLoadProgressEvent.addEventListener((value) => {
            if (!this.ready && value === 0) {
                this.ready = true;

                console.log("map is ready")
                for (let i = 0; i < this.onReady.length; i++) {
                    this.onReady[i]();
                }
            }
        });

    }
}

export default map;