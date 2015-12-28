// -*- mode: espresso; espresso-indent-level: 4; indent-tabs-mode: nil -*-

// This function might be passed either an OpenLayers.LonLat (so has
// lon and lat) or an OpenLayers.Geometry.Point (so has x and y)
function fixmystreet_update_pin(lonlat) {
    lonlat.transform(
        fixmystreet.map.getProjectionObject(),
        new OpenLayers.Projection("EPSG:4326")
    );
    document.getElementById('fixmystreet.latitude').value = lonlat.lat || lonlat.y;
    document.getElementById('fixmystreet.longitude').value = lonlat.lon || lonlat.x;
}

function fixmystreet_activate_drag() {
    fixmystreet.drag = new OpenLayers.Control.DragFeature( fixmystreet.markers, {
        onComplete: function(feature, e) {
            fixmystreet_update_pin( feature.geometry.clone() );
        }
    } );
    fixmystreet.map.addControl( fixmystreet.drag );
    fixmystreet.drag.activate();
}

function fms_markers_list(pins, transform) {
    var markers = [];
    for (var i=0; i<pins.length; i++) {
        var pin = pins[i];
        var loc = new OpenLayers.Geometry.Point(pin[1], pin[0]);
        if (transform) {
            // The Strategy does this for us, so don't do it in that case.
            loc.transform(
                new OpenLayers.Projection("EPSG:4326"),
                fixmystreet.map.getProjectionObject()
            );
        }
        var marker = new OpenLayers.Feature.Vector(loc, {
            colour: pin[2],
            size: pin[5] || 'normal',
            id: pin[3],
            title: pin[4] || ''
        });
        markers.push( marker );
    }
    return markers;
}

function getNavControl(map) {
    var nav;
    for (var i = 0; i< map.controls.length; i++) {
        if (map.controls[i].displayClass == 
                                "olControlNavigation") {
            nav = map.controls[i];
            return nav;
        }
    }
    return nav;
}

function fixmystreet_onload() {
    var pin_layer_style_map = new OpenLayers.StyleMap({
        'default': new OpenLayers.Style({
            graphicTitle: "${title}",
            graphicOpacity: 1,
            graphicZIndex: 11,
            backgroundGraphicZIndex: 10
        })
    });
    var location_img = 'images/pin@x2.png';
    var location_bg_img = 'images/pin_shadow@x2.png';
    if ( typeof device !== 'undefined' && (
        (device.platform == 'Android' && parseInt(device.version, 10) > 2) ||
        (device.platform !== 'Android') ) ) {
        location_img = 'images/pin.svg';
        location_bg_img = 'images/pin_shadow.svg';
    }

    pin_layer_style_map.addUniqueValueRules('default', 'size', {
        'normal': {
            externalGraphic: "images/pin-${colour}.png",
            graphicWidth: 48,
            graphicHeight: 64,
            graphicXOffset: -24,
            graphicYOffset: -64,
            backgroundGraphic: "images/pin-shadow.png",
            backgroundWidth: 60,
            backgroundHeight: 30,
            backgroundXOffset: -7,
            backgroundYOffset: -30
        },
        'big': {
            externalGraphic: "images/pin-${colour}-big.png",
            graphicWidth: 78,
            graphicHeight: 105,
            graphicXOffset: -39,
            graphicYOffset: -105,
            backgroundGraphic: "images/pin-shadow-big.png",
            backgroundWidth: 88,
            backgroundHeight: 40,
            backgroundXOffset: -10,
            backgroundYOffset: -35
        },
        'location': {
            externalGraphic: location_img,
            graphicWidth: 70,
            graphicHeight: 110,
            graphicXOffset: -35,
            graphicYOffset: -110,
            backgroundGraphic: location_bg_img,
            backgroundWidth: 186,
            backgroundHeight: 110,
            backgroundXOffset: -93,
            backgroundYOffset: -110 
        }
    });
    var pin_layer_options = {
        rendererOptions: {
            yOrdering: true
        },
        styleMap: pin_layer_style_map
    };

    // This layer is for displaying the location of the current report.
    // It's in its own layer as that means canceling a report means we only
    // need to switch layer visibility rather than fetching the position of the
    // existing reports all over again. 
    fixmystreet.report_location = new OpenLayers.Layer.Vector("Report", pin_layer_options);
    fixmystreet.report_location.setVisibility(false)
    fixmystreet.map.addLayer(fixmystreet.report_location);

    if (fixmystreet.page == 'around') {
        fixmystreet.bbox_strategy = new OpenLayers.Strategy.BBOX({ ratio: 1 });
        pin_layer_options.strategies = [ fixmystreet.bbox_strategy ];
        pin_layer_options.protocol = new OpenLayers.Protocol.HTTP({
            url: CONFIG.FMS_URL + '/ajax',
            params: fixmystreet.all_pins ? { all_pins: 1 } : { },
            format: new OpenLayers.Format.FixMyStreet()
        });
    }
    fixmystreet.markers = new OpenLayers.Layer.Vector("Pins", pin_layer_options);
    fixmystreet.markers.events.register( 'loadend', fixmystreet.markers, function(evt) {
        if (fixmystreet.map.popups.length) fixmystreet.map.removePopup(fixmystreet.map.popups[0]);
    });

    fixmystreet.nav = getNavControl(fixmystreet.map);

    var markers = fms_markers_list( fixmystreet.pins, true );
    fixmystreet.markers.addFeatures( markers );
    if (fixmystreet.page == 'around' || fixmystreet.page == 'reports' || fixmystreet.page == 'my') {
        fixmystreet.select_feature = new OpenLayers.Control.SelectFeature( fixmystreet.markers );
        var selectedFeature;
        function onPopupClose(evt) {
            fixmystreet.select_feature.unselect(selectedFeature);
            OpenLayers.Event.stop(evt);
        }
        fixmystreet.markers.events.register( 'featureunselected', fixmystreet.markers, function(evt) {
            var feature = evt.feature, popup = feature.popup;
            fixmystreet.map.removePopup(popup);
            popup.destroy();
            feature.popup = null;
            $('#OpenLayers_Control_Crosshairs_crosshairs').show();
        });
        fixmystreet.markers.events.register( 'featureselected', fixmystreet.markers, function(evt) {
            var feature = evt.feature;
            selectedFeature = feature;
            var popup = new OpenLayers.Popup.FramedCloud("popup",
                feature.geometry.getBounds().getCenterLonLat(),
                null,
                feature.attributes.title + "<br><a onclick=\"FMS.openExternal(event); return false;\" href=\"" + CONFIG.FMS_URL + "/report/" + feature.attributes.id + "\">More details</a>",
                { size: new OpenLayers.Size(0,0), offset: new OpenLayers.Pixel(0,-40) },
                true, onPopupClose);
            feature.popup = popup;
            fixmystreet.map.addPopup(popup);
            $('#OpenLayers_Control_Crosshairs_crosshairs').hide();
        });
        fixmystreet.map.addControl( fixmystreet.select_feature );
        fixmystreet.select_feature.activate();
    } else if (fixmystreet.page == 'new') {
        fixmystreet_activate_drag();
    }
    fixmystreet.map.addLayer(fixmystreet.markers);

    // this layer is for the position of the 'You are here' blue dot
    fixmystreet.location = new OpenLayers.Layer.Vector('location');
    fixmystreet.map.addLayer(fixmystreet.location);

    if ( fixmystreet.zoomToBounds ) {
        var bounds = fixmystreet.markers.getDataExtent();
        if (bounds) { fixmystreet.map.zoomToExtent( bounds ); }
    }

    if (fixmystreet.page == 'around' ) {
        fixmystreet.actionafterdrag = new OpenLayers.Control.ActionAfterDrag({'autoActivate': true});
        fixmystreet.map.addControl(fixmystreet.actionafterdrag);
        fixmystreet.map.addControl( new OpenLayers.Control.Crosshairs(null) );
    }
}
OpenLayers.Map.prototype.getCurrentSize = function() {
    var mapDiv = $(this.div);
    return new OpenLayers.Size(mapDiv.width(), mapDiv.height());
};

function show_map(event) {
    if (typeof fixmystreet !== 'undefined' && fixmystreet.page == 'around') {
        // Immediately go full screen map if on around page
        var mapTop = 0;
        if ( $('body').hasClass('ios7') ) {
            mapTop = 20;
        }
        $('#map_box').css({
            position: 'fixed',
            top: mapTop, left: 0, right: 0, bottom: 0,
            height: FMS.windowHeight,
            margin: 0
        });
    } else {
        $('#map_box').css({
            zIndex: '', position: '',
            top: '', left: '', right: '', bottom: '',
            width: '', height: '10em',
            margin: ''
        });
    }

    set_map_config();
    $('#mark-here').hide();

    fixmystreet.map = new OpenLayers.Map("map", {
        controls: fixmystreet.controls,
        displayProjection: new OpenLayers.Projection("EPSG:4326")
    });

    fixmystreet.layer_options = OpenLayers.Util.extend({
        zoomOffset: fixmystreet.zoomOffset,
        transitionEffect: 'resize',
        numZoomLevels: fixmystreet.numZoomLevels
    }, fixmystreet.layer_options);
    var layer = new fixmystreet.map_type("", fixmystreet.layer_options);
    fixmystreet.map.addLayer(layer);

    if (!fixmystreet.map.getCenter()) {
        var centre = new OpenLayers.LonLat( fixmystreet.longitude, fixmystreet.latitude );
        FMS.currentPosition = { latitude: centre.lat, longitude: centre.lon };
        centre.transform(
            new OpenLayers.Projection("EPSG:4326"),
            fixmystreet.map.getProjectionObject()
        );
        fixmystreet.map.setCenter(centre, fixmystreet.zoom || 4);
    }

    fixmystreet_onload();

    var crosshairsControls, i, markHere, confirm, newX, newY;

    if (typeof fixmystreet !== 'undefined' && typeof fixmystreet.map !== "undefined") {
        // Update the position of any crosshairs controls:
        crosshairsControls = fixmystreet.map.getControlsByClass(
            "OpenLayers.Control.Crosshairs");
        for (i = 0; i < crosshairsControls.length; ++i) {
            crosshairsControls[i].reposition();
        }
    }

    if ( fixmystreet.page == 'around' ) {
        fixmystreet.nav.activate();
        $('#view-my-reports').show();
        $('#login-options').show();
        $('#mark-here').show();
    }
}


OpenLayers.Control.Crosshairs = OpenLayers.Class.create();
OpenLayers.Control.Crosshairs.CROSSHAIR_SIDE = 106;
OpenLayers.Control.Crosshairs.DIV_ID = "OpenLayers_Control_Crosshairs_crosshairs";
OpenLayers.Control.Crosshairs.prototype =
  OpenLayers.Class.inherit( OpenLayers.Control, {
    element: null,
    position: null,

    initialize: function(element) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.element = OpenLayers.Util.getElement(element);
        this.imageSize = new OpenLayers.Size(OpenLayers.Control.Crosshairs.CROSSHAIR_SIDE,
                                             OpenLayers.Control.Crosshairs.CROSSHAIR_SIDE);
    },

    draw: function() {
        var position;
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        position = this.getIdealPosition();
        this.buttons = new Array();
        // we set the background image in CSS so we can use media queries for retina
        // screens so we want an blank image here
        var imgLocation = OpenLayers.Util.getImagesLocation() + "blank.gif";
        return OpenLayers.Util.createAlphaImageDiv(OpenLayers.Control.Crosshairs.DIV_ID,
                 position, this.imageSize, imgLocation, "absolute");
    },

    getIdealPosition: function() {
        this.map.updateSize();
        var mapSize = this.map.getSize();
        var center = this.map.getCenter();
        var px = this.map.getPixelFromLonLat( center );
        return new OpenLayers.Pixel( px.x - ( this.imageSize.w / 2 ),
                                     px.y - ( this.imageSize.h / 2 ) );
    },

    getMapPosition: function() {
        var left = parseInt( $('#' + OpenLayers.Control.Crosshairs.DIV_ID).css('left') );
        var top = parseInt( $('#' + OpenLayers.Control.Crosshairs.DIV_ID).css('top') );

        left += ( this.imageSize.w / 2 );
        top += ( this.imageSize.h / 2 );

        var pos = this.map.getLonLatFromViewPortPx( new OpenLayers.Pixel( left, top ) );
        return pos;
    },

    reposition: function() {
        var position = this.getIdealPosition();
        $('#' + OpenLayers.Control.Crosshairs.DIV_ID).css({
            left: position.x,
            top: position.y});
    },

    CLASS_NAME: "OpenLayers.Control.Crosshairs"
});

OpenLayers.Control.PanZoomFMS = OpenLayers.Class(OpenLayers.Control.PanZoom, {
    buttonDown: function (evt) {
        if (!OpenLayers.Event.isLeftClick(evt)) {
            return;
        }

        switch (this.action) {
            case "panup":
                this.map.pan(0, -this.getSlideFactor("h"));
                break;
            case "pandown":
                this.map.pan(0, this.getSlideFactor("h"));
                break;
            case "panleft":
                this.map.pan(-this.getSlideFactor("w"), 0);
                break;
            case "panright":
                this.map.pan(this.getSlideFactor("w"), 0);
                break;
            case "zoomin":
                this.map.zoomIn();
                break;
            case "zoomout":
                this.map.zoomOut();
                break;
            case "zoomworld":
                this.map.zoomTo(0);
                break;
        }

        OpenLayers.Event.stop(evt);
    }
});


/* Pan data handler */
OpenLayers.Format.FixMyStreet = OpenLayers.Class(OpenLayers.Format.JSON, {
    read: function(json, filter) {
        if (typeof json == 'string') {
            obj = OpenLayers.Format.JSON.prototype.read.apply(this, [json, filter]);
        } else {
            obj = json;
        }
        var current, current_near;
        if (typeof(obj.current) != 'undefined' && (current = document.getElementById('current'))) {
            current.innerHTML = obj.current;
        }
        if (typeof(obj.current_near) != 'undefined' && (current_near = document.getElementById('current_near'))) {
            current_near.innerHTML = obj.current_near;
        }
        var markers = fms_markers_list( obj.pins, false );
        return markers;
    },
    CLASS_NAME: "OpenLayers.Format.FixMyStreet"
});

OpenLayers.Control.ActionAfterDrag = OpenLayers.Class(OpenLayers.Control, {

    defaultHandlerOptions: {
        'stopDown': false
        /* important, otherwise it prevent the click-drag event from 
           triggering the normal click-drag behavior on the map to pan it */
    },

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        ); 
        this.handler = new OpenLayers.Handler.Drag(
            this, {
                'move': this.onDragStart
            }, this.handlerOptions
        );
    }, 

    onDragStart: function(evt) {
        if ( $('#confirm-map').css('display') == 'block' ) {
            $('#reposition').show();
        } else {
            $('#relocate').show();
            $('#front-howto').hide();
        }
    }
});


// Overload the PinchZoom control so we can stop zoom snapback when we
// reach the limit of zooming
OpenLayers.Control.PinchZoom = OpenLayers.Class(OpenLayers.Control.PinchZoom,{
    pinchMove: function(evt,pinchData) {
        var maxZoom = fixmystreet.numZoomLevels - 1;
        var scale = pinchData.scale;
        var containerOrigin = this.containerOrigin;
        var pinchOrigin = this.pinchOrigin;
        var current = evt.xy;
        var dx = Math.round((current.x-pinchOrigin.x) + (scale-1) * (containerOrigin.x-pinchOrigin.x));
        var dy = Math.round((current.y-pinchOrigin.y) + (scale-1) * (containerOrigin.y-pinchOrigin.y));

        // if we are at the limits of the zoom then do nothing to stop zoom snapback effect
        var mapZoom = this.map.getZoom();
        if ( ( ( dx < 0 || dy < 0 ) && mapZoom == maxZoom ) || ( ( dx > 0 || dy > 0 ) && mapZoom == 0 ) ) {
            return false;
        }

        this.applyTransform("translate("+dx+"px, "+dy+"px) scale("+scale+")");
        this.currentCenter=current;
    },
    CLASS_NAME: "OpenLayers.Control.PinchZoom"
});
