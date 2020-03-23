import Asset from "./base/Asset.js";

export default class Video extends Asset {
    constructor(id, xml, parent = null) {
        super(id, parent);
        this.setup(xml);
    };

    /* override */
    setup(xml) {

        const keys = ["owner", "title", "description", "date", "video_url1", "video_url2",
            "location", "poster_url", "markers_url", "subtitles_url"
        ];

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            this[key] = null;
            if (xml.getElementsByTagName(key).length > 0) {
                if (xml.getElementsByTagName(key)[0].childNodes.length > 0) {
                    this[key] = xml.getElementsByTagName(key)[0].childNodes[0].nodeValue;
                }
            }
        };
    };
}