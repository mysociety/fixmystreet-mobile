(function (FMS, Backbone, _, $) {
    FMS.PhotoView = FMS.PhotoView.extend({
        currentFile: null,

        events: {
            'pagehide': 'destroy',
            'pagebeforeshow': 'beforeDisplay',
            'pageshow': 'afterDisplay',
            'vclick .ui-btn-left': 'onClickButtonPrev',
            'vclick .ui-btn-right': 'onClickButtonNext',
            'vclick #id_photo_button': 'takeNewPhoto',
            'vclick #id_existing': 'addPhotoFromLibrary',
            'vclick .del_photo_button': 'deletePhoto',
            'vclick .pothole-size-button': 'potholeSizeSelected'
        },

        addPhotoToReport: function(file) {
            this.blurBackground();
            this.currentFile = file;
            $(".pothole-size-selector .photo").css("background-image", "url("+file.toURL()+")");
            $(".pothole-size-selector").removeClass('hidden');
            $.mobile.loading('hide');
        },

        potholeSizeSelected: function(e) {
            e.preventDefault();

            var size = e.target.dataset.potholeSize;
            var pothole_sizes = this.model.get("pothole_sizes") || {};
            var filekey = this.currentFile.toURL();
            pothole_sizes[filekey] = size;
            this.model.set("pothole_sizes", pothole_sizes);
            this.unblurBackground();

            FMS.PhotoView.__super__.addPhotoToReport.call(this, this.currentFile);
        },

        blurBackground: function() {
            $("#photo-page [data-role=header], #photo-page [data-role=content], #map_box").addClass("blurred");
        },

        unblurBackground: function() {
            $("#photo-page [data-role=header], #photo-page [data-role=content], #map_box").removeClass("blurred");
        }
    });
})(FMS, Backbone, _, $);
