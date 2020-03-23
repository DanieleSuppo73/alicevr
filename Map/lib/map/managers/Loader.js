// import Asset from "./constructors/Asset.js";
import Video from "./constructors/Video.js";
import Track from "./constructors/Track.js";


export default class Loader {
    constructor(id, node, parent, onEndCallback) {
        this.id = id;
        this.url = `data/xml/${id}.xml`;
        this.loadAsset(node, parent, onEndCallback);
    };


    loadAsset(node, parent, onEndCallback) {

        /* load XML */
        Loader.loadXml(this.url)
            .then((xml) => {

                const type = xml.getElementsByTagName("type")[0].childNodes[0].nodeValue;

                /* get Class by type */
                switch (type) {

                    case "video":
                        node.asset = new Video(this.id, xml, parent, onEndCallback);
                        break;

                    case "track":
                        node.asset = new Track(this.id, xml, parent, onEndCallback);
                        break;

                        // case "route":
                        //     node.asset = new Video(this.id, xml);
                        //     break;

                        // case "pointsOfInterest":
                        //     node.asset = new Video(this.id, xml);
                        //     break;

                        // case "journal":
                        //     node.asset = new Video(this.id, xml);
                        //     break;
                };


                /* load children recursive */
                if (xml.getElementsByTagName("id").length > 0) {
                    const childsId = xml.getElementsByTagName("id");
                    for (let i = 0; i < childsId.length; i++) {
                        const id = childsId[i].childNodes[0].nodeValue;
                        const child = {
                            asset: null
                        };

                        /* create child asset */
                        node.asset.children[i] = child;
                        const loader = new Loader(id, node.asset.children[i], node.asset, onEndCallback);
                    };
                };
            });


        setTimeout(function () {
            console.log(Loader.root)
        }, 2000)
    };







    /* STATICS */



    /* init */
    static init(id, callback = null) {

        let loader = new Loader(id, Loader.root, null, () => {
            console.log("FINITO!!!")
        });
    };




    /* lod XMl */
    static loadXml(url) {
        return new Promise(function (resolve) {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(xhttp.responseXML);
                };
            };
            xhttp.open("GET", url, true);
            xhttp.send();
        });
    };
};




/* the main root */
Loader.root = {
    asset: null,
    childrens: []
}