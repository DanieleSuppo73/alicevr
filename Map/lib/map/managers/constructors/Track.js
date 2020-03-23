import Asset from "./base/Asset.js";
import Gpx from "./Gpx.js";


export default class Track extends Asset {
    constructor(id, xml, parent = null) {
        super(id, parent);
        this.tracks = [];
        this._loading = 0; /// temporary property
        this.ready = false;
        this.setup(xml);
    };

    setup(xml) {
        let xmlElements = xml.getElementsByTagName("track");
        this.loading = xmlElements.length;
        for (let i = 0; i < xmlElements.length; i++) {
            this.tracks[i] = new Gpx(xmlElements[i], this, "TRACK");
        };
    };

    /* set this ready when all tracks are loaded 
    and delete _loading property */
    set loading (n){
        this._loading = n;
        if (this._loading === 0){
            this.ready = true;
            delete this._loading;
        };
    };
};