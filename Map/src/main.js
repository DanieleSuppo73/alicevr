function loadDoc(Obj, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback(Obj, this);
        }
    };
    let url = main.url + Obj.id + '.xml';
    xhttp.open("GET", url, true);
    // logger.log("reading: " + url)
    xhttp.send();
}






//////
////// the Asset Class
class Asset {
    constructor(id) {
        this.id = id
        this.locomotion = null;
        this.subObj = []
        this.isLoading = true;
        this.boundingSphere = null;
        this.parent = null;
        this.placeholder = null;
        this.isOver = false;
        this.isSelected = false;
        this.isOpen = false;
        this.label = null;
        this.gpxUrl = null;
        this.subtitles = null;
        this.POI = null;
        this.guide = null;
        this.routes = null;
    }

    setBoundingSphere(receivedBoundingSphere) {

        this.boundingSphere = this.boundingSphere === null ?
            receivedBoundingSphere :
            Cesium.BoundingSphere.union(this.boundingSphere, receivedBoundingSphere);

        this.parent.setBoundingSphere(this.boundingSphere);

        /// if this asset is a video draw placeholder
        if (this.type === 'event' || this.type === 'video') {
            this.drawPlaceholder();
            // this.drawLabel();
        }
    }

    load(parentObj) {

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
                    // console.log(Obj.description)
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

            if (xmlDoc.getElementsByTagName("guide").length !== 0) {
                if (xmlDoc.getElementsByTagName("guide")[0].childNodes.length !== 0) {
                    Obj.guide = xmlDoc.getElementsByTagName("guide")[0].childNodes[0].nodeValue;
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
}










main = {
    url: '../data/xml/',
    id: 'main',
    idToLoad: null,
    subObj: [],
    isLoaded: false,
    boundingSphere: null,
    boundingSphereToLoad: 0,
    boundingSphereLoaded: 0,
    selectedAsset: null,
    oldSelectedAsset: this,
    isReady: false,
    onSelectedAssetHandlers: [],

    isTrackVisible: layersToggle.showLayers,

    toggleTracksVisibility: function (value) {
        main.isTrackVisible = value;
        getAssetRecursive(main, true, 'track', false, (result) => {
            result.track.visibleTrack.polyline.show = main.isTrackVisible;
        });
    },


    /// wait for all subobjects are loaded...
    /// wait for Asynchronous loading...
    waitForLoading: function () {
        let wait = setInterval(function () {

            for (let i = 0; i < main.subObj.length; i++) {
                if (main.subObj[i].isLoading) {
                    return;
                }

                if (main.subObj[i].subObj.length > 0) {
                    for (let ii = 0; ii < main.subObj[i].subObj.length; ii++) {
                        if (main.subObj[i].subObj[ii].isLoading) {
                            return;
                        }
                    }
                }
            }

            main.isLoaded = true;

            clearInterval(wait);

            /// sort by date
            main.subObj = main.subObj.sort((a, b) => b.date - a.date);
            console.log("FINITO di caricare gli XML");

            // /// create the list
            // UI.createList(main.subObj);


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //// if there's only one video, click it
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            let videos = [];
            getAssetRecursive(main, false, 'video', false, (result) => {
                videos.push(result);
            });
            if (videos.length === 1) {
                console.log("onPickedAsset " + videos[0].id + " ->")
                onPickedAsset(videos[0]);
            }

        }, 500)
    },



    /// load the main.xml and all its children
    load: function () {

        if (this.idToLoad) {
            const parentObj = main;
            main.subObj[0] = new Asset(this.idToLoad);
            main.subObj[0].load(parentObj);

            main.waitForLoading();


        } else {

            loadDoc(this, function (Obj, xml) {
                let xmlDoc = xml.responseXML;
                let ids = xmlDoc.getElementsByTagName("id");

                for (let i = 0; i < ids.length; i++) {
                    let id = ids[i].childNodes[0].nodeValue;

                    const parentObj = Obj;
                    Obj.subObj[i] = new Asset(id);
                    Obj.subObj[i].load(parentObj);
                }

                main.waitForLoading();
            });
        }
    },



    /// set the main boundingSphere
    /// sorrounding all assets
    setBoundingSphere(receivedBoundingSphere) {
        this.boundingSphere = this.boundingSphere === null ?
            receivedBoundingSphere :
            Cesium.BoundingSphere.union(this.boundingSphere, receivedBoundingSphere);


        this.boundingSphereLoaded++;

        if (this.boundingSphereLoaded === this.boundingSphereToLoad) {
            console.log('ALL BOUNDING SPHERE LOADED')

            // /// add more Km to the radius of the main boundingSphere
            // this.boundingSphere.radius += 5;
            this.onReady();


        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////// WHEN EVERYTING IS LOADED...
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    onReady() {
        this.isReady = true;


        /// check if there are tracks
        let thereAreTracks = false;
        getAssetRecursive(this, false, 'track', false, (result) => {
            if (result) thereAreTracks = true;
        });


        if (!thereAreTracks) {
            viewer.camera.flyToBoundingSphere(this.boundingSphere, {
                duration: 0,
            });
        } else {
            /// get the heading of the 1st marker, pointing along the track
            let boundingSphere = this.boundingSphere;
            let markerDateTime = videoMarkers.markers[0].date;
            getTrackFromDateTime(markerDateTime)
                .then(function (foundTrack) {

                    getGpxIndexFromDateTime(foundTrack, markerDateTime)
                        .then(function (foundIndex) {

                            if (foundIndex) {

                                let p1 = foundTrack.cartesianPositions[foundIndex];
                                let p2 = foundTrack.cartesianPositions[foundIndex + 1];

                                map.initHeading = getHeadingPitchFromPoints(p1, p2);
                                let offset = new Cesium.HeadingPitchRange(map.initHeading, map.initPitch, map.initRange);

                                viewer.camera.flyToBoundingSphere(boundingSphere, {
                                    offset: offset,
                                    duration: 0,
                                });
                            }
                        });
                })
        }










        /// add the handler to show/hide the tracks with the button
        layersToggle.layersToggleHandlers.push(main.toggleTracksVisibility);
    }
}







// //////////////////
// /// preload images
// //////////////////
// const preload = {
//     folder: 'images/',
//     urls: ['icon_placeholder-event_selected.svg',
//         'icon_placeholder-video_selected.svg',
//     ],
//     images: [],
//     load: function () {
//         for (let i in this.urls) {
//             let img = new Image();
//             img.src = this.folder + this.urls[i];
//             this.images.push(img)
//         }
//     }
// }












// /// register the handler for picked entity!!!!!
// viewer.screenSpaceEventHandler.setInputAction(function (movement) {
//     let pickedFeature = viewer.scene.pick(movement.position);
//     if (!Cesium.defined(pickedFeature)) {
//         return;
//     }
//     let pickedPlaceholder = pickedFeature.id;
//     if (pickedPlaceholder.asset) {
//         onPickedAsset(pickedPlaceholder.asset);
//     }
// }, Cesium.ScreenSpaceEventType.LEFT_CLICK);













// function SHOWALL() {
//     console.log('SHOWALL');
//     let selectedAsset = main;
//     getNew(selectedAsset, true, 'track', false, (result) => {
//         // result.track.visibleTrack.polyline.show = true;
//         result.track.visibleTrack.polyline.material = result.track.highlightedMaterial;
//         console.log('show track ' + result.track.url)
//     });
// }

// function HIDEALL() {
//     console.log('HIDEALL');
//     let selectedAsset = main;
//     getNew(selectedAsset, true, 'track', false, (result) => {
//         // result.track.visibleTrack.polyline.show = false;
//         result.track.visibleTrack.polyline.material = result.track.defaultMaterial;
//         console.log('show track ' + result.track.url)
//     });
// }


// function getNew(parent, includeParent, type, useOnlyParent, callback) {
//     if (useOnlyParent) {
//         console.log("MA PERCHE?")
//         callback(parent);
//         return;
//     }
//     if (includeParent && parent.type && parent.type === type)
//         callback(parent);
//     for (let i in parent.subObj) {
//         if (type !== 'any') {
//             if (parent.subObj[i].type === type) {
//                 callback(parent.subObj[i]);
//             } else {
//                 getNew(parent.subObj[i], includeParent, type, useOnlyParent, callback);
//             }
//         } else {
//             callback(parent.subObj[i]);
//             getNew(parent.subObj[i], includeParent, type, useOnlyParent, callback);
//         }
//     }
// }
















// /////////////////////////////////////////////////////////////////////////////
// /// function to execute when the mouse
// /// is Hover a placeholder
// /////////////////////////////////////////////////////////////////////////////
// function onHoverPlaceholder(Obj) {
//     console.log("onHoverPlaceholder")
//     if (!Obj.isSelected) {
//         Obj.isOver = true;
//         Obj.placeholder.billboard.scale = 1.3;

//         /// if is a video set highlight material all nested tracks
//         if (Obj.type === 'video') {
//             getAssetRecursive(Obj, true, 'track', false, (result) => {
//                 result.track.visibleTrack.polyline.material = result.track.highlightedMaterial;
//                 // result.track.visibleTrack.polyline.show = true;
//             });
//         }

//     }
// }


// /////////////////////////////////////////////////////////////////////////////
// /// function to execute when the mouse
// /// exit from a placeholder
// /////////////////////////////////////////////////////////////////////////////
// function onExitPlaceholder(Obj) {
//     if (Obj.isOver && !Obj.isSelected && Obj.id !== 'main') {
//         Obj.isOver = false;
//         Obj.placeholder.billboard.scale = 1.0;

//         /// if is a video set dafault material for all nested tracks
//         if (Obj.type === 'video') {
//             getAssetRecursive(Obj, true, 'track', false, (result) => {
//                 result.track.visibleTrack.polyline.material = result.track.defaultMaterial;
//                 // result.track.visibleTrack.polyline.show = false;
//             });
//         }
//     }
// }





// /////////////////////////////////////////////////////////////////////////////
// /// fade in/out placeholders recursively
// /////////////////////////////////////////////////////////////////////////////
// function fadePlaceholder(parent, type, value, timeout = null, useOnlyParent = false) {
//     getAssetRecursive(parent, true, type, useOnlyParent, (result) => {
//         if (value) {
//             if (timeout) {
//                 result.placeholder.billboardImage.fadeInWithTimeout(timeout);
//                 // result.label.labelImage.fadeInWithTimeout(timeout);
//             } else {
//                 result.placeholder.billboardImage.fadeIn();
//                 // result.label.labelImage.fadeIn();
//             }
//         } else {
//             if (timeout) {
//                 result.placeholder.billboardImage.fadeOutWithTimeout(timeout);
//                 // result.label.labelImage.fadeOutWithTimeout(timeout);
//             } else {
//                 result.placeholder.billboardImage.fadeOut();
//                 // result.label.labelImage.fadeOut();
//             }
//         }
//     })
// }





/////////////////////////////////////////////////////////////////////////////
/// when  a video asset is clicked, from onPickedAsset function
/////////////////////////////////////////////////////////////////////////////
function onVideoAssetClicked(asset) {
    console.log('onVideoAssetClicked')

    // /// load the video
    // videoPlayer.load(asset.videoUrl, asset.poster, asset.title, asset.description);

    // /// load the subtitles (if any)
    // subtitles.load(asset.subtitles);

    /// load the markers and start to check
    if (asset.videoMarkers) {
        console.log("load markers")
        videoMarkers.load(asset);
    }


    /// send message!
    const pickedAsset = {
        owner: asset.owner,
        videoUrl: asset.videoUrl,
        videoUrl_1: asset.videoUrl_1,
        poster: asset.poster,
        subtitles: asset.subtitles,
        title: asset.title,
        description: asset.description,
        videoMarkers: asset.videoMarkers,
    }
    window.parent.postMessage({
        'func': 'parentFunc',
        'message': {
            command: 'onVideoAssetClicked',
            asset: pickedAsset
        }
    }, "*");






    // /// show title and description in panel2
    // $("#ownerProfilePicture").attr("src", "images/profiles/" + asset.owner + ".jpg");
    // $('#videoOwner').text(asset.owner);
    // $('#videoDate').text(asset.date.toDateString().toUpperCase());
    // $('#videoTitle').text(asset.title);
    // if (asset.description) {
    //     $('#videoDescription').css('display', 'block');
    //     $('#videoDescription').text(asset.description);
    // } else {
    //     $('#videoDescription').css('display', 'none');
    // }


    /// execute subscribed functions
    /// to the handlers
    for (let i in main.onSelectedAssetHandlers) main.onSelectedAssetHandlers[i](asset);
}





/////////////////////////////////////////////////////////////////////////////
/// function to execute when something is picked
/// or clicked in the widget
/////////////////////////////////////////////////////////////////////////////

/// empty array to subscribe
let onPicketAssetHandler = [];

function onPickedAsset(asset) {

    console.log("-> onPickedAsset")

    let selectedAsset = asset;
    let oldSelectedAsset = main.oldSelectedAsset;


    /// QUESTO L'HO MESSO ORA
    main.selectedAsset = asset;


    /// if we are clicking on the same button
    if (selectedAsset === oldSelectedAsset) {
        return;
    }


    /// execute subscribed functions
    for (let i in onPicketAssetHandler) onPicketAssetHandler[i](asset);


    /// if we are tracking the billboard unlink and stop the video
    if (viewer.trackedEntity) {
        unlinkCameraFromEntity();
        videoPlayer.pause();
    }


    // /// hide the billboard if selected asset is not a video
    // if (selectedAsset !== 'video') {
    //     TMP.billboard.show = false;
    // }



    /// if is a video call 'onVideoAssetClicked'
    if (selectedAsset.type === 'video') {
        onVideoAssetClicked(selectedAsset);


        // console.log("Centro della bounding sphere di questo video: " + selectedAsset.boundingSphere.center);

        //var cartesian = new Cesium.Cartesian3(1527780.02515, -4464217.70308, 4277167.40653);
        // var cartographic = Cesium.Cartographic.fromCartesian(selectedAsset.boundingSphere.center);
        // var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        // var longitude = Cesium.Math.toDegrees(cartographic.longitude);

        // console.log("lat: " + latitude)
        // console.log("lng: " + longitude)


    }

    // if (main.isReady) {
    //     viewer.camera.flyToBoundingSphere(selectedAsset.boundingSphere, {
    //         duration: 0,
    //     });
    // }



    // /// turn on selected widget
    // let selectedId = "#" + selectedAsset.id;
    // $(selectedId).data('selected', true);
    // onListWidgetHover(selectedId);


    // /// turn off old widget
    // if (oldSelectedAsset) {
    //     let oldId = "#" + oldSelectedAsset.id;
    //     $(oldId).data('selected', false);
    //     onListWidgetOut(oldId);


    //     /// turn off home button
    //     if (oldSelectedAsset === main) {
    //         $('#main').data('clicked', false);
    //         toggleSvgButton('#main', false);
    //     }
    // }



    //////////////// TRACK AND PLACEHOLDER UI ////////////////
    //////////////// vvvvvvvvvvvvvvvvvvvvvvvv ////////////////


    /////////////////////////////// OLD SELECTED ///////////////////////////////////
    if (oldSelectedAsset && oldSelectedAsset.id !== 'main') {

        oldSelectedAsset.isSelected = false;
        /// restore default scale
        if (oldSelectedAsset.placeholder)
            oldSelectedAsset.placeholder.billboard.scale = 1;

        if (oldSelectedAsset.type === 'event') {
            if (selectedAsset.id !== 'main') {
                if (oldSelectedAsset.id !== selectedAsset.parent.id) {
                    /// restore old placeholder visibility
                    logger.log('restore old placeholder visibility')
                    oldSelectedAsset.placeholder.billboardImage.fadeInWithTimeout(1000);
                    // oldSelectedAsset.label.labelImage.fadeIn();
                    // fade out old nested placeholders
                    logger.log('fade out old nested placeholders')
                    fadePlaceholder(oldSelectedAsset, 'video', false);
                }
            } else {
                /// restore old placeholder visibility
                logger.log('restore old placeholder visibility')
                oldSelectedAsset.placeholder.billboardImage.fadeInWithTimeout(1000);
                // oldSelectedAsset.label.labelImage.fadeIn();
                // fade out old nested placeholders
                logger.log('fade out old nested placeholders')
                fadePlaceholder(oldSelectedAsset, 'video', false);
            }

        }

        if (oldSelectedAsset.parent.type === 'event') {
            if (selectedAsset.id !== 'main') {
                if (oldSelectedAsset.parent.id !== selectedAsset.parent.id &&
                    oldSelectedAsset.parent.id !== selectedAsset.id) {
                    /// restore old parent placeholder visibility
                    logger.log('restore old parent placeholder visibility: ' + oldSelectedAsset.parent.title)
                    oldSelectedAsset.parent.placeholder.billboardImage.fadeInWithTimeout(1000);
                    // oldSelectedAsset.parent.label.labelImage.fadeIn();
                    /// fade out old parent nested placeholders
                    logger.log('fade out old parent nested placeholders')
                    fadePlaceholder(oldSelectedAsset.parent, 'video', false);
                }
            } else {
                /// restore old parent placeholder visibility
                logger.log('restore old parent placeholder visibility: ' + oldSelectedAsset.parent.title)
                oldSelectedAsset.parent.placeholder.billboardImage.fadeInWithTimeout(1000);
                // oldSelectedAsset.parent.label.labelImage.fadeIn();
                /// fade out old parent nested placeholders
                logger.log('fade out old parent nested placeholders')
                fadePlaceholder(oldSelectedAsset.parent, 'video', false);
            }

        }

        if (oldSelectedAsset.type === 'video') {
            /// restore default old placeholder image
            oldSelectedAsset.placeholder.billboard.image =
                getIconByType(oldSelectedAsset.type, false);
            /// hide all nested tracks
            getAssetRecursive(oldSelectedAsset, true, 'track', false, (result) => {
                result.track.visibleTrack.polyline.material = result.track.defaultMaterial;
            })
            // /// restore the label
            // oldSelectedAsset.label.labelImage.setOpacity(1);
        }

    }



    /////////////////////////////// NEW SELECTED ///////////////////////////////////
    if (selectedAsset.id !== 'main') {

        selectedAsset.isSelected = true;
        // /// set new scale
        // selectedAsset.placeholder.billboard.scale = 1.3;

        // if (selectedAsset.type === 'event') {
        //     if (oldSelectedAsset.id !== 'main') {
        //         if (oldSelectedAsset.parent.id !== selectedAsset.id) {
        //             /// fade in nested placeholders
        //             logger.log('fade in nested placeholders')
        //             fadePlaceholder(selectedAsset, 'video', true, 1000);
        //             /// fade out this placeholder
        //             logger.log('fade out this placeholder')
        //             selectedAsset.placeholder.billboardImage.fadeOut();
        //             // selectedAsset.label.labelImage.fadeOut();
        //         }
        //     } else {
        //         /// fade in nested placeholders
        //         logger.log('fade in nested placeholders')
        //         fadePlaceholder(selectedAsset, 'video', true, 1000);
        //         /// fade out this placeholder
        //         logger.log('fade out this placeholder')
        //         selectedAsset.placeholder.billboardImage.fadeOut();
        //         // selectedAsset.label.labelImage.fadeOut();
        //     }
        // }


        // if (selectedAsset.type === 'video') {
        //     logger.log("VIDEO SELECTED: " + selectedAsset.title)
        //     /// change icon on selected
        //     // selectedAsset.placeholder.billboard.image =
        //     //     getIconByType(selectedAsset.type, true);
        //     selectedAsset.placeholder.billboard.image = null;

        //     // /// highlight all nested tracks
        //     // getAssetRecursive(selectedAsset, true, 'track', false, (result) => {
        //     //     result.track.visibleTrack.polyline.material = result.track.highlightedMaterial;
        //     // })
        //     // /// hide the label
        //     // selectedAsset.label.labelImage.setOpacity(0);
        //     ///
        //     if (selectedAsset.parent.type === 'event') {
        //         if (oldSelectedAsset.id !== 'main') {
        //             if (selectedAsset.parent.id !== oldSelectedAsset.parent.id &&
        //                 selectedAsset.parent.id !== oldSelectedAsset.id) {
        //                 /// fade in nested placeholders of the parent
        //                 logger.log('fade in nested placeholders of the parent')
        //                 fadePlaceholder(selectedAsset.parent, 'video', true, 1000);
        //                 /// fade out parent placeholder
        //                 logger.log('fade out parent placeholder')
        //                 selectedAsset.parent.placeholder.billboardImage.fadeOut();
        //                 // selectedAsset.parent.label.labelImage.fadeOut();
        //             }
        //         } else {
        //             /// fade in nested placeholders of the parent
        //             logger.log('fade in nested placeholders of the parent')
        //             fadePlaceholder(selectedAsset.parent, 'video', true);
        //             /// fade out parent placeholder
        //             logger.log('fade out parent placeholder')
        //             selectedAsset.parent.placeholder.billboardImage.fadeOut();
        //             // selectedAsset.parent.label.labelImage.fadeOut();
        //         }

        //     }
        // }
    }




    main.selectedAsset = asset;
    main.oldSelectedAsset = selectedAsset;
    return;
}



/// get asset by 'type' nested
/// inside parent object
function getAssetRecursive(parent, includeParent, type, useOnlyParent, callback) {
    if (useOnlyParent) {
        console.log("MA PERCHE?")
        callback(parent);
        return;
    }
    if (includeParent && parent.type && parent.type === type)
        callback(parent);
    for (let i in parent.subObj) {
        if (type !== 'any') {
            if (parent.subObj[i].type === type) {
                callback(parent.subObj[i]);
            } else {
                getAssetRecursive(parent.subObj[i], includeParent, type, useOnlyParent, callback);
            }
        } else {
            callback(parent.subObj[i]);
            getAssetRecursive(parent.subObj[i], includeParent, type, useOnlyParent, callback);
        }
    }
}


/// get the Parameters from iframe declaration in html page
function getParameterFromIframe(parameter) {
    let url = window.location.search.substring(1); //get rid of "?" in querystring
    let qArray = url.split('&'); //get key-value pairs
    for (let i = 0; i < qArray.length; i++) {
        let pArr = qArray[i].split('='); //split key and value
        if (pArr[0] === parameter)
            return pArr[1]; //return value
    }
}



////////////////////// //////////////////////////////////////////////
/// START - START - START - START - START - START - START - START ///
/////////////////////////////////////////////////////////////////////
function start() {

    // preload.load();

    main.idToLoad = getParameterFromIframe("id");
    main.load();
    // main.load('1579530506349');

}
start();