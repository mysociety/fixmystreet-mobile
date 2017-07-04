(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        PhotoView: FMS.PhotoCaptureView.extend({
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
                'vclick #id_existing': 'addPhotoFromLibrary',
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

            beforeCapture: function() {
                $('.photo-wrapper .photo img').hide();
                $.mobile.loading('show');
            },

            afterCapture: function() {
                $('.photo-wrapper .photo img').show();
                $.mobile.loading('hide');
            },

            capturePhotoSuccess: function(file, latitude, longitude) {
                var files = this.model.get('files');
                files.push(file.toURL());
                this.model.set('files', files);
                FMS.saveCurrentDraft();

                var that = this;
                window.setTimeout(function() {
                    that.rerender();
                }, 100);
            },

            capturePhotoFail: function(message) {
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
