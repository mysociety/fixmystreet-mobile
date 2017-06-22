(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        AroundView: FMS.LocatorView.extend({
            template: 'around',
            id: 'around-page',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick #locate_cancel': 'goSearch',
                'vclick #login-options': 'goLogin',
                'vclick #view-my-reports': 'goReports',
                'vclick #search': 'goSearch',
                'vclick .ui-input-clear': 'clearSearchErrors',
                'blur #pc': 'clearSearchErrors',
                'vclick #relocate': 'centerMapOnPosition',
                'vclick #cancel': 'onClickCancel',
                'vclick #confirm-map': 'onClickReport',
                'vclick #mark-here': 'onClickMark',
                'vclick #locate-here': 'onClickMark',
                'vclick #reposition': 'onClickReposition',
                'vclick a.address': 'goAddress',
                'submit #postcodeForm': 'search'
            },

            render: function(){
                if ( !this.template ) {
                    FMS.printDebug('no template to render');
                    return;
                }
                template = _.template( tpl.get( this.template ) );
                if ( this.model ) {
                    this.$el.html(template({ model: this.model.toJSON(), user: FMS.currentUser.toJSON() }));
                } else {
                    this.$el.html(template());
                }
                this.afterRender();
                return this;
            },

            beforeDisplay: function() {
                this.origPcPlaceholder = $('#pc').attr('placeholder');
                $('a[data-role="button"]').hide();
                $('#view-my-reports').hide();
                $('#login-options').hide();
                $('#postcodeForm').hide();
                $('#relocate').hide();
                $('#cancel').hide();
                $('#map_box').removeClass('background-map');
                this.fixPageHeight();
                $('#map_box').on('touchend', function() { if ( ! $('#popup').length ) { $('#OpenLayers_Control_Crosshairs_crosshairs').show(); } } );
            },

            afterDisplay: function() {
                if ( FMS.isOffline ) {
                    $('#locating').hide();
                    this.navigate( 'offline' );
                } else if ( this.model && this.model.get('lat') ) {
                    var modelInfo = { coordinates: { latitude: this.model.get('lat'), longitude: this.model.get('lon') } };
                    this.setMapPosition(modelInfo);
                    this.displayButtons(true);
                    this.setReportPosition({ lat: this.model.get('lat'), lon: this.model.get('lon') }, true);
                    this.listenTo(FMS.locator, 'gps_current_position', this.positionUpdate);
                    FMS.locator.trackPosition();
                } else if ( FMS.currentPosition ) {
                    var info = { coordinates: FMS.currentPosition };
                    FMS.currentPosition = null;
                    if ( !fixmystreet.map ) {
                        this.setMapPosition(info);
                    }
                    this.displayButtons(false);
                    this.listenTo(FMS.locator, 'gps_current_position', this.positionUpdate);
                    FMS.locator.trackPosition();
                } else {
                    this.locate();
                    this.displayButtons(false);
                }
            },

            _back: function(e) {
                if ( $('#confirm-map').css('display') == 'block' ) {
                    this.onClickCancel(e);
                } else {
                    navigator.app.exitApp();
                }
            },

            setMapPosition: function( info ) {
                var coords = info.coordinates;
                fixmystreet.latitude = coords.latitude;
                fixmystreet.longitude = coords.longitude;

                if ( !fixmystreet.map ) {
                    show_map();
                } else {
                    FMS.currentPosition = coords;
                    var centre = this.projectCoords( coords );
                    fixmystreet.map.panTo(centre);
                }
            },

            gotLocation: function( info ) {
                $('#relocate').show();
                this.finishedLocating();

                this.listenTo(FMS.locator, 'gps_current_position', this.positionUpdate);

                this.located = true;
                this.locateCount = 21;

                this.setMapPosition( info );

                FMS.locator.trackPosition();
                // FIXME: not sure why I need to do this
                fixmystreet.select_feature.deactivate();
                fixmystreet.select_feature.activate();
                fixmystreet.nav.activate();
                this.displayHelpIfFirstTime();
            },

            positionUpdate: function( info ) {
                if ( $('#front-howto').is(':hidden') ) {
                    $('#relocate').show();
                }
                FMS.currentPosition = info.coordinates;
                var centre = this.projectCoords( info.coordinates );

                var point = new OpenLayers.Geometry.Point( centre.lon, centre.lat );

                fixmystreet.location.removeAllFeatures();
                    var x = new OpenLayers.Feature.Vector(
                        point,
                        {},
                        {
                            graphicZIndex: 3000,
                            graphicName: 'circle',
                            'externalGraphic': 'images/gps-marker.svg', 
                            pointRadius: 16
                        }
                    );
                fixmystreet.location.addFeatures([ x ]);
            },

            centerMapOnPosition: function(e) {
                e.preventDefault();
                if ( !fixmystreet.map ) {
                    return;
                }

                // if there isn't a currentPosition then something
                // is up so we probably should not recenter
                if ( FMS.currentPosition ) {
                    fixmystreet.map.panTo(this.projectCoords( FMS.currentPosition ));

                    // If we've confirmed the report position then we should be able
                    // to reposition it if we've moved the map.
                    if ( $('#confirm-map').css('display') == 'block' ) {
                        var currentPos = this.projectCoords(FMS.currentPosition);
                        var markerPos = this.getMarkerPosition(true);

                        // Displaying the button if the report is in the same place as the 
                        // GPS location could be confusing so check they are different.
                        // The slight margin of error is there to account for both rounding
                        // wiggle in the projectCoords and also so that small changes due to
                        // GPS noise are ignored
                        if ( Math.abs(markerPos.lat - currentPos.lat) > 1 ||
                             Math.abs(markerPos.lon - currentPos.lon) > 1 ) {
                            $('#reposition').show();
                        }
                    }
                }
            },

            failedLocation: function( details ) {
                this.finishedLocating();
                this.locateCount = 21;
                var msg = '';
                if ( details.msg ) {
                    msg = details.msg;
                } else {
                    msg = FMS.strings.location_problem;
                }
                if ( !fixmystreet.map ) {
                    $('#relocate').hide();
                    $('#mark-here').hide();
                    // if we are going to display the help then we don't want to focus on
                    // the search box as it will show through the help
                    if ( FMS.usedBefore ) {
                        $('#pc').attr('placeholder', FMS.strings.search_placeholder).focus();
                    }
                }
                $('#front-howto').html('<p>' + msg + '</p>');
                $('#front-howto').show();

                this.displayHelpIfFirstTime();
            },

            displayHelpIfFirstTime: function() {
                if ( !FMS.usedBefore ) {
                    FMS.helpShow();
                }
            },

            displayButtons: function(isLocationSet) {
                if ( fixmystreet.map ) {
                    fixmystreet.nav.activate();
                    fixmystreet.actionafterdrag.activate();
                }
                if (isLocationSet) {
                    $('#cancel').addClass('ui-btn-left').show();
                    $('#confirm-map').show();
                    $('#view-my-reports').hide();
                    $('#login-options').hide();
                    $('#mark-here').hide();
                    $('#locate-here').hide();
                    $('#postcodeForm').hide();
                    if ( fixmystreet.map ) {
                        fixmystreet.markers.setVisibility(false);
                        fixmystreet.select_feature.deactivate();
                        fixmystreet.bbox_strategy.deactivate();
                    }
                } else {
                    if ( FMS.currentDraft.isPartial() ) {
                        $('#cancel').addClass('ui-btn-left').show();
                        $('#view-my-reports').hide();
                        $('#login-options').hide();
                        $('#locate-here').show();
                    } else {
                        $('#cancel').hide().removeClass('ui-btn-left');
                        $('#view-my-reports').show();
                        $('#login-options').show();
                        $('#mark-here').show();
                        $('#locate-here').hide();
                    }
                    $('#confirm-map').hide();
                    $('#postcodeForm').show();
                    $('#reposition').hide();
                    if ( fixmystreet.map ) {
                        fixmystreet.bbox_strategy.activate();
                        fixmystreet.report_location.setVisibility(false);
                        fixmystreet.markers.setVisibility(true);
                        fixmystreet.select_feature.deactivate();
                        fixmystreet.select_feature.activate();
                    }
                }
            },

            setReportPosition: function(lonlat, convertPosition) {
                var markers = fms_markers_list( [ [ lonlat.lat, lonlat.lon, 'green', 'location', '', 'location' ] ], convertPosition );
                fixmystreet.report_location.removeAllFeatures();
                fixmystreet.report_location.addFeatures( markers );
                fixmystreet.report_location.setVisibility(true);
            },

            onClickMark: function(e) {
                e.preventDefault();
                this.clearSearchErrors();
                this.displayButtons(true);
                $('#popup').hide();
                $('#OpenLayers_Control_Crosshairs_crosshairs').show();
                $('#reposition').hide();

                var lonlat = this.getCrossHairPosition();
                this.setReportPosition(lonlat, true);
            },

            onClickCancel: function(e) {
                e.preventDefault();
                fixmystreet.markers.removeAllFeatures();
                fixmystreet_activate_drag();
                // force pins to be refetched and displayed
                fixmystreet.bbox_strategy.update({force: true});
                if ( this.model.isPartial() ) {
                    FMS.clearCurrentDraft();
                } else {
                    // it's not partial but we've created a draft anyway so
                    // delete it
                    if ( this.model.id ) {
                        var del = FMS.removeDraft( this.model.id, true );
                        var that = this;
                        del.done( function() { that.decrementDraftCount(); } );
                    }
                    this.model.set('lat', null);
                    this.model.set('lon', null);
                }
                this.displayButtons(false);
            },

            decrementDraftCount: function() {
                var counter = $('#view-my-reports .draft_count');
                var count = counter.text();
                count--;
                counter.text(count);
            },

            onClickReposition: function(e) {
                e.preventDefault();
                var lonlat = this.getCrossHairPosition();
                lonlat.transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    fixmystreet.map.getProjectionObject()
                );
                fixmystreet.report_location.features[0].move(lonlat);
                $('#reposition').hide();
            },

           onClickReport: function(e) {
                e.preventDefault();
                var position = this.getMarkerPosition();

                if ( FMS.isOffline ) {
                    this.stopListening(FMS.locator);
                    FMS.locator.stopTracking();
                    // these may be out of the area but lets just save them
                    // for now and they can be checked when we are online.
                    this.model.set('lat', position.lat );
                    this.model.set('lon', position.lon );
                    FMS.saveCurrentDraft();
                    this.navigate( 'offline' );
                } else {
                    this.listenTo(FMS.locator, 'gps_located', this.goPhoto);
                    this.listenTo(FMS.locator, 'gps_failed', this.locationCheckFailed );
                    FMS.locator.check_location( { latitude: position.lat, longitude: position.lon } );
                }
            },

            search: function(e) {
                $('#pc').blur();
                // this is to stop form submission
                e.preventDefault();
                $('#front-howto').hide();
                this.clearSearchErrors();
                this.clearValidationErrors();
                var pc = this.$('#pc').val();
                this.listenTo(FMS.locator, 'search_located', this.searchSuccess );
                this.listenTo(FMS.locator, 'search_failed', this.searchFail);

                FMS.locator.lookup(pc);
            },

            searchSuccess: function( info ) {
                this.stopListening(FMS.locator, 'search_located');
                this.stopListening(FMS.locator, 'search_failed');
                var coords = info.coordinates;
                if ( fixmystreet.map ) {
                    fixmystreet.map.panTo(this.projectCoords( coords ));
                } else {
                    this.setMapPosition(info);
                    this.displayButtons(false);
                }
            },

            goAddress: function(e) {
                $('#relocate').show();
                $('#front-howto').html('').hide();
                var t = $(e.target);
                var lat = t.attr('data-lat');
                var long = t.attr('data-long');

                var coords  = { latitude: lat, longitude: long };
                if ( fixmystreet.map ) {
                    fixmystreet.map.panTo(this.projectCoords( coords ));
                } else {
                    this.setMapPosition({ coordinates: coords });
                }
            },

            searchError: function(msg) {
                if ( msg.length < 30 ) {
                    $('#pc').attr('placeholder', msg).addClass('error');;
                } else {
                    $('#front-howto').html(msg);
                    $('#relocate').hide();
                    $('#front-howto').show();
                }
            },

            clearSearchErrors: function() {
                $('#pc').attr('placeholder', this.origPcPlaceholder).removeClass('error');;
                if ( fixmystreet.map ) {
                    $('#front-howto').hide();
                    $('#relocate').show();
                }
            },

            searchFail: function( details ) {
                // this makes sure any onscreen keyboard is dismissed
                $('#submit').focus();
                this.stopListening(FMS.locator, 'search_located');
                this.stopListening(FMS.locator, 'search_failed');
                if ( details.msg ) {
                    this.searchError( details.msg );
                } else if ( details.locations ) {
                    var multiple = '';
                    for ( var i = 0; i < details.locations.length; i++ ) {
                        var loc = details.locations[i];
                        var li = '<li><a class="address" id="location_' + i + '" data-lat="' + loc.lat + '" data-long="' + loc.long + '">' + loc.address + '</a></li>';
                        multiple = multiple + li;
                    }
                    $('#front-howto').html('<p>Multiple matches found</p><ul data-role="listview" data-inset="true">' + multiple + '</ul>');
                    $('.ui-page').trigger('create');
                    $('#relocate').hide();
                    $('#front-howto').show();
                } else {
                    this.searchError( FMS.strings.location_problem );
                }
            },

            pauseMap: function() {
                this.stopListening(FMS.locator);
                FMS.locator.stopTracking();
                if ( FMS.iPhoneModel > 3 ) {
                    $('#map_box').addClass('background-map');
                }
                $('#map_box').off('touchend');
                if ( fixmystreet.map ) {
                    fixmystreet.nav.deactivate();
                    fixmystreet.actionafterdrag.deactivate();
                }
            },

            goPhoto: function(info) {
                this.pauseMap();
                this.model.set('lat', info.coordinates.latitude );
                this.model.set('lon', info.coordinates.longitude );
                this.model.set('categories', info.details.category );
                if ( info.details.titles_list ) {
                    this.model.set('titles_list', info.details.titles_list);
                }
                FMS.saveCurrentDraft();

                this.navigate( 'photo' );
            },

            locationCheckFailed: function() {
                this.finishedLocating();
                this.displayAlert(FMS.strings.location_check_failed);
            },

            goSearch: function(e) {
                e.preventDefault();
                if ( !fixmystreet.map ) {
                    this.$('#mark-here').hide();
                    this.$('#relocate').hide();
                    $('#front-howto').html('<p>' + FMS.strings.locate_dismissed + '</p>');
                    $('#front-howto').show();
                }
                this.finishedLocating();
            },

            goLogin: function(e) {
                e.preventDefault();
                this.pauseMap();
                this.navigate( 'login' );
            },

            goReports: function(e) {
                e.preventDefault();
                this.pauseMap();
                this.navigate( 'reports' );
            },

            getCrossHairPosition: function() {
                var cross = fixmystreet.map.getControlsByClass(
                "OpenLayers.Control.Crosshairs");

                var position = cross[0].getMapPosition();
                position.transform(
                    fixmystreet.map.getProjectionObject(),
                    new OpenLayers.Projection("EPSG:4326")
                );

                return position;
            },

            getMarkerPosition: function(skipTransform) {
                var marker = fixmystreet.report_location.features[0].geometry;

                var position = new OpenLayers.LonLat( marker.x, marker.y );
                if ( skipTransform ) {
                    return position;
                }
                position.transform(
                    fixmystreet.map.getProjectionObject(),
                    new OpenLayers.Projection("EPSG:4326")
                );

                return position;
            },

            projectCoords: function( coords ) {
                var centre = new OpenLayers.LonLat( coords.longitude, coords.latitude );
                centre.transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    fixmystreet.map.getProjectionObject()
                );

                return centre;
            }
        })
    });
})(FMS, Backbone, _, $);
