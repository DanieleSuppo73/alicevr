

/////////////////////////////////////////
////// cameraLinkButton
/////////////////////////////////////////
const cameraLinkButton = {
    id: "#cameraLinkButton",
    _isActive: false,
    _isLinked: null,
    images: {
        linked: "images/icon_linked.svg",
        unlinked: "images/icon_unlinked.svg",
    },
    get isActive() {
        return this._isActive;
    },
    set isActive(value) {
        this._isActive = value;
        if (this._isActive) {
            $(this.id).click(function () {
                cameraLinkButton.toggle();
            });
            $(this.id).css("cursor", "pointer");
            $(this.id).css("opacity", "1");
        } else {
            $(this.id).unbind();
            $(this.id).css("cursor", "default");
            $(this.id).css("opacity", "0.6");
        }
    },
    get isLinked() {
        return this._isLinked;
    },
    set isLinked(value) {
        if (value !== this._isLinked){
            this._isLinked = value;
            if (this._isLinked) {
                $(this.id).attr("src", this.images.linked);
    
                // if (typeof videoMarkers !== "undefined" && videoMarkers.isBillboarDefined) {
                //     console.log("cameraLinkButton.SetCamera")
                //     flyAndLinkCameraToEntity();
                // }
                
            } else {
                $(this.id).attr("src", this.images.unlinked);
                if (viewer.trackedEntity) {
                    unlinkCameraFromEntity();
                }

                /// reset the heading/range/pitch 
                if (typeof videoMarkers !== "undefined")
                    videoMarkers.firstReached = false;
            }
        }
    },
    toggle: function (value) {
        if (!value) {
            this.isLinked = this._isLinked ? false : true;
        } else this.isLinked = value;
    }
}

cameraLinkButton.isLinked = false;
cameraLinkButton.isActive = false;






/////////////////////////////////////////
////// layers toggle
/////////////////////////////////////////
const layersToggle = {
    layersToggleHandlers: [],
    showLayers: true,
    setLayers: function () {
        this.showLayers = !this.showLayers;
        let img = this.showLayers ?
            "images/icon_layers_on.svg" :
            "images/icon_layers_off.svg";
        $("#mapLayersToggle").attr("src", img);
        for (let i in this.layersToggleHandlers)
            this.layersToggleHandlers[i](this.showLayers);
    }
}





/////////////////////////////////////////
////// toolbar
/////////////////////////////////////////
const toolbar = {
    height: 0,
    navigation: {
        id: "#navigation",
        working: false,
        _isActive: true,
        get isActive() {
            return this._isActive;
        },
        set isActive(value) {
            if (value) {
                $(this.id).children('img').css("opacity", "0.7");
            } else {
                turnOffButton();
                $(this.id).children('img').css("opacity", "0.3");
            }
            this._isActive = value;
        },
    },
    _mobile: false,
    get isMobile() {
        return this._mobile;
    },
    set isMobile(value) {
        if (value) this.isVisible(false);
        this._mobile = value;
    },
    _visible: true,
    get isVisible() {
        return this._visible;
    },
    set isVisible(value) {
        if (!value) $("#toolbar").hide();
        else $("#toolbar").show();
        this._visible = value;
    },
    /// change visibility on resize, only for desktop
    setVisibility: function () {
        if (!this.isMobile) {
            let windowHeight = $(window).height();
            let windowWidth = $(window).width();
            let minSize = windowHeight >= windowWidth ?
                windowWidth : windowHeight;
            this.isVisible = minSize >= this.height + 50 ?
                true : false;
        }
    }
}




let timer;
$(document).ready(function () {

    /// set toolbar visibility
    toolbar.height = $("#toolbar").outerHeight();
    $(window).on("resize", function () {
        toolbar.setVisibility();
    });
    toolbar.setVisibility();

    // $("#cameraLinkButton").click(function () {
    //     cameraLinkButton.toggle();
    // });

    $("#mapLayersToggle").click(function () {
        layersToggle.setLayers();
    });


    let _bttn = null;



    function fixCameraToFrame() {
        let position = getPointFromCamera();
        viewer.camera.lookAt(position,
            new Cesium.HeadingPitchRange(viewer.camera.heading, viewer.camera.pitch, cameraProperties.range));
    }



    function turnOffButton() {
        if (_bttn) {
            $(_bttn).css('opacity', '0.7');
            clearInterval(timer);

            _bttn = null

            if (!viewer.trackedEntity) {
                viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            }
        }
    }




    /////////////////////////
    /// CAMERA ZOOM IN
    /////////////////////////
    $("#zoomIn").mousedown(function () {
        $(this).css('opacity', '1');

        _bttn = this;

        timer = setInterval(function () {
            let h = cameraProperties.height;
            if (h >= cameraProperties.minHeight) {
                let zoom = Math.pow(h, 1.25) * cameraProperties.zoomRate;
                camera.moveForward(zoom);
            }
        }, 20);
    });
    $("#zoomIn").mouseup(function () {
        turnOffButton()
    });
    $("#zoomIn").mouseleave(function () {
        turnOffButton()
    });




    /////////////////////////
    /// CAMERA ZOOM OUT
    /////////////////////////
    $("#zoomOut").mousedown(function () {
        $(this).css('opacity', '1');

        _bttn = this;

        timer = setInterval(function () {
            let h = cameraProperties.height;
            if (h <= cameraProperties.maxHeight) {
                let zoom = Math.pow(h, 1.25) * cameraProperties.zoomRate;
                camera.moveBackward(zoom);
            }
        }, 20);
    });
    $("#zoomOut").mouseup(function () {
        turnOffButton()
    });
    $("#zoomOut").mouseleave(function () {
        turnOffButton()
    });




    /////////////////////////
    /// ROTATE CAMERA LEFT
    /////////////////////////
    $("#turnLeft").mousedown(function () {
        $(this).css('opacity', '1');

        if (!viewer.trackedEntity) fixCameraToFrame();
        _bttn = this;

        timer = setInterval(function () {
            if (!viewer.trackedEntity && cameraLinkButton.isLinked) fixCameraToFrame();
            camera.rotateLeft(0.005);
        }, 20);
    });
    $("#turnLeft").mouseup(function () {
        turnOffButton()
    });
    $("#turnLeft").mouseleave(function () {
        turnOffButton()
    });





    /////////////////////////
    /// ROTATE CAMERA RIGHT
    /////////////////////////
    $("#turnRight").mousedown(function () {
        $(this).css('opacity', '1');

        if (!viewer.trackedEntity) fixCameraToFrame();
        _bttn = this;

        timer = setInterval(function () {
            if (!viewer.trackedEntity && cameraLinkButton.isLinked) fixCameraToFrame();
            camera.rotateRight(0.005);
        }, 20);
    });
    $("#turnRight").mouseup(function () {
        turnOffButton();
    });
    $("#turnRight").mouseleave(function () {
        turnOffButton();
    });




    /////////////////////////
    /// ROTATE CAMERA UP
    /////////////////////////
    $("#turnUp").mousedown(function () {
        $(this).css('opacity', '1');

        if (!viewer.trackedEntity) fixCameraToFrame();
        _bttn = this;

        timer = setInterval(function () {
            if (viewer.camera.pitch > -0.9) {
                if (!viewer.trackedEntity && cameraLinkButton.isLinked) fixCameraToFrame();
                camera.rotateDown(0.005);
            }
        }, 20);
    });
    $("#turnUp").mouseup(function () {
        turnOffButton();
    });
    $("#turnUp").mouseleave(function () {
        turnOffButton();
    });




    /////////////////////////
    /// ROTATE CAMERA DOWN
    /////////////////////////
    $("#turnDown").mousedown(function () {
        $(this).css('opacity', '1');

        if (!viewer.trackedEntity) fixCameraToFrame();
        _bttn = this;

        timer = setInterval(function () {
            if (viewer.camera.pitch < -0.1) {
                if (!viewer.trackedEntity && cameraLinkButton.isLinked) fixCameraToFrame();
                camera.rotateUp(0.005);
            }
        }, 20);
    });
    $("#turnDown").mouseup(function () {
        turnOffButton();
    });
    $("#turnDown").mouseleave(function () {
        turnOffButton();
    });
});





// //////////////////////////////////////////////////////////
// /// receiver from Dispatcher.js
// //////////////////////////////////////////////////////////
// if (window.addEventListener) window.addEventListener("message", displayMessage, false);
// else window.attachEvent("onmessage", displayMessage);

// function displayMessage(evt) {
//     let message = evt.data;
//     if (message.command === "onDeviceDetected") {
//         toolbar.isVisible = message.isMobile ? false : true;
//     }
//     if (message.command === "onVideoPlayerStatus" && message.status === "started") {
//         cameraLinkButton.isLinked = true;
//         cameraLinkButton.isActive = true;
//     }
// }




// //////////////////////////////////////////////////////////
// /// receiver from Dispatcher.js
// //////////////////////////////////////////////////////////
// dispatcher.receiveMessage(function (msg) {
//     if (msg.command === "onDeviceDetected") {
//         toolbar.isVisible = msg.isMobile ? false : true;
//     }
//     if (msg.command === "onVideoPlayerStatus" && msg.status === "started") {
//         cameraLinkButton.isLinked = true;
//         cameraLinkButton.isActive = true;
//     }
// })