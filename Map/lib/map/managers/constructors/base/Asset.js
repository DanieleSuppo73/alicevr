export default class Asset {

    constructor(id, parent, onEndCallback) {
        this.id = id
        this.boundingSphere = null;
        this.children = [];
        // this.properties = {
        //     id = id,
        //     boundingSphere: null,
        // };
        // this.parentProperties = parent ? parent.properties : null;
        this.parent = parent;
        this.onEndCallback = onEndCallback;
    };


    addBoundingSphere(bdReceived) {
        this.boundingSphere = this.boundingSphere ?
            Cesium.BoundingSphere.union(bdReceived, this.boundingSphere) :
            bdReceived;

        if (this.parent)
            this.parent.addBoundingSphere(this.boundingSphere);


        console.log(Asset.boundingSphereLoading)

        if (Asset.boundingSphereLoading === 0)
            this.onEndCallback();
    };

    // addBoundingSphere(bdReceived) {

    //     /* add received boundingsphere to this boundingsphere */
    //     this.properties.boundingSphere = this.properties.boundingSphere ?
    //         Cesium.BoundingSphere.union(bdReceived, this.properties.boundingSphere) :
    //         bdReceived;

    //     /* send this boundingsphere to the parent */
    //     // if (this.parentProperties) {
    //     //     this.parentProperties.boundingSphere = this.parentProperties.boundingSphere ?
    //     //         Cesium.BoundingSphere.union(this.properties.boundingSphere, this.parentProperties.boundingSphere) :
    //     //         this.properties.boundingSphere;
    //     // }

    // };

    // /* this is a generic function that should be overrided */
    // setup(xml) {
    //     console.log(xml);
    // };


    // static loadTxt(url) {
    //     return new Promise(function (resolve) {

    //         Asset.loadFileFromUrl(url).then((xhttp) => {
    //             resolve(xhttp.responseText);
    //         }).catch((err) => {

    //         });


    //         // const xhttp = new XMLHttpRequest();
    //         // xhttp.onreadystatechange = function () {
    //         //     if (this.readyState === 4 && this.status === 200) {
    //         //         resolve(xhttp.responseText);
    //         //     };
    //         // };
    //         // xhttp.open("GET", url, true);
    //         // xhttp.send();
    //     });
    // };


    // static loadFileFromUrl(url){
    //     return new Promise(function (resolve) {
    //         const xhttp = new XMLHttpRequest();
    //         xhttp.onreadystatechange = function () {
    //             if (this.readyState === 4 && this.status === 200) {
    //                 resolve(xhttp);
    //             };
    //         };
    //         xhttp.open("GET", url, true);
    //         xhttp.send();
    //     });
    // };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //     load(callback = null) {

    //         //////////////////////////////////////////
    //         /// load the XML file
    //         //////////////////////////////////////////
    //         const self = this;
    //         const xhttp = new XMLHttpRequest();
    //         xhttp.onreadystatechange = function () {
    //             if (this.readyState === 4 && this.status === 200) {
    //                 const xml = xhttp.responseXML;



    //                 //////////////////////////////////////////
    //                 /// create this asset properties from xml
    //                 //////////////////////////////////////////
    //                 const keys = ["type", "owner", "title", "description", "date", "video_url1", "video_url2",
    //                     "tracks_url", "location", "poster_url", "videoMarkers", "subtitles_url", "pointsOfInterest_url", "journal_url", "routes_url"
    //                 ];
    //                 for (let i = 0; i < keys.length; i++) {
    //                     const key = keys[i]
    //                     // self[key] = null;
    //                     if (xml.getElementsByTagName(key).length > 0) {
    //                         if (xml.getElementsByTagName(key)[0].childNodes.length > 0) {
    //                             self[key] = xml.getElementsByTagName(key)[0].childNodes[0].nodeValue;
    //                         }
    //                     }
    //                 }



    //                 //////////////////////////////////////////
    //                 /// check for tracks
    //                 //////////////////////////////////////////
    //                 if (typeof self.tracks_url !== "undefined") {
    //                     Track.loadXml(self, callback);
    //                 } else {
    //                     callback();
    //                 }

    //             }
    //         };
    //         xhttp.open("GET", this.url, true);
    //         xhttp.send();
    //     };
};


Asset.boundingSphereLoading = 0;