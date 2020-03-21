import Asset from "./constructors/Asset.js";
import Billboard from "../entity/Billboard.js";


export default class Loader {

    static init(id, callback = null) {

        Loader.root = new Asset(id);
        Loader.root.load(() => {

            /// if the root boundingSphere is null
            /// create if from childrens
            if (!Loader.root.boundingSphere) {
                for (let i = 0; i < Loader.root.childrens.length; i++) {
                    Loader.root.boundingSphere = Loader.root.boundingSphere ?
                        Cesium.BoundingSphere.union(Loader.root.boundingSphere, Loader.root.childrens[i].boundingSphere) :
                        Loader.root.childrens[i].boundingSphere;
                }
            };

            /// create placeholder for video assets
            getAssetRecursive(Loader.root, true, 'video', (result) => {
                Billboard.draw(result.boundingSphere.center, "PLACEHOLDER");
            })


            if (callback) callback();
        });
    }
};




/// get asset by 'type' nested
/// inside parent object
function getAssetRecursive(root, includeRoot, type, callback) {
    if (includeRoot && root.type && root.type === type)
        callback(root);
    for (let i in root.childrens) {
        if (type !== 'any') {
            if (root.childrens[i].type === type) {
                callback(root.childrens[i]);
            } else {
                getAssetRecursive(root.childrens[i], includeRoot, type, callback);
            }
        } else {
            callback(root.childrens[i]);
            getAssetRecursive(root.childrens[i], includeRoot, type, callback);
        }
    }
};