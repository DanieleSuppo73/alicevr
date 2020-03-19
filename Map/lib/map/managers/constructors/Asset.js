import Track from "./Track.js"


class Asset {
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
        if (Asset.loadingCount === 0){
            console.log("FINITO!")

            if (callback) callback();
            // else{
            //     console.log(callback)
            // }
        }
    };



    load(parent = null, callback = null) {

        // console.log(callback)

        /// increase the counter of asset loading
        Asset.loadingCount++;

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
                    "location", "poster", "videoMarkers", "subtitles", "POI", "journal", "routes"];


                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    _this[key] = null;
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








    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////













    loadOLD___________(parentObj) {

        this.parent = parentObj;

        /// load object
        loadDoc(this, function (Obj, xml) {
            let xmlDoc = xml.responseXML;
            Obj.type = xmlDoc.getElementsByTagName("objType")[0].childNodes[0].nodeValue;
            Obj.owner = xmlDoc.getElementsByTagName("userName")[0].childNodes[0].nodeValue;
            Obj.title = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;

            Obj.description = "";
            if (xmlDoc.getElementsByTagName("description").length !== 0) {
                if (xmlDoc.getElementsByTagName("description")[0].childNodes.length !== 0) {
                    Obj.description = xmlDoc.getElementsByTagName("description")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("date").length !== 0) {
                if (xmlDoc.getElementsByTagName("date")[0].childNodes.length !== 0) {
                    Obj.date = new Date(Date.parse(xmlDoc.getElementsByTagName("date")[0].childNodes[0].nodeValue));
                }
            }

            if (xmlDoc.getElementsByTagName("gpxUrl").length !== 0) {
                if (xmlDoc.getElementsByTagName("gpxUrl")[0].childNodes.length !== 0) {
                    Obj.gpxUrl = xmlDoc.getElementsByTagName("gpxUrl")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("videoUrl").length !== 0) {
                if (xmlDoc.getElementsByTagName("videoUrl")[0].childNodes.length !== 0) {
                    Obj.videoUrl = xmlDoc.getElementsByTagName("videoUrl")[0].childNodes[0].nodeValue;
                }
            }

            Obj.videoUrl_1 = null;
            if (xmlDoc.getElementsByTagName("videoUrl_1").length !== 0) {
                if (xmlDoc.getElementsByTagName("videoUrl_1")[0].childNodes.length !== 0) {
                    Obj.videoUrl_1 = xmlDoc.getElementsByTagName("videoUrl_1")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("location").length !== 0) {
                if (xmlDoc.getElementsByTagName("location")[0].childNodes.length !== 0) {
                    Obj.location = xmlDoc.getElementsByTagName("location")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("from").length !== 0) {
                if (xmlDoc.getElementsByTagName("from")[0].childNodes.length !== 0) {
                    Obj.from = new Date(Date.parse(xmlDoc.getElementsByTagName("from")[0].childNodes[0].nodeValue));
                }
            }

            if (xmlDoc.getElementsByTagName("to").length !== 0) {
                if (xmlDoc.getElementsByTagName("to")[0].childNodes.length !== 0) {
                    Obj.to = new Date(Date.parse(xmlDoc.getElementsByTagName("to")[0].childNodes[0].nodeValue));
                }
            }

            if (xmlDoc.getElementsByTagName("poster").length !== 0) {
                if (xmlDoc.getElementsByTagName("poster")[0].childNodes.length !== 0) {
                    Obj.poster = xmlDoc.getElementsByTagName("poster")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("videoMarkers").length !== 0) {
                if (xmlDoc.getElementsByTagName("videoMarkers")[0].childNodes.length !== 0) {
                    Obj.videoMarkers = xmlDoc.getElementsByTagName("videoMarkers")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("subtitles").length !== 0) {
                if (xmlDoc.getElementsByTagName("subtitles")[0].childNodes.length !== 0) {
                    Obj.subtitles = xmlDoc.getElementsByTagName("subtitles")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("POI").length !== 0) {
                if (xmlDoc.getElementsByTagName("POI")[0].childNodes.length !== 0) {
                    Obj.POI = xmlDoc.getElementsByTagName("POI")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("journal").length !== 0) {
                if (xmlDoc.getElementsByTagName("journal")[0].childNodes.length !== 0) {
                    Obj.journal = xmlDoc.getElementsByTagName("journal")[0].childNodes[0].nodeValue;
                }
            }

            if (xmlDoc.getElementsByTagName("routes").length !== 0) {
                if (xmlDoc.getElementsByTagName("routes")[0].childNodes.length !== 0) {
                    Obj.routes = xmlDoc.getElementsByTagName("routes")[0].childNodes[0].nodeValue;
                }
            }




            /// recursive load of sub objects
            if (xmlDoc.getElementsByTagName("id").length !== 0) {

                let subObjIds = xmlDoc.getElementsByTagName("id");
                for (let i = 0; i < subObjIds.length; i++) {

                    let subObjId = subObjIds[i].childNodes[0].nodeValue;

                    let thisIsTheParentObj = Obj;
                    Obj.subObj[i] = new Asset(subObjId);
                    Obj.subObj[i].load(thisIsTheParentObj);
                }
            }

            /// execute something after that the asset
            /// is loaded (and pass the parent Asset)
            Obj.onAssetLoadedHandler(parentObj);

            Obj.isLoading = false;
        })
    }


    /// function to execute when a specific
    /// asset is loaded
    onAssetLoadedHandler(parentObj) {

        if (this.type === "track") {

            if (this.gpxUrl !== null) {

                //////////////////////////////////////////////////////////////////////////////////////////////////
                /// create a new Track object property for this asset
                //////////////////////////////////////////////////////////////////////////////////////////////////
                this.track = new Track(this);
                this.track.load((returnedBoundingSphere) => {

                    /// get the boundingSphere from the
                    /// returned boundingSphere of the Track
                    this.boundingSphere = returnedBoundingSphere;

                    /// set the boundingSphere of the parent
                    parentObj.setBoundingSphere(this.boundingSphere);
                });
            }
        }

        if (this.type === 'video') {

            /// if there's not any track nested into this video create a boundingSphere
            /// from longitude/latitude from its marker.xml file
            if (this.subObj.length === 0) {

                console.log('bounding sphere from markers of: ' + this.title);

                let Obj = this;
                videoMarkers.load(this, function () {

                    videoMarkers.createBoundingSphereFromMarkers((returnedBoundingSphere) => {

                        /// set the boundingSphere of this video asset
                        Obj.setBoundingSphere(returnedBoundingSphere);
                    });
                })
            }
        }
    }


    drawPlaceholder() {
        if (this.placeholder === null) {
            console.log('create placeholder for: ' + this.title)
            this.placeholder = viewer.entities.add({
                position: this.boundingSphere.center,
                billboard: {
                    image: getIconByType(this.type),
                    width: 32,
                    height: 38,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    heightReference: Cesium.HeightReference.NONE,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
                }
            });
            /// add this asset to the placeholder for picking...
            this.placeholder.asset = this;

            /// add billboardImage property method for the placeholder
            this.placeholder.billboardImage = new billboardImage(this.placeholder);

            if (this.parent.type === 'event') {
                this.placeholder.billboardImage.setOpacity(0);
            }

            let Obj = this;

            // /// register the handler for over placeholders
            // this.onHoverHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            // this.onHoverHandler.setInputAction(function (movement) {
            //     let pickedObject = scene.pick(movement.endPosition);
            //     if (Cesium.defined(pickedObject) && (pickedObject.id === Obj.placeholder)) {
            //         onHoverPlaceholder(Obj);
            //     } else {
            //         onExitPlaceholder(Obj);
            //     }
            // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


        } else {
            this.placeholder.position = this.boundingSphere.center;
        }
    }
};

Asset.loadingCount = 0;

export default Asset;