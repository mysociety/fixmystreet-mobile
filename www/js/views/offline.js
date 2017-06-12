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
                'pagebeforeshow': 'beforeShow',
                'pageshow': 'afterDisplay',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext',
                'vclick #id_photo_button': 'takePhoto',
                'vclick #id_existing': 'addPhoto',
                'vclick .del_photo_button': 'deletePhoto',
                'vclick #locate': 'onClickLocate',
                'vclick #locate_cancel': 'onClickCancel',
                'blur input': 'toggleNextButton',
                'blur textarea': 'toggleNextButton'
            },

            _back: function() {
                navigator.app.exitApp();
            },

            draftHasContent: function() {
                var hasContent = false;

                if ( $('#form_title').val() || $('#form_detail').val() ||
                     this.model.get('lat') || this.model.get('file') ) {
                    hasContent = true;
                }

                return hasContent;
            },

            afterDisplay: function() {
                $('body')[0].scrollTop = 0;
                $('div[data-role="content"]').show();
            },

            beforeShow: function() {
                $('div[data-role="content"]').hide();
                this.toggleNextButton();
            },

            toggleNextButton: function() {
                if ( this.draftHasContent() ) {
                    $('#offline-next-btn .ui-btn-text').text('Save');
                } else {
                    $('#offline-next-btn .ui-btn-text').text('Skip');
                }
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
                navigator.camera.getPicture( function(imgURI) { that.addPhotoSuccess(imgURI); }, function(error) { that.addPhotoFail(error); }, { saveToPhotoAlbum: true, quality: 49, destinationType: Camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.CAMERA, correctOrientation: true });
            },

            addPhoto: function() {
                var that = this;
                navigator.camera.getPicture( function(imgURI) { that.addPhotoSuccess(imgURI); }, function(error) { that.addPhotoFail(error); }, { saveToPhotoAlbum: false, quality: 49, destinationType: Camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY, correctOrientation: true });
            },

            addPhotoSuccess: function(imgURI) {
                var move = FMS.files.moveURI( imgURI );

                var that = this;
                move.done( function( file ) {
                    $('.photo-wrapper .photo img').attr('src', file.toURL());
                    that.model.set('file', file.toURL());
                    FMS.saveCurrentDraft();

                    $('#photo-next-btn .ui-btn-text').text(FMS.strings.next);
                    $('#display_photo').show();
                    $('#add_photo').hide();
                });

                move.fail( function() { that.addPhotoFail(); } );
            },

            addPhotoFail: function(message) {
                if ( message != 'no image selected' &&
                    message != 'Selection cancelled.' &&
                    message != 'Camera cancelled.' ) {
                    this.displayAlert(FMS.strings.photo_failed);
                }
            },

            deletePhoto: function() {
                var that = this;
                var del = FMS.files.deleteURI( this.model.get('file') );

                del.done( function() {
                    that.model.set('file', '');
                    FMS.saveCurrentDraft();
                    $('.photo-wrapper .photo img').attr('src', '');

                    $('#photo-next-btn .ui-btn-text').text('Skip');
                    $('#display_photo').hide();
                    $('#add_photo').show();
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
            }
        })
    });
})(FMS, Backbone, _, $);
