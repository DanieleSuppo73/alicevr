import * as cities from "../lib/cities.js";





////////////////////////
/// INIT
////////////////////////
function init() {
    console.log("START")

    cities.loadAuto();
};




////////////////////////
/// wait for map ready
////////////////////////
let ready = false;
(function () {
    function t() {
        if (typeof viewer === "undefined") {
            setTimeout(t, 250);
        } else {
            viewer.scene.globe.tileLoadProgressEvent.addEventListener((value) => {
                if (!ready && value === 0) {
                    ready = true;
                    init();
                }
            });
        }
    };
    t();
})();







// class coveredMap {
//     constructor(debugText = null, debugColor = null) {
//         this.spheres = [];
//         this.debugText = debugText;
//         this.debugColor = debugColor;

//         this.isCovered = function () {

//             let isInside = false;
//             let viewCenter = getPointFromCamera();

//             for (let i in this.spheres) {
//                 let dist = Cesium.Cartesian3.distance(viewCenter, this.spheres[i].center)
//                 if (dist < this.spheres[i].radius) {
//                     isInside = true;
//                     break;
//                 }
//             }

//             if (this.debugText){
//                 if(isInside) console.log("siamo dentro " + this.debugText);
//                 else console.warn("non siamo dentro " + this.debugText);
//             }

//             if (!isInside) {
//                 /// create a new bounding sphere
//                 let radius = Cesium.Cartesian3.distance(camera.positionWC, viewCenter) / 1.9
//                 this.spheres.push(new Cesium.BoundingSphere(viewCenter, radius));

//                 /// draw debug sphere
//                 if(this.debugColor){
//                     viewer.entities.add({
//                         name: 'Red sphere with black outline',
//                         position: viewCenter,
//                         ellipsoid: {
//                             radii: new Cesium.Cartesian3(radius, radius, radius),
//                             maximumCone: Cesium.Math.PI_OVER_TWO,
//                             material: Cesium.Color.GREEN.withAlpha(0.3),
//                         }
//                     });
//                 }
                
//             }

//             return isInside;
//         }
//     }
// }

// let TEST = false;

// let bigArea = new coveredMap("BIG" , Cesium.Color.GREEN.withAlpha(0.25));
// function testSphere() {

//     // if (!bigArea.isCovered()) {
//     //     console.log("not covered")
//     // }
//     // else{
//     //     console.log("covered")
//     // }
//     TEST = true;
// }



// window.testSphere = testSphere;

// viewer.camera.changed.addEventListener(() => {
//     var center = getPointFromCamera();
//     viewer.entities.add({
//         position : center,
//         point : {
//             pixelSize : 10,
//             color : Cesium.Color.RED
//         }
//     });


//     if (TEST){
//         if (!bigArea.isCovered()) {
//             console.log("not covered")
//         }
//         else{
//             console.log("covered")
//         }
//     }
    
    
// });