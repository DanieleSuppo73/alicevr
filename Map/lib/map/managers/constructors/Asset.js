import Track from "./Track.js"


export default class Asset {

    constructor(id) {
        this.id = id
        this.url = `data/xml/${id}.xml`;
        this.type = null;
        this.boundingSphere = null;
    };

    load(callback = null) {

        //////////////////////////////////////////
        /// load the XML file
        //////////////////////////////////////////
        const self = this;
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const xml = xhttp.responseXML;



                //////////////////////////////////////////
                /// create this asset properties from xml
                //////////////////////////////////////////
                const keys = ["type", "owner", "title", "description", "date", "video_url1", "video_url2",
                    "tracks_url", "location", "poster_url", "videoMarkers", "subtitles_url", "pointsOfInterest_url", "journal_url", "routes_url"
                ];
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    // self[key] = null;
                    if (xml.getElementsByTagName(key).length > 0) {
                        if (xml.getElementsByTagName(key)[0].childNodes.length > 0) {
                            self[key] = xml.getElementsByTagName(key)[0].childNodes[0].nodeValue;
                        }
                    }
                }



                //////////////////////////////////////////
                /// check for tracks
                //////////////////////////////////////////
                if (typeof self.tracks_url !== "undefined") {
                    Track.loadXml(self, callback);
                }

                else{
                    callback();
                }

            }
        };
        xhttp.open("GET", this.url, true);
        xhttp.send();
    };
};