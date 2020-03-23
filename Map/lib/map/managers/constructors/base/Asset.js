export default class Asset {

    constructor(id, parent = null) {
        this.id = id
        this.boundingSphere = null;
        this.children = [];
        this.parent = parent;
    };


    addBoundingSphere(bdReceived) {
        this.boundingSphere = this.boundingSphere ?
            Cesium.BoundingSphere.union(bdReceived, this.boundingSphere) :
            bdReceived;

        if (this.parent)
            this.parent.addBoundingSphere(this.boundingSphere);


        // console.log(Asset.boundingSphereLoading)

        if (Asset.boundingSphereLoading === 0 && Asset.onEndLoadingCallback){
            Asset.onEndLoadingCallback();
            Asset.onEndLoadingCallback = null;
        }
    };
};


Asset.boundingSphereLoading = 0;
Asset.onEndLoadingCallback = null;