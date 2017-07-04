(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        PhotoCaptureView: FMS.LocatorView.extend({
            getOptions: function(isFromAlbum) {
                var options = {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                    correctOrientation: true,
                    targetHeight: 768,
                    targetWidth: 1024
                };

                if ( ! isFromAlbum ) {
                    options.saveToPhotoAlbum = true;
                    options.sourceType = navigator.camera.PictureSourceType.CAMERA;
                }

                // this helps with out of memory errors on iPhones but not on Android it seems
                if ( ! FMS.isAndroid ) {
                    options.quality = 49;
                }

                return options;
            },

            takePhoto: function(e) {
                e.preventDefault();
                this._capture(false);
            },

            addPhotoFromLibrary: function(e) {
                e.preventDefault();
                this._capture(true);
            },

            beforeCapture: function() {
                $.mobile.loading('show');
            },

            afterCapture: function() {
                $.mobile.loading('hide');
            },

            _capture: function(from_library) {
                this.beforeCapture();
                $('.photo-wrapper .photo img').hide();
                var that = this;
                var options = this.getOptions(from_library);
                navigator.camera.getPicture( function(result) { that.getPictureSuccess(result) }, function(error) { that.getPictureFail(error); }, options);
            },

            getPictureSuccess: function(result) {
                console.log(result);
                result = JSON.parse(result);
                console.log(result);
                var metadata = JSON.parse(result.json_metadata);
                console.log(metadata);
                var imgURI = result.filename;

                var latitude, longitude;
                if (typeof metadata.GPS !== "undefined") {
                    latitude = metadata.GPS.Latitude;
                    if (metadata.GPS.LatitudeRef === "S") {
                        latitude *= -1;
                    }
                    longitude = metadata.GPS.Longitude;
                    if (metadata.GPS.LongitudeRef === "W") {
                        longitude *= -1;
                    }
                }

                var move;
                // on iOS the photos go into a temp folder in the apps own filespace so we
                // can move them, and indeed have to as the tmp space is cleaned out by the OS
                // so draft reports might have their images removed. on android you access the
                // images where they are stored on the filesystem so if you move, and then delete
                // them, you are moving and deleting the only copy of them which is likely to be
                // surprising and unwelcome so we copy them instead.
                var fileName = CONFIG.NAMESPACE + '_' + this.model.cid + '_' + moment().unix() + '.jpg';
                if ( FMS.isAndroid ) {
                    move = FMS.files.copyURI( imgURI, fileName );
                } else {
                    move = FMS.files.moveURI( imgURI, fileName );
                }

                var that = this;
                move.done( function( file ) {
                    that.afterCapture();
                    that.capturePhotoSuccess(file, latitude, longitude);
                });

                move.fail( function() {
                    that.getPictureFail("Couldn't access photo file.");
                });
            },

            getPictureFail: function(error) {
                this.afterCapture();
                this.capturePhotoFail(error);
            },

            capturePhotoSuccess: function(file, latitude, longitude) {
                // This should be overridden by a subclass.
                console.log("PhotoCaptureView.capturePhotoSuccess: %s, latlon: %s,%s", file, latitude, longitude);
            },

            capturePhotoFail: function(message) {
                // This should be overridden by a subclass.
                console.log("PhotoCaptureView.capturePhotoFail: %s", message);
            }
        })
    });
})(FMS, Backbone, _, $);
