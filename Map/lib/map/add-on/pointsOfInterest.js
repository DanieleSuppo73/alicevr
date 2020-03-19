import {
    drawLabel,
    removeLabel
} from "./map/entity/label.js";



let pointsOfInterest = [];


export function loadFromFile(asset) {

    clear();
    pointsOfInterest = [];


    let url = asset.POI;
    if (url) {

        /// load custom POI from xml file
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {

                /// read XML file
                let xmlDoc = this.responseXML;
                let x = xmlDoc.getElementsByTagName("POI");
                for (let i = 0; i < x.length; i++) {

                    let longitude = x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
                    let latitude = x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
                    let type = x[i].getElementsByTagName("TYPE")[0].childNodes[0].nodeValue;
                    let name = x[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
                    let category = null;
                    if (x[i].getElementsByTagName("CATEGORY").length !== 0) {
                        if (x[i].getElementsByTagName("CATEGORY")[0].childNodes.length !== 0) {
                            category = x[i].getElementsByTagName("CATEGORY")[0].childNodes[0].nodeValue;
                        }
                    }

                    if (type === "BILLBOARD") {
                        let address = null;
                        if (x[i].getElementsByTagName("ADDRESS").length !== 0) {
                            if (x[i].getElementsByTagName("ADDRESS")[0].childNodes.length !== 0) {
                                address = x[i].getElementsByTagName("ADDRESS")[0].childNodes[0].nodeValue;
                            }
                        }
                        let description = null;
                        if (x[i].getElementsByTagName("DESCRIPTION").length !== 0) {
                            if (x[i].getElementsByTagName("DESCRIPTION")[0].childNodes.length !== 0) {
                                description = x[i].getElementsByTagName("DESCRIPTION")[0].childNodes[0].nodeValue;
                            }
                        }
                        let tel = null;
                        if (x[i].getElementsByTagName("TEL").length !== 0) {
                            if (x[i].getElementsByTagName("TEL")[0].childNodes.length !== 0) {
                                tel = x[i].getElementsByTagName("TEL")[0].childNodes[0].nodeValue;
                            }
                        }
                        let web = null;
                        if (x[i].getElementsByTagName("WEB").length !== 0) {
                            if (x[i].getElementsByTagName("WEB")[0].childNodes.length !== 0) {
                                web = x[i].getElementsByTagName("WEB")[0].childNodes[0].nodeValue;
                            }
                        }
                    }


                    /////////////////////////////////////
                    /// draw entity
                    /////////////////////////////////////

                    let position = Cesium.Cartesian3.fromDegrees(longitude, latitude);

                    if (type === "LABEL") {
                        drawLabel(position, name, category, pointsOfInterest);
                    }
                }
            }
        };
        xhttp.open("GET", "./data/xml/" + url, true);
        xhttp.send();
    }
}




function clear() {
    for (let i in pointsOfInterest) {
       removeLabel(pointsOfInterest[i]);
    }
}


window.removePOI = clear;