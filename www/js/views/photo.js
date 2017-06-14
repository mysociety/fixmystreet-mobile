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
                'vclick #id_photo_button': 'takePhoto',
                'vclick #id_existing': 'addPhoto',
                'vclick .del_photo_button': 'deletePhoto'
            },

            beforeDisplay: function() {
                this.fixPageHeight();
            },

            afterDisplay: function() {
                // The height of the photos container needs to be adjusted
                // depending on the number of photos - if there are 3 photos
                // then the 'add photo' UI isn't shown so we should use all the
                // vertical space for the thumbnails.
                var wrapperHeight = $(".ui-content").height();
                wrapperHeight -= $(".ui-content h2").outerHeight(true);
                wrapperHeight -= $(".ui-content .bottom-btn").outerHeight(true)
                $(".photo-wrapper").height(wrapperHeight);
            },

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
                $.mobile.loading('show');
                $('.photo-wrapper .photo img').hide();
                var that = this;

                var options = this.getOptions();

                navigator.camera.getPicture( function(imgURI) { that.addPhotoSuccess(imgURI); }, function(error) { that.addPhotoFail(error); }, options);
            },

            addPhoto: function(e) {
                e.preventDefault();
                $.mobile.loading('show');
                $('.photo-wrapper .photo img').hide();
                var that = this;
                var options = this.getOptions(true);
                navigator.camera.getPicture( function(imgURI) { that.addPhotoSuccess(imgURI); }, function(error) { that.addPhotoFail(error); }, options);
            },

            addPhotoSuccess: function(imgURI) {
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
                    var files = that.model.get('files');
                    files.push(file.toURL());
                    that.model.set('files', files);
                    FMS.saveCurrentDraft();

                    window.setTimeout(function() {
                        $.mobile.loading('hide');
                        that.rerender();
                    }, 100);
                });

                move.fail( function() { that.addPhotoFail(); } );
            },

            addPhotoFail: function(message) {
                $('.photo-wrapper .photo img').show();
                $.mobile.loading('hide');
                if ( message != 'no image selected' &&
                    message != 'Selection cancelled.' &&
                    message != 'Camera cancelled.' ) {
                    this.displayAlert(FMS.strings.photo_failed);
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
                    // $('#photo_title').hide();
                    // $('#nophoto_title').show();
                    // $('.del_photo_button').hide();
                    that.model.set('files', files);
                    FMS.saveCurrentDraft(true);
                    that.rerender();
                    // $('.photo-wrapper .photo img').attr('src', 'images/placeholder-photo.png').addClass('placeholder').removeClass('small');
                    //
                    // $('#photo-next-btn .ui-btn-text').text('Skip');
                    // $('#id_photo_button').parents('.ui-btn').show();
                    // $('#id_existing').parents('.ui-btn').show();
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
