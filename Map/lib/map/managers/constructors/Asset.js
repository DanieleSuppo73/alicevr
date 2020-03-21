import Track from "./Track.js"


export default class Asset {
    constructor(id) {
        this.id = id
        this.url = `data/xml/${id}.xml`;
        this.type = null;
        this.childrens = [];
        this.boundingSphere = null;
    };


    setBoundingSphere(boundingSphere, callback) {
        this.boundingSphere = this.boundingSphere ?
            Cesium.BoundingSphere.union(this.boundingSphere, boundingSphere) :
            boundingSphere;

        /// decrease the counter of boundingsphere added
        Asset.loadingCount--;

        /// if all asset are loaded call the callback
        if (Asset.loadingCount === 0) {
            if (callback) callback();
        }
    };



    load(parent = null, callback = null) {

        /// increase the counter of asset loading
        if (this.id !== "main") Asset.loadingCount++;

        //////////////////////////////////////////
        /// load the XML file
        //////////////////////////////////////////
        const _this = this;
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const xml = xhttp.responseXML;


                //////////////////////////////////////////
                /// create this asset properties from xml
                //////////////////////////////////////////
                const keys = ["type", "owner", "title", "description", "date", "gpxUrl", "videoUrl", "videoUrl_1",
                    "location", "poster", "videoMarkers", "subtitles", "POI", "journal", "routes"
                ];


                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // _this[key] = null;
                    if (xml.getElementsByTagName(key).length > 0) {
                        if (xml.getElementsByTagName(key)[0].childNodes.length > 0) {
                            _this[key] = xml.getElementsByTagName(key)[0].childNodes[0].nodeValue;
                        }
                    }
                }




                //////////////////////////////////////////
                /// check for childrens of this asset,
                /// and if exist load them recursively
                //////////////////////////////////////////
                if (xml.getElementsByTagName("id").length > 0) {
                    const childrens = xml.getElementsByTagName("id");
                    for (let i = 0; i < childrens.length; i++) {
                        let id = childrens[i].childNodes[0].nodeValue;
                        _this.childrens[i] = new Asset(id);
                        _this.childrens[i].load(_this, callback);
                    }
                }




                //////////////////////////////////////////
                /// execute different functions
                /// on the base of the "type" of this asset
                //////////////////////////////////////////
                switch (_this.type) {

                    case "track":

                        /// create a new Track class property for this asset
                        _this.track = new Track(_this.gpxUrl);
                        _this.track.load((boundingSphere) => {

                            /// set the boundingSphere of this asset from
                            /// the returned boundingSphere of the Track class
                            _this.boundingSphere = boundingSphere;

                            /// add the boundingSphere of this "track" asset to
                            /// the boundingsphere of the parent asset (tipically a "video")
                            parent.setBoundingSphere(_this.boundingSphere, callback);
                        });
                        break;


                    case "video":

                        // /// if there's not any track nested into this video create a boundingSphere
                        // /// from longitude/latitude from its marker.xml file
                        // if (this.subObj.length === 0) {

                        //     console.log('bounding sphere from markers of: ' + this.title);

                        //     let Obj = this;
                        //     videoMarkers.load(this, function () {

                        //         videoMarkers.createBoundingSphereFromMarkers((returnedBoundingSphere) => {

                        //             /// set the boundingSphere of this video asset
                        //             Obj.setBoundingSphere(returnedBoundingSphere);
                        //         });
                        //     })
                        // }


                        Asset.loadingCount--;
                        break;

                }
            }
        };
        xhttp.open("GET", this.url, true);
        xhttp.send();
    };
};

Asset.loadingCount = 0;