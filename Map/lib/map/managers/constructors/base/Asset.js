export default class Asset {

    constructor(id) {
        this.id = id
        this.boundingSphere = null;
        this.children = [];
        // this.setup(xml);
    };


    // /* this is a generic function that should be overrided */
    // setup(xml) {
    //     console.log(xml);
    // };


    static loadTxt(url) {
        return new Promise(function (resolve) {

            Asset.loadFileFromUrl(url).then((xhttp) => {
                resolve(xhttp.responseText);
            }).catch((err) => {
                
            });


            // const xhttp = new XMLHttpRequest();
            // xhttp.onreadystatechange = function () {
            //     if (this.readyState === 4 && this.status === 200) {
            //         resolve(xhttp.responseText);
            //     };
            // };
            // xhttp.open("GET", url, true);
            // xhttp.send();
        });
    };


    static loadFileFromUrl(url){
        return new Promise(function (resolve) {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(xhttp);
                };
            };
            xhttp.open("GET", url, true);
            xhttp.send();
        });
    };

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