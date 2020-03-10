// viewer.camera.changed.addEventListener(() => {
//     mapLabels.isRequestCheck = true;

//     if (map.isReady) console.log("RANGE: " +cameraProperties.range)
// });




// viewer.camera.moveEnd.addEventListener(() => {
//     mapLabels.load();
// });




const mapLabels = {
    isServerAvailable: true, /// does the webserver can accept a new request?
    serverRequestDelay: 1000, /// time to wait from each request to the webserver
    labels: [],
    wait: null,
    load: function () {
        if (this.wait) {
            clearInterval(this.wait);
            this.wait = null;
        }
        if (!map.isReady || !mapLabels.isServerAvailable) {
            console.log("attempt to load cities is refused, map or server not ready...");
            this.wait = setInterval(function () {
                if (map.isReady && mapLabels.isServerAvailable) {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>  now attempt to load cities is accepted!");
                    clearInterval(mapLabels.wait);
                    mapLabels.wait = null;
                    loader();
                }
            }, 1000);
        } else {
            console.log(">>>>>>>>>>>>>>>>>>>  attempt to load cities is accepted");
            loader();
        }

        /// load cities
        function loader() {
            console.log("LOADER--------------")
            let radius = cameraProperties.range / 1000;
            /// if the radius is < 1km don't request
            if (radius <= 1) {
                console.log("camera too near to terrain, don't request cities");
                mapLabels.isServerAvailable = true;
                return;
            }

            mapLabels.isServerAvailable = false;

            /// get the coordinates in the center of the window
            let cartographic = Cesium.Cartographic.fromCartesian(getPointFromCamera());
            let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);


            console.log("looking for cities at " + latitude + " - " + longitude + " around " + radius + " Km");

            /// load mayor cities
            console.log('LOAD MAYOR CITIES')
            let minPopulation = 100000;
            let font = '28px Acumin-bold';
            let minDistance = 50000;
            let maxDistance = 800000;
            
            
            getDataFromWebServer(function () {

                mapLabels.isServerAvailable = true;

                // /// load minor cities
                // console.log('LOAD MEDIUM CITIES')
                // minPopulation = 10000;
                // font = '24px Acumin-bold';
                // minDistance = 30000;
                // maxDistance = 200000;
                // getDataFromWebServer(function () {

                //     console.log('LOAD MINOR CITIES')
                //     minPopulation = 1000;
                //     font = '24px Acumin-bold';
                //     minDistance = 30000;
                //     maxDistance = 200000;
                //     getDataFromWebServer(function () {
                //         mapLabels.isServerAvailable = true;
                //     });
                // })

            });





            // /// check if the server is available, because we can make a request
            // /// only every 1000 ms, and make a request
            // function requestData() {
            //     let wait = setInterval(function () {

            //         /// as soon as the server is available..
            //         if (mapLabels.isServerAvailable) {

            //             /// set the server unavailable
            //             mapLabels.isServerAvailable = false;
            //             clearInterval(wait);

            //             getDataFromWebServer(function () {
            //                 /// start the countdown to set the server as available again
            //                 mapLabels.resetServerAvailable();
            //             });
            //         }
            //     }, 100)
            // }



            /// actually get data from https://rapidapi.com/wirefreethought/api/geodb-cities/details
            function getDataFromWebServer(callback) {

                let data = null;
                let xhr = new XMLHttpRequest();
                xhr.withCredentials = true;

                xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === this.DONE) {
                        let allObj = JSON.parse(this.responseText);
                        let data = allObj.data;

                        /// handle the error from webserver
                        if (data === undefined) {
                            console.error("error loading labels from webserver");
                            mapLabels.isServerAvailable = true;
                            return;
                        }
                        if (data.length === 0) {
                            console.log("no cities with " + minPopulation + " people in this area");
                        }

                        /// create labels of the cities
                        for (let i = 0; i < data.length; i++) {
                            let result = data[i];
                            if (result.type === "CITY") {

                                /// check if this city is already loaded
                                if (!mapLabels.labels.includes(result.city)) {

                                    // console.log("new city: " + result.city);

                                    /// create map label
                                    viewer.entities.add({
                                        position: Cesium.Cartesian3.fromDegrees(result.longitude, result.latitude),
                                        label: {
                                            text: result.city,
                                            // font: '24px Acumin-bold',
                                            font: '700 20px Roboto',
                                            fillColor: Cesium.Color.WHITE,
                                            outlineColor: Cesium.Color.BLACK,
                                            outlineWidth: 3,
                                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                            heightReference: Cesium.HeightReference.NONE,
                                            pixelOffset: new Cesium.Cartesian2(0, -5),
                                            translucencyByDistance: new Cesium.NearFarScalar(minDistance, 1.0,
                                                maxDistance, 0.0),
                                            disableDepthTestDistance: Number.POSITIVE_INFINITY,
                                        }
                                    });

                                    mapLabels.labels.push(result.city);
                                } else {
                                    // console.log("refused city: " + result.city);
                                }
                            }
                        }


                        /// wait serverRequestDelay for the callback
                        setTimeout(function () {
                            if (callback) callback();
                        }, mapLabels.serverRequestDelay);


                    }
                });


                xhr.open("GET", "https://wft-geo-db.p.rapidapi.com/v1/geo/locations/%2B" + latitude + "%2B" +
                    longitude + "/nearbyCities?limit=10&languageCode=it&minPopulation=" + minPopulation + "&radius=" + radius);
                xhr.setRequestHeader("x-rapidapi-host", "wft-geo-db.p.rapidapi.com");
                xhr.setRequestHeader("x-rapidapi-key", "ce699b059emshab8963e751a141dp1fb327jsn457d60aff686");
                xhr.send(data);
            }
        }
    },

    // resetServerAvailable: function () {
    //     /// reset server available
    //     setTimeout(function () {
    //         mapLabels.isServerAvailable = true;
    //     }, mapLabels.serverRequestDelay);
    // }
};