const canvas = viewer.scene.canvas;
const ellipsoid = viewer.scene.mapProjection.ellipsoid;


export class coveredArea {
    constructor() {

        /// the whole covered area
        this.area = new Cesium.Rectangle();

        this.isCovered = function () {

            let viewCenter = getPointFromCamera();
            if (viewCenter === undefined) return null;

            let array = [
                getPointFromCamera(0, 0),
                getPointFromCamera(0, canvas.clientHeight),
                getPointFromCamera(canvas.clientWidth, 0),
                getPointFromCamera(canvas.clientWidth, canvas.clientHeight)
            ];

            let viewCenterC = new Cesium.Cartographic();
            Cesium.Cartographic.fromCartesian(viewCenter, ellipsoid, viewCenterC);

            let isInside = Cesium.Rectangle.contains(this.area, viewCenterC);

            if (isInside) console.log("same area...")
            else console.log("new area!")

            if (!isInside) {
                if (this.area.width === 0) {
                    Cesium.Rectangle.fromCartesianArray(array, ellipsoid, this.area);
                } else {
                    let rect = new Cesium.Rectangle();
                    Cesium.Rectangle.fromCartesianArray(array, ellipsoid, rect);
                    Cesium.Rectangle.union(this.area, rect, this.area);
                }
            }

            return isInside;
        };
    }
}



// let coveredArea = new Cesium.Rectangle();
// const canvas = viewer.scene.canvas;
// const ellipsoid = viewer.scene.mapProjection.ellipsoid;

// export function isCoveredArea() {

//     let viewCenter = getPointFromCamera();

//     if (viewCenter === undefined) return null;

//     let array = [
//         getPointFromCamera(0, 0),
//         getPointFromCamera(0, canvas.clientHeight),
//         getPointFromCamera(canvas.clientWidth, 0),
//         getPointFromCamera(canvas.clientWidth, canvas.clientHeight)
//     ];

//     let viewCenterC = new Cesium.Cartographic();
//     Cesium.Cartographic.fromCartesian(viewCenter, ellipsoid, viewCenterC);

//     let isInside = Cesium.Rectangle.contains(coveredArea, viewCenterC);
//     // console.log(isInside)

//     if (!isInside) {
//         if (coveredArea.width === 0) {
//             Cesium.Rectangle.fromCartesianArray(array, ellipsoid, coveredArea);
//         } else {
//             let rect = new Cesium.Rectangle();
//             Cesium.Rectangle.fromCartesianArray(array, ellipsoid, rect);
//             Cesium.Rectangle.union(coveredArea, rect, coveredArea);
//         }
//     }

//     return isInside;
// }