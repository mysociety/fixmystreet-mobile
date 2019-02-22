(function (FMS, Backbone, _, $) {
    FMS.PhotoView = FMS.PhotoView.extend({
        currentFile: null,
        selectingPotholeSize: false,

        events: {
            'pagehide': 'destroy',
            'pagebeforeshow': 'beforeDisplay',
            'pageshow': 'afterDisplay',
            'vclick .ui-btn-left': 'onClickButtonPrev',
            'vclick .ui-btn-right': 'onClickButtonNext',
            'vclick #id_photo_button': 'takeNewPhoto',
            'vclick #id_existing': 'addPhotoFromLibrary',
            'vclick .del_photo_button': 'deletePhoto',
            'vclick .pothole-size-button': 'potholeSizeSelected',
            'vclick .pothole-size': 'resizePotholeForPhoto'
        },

        addPhotoToReport: function(file) {
            this.currentFile = file;
            $.mobile.loading('hide');
            this.showSizeSelector(file.toURL());
        },

        showSizeSelector: function(url) {
            this.blurBackground();
            if (window.MobileAccessibility) {
                window.MobileAccessibility.usePreferredTextZoom(false);
            }
            $(".pothole-size-selector .photo").css("background-image", "url("+url+")");
            $(".pothole-size-selector .photo").data("photo_url", url);
            $(".pothole-size-selector").removeClass('hidden');
            this.selectingPotholeSize = true;
        },

        potholeSizeSelected: function(e) {
            e.preventDefault();

            var size = $(e.target).closest(".pothole-size-button").data().potholeSize;
            var pothole_sizes = this.model.get("pothole_sizes") || {};
            var filekey = $(".pothole-size-selector .photo").data("photo_url");
            pothole_sizes[filekey] = size;
            this.model.set("pothole_sizes", pothole_sizes);
            this.unblurBackground();
            $(".pothole-size-selector").addClass('hidden');
            $(".pothole-size-selector .photo").css("background-image", "");
            $(".pothole-size-selector .photo").removeData("photo_url");
            if (window.MobileAccessibility) {
                window.MobileAccessibility.usePreferredTextZoom(true);
            }

            this.selectingPotholeSize = false;
            if (this.currentFile) {
                FMS.PhotoView.__super__.addPhotoToReport.call(this, this.currentFile);
                this.currentFile = null;
            } else {
                this.rerender();
            }
        },

        resizePotholeForPhoto: function(e) {
            e.preventDefault();
            var url = $(e.target).closest(".photo").data("photoUrl");
            this.showSizeSelector(url);
        },

        blurBackground: function() {
            $("#photo-page [data-role=header], #photo-page [data-role=content], #map_box").addClass("blurred");
        },

        unblurBackground: function() {
            $("#photo-page [data-role=header], #photo-page [data-role=content], #map_box").removeClass("blurred");
        },

        takeNewPhoto: function(e) {
            // Some clicks seem to go through the pothole size selector to the
            // take photo/add photo buttons behind - prevent this if the size
            // UI is visible.
            if (this.selectingPotholeSize) {
                e.preventDefault();
                return;
            }
            FMS.PhotoView.__super__.takeNewPhoto.call(this, e);
        },

        addPhotoFromLibrary: function(e) {
            // Some clicks seem to go through the pothole size selector to the
            // take photo/add photo buttons behind - prevent this if the size
            // UI is visible.
            if (this.selectingPotholeSize) {
                e.preventDefault();
                return;
            }
            FMS.PhotoView.__super__.addPhotoFromLibrary.call(this, e);
        },


    });
})(FMS, Backbone, _, $);
