import map from "../lib/map/map.js";
import drawLabel from "./map/tools/drawLabel.js"
import coveredMap from "./map/tools/coveredMap.js"



let isServerAvailable = true; /// does the webserver can accept a new request?
const serverRequestTimeout = 1000; /// time to wait from each request to the webserver
let cities = [];
let bigArea; /// the area that have been covered for big cities
let mediumArea; /// the area that have been covered for small cities
let smallArea; /// the area that have been covered for small cities
let wait = null; /// the setTimeout to process the request






///////////////////////////////////////
/// load cities by population
///////////////////////////////////////
export function loadCitiesByPopulation(minPopulation, callback = null) {
    loadCities(minPopulation, callback);
}






///////////////////////////////////////
/// load all big cities
///////////////////////////////////////
export function loadBigCities(callback = null) {
    loadCitiesByPopulation(500000, function () {
        loadCitiesByPopulation(100000, function () {
            loadCitiesByPopulation(50000, function () {
                if (callback) callback();
            });
        });
    });

}



///////////////////////////////////////
/// automate the loading as camera move
///////////////////////////////////////
export function loadAuto() {
    
    bigArea = new coveredMap();
    mediumArea = new coveredMap();
    smallArea = new coveredMap();

    onCameraChanged();

    /// add listener
    map.camera.changed.addEventListener(() => {
        onCameraChanged();
    });
}







function onCameraChanged() {

    let range = map.range;

    if (!bigArea.isCovered()) {
        console.log("> load big cities <")
        loadBigCities();
    }

    if (range <= 100000) {

        if (!mediumArea.isCovered()) {
            console.log("> load small cities <")
            loadCitiesByPopulation(10000, function () {

                if (range <= 55000 && !smallArea.isCovered()) {
                    console.log("> load very small cities <")
                    // loadCitiesByPopulation(1000);
                }
            });
        } else {
            if (range <= 55000 && !smallArea.isCovered()) {
                console.log("> load very small cities <")
                loadCitiesByPopulation(1000);
            }
        }

    }
}



/// main function
function loadCities(minPopulation, callback = null) {

    /// if there's a previous request...
    if (wait) {
        console.warn("! --> cities request not allowed because there's another one in queue");
    } else {
        wait = function () {
            if (!isServerAvailable) setTimeout(wait, 100);

            else {
                wait = null;

                let radius = map.range / 2000;
                /// if the radius is < 1km don't request
                if (radius <= 1) {
                    console.warn("camera too near to terrain, don't request cities");
                } else {
                    /// get the coordinates in the center of the window
                    let cartographic = Cesium.Cartographic.fromCartesian(map.getPointFromCamera());
                    let longitude = Cesium.Math.toDegrees(cartographic.longitude);
                    let latitude = Cesium.Math.toDegrees(cartographic.latitude);
                    console.info("? - looking for cities with min population = " + minPopulation);

                    getDataFromWebServer(minPopulation, latitude, longitude, radius, callback);
                }
            }
        }
        wait();
    }
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
                console.info("! -- no cities with " + minPopulation + " people in this area");
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
                        if (minPopulation >= 50000 && minPopulation < 100000) category = "A3";
                        if (minPopulation >= 10000 && minPopulation < 50000) category = "A4";
                        if (minPopulation < 10000) category = "A5";
                        
                        let position = Cesium.Cartesian3.fromDegrees(result.longitude, result.latitude);

                        drawLabel(position, result.city, category)

                        console.info("--- new city: " + result.city);
                    } 
                    // else {
                    //     console.info("refused city: " + result.city);
                    // }
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