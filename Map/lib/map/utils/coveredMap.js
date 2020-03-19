import map from "../map.js";



class coveredMap {
    constructor(debugText = null, debugColor = null) {
        this.points = [];
        this.spheres = [];
        this.debugText = debugText;
        this.debugColor = debugColor;

        this.isCovered = function () {

            let isInside = true; /// default
            let viewCenter = map.getPointFromCamera();
            let outsidePoint;


            /// get 4 points from the camera
            let points = [];
            points.push(map.getPointFromCamera(map.canvas.clientWidth * 0.3, map.canvas.clientHeight * 0.3))
            points.push(map.getPointFromCamera(map.canvas.clientWidth * 0.3, map.canvas.clientHeight * 0.6))
            points.push(map.getPointFromCamera(map.canvas.clientWidth * 0.6, map.canvas.clientHeight * 0.3))
            points.push(map.getPointFromCamera(map.canvas.clientWidth * 0.6, map.canvas.clientHeight * 0.6))


            if (this.spheres.length === 0) isInside = false;

            /// check if one of these points is outside ALL the spheres
            for (let i = 0; i < points.length; i++) {
                let checked = 0;
                for (let ii = 0; ii < this.spheres.length; ii++) {
                    let dist = Cesium.Cartesian3.distance(points[i], this.spheres[ii].center)
                    if (dist < this.spheres[ii].radius) {
                        checked++;
                    }
                }

                if (checked === 0) {
                    isInside = false;
                    outsidePoint = points[i];
                    break;
                }
            }

            if (this.debugText) {
                if (isInside) console.log("siamo dentro " + this.debugText);
                else console.warn("non siamo dentro " + this.debugText);
            }

            if (!isInside) {
                /// create a new bounding sphere
                let radius = Cesium.Cartesian3.distance(map.camera.positionWC, viewCenter) / 1.8
                this.spheres.push(new Cesium.BoundingSphere(viewCenter, radius));


                /// DEBUG
                if (this.debugColor) {
                    /// draw debug sphere
                    map.viewer.entities.add({
                        name: 'Red sphere with black outline',
                        position: viewCenter,
                        ellipsoid: {
                            radii: new Cesium.Cartesian3(radius, radius, radius),
                            maximumCone: Cesium.Math.PI_OVER_TWO,
                            material: Cesium.Color.GREEN.withAlpha(0.3),
                        }
                    });

                    /// draw debug point
                    var debugPoint = map.viewer.entities.add({
                        position: outsidePoint,
                        point: {
                            pixelSize: 30,
                            color: Cesium.Color.WHITE
                        }
                    });

                    /// clear point
                    setTimeout(function () {
                        debugPoint.point.show = false;
                    }, 4000)
                }
            }

            return isInside;
        }
    }
}

export default coveredMap;