// import Asset from "./constructors/Asset.js";
import Video from "./constructors/Video.js";
import Track from "./constructors/Track.js";


var root = {
    asset: null,
    childrens: []
}

export default class Loader {
    constructor(id, node) {
        this.id = id;
        this.url = `data/xml/${id}.xml`;
        this.loadAsset(node);
    };

    loadAsset(node) {

        /* load XML */
        let url = this.url;
        let loadXml = new Promise(function (resolve) {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(xhttp.responseXML);
                };
            };
            xhttp.open("GET", url, true);
            xhttp.send();
        });

        loadXml
            .then((xml) => {

                let type = xml.getElementsByTagName("type")[0].childNodes[0].nodeValue;

                /* get Class by type */
                switch (type) {

                    case "video":
                        node.asset = new Video(this.id, xml);
                        break;

                    case "track":
                        node.asset = new Track(this.id, xml);
                        break;

                    case "route":
                        node.asset = new Video(this.id, xml);
                        break;
                };


                /* load children recursively */
                if (xml.getElementsByTagName("id").length > 0) {
                    let childsId = xml.getElementsByTagName("id");
                    for (let i = 0; i < childsId.length; i++) {
                        let id = childsId[i].childNodes[0].nodeValue;
                        let child = {
                            asset: null
                        };
                        node.asset.children[i] = child;
                        let loader = new Loader(id, node.asset.children[i]);
                    };
                };
            });


        setTimeout(function () {
            console.log(root)
        }, 2000)


    };


     /* STATIC */
    /* init */
    static init(id, callback = null) {

        let loader = new Loader(id, root);
    };
};




// /// get asset by 'type' nested
// /// inside parent object
// function getAssetRecursive(root, includeRoot, type, callback) {
//     if (includeRoot && root.type && root.type === type)
//         callback(root);
//     for (let i in root.childrens) {
//         if (type !== 'any') {
//             if (root.childrens[i].type === type) {
//                 callback(root.childrens[i]);
//             } else {
//                 getAssetRecursive(root.childrens[i], includeRoot, type, callback);
//             }
//         } else {
//             callback(root.childrens[i]);
//             getAssetRecursive(root.childrens[i], includeRoot, type, callback);
//         }
//     }
// };


Loader.root = null;