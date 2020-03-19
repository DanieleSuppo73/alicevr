import Asset from "./constructors/Asset.js";
import Ellipse from '../entity/Ellipse.js';



class Loader {

    static init(callback = null) {

        const root = new Asset("1579530506349");

        root.load(null, () => {
            console.log("All boundingspheres loaded");
            Ellipse.draw(root.boundingSphere.center, "GREEN_TRANSPARENT", root.boundingSphere.radius);

            if (callback) callback();
        });


    }
};

export default Loader;