import {
    drawLabel
} from "./drawLabel.js"
import {
    coveredArea
} from "../lib/utils/isCoveredArea.js"


let isServerAvailable = true; /// does the webserver can accept a new request?
const serverRequestTimeout = 1000; /// time to wait from each request to the webserver
let cities = [];
let bigArea; /// the area that have been covered for big cities
let smallArea; /// the area that have been covered for small cities


export function loadCitiesByPopulation(minPopulation, callback = null) {
    loadCities(minPopulation, callback);
}


export function loadAllCities(callback = null) {
    loadCitiesByPopulation(500000, function () {
        loadCitiesByPopulation(100000, function () {
            loadCitiesByPopulation(50000, function(){
                if (callback) callback();
            });
        });
    });

}

/// automate
export function loadAuto() {

    /// at start


    bigArea = new coveredArea();
    smallArea = new coveredArea();


    // if (!isCoveredArea()) {
    //     loadAllCities();
    // }

    // /// add listener
    // viewer.camera.changed.addEventListener(() => {
    //     if (!isCoveredArea()) {
    //         loadAllCities();
    //     }

    //     if (cameraProperties.range <= 30000){
    //         loadCitiesByPopulation(10000);
    //     }
    // });


    if (!bigArea.isCovered()) {
        loadAllCities();
    }

    /// add listener
    viewer.camera.changed.addEventListener(() => {
        if (!bigArea.isCovered()) {
            loadAllCities();
        }

        if (cameraProperties.range <= 30000){
            if (!smallArea.isCovered()){
                loadCitiesByPopulation(10000);
            }
            
        }
    });
}




function loadCities(minPopulation, callback = null) {

    function waitForServer() {
        if (!isServerAvailable) setTimeout(waitForServer, 100);
        else {
            let radius = cameraProperties.range / 2000;
            /// if the radius is < 1km don't request
            if (radius <= 1) {
                console.warn("camera too near to terrain, don't request cities");
            } else {
                /// get the coordinates in the center of the window
                let cartographic = Cesium.Cartographic.fromCartesian(getPointFromCamera());
                let longitude = Cesium.Math.toDegrees(cartographic.longitude);
                let latitude = Cesium.Math.toDegrees(cartographic.latitude);
                console.info("looking for cities at " + latitude + " - " + longitude + " around " + radius + " Km");

                getDataFromWebServer(minPopulation, latitude, longitude, radius, callback);
            }
        }
    }
    waitForServer();
}




/// actually get data from https://rapidapi.com/wirefreethought/api/geodb-cities/details
function getDataFromWebServer(minPopulation, latitude, longitude, radius, callback) {

    let data = null;
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            let allObj = JSON.parse(this.responseText);
            let data = allObj.data;

            /// handle the error from webserver
            if (data === undefined) {
                console.error("error loading cities from webserver");
                isServerAvailable = true;
                return;
            }
            if (data.length === 0) {
                console.info("no cities with " + minPopulation + " people in this area");
            }

            /// create labels of the cities
            for (let i = 0; i < data.length; i++) {
                let result = data[i];

                if (result.type === "CITY" || result.type === "ADM2") {

                    /// check if this city is already loaded
                    if (!cities.includes(result.city)) {
                        cities.push(result.city);

                        let category;
                        if (minPopulation >= 500000) category = "A1";
                        if (minPopulation >= 100000 && minPopulation < 500000) category = "A2";
                        if (minPopulation >= 10000 && minPopulation < 100000) category = "A3";
                        if (minPopulation < 10000) category = "A4";
                        let position = Cesium.Cartesian3.fromDegrees(result.longitude, result.latitude);

                        drawLabel(position, result.city, category)

                    } else {
                        console.info("refused city: " + result.city);
                    }
                }
            }

            /// wait serverRequestDelay for the callback
            setTimeout(function () {
                isServerAvailable = true;
                if (callback) callback();
            }, serverRequestTimeout);
        }
    });


    xhr.open("GET", "https://wft-geo-db.p.rapidapi.com/v1/geo/locations/%2B" + latitude + "%2B" +
        longitude + "/nearbyCities?limit=10&languageCode=it&minPopulation=" + minPopulation + "&radius=" + radius + "&types=CITY");
    xhr.setRequestHeader("x-rapidapi-host", "wft-geo-db.p.rapidapi.com");
    xhr.setRequestHeader("x-rapidapi-key", "ce699b059emshab8963e751a141dp1fb327jsn457d60aff686");
    xhr.send(data);
    isServerAvailable = false;
}