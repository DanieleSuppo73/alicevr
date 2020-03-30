export default class Asset {

    constructor(id, parent = null) {
        this.id = id
        this.parentId = parent ? parent.id : null;
        this.boundingSphere = null;
        this.children = [];
        this.parent = parent; /// temporary property
    };


    addBoundingSphere(bdReceived) {
        this.boundingSphere = this.boundingSphere ?
            Cesium.BoundingSphere.union(bdReceived, this.boundingSphere) :
            bdReceived;

        if (this.parent)
            this.parent.addBoundingSphere(this.boundingSphere);

        if (Asset.boundingSphereLoading === 0) {

            /* call the end loading callback */
            if (Asset.onEndLoadingCallback) {
                Asset.onEndLoadingCallback();
                Asset.onEndLoadingCallback = null;
            };

            /* delete temporary parent property
             to reserve memory */
            delete this.parent;
        }
    };
};

Asset.boundingSphereLoading = 0;
Asset.onEndLoadingCallback = null;
