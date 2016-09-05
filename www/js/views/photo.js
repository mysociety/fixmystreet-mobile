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
                'vclick #id_del_photo_button': 'deletePhoto'
            },

            beforeDisplay: function() {
                this.fixPageHeight();
                this.$('#id_del_photo_button').hide();
                if ( this.model.get('file') ) {
                    $('#id_photo_button').parents('.ui-btn').hide();
                    $('#id_existing').parents('.ui-btn').hide();
                    window.setTimeout( function() { $('#id_del_photo_button').show(); }, 250 );
                }
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
                $('#photo').hide();
                var that = this;

                var options = this.getOptions();

                navigator.camera.getPicture( function(imgURI) { that.addPhotoSuccess(imgURI); }, function(error) { that.addPhotoFail(error); }, options);
            },

            addPhoto: function(e) {
                e.preventDefault();
                $.mobile.loading('show');
                $('#photo').hide();
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
                    $('#nophoto_title').hide();
                    $('#photo_title').html(FMS.strings.photo_added).show();
                    $('#photo').attr('src', file.toURL()).addClass('small').removeClass('placeholder');
                    that.model.set('file', file.toURL());
                    FMS.saveCurrentDraft();

                    $('#photo-next-btn .ui-btn-text').text(FMS.strings.next);
                    $('#id_photo_button').parents('.ui-btn').hide();
                    $('#id_existing').parents('.ui-btn').hide();
                    $('#photo').show();
                    window.setTimeout(function() { $('#id_del_photo_button').show() }, 500);
                    window.setTimeout(function() { $.mobile.loading('hide') }, 100);
                });

                move.fail( function() { that.addPhotoFail(); } );
            },

            addPhotoFail: function(message) {
                $('#photo').show();
                $.mobile.loading('hide');
                if ( message != 'no image selected' &&
                    message != 'Selection cancelled.' &&
                    message != 'Camera cancelled.' ) {
                    this.displayAlert(FMS.strings.photo_failed);
                }
            },

            deletePhoto: function(e) {
                e.preventDefault();
                var that = this;
                var del = FMS.files.deleteURI( this.model.get('file') );

                del.done( function() {
                    $('#photo_title').hide();
                    $('#nophoto_title').show();
                    $('#id_del_photo_button').hide();
                    that.model.set('file', '');
                    FMS.saveCurrentDraft(true);
                    $('#photo').attr('src', 'images/placeholder-photo.png').addClass('placeholder').removeClass('small');

                    $('#photo-next-btn .ui-btn-text').text('Skip');
                    $('#id_photo_button').parents('.ui-btn').show();
                    $('#id_existing').parents('.ui-btn').show();
                });

            }
        })
    });
})(FMS, Backbone, _, $);
