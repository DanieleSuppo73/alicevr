import Video from "../assets/Video.js";
import Track from "../assets/Track.js";
import Route from "../assets/Route.js";
import Point from "../assets/Point.js";
import Asset from "../assets/Asset.js";
import * as jsUtils from "../../../lib/jsUtils.js";



export default class Loader {
    constructor(id, node, parent = null) {
        this.id = id;
        this.url = `../data/xml/${id}.xml`;
        this.loadAsset(node, parent);
    };


    loadAsset(node, parent) {

        /* load xml file */
        jsUtils.loadXml(this.url)
            .then((xml) => {

                /* get type from xml */
                let type = null;
                if (xml.getElementsByTagName("type").length > 0) {
                    if (xml.getElementsByTagName("type")[0].childNodes.length > 0) {
                        type = xml.getElementsByTagName("type")[0].childNodes[0].nodeValue;
                    }
                }

                /* create Class by type */
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

                    case "point":
                        node.asset = new Point(this.id, xml, parent);
                        break;

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




    /*******************
     ** load function **
     *******************/
    static load(id, callback = null) {
        Asset.onEndLoadingCallback = callback;
        const loader = new Loader(id, Loader.root);
    };
};




/*******************
 * *****************
 ** the main root **
 *******************
 *******************/
Loader.root = {

    asset: null,

    /* utility */
    getAssetById: function (id, parentAsset = null) {
        let parent = parentAsset ? parentAsset : this.asset;
        return getAssetRecursive(parent, "id", id);
    },

    /* utility */
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
    if (parentAsset[key] === value){
        return (parentAsset);
    }
    else {
        for (let i = 0; i < parentAsset.children.length; i++) {
            if (parentAsset.children[i].asset[key] === value) {
                return (parentAsset.children[i].asset);
            } else {
                getAssetRecursive(parentAsset.children[i].asset, key, value);
            }
        }
    }
};