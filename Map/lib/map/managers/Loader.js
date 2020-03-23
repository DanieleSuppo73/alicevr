import Video from "./constructors/Video.js";
import Track from "./constructors/Track.js";
import Route from "./constructors/Route.js";
import Asset from "./constructors/base/Asset.js";



export default class Loader {
    constructor(id, node, parent = null) {
        this.id = id;
        this.url = `data/xml/${id}.xml`;
        this.loadAsset(node, parent);
    };


    loadAsset(node, parent) {

        /* load XML */
        Loader.loadXml(this.url)
            .then((xml) => {

                let type = null;
                if (xml.getElementsByTagName("type").length > 0) {
                    if (xml.getElementsByTagName("type")[0].childNodes.length > 0) {
                        type = xml.getElementsByTagName("type")[0].childNodes[0].nodeValue;
                    }
                }

                /* get Class by type */
                switch (type) {

                    case "video":
                        node.asset = new Video(this.id, xml, parent);
                        break;

                    case "track":
                        node.asset = new Track(this.id, xml, parent);
                        break;

                    case "route":
                        node.asset = new Route(this.id, xml, parent);
                        break;

                        // case "pointsOfInterest":
                        //     node.asset = new Video(this.id, xml);
                        //     break;

                        // case "journal":
                        //     node.asset = new Video(this.id, xml);
                        //     break;

                    default:
                        node.asset = new Asset(this.id, parent);
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
                        const loader = new Loader(id, node.asset.children[i], node.asset);
                    };
                };
            });
    };


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


    /* init */
    static init(id, callback = null) {
        Asset.onEndLoadingCallback = callback;
        let loader = new Loader(id, Loader.root);
    };
};




/* the main root */
Loader.root = {

    asset: null,

    /* utilities */
    getAssetById: function (id, parentAsset = null) {
        let parent = parentAsset ? parentAsset : this.asset;
        return getAssetRecursive(parent, "id", id);
    },

    getAssetByClass: function (className, parentAsset = null) {
        let parent = parentAsset ? parentAsset : this.asset;
        for (let i = 0; i < parent.children.length; i++) {
            if (!parent.children[i].asset) return null;
            if (parent.children[i].asset.constructor.name === className) {
                return parent.children[i].asset;
            }
        }
    },
};




/* return an asset by property key-value,
starting to search from a parent asset */
function getAssetRecursive(parentAsset, key, value) {
    if (parentAsset[key] === value)
        return (parentAsset);
    else {
        for (let i = 0; i < parentAsset.children.length; i++) {
            if (parentAsset.children[i].asset[key] === value) {
                return (parentAsset.children[i].asset);
            } else {
                getAssetRecursive(parentAsset.childrens[i], key, value);
            }
        }
    }
};