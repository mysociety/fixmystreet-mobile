(function(FMS, Backbone, _) {
    // The Geolocation docs refer to PositionError but it's not made clear
    // where it's actually defined, if anywhere.
    // So let's define it ourselves if it doesn't already exist.
    var PositionError = window.PositionError || {};
    PositionError.PERMISSION_DENIED = PositionError.PERMISSION_DENIED || 1;
    PositionError.POSITION_UNAVAILABLE = PositionError.POSITION_UNAVAILABLE || 2;
    PositionError.TIMEOUT = PositionError.TIMEOUT || 3;

    _.extend( FMS, {
        Locate: function() { return {
            locating: 0,
            updating: 0,

            lookup: function(q) {
                var that = this;
                if (!q) {
                    this.trigger('search_failed', { msg: FMS.strings.missing_location } );
                    return false;
                }

                var url = CONFIG.FMS_URL + '/ajax/lookup_location?term=' + q;

                var x = $.ajax( {
                    url: url,
                    dataType: 'json',
                    timeout: 30000,
                    success: function(data, status) {
                        if ( status == 'success' ) {
                            if ( data.latitude ) {
                                that.trigger('search_located', { coordinates: { latitude: data.latitude, longitude: data.longitude } } );
                            } else if ( data.suggestions ) {
                                that.trigger( 'search_failed', { suggestions: data.suggestions, locations: data.locations } );
                            } else {
                                that.trigger( 'search_failed', { msg: data.error } );
                            }
                        } else {
                            that.trigger( 'search_failed', { msg: FMS.strings.location_problem } );
                        }
                    },
                    error: function(data, status, errorThrown) {
                        that.trigger( 'search_failed', { msg: FMS.strings.location_problem } );
                    }
                } );
            },

            geolocate: function( minAccuracy, skipLocationCheck ) {
                this.locating = 1;

                var that = this;
                this.watch_id = navigator.geolocation.watchPosition(
                    function(location) {
                        if ( that.watch_id === undefined ) { FMS.printDebug( 'no watch id' ); return; }

                        if ( minAccuracy && location.coords.accuracy > minAccuracy ) {
                            that.trigger('gps_locating', location.coords.accuracy);
                        } else {
                            that.locating = 0;
                            navigator.geolocation.clearWatch( that.watch_id );
                            delete that.watch_id;

                            if ( skipLocationCheck ) {
                                that.trigger('gps_located', { coordinates: location.coords } );
                            } else {
                                that.check_location(location.coords, false);
                            }
                        }
                    },
                    function(err) {
                        if ( that.watch_id === undefined ) { return; }
                        that.locating = 0;
                        navigator.geolocation.clearWatch( that.watch_id );
                        delete that.watch_id;
                        var errorMsg = FMS.strings.geolocation_failed;

                        if ( err && err.code == PositionError.PERMISSION_DENIED ) {
                            errorMsg = FMS.strings.geolocation_denied;
                        }
                        that.trigger('gps_failed', { msg: errorMsg } );
                    },
                    { timeout: 20000, enableHighAccuracy: true }
                );
            },

            trackPosition: function() {
                this.updating = 1;
                var that = this;
                this.track_watch_id = navigator.geolocation.watchPosition(
                    function(location) {
                        that.trigger('gps_current_position', { coordinates: location.coords } );
                    },
                    function() {},
                    { timeout: 20000, enableHighAccuracy: true }
                );
            },

            stopTracking: function() {
                this.updating = 0;
                if ( this.track_watch_id ) {
                    navigator.geolocation.clearWatch( this.track_watch_id );
                    delete this.track_watch_id;
                }
            },

            check_location: function(coords, showSpinner) {
                if ( typeof( showSpinner ) === 'undefined' ) {
                    showSpinner = true;
                }
                var that = this;
                $.ajax( {
                    url: CONFIG.FMS_URL + '/report/new/ajax',
                    global: showSpinner,
                    dataType: 'json',
                    data: {
                        latitude: coords.latitude,
                        longitude: coords.longitude
                    },
                    timeout: 10000,
                    success: function(data) {
                        if (data.error) {
                            that.trigger('gps_failed', { msg: data.error } );
                            return;
                        }
                        that.trigger('gps_located', { coordinates: coords, details: data } );
                    },
                    error: function (data, status, errorThrown) {
                        that.trigger('gps_failed', { msg: FMS.strings.location_check_failed } );
                    }
                } );
            }
        }; }
    });
})(FMS, Backbone, _);
