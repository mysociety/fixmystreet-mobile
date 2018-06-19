(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        OfflineView: FMS.LocatorView.extend({
            template: 'offline',
            id: 'offline',
            prev: 'around',
            next: 'reports',
            skipLocationCheck: true,

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext',
                'vclick #id_photo_button': 'takePhoto',
                'vclick #id_existing': 'addPhoto',
                'vclick .del_photo_button': 'deletePhoto',
                'vclick #locate': 'onClickLocate',
                'vclick #locate_cancel': 'onClickCancel',
                'blur input': 'toggleNextButton',
                'blur textarea': 'blurTextArea',
                'focus textarea': 'focusTextArea'
            },

            _back: function() {
                navigator.app.exitApp();
            },

            draftHasContent: function() {
                var hasContent = false;

                if ( $('#form_title').val() || $('#form_detail').val() ||
                     this.model.get('lat') || this.model.get('files').length > 0 ) {
                    hasContent = true;
                }

                return hasContent;
            },

            afterDisplay: function() {
                $('body')[0].scrollTop = 0;

                // The height of the photos container needs to be adjusted
                // depending on the number of photos - if the max number of
                // photos have already been added then the 'add photo' UI isn't
                // shown so we should use all the vertical space for the
                // thumbnails.
                var wrapperHeight = $(".ui-content").height();
                wrapperHeight -= $(".ui-content .notopmargin").outerHeight(true);
                wrapperHeight -= $(".ui-content #locate_result").outerHeight(true);
                wrapperHeight -= $(".ui-content .inputcard").outerHeight(true);
                wrapperHeight -= $(".ui-content #add_photo").outerHeight(true);
                $(".photo-wrapper").height(wrapperHeight);
            },

            beforeDisplay: function() {
                this.fixPageHeight();
                this.toggleNextButton();
            },

            toggleNextButton: function() {
                if ( this.draftHasContent() ) {
                    $('#offline-next-btn .ui-btn-text').text(FMS.strings.save);
                } else {
                    $('#offline-next-btn .ui-btn-text').text(FMS.strings.skip);
                }
            },

            focusTextArea: function() {
                $("textarea#form_detail").get(0).rows = 7;
            },

            blurTextArea: function(e) {
                $("textarea#form_detail").get(0).rows = 2;
                this.toggleNextButton();
            },

            failedLocation: function(details) {
                this.finishedLocating();
                this.locateCount = 21;

                $('#locate_result').html(FMS.strings.offline_failed_position);
            },

            gotLocation: function(info) {
                this.finishedLocating();

                this.model.set('lat', info.coordinates.latitude);
                this.model.set('lon', info.coordinates.longitude);

                $('#locate_result').html(FMS.strings.offline_got_position);
            },

            takePhoto: function() {
                var that = this;
                $.mobile.loading('show');
                navigator.camera.getPicture( function(imgURI) { that.addPhotoSuccess(imgURI); }, function(error) { that.addPhotoFail(error); }, { saveToPhotoAlbum: true, quality: 49, destinationType: Camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.CAMERA, correctOrientation: true });
            },

            addPhoto: function() {
                var that = this;
                $.mobile.loading('show');
                navigator.camera.getPicture( function(imgURI) { that.addPhotoSuccess(imgURI); }, function(error) { that.addPhotoFail(error); }, { saveToPhotoAlbum: false, quality: 49, destinationType: Camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY, correctOrientation: true });
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
                    that.updateCurrentReport();

                    $.mobile.loading('hide');
                    that.rerender();
                });

                move.fail( function() { that.addPhotoFail(); } );
            },

            addPhotoFail: function(message) {
                $.mobile.loading('hide');
                if ( message != 'no image selected' &&
                    message != 'Selection cancelled.' &&
                    message != 'Camera cancelled.' ) {
                    this.displayAlert(FMS.strings.photo_failed);
                }
            },

            deletePhoto: function(e) {
                e.preventDefault();
                $.mobile.loading('show');
                var files = this.model.get('files');
                var index = parseInt($(e.target).data('fileIndex'));
                var deleted_file = files.splice(index, 1)[0];

                var del = FMS.files.deleteURI( deleted_file );

                var that = this;
                del.done( function() {
                    that.model.set('files', files);
                    that.updateCurrentReport();

                    $.mobile.loading('hide');
                    that.rerender();
                });
            },

            onClickLocate: function(e) {
                e.preventDefault();
                this.locate();
            },

            onClickCancel: function(e) {
                e.preventDefault();
                this.finishedLocating();
            },

            onClickButtonNext: function() {
                this.updateCurrentReport();
                if ( !this.draftHasContent() && this.model.id ) {
                    var del = FMS.removeDraft( this.model.id );

                    var that = this;
                    del.done( function() { that.draftDeleted(); } );
                    del.fail( function() { that.draftDeleted(); } );
                } else {
                    FMS.clearCurrentDraft();
                    this.navigate( this.next );
                }
            },

            draftDeleted: function() {
                FMS.clearCurrentDraft();
                this.navigate( this.next );
            },

            updateCurrentReport: function() {
                this.model.set('title', $('#form_title').val());
                this.model.set('details', $('#form_detail').val());
                FMS.saveCurrentDraft();
            },

            rerender: function() {
                FMS.router.offline();
            }

        })
    });
})(FMS, Backbone, _, $);
