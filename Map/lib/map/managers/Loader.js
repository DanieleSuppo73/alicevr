import Asset from "./constructors/Asset.js";


export default class Loader {

    static init(callback = null) {

        Loader.root = new Asset("1579530506349");

        Loader.root.load(null, () => {
            if (callback) callback();
        });
    }
};