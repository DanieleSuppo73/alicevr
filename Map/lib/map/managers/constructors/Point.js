import Asset from "./base/Asset.js";


export default class Point extends Asset {
    constructor(id, xml, parent = null) {
        super(id, parent);
        this.setup(xml);
    };

    setup(xml) {

    };


};