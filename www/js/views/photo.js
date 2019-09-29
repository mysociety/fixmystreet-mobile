(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        PhotoView: FMS.FMSView.extend({
            template: 'photo',
            id: 'photo-page',
            prev: 'around',
            next: 'details',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext',
                'vclick #id_photo_button': 'takeNewPhoto',
                'vclick #id_existing': 'addPhotoFromLibrary',
                'vclick .del_photo_button': 'deletePhoto'
            },

            onClickButtonPrev: function(e) {
                e.preventDefault();
                if (this.model.get('top_message')) {
                    this.navigate( 'top_message', true );
                } else {
                    this.navigate( this.prev, true );
                }
            },

            beforeDisplay: function() {
                this.fixPageHeight();
            },

            afterDisplay: function() {
                // The height of the photos container needs to be adjusted
                // depending on the number of photos - if the max number of
                // photos have already been added then the 'add photo' UI isn't
                // shown so we should use all the vertical space for the
                // thumbnails.
                var wrapperHeight = $(".ui-content").height();
                wrapperHeight -= $(".ui-content h2").outerHeight(true);
                wrapperHeight -= $(".ui-content .bottom-btn").outerHeight(true)
                $(".photo-wrapper").height(wrapperHeight);
            },

            takeNewPhoto: function(e) {
                e.preventDefault();
                this.getPhoto(false);
            },

            addPhotoFromLibrary: function(e) {
                e.preventDefault();
                this.getPhoto(true);
            },

            getPhoto: function(isFromAlbum) {
                $.mobile.loading('show');
                $('.photo-wrapper .photo img').hide();
                var that = this;
                var options = this.getCameraOptions(isFromAlbum);
                navigator.camera.getPicture(
                    function(imgURI) {
                        that.fixiOSStatusBar();
                        that.getPhotoSuccess(imgURI);
                    },
                    function(error) {
                        that.fixiOSStatusBar();
                        that.getPhotoFail(error);
                    },
                    options
                );
            },

            fixiOSStatusBar: function() {
                // iOS 13 suffers a bug where the status bar height isn't correctly
                // set after a full-screen overlay (e.g. the photo picker or camera)
                // is presented. This results in the containing webview being scrolled
                // up slightly, chopping off the top of the app UI and preventing
                // the user from proceeding past the photo screen.
                // This bug should be fixed in either cordova-plugin-camera or
                // cordova-plugin-statusbar, but until then this workaround
                // of hiding and showing the status bar fixes the problem.
                if (device && device.platform === 'iOS' && parseInt(device.version) >= 13) {
                    StatusBar.hide();
                    StatusBar.show();
                }
            },

            getCameraOptions: function(isFromAlbum) {
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

            getPhotoSuccess: function(imgURI) {
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
                move.done( function( file ) { that.addPhotoToReport(file); });
                move.fail( function() { that.getPhotoFail("File move failed."); } );
            },

            addPhotoToReport: function(file) {
                var files = this.model.get('files');
                files.push(file.toURL());
                this.model.set('files', files);
                FMS.saveCurrentDraft();
                $.mobile.loading('hide');
                this.rerender();
            },

            getPhotoFail: function(message) {
                $('.photo-wrapper .photo img').show();
                $.mobile.loading('hide');

                // Rewrite errors from photo capture failure to be more friendly
                // (and localised). Map a message to null if it shouldn't
                // generate a dialog to the user.
                // Missing messages from this map will default to
                // FMS.strings.photo_failed.
                var friendly_messages = {
                    'no image selected': null,
                    'No Image Selected': null,
                    'Selection cancelled.': null,
                    'Camera cancelled.': null,
                    'has no access to camera': FMS.strings.camera_access_denied,
                    // Sadly the cordova-plugin-camera plugin returns this
                    // string on iOS if the user dismisses the photo picker,
                    // so we can't present a more helpful 'please allow access'
                    // message.
                    'has no access to assets': null
                };
                if (typeof friendly_messages[message] === 'undefined') {
                    this.displayAlert(FMS.strings.photo_failed);
                } else if (friendly_messages[message]) {
                    this.displayAlert(friendly_messages[message]);
                }
            },

            deletePhoto: function(e) {
                e.preventDefault();
                var files = this.model.get('files');
                var index = parseInt($(e.target).data('fileIndex'));
                var deleted_file = files.splice(index, 1)[0];

                var del = FMS.files.deleteURI( deleted_file );

                var that = this;
                del.done( function() {
                    that.model.set('files', files);
                    FMS.saveCurrentDraft(true);
                    that.rerender();
                });
            },

            rerender: function() {
                // Simply calling this.render() breaks the DOM in a weird and
                // interesting way, so this is a convenience wrapper around
                // the correct router call.
                FMS.router.photo();
            }
        })
    });
})(FMS, Backbone, _, $);
