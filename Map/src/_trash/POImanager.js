




function stringDivider(str, width, spaceReplacer) {
    if (str.length>width) {
        var p=width
        for (;p>0 && str[p]!=' ';p--) {
        }
        if (p>0) {
            var left = str.substring(0, p);
            var right = str.substring(p+1);
            return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
        }
    }
    return str;
}




function setLabelVisibility(){
    
}






let allPOI = [];

let isPoisVisible = layersToggle.showLayers;

/// hide the default Div
$(document).ready(function () {
    $('#POI-container-default').css('display', 'none');
});


// getting places from REST APIs
function loadPlaceFromAPIs(lng, lat, radius) {
    const params = {
        clientId: 'W5EWPKYYJJ3HMFEYXZHJKRVBG3JA3GDJG0AN2XFK0V0CVUMP',
        clientSecret: 'R233QHAWTWFZAEGYKZAVY4RJ1H4GZRLIHZNQV32PD1NZNRSM',
        version: '20300101', // foursquare versioning, required but unuseful
    };

    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
    &ll=${lat},${lng}
    &radius=${radius}
    &client_id=${params.clientId}
    &client_secret=${params.clientSecret}
    &limit=100

    &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    console.log(resp.response.venues)
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};



const loadPlaces = function (lng, lat, radius) {

    const PLACES = [{
        name: "Your place name",
        categories: [],
        location: {
            id: null,
            lat: 0, // add here latitude if using static data
            lng: 0, // add here longitude if using static data
            address: null,
            city: null,
        },
    }, ];

    return loadPlaceFromAPIs(lng, lat, radius);
};



///POI object constructor
function POI(longitude, latitude, type, name, address, description, tel, web, foursquareId) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.type = type;
    this.name = name;
    this.address = address;
    this.description = description;
    this.tel = tel;
    this.web = web;
    this.billboard = null;
    this.label = null;
    this.text = null;
    this.div = null;
    this.foursquareId = foursquareId;

   
    this.createLabel = function () {
        this.entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude),
            label: {
                text: stringDivider(this.name, 15, "\n"),
                font: '12px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.RED,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                heightReference: Cesium.HeightReference.NONE,
                // pixelOffset: new Cesium.Cartesian2(0, -5),
                // translucencyByDistance: new Cesium.NearFarScalar(minDistance, 1.0,
                //     maxDistance, 0.0),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
        });
    };



    /// create the visible part of the POI
    // if (this.type !== 'LABEL' && this.type !== 'TEXT') this.createBillboard();
    if (this.type === 'LABEL') this.createLabel();
    
}



POImanager = {

    load: function (asset) {

        let interval = setInterval(function () {

            if (map.isReady) {
                clearInterval(interval);

                /// clear all previuos loaded
                for (let i = 0; i < allPOI.length; i++) {
                    viewer.entities.remove(allPOI[i].billboard);
                    viewer.entities.remove(allPOI[i].label);
                }
                allPOI = [];



                // /// load places from API (foursquare.com)
                // /// from lng lat of the bounding sphere center of the selected asset
                // let cartographic = Cesium.Cartographic.fromCartesian(asset.boundingSphere.center);
                // let lng = Cesium.Math.toDegrees(cartographic.longitude);
                // let lat = Cesium.Math.toDegrees(cartographic.latitude);
                // let radius = 10000;
                // loadPlaces(lng, lat, radius)
                //     .then((places) => {
                //         places.forEach((place) => {

                //             let lng = place.location.lng;
                //             let lat = place.location.lat;
                //             let name = place.name;
                //             let address = null;
                //             if (typeof place.location.address !== 'undefined' && typeof place.location.city !== 'undefined')
                //                 address = place.location.address + " - " + place.location.city;

                //             let categoryName = place.categories[0].name;
                //             let categoryId = place.categories[0].id;
                //             let foursquareId = place.id;

                //             let newPOI = new POI(lng, lat, categoryId, name, address, null, null, null, foursquareId);
                //             allPOI.push(newPOI);
                //         });
                //     })






                /// load custom POI from xml file
                /// if available
                let url = asset.POI;
                if (url === null) return;

                let xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {

                        /// read XML file
                        let xmlDoc = this.responseXML;
                        let x = xmlDoc.getElementsByTagName("POI");
                        for (let i = 0; i < x.length; i++) {

                            
                            let poi = {};

                            
                            /// read data
                            let longitude = x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
                            let latitude = x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
                            let type = x[i].getElementsByTagName("TYPE")[0].childNodes[0].nodeValue;
                            let name = x[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue;

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
                            let font = null;
                            if (x[i].getElementsByTagName("FONT").length !== 0) {
                                if (x[i].getElementsByTagName("FONT")[0].childNodes.length !== 0) {
                                    font = x[i].getElementsByTagName("FONT")[0].childNodes[0].nodeValue;
                                }
                            }
                            let color = null;
                            if (x[i].getElementsByTagName("COLOR").length !== 0) {
                                if (x[i].getElementsByTagName("COLOR")[0].childNodes.length !== 0) {
                                    color = x[i].getElementsByTagName("COLOR")[0].childNodes[0].nodeValue;
                                }
                            }

                            // let newPOI = new POI(longitude, latitude, type, name, address, description, tel, web, null);
                            // allPOI.push(newPOI);
                            console.log(font)

                            let f = font ? font : '12px sans-serif';
                            let c = color ? Cesium.Color.LIGHTGREEN : Cesium.Color.WHITE;
                            
                            viewer.entities.add({
                                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                                label: {
                                    text: stringDivider(name, 15, "\n"),
                                    font: f,
                                    fillColor: c,
                                    outlineColor: Cesium.Color.BLACK,
                                    outlineWidth: 3,
                                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                    heightReference: Cesium.HeightReference.NONE,
                                    // pixelOffset: new Cesium.Cartesian2(0, -5),
                                    // translucencyByDistance: new Cesium.NearFarScalar(1000, 1.0,
                                    //     15000, 0.0),
                                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                                }
                            });

                        }
                    }
                };


                xhttp.open("GET", "../data/xml/" + url, true);
                xhttp.send();
            }

        }, 200)



    },
}



// getting places from REST APIs
function loadPlaceFromAPIs(lng, lat, radius) {
    const params = {
        lng: 7.6763373,
        lat: 45.0620588,
        radius: 100, // search places not farther than this value (in meters)
        clientId: 'W5EWPKYYJJ3HMFEYXZHJKRVBG3JA3GDJG0AN2XFK0V0CVUMP',
        clientSecret: 'R233QHAWTWFZAEGYKZAVY4RJ1H4GZRLIHZNQV32PD1NZNRSM',
        version: '20300101', // foursquare versioning, required but unuseful
    };

    const categories = {
        noleggioBici: '4e4c9077bd41f78e849722f9',
        hotel: '4bf58dd8d48988d1fa931735',
        campeggio: '4bf58dd8d48988d1e4941735',
        agriturismo: '55a5a1ebe4b013909087cb7c',
        monumento: '4bf58dd8d48988d12d941735',

        parcoNazionale: '52e81612bcbc57f1066b7a21',
        riservaNaturale: '52e81612bcbc57f1066b7a13',
        parco: '4bf58dd8d48988d163941735',
        parcoStatale: '5bae9231bedf3950379f89d0',


    }

    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
    &ll=${lat},${lng}
    &radius=${radius}
    &client_id=${params.clientId}
    &client_secret=${params.clientSecret}
    &limit=100
    &categoryId=${categories.parcoNazionale}
    &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    console.log(resp.response.venues)
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};




/// function to execute when the mouse is over a POI
const onPoisOver = function (entity) {
    if (entity.id.name !== "PLACE") return;

    $("#overlayLabel").find("#name").text(entity.id.overlayLabel.name);
    $("#overlayLabel").find("#address").text(entity.id.overlayLabel.address);
    $('#overlayLabel').fadeIn();

    // offsetWidth = 20;
    // offsetHeight = $("#overlayLabel").height();
    // offsetHeight /= -2;
}



const togglePoisVisibility = (value) => {
    isPoisVisible = value;
    for (let i = 0; i < allPOI.length; i++) {
        if (allPOI[i].billboard) {
            allPOI[i].billboard.show = value;
            allPOI[i].billboard.billboard.show = value;
        }
    }
}



/// function to execute when the mouse exit from a POI
const onPoisExit = (entity) => {
    if (entity.id.name !== "PLACE") return;
    $('#overlayLabel').fadeOut();
}



/// load the POI when the asset is selected
main.onSelectedAssetHandlers.push(POImanager.load);

map.onOverEntityHandlers.push(onPoisOver);
map.onExitEntityHandlers.push(onPoisExit);

layersToggle.layersToggleHandlers.push(togglePoisVisibility);