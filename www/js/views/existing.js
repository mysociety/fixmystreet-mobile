(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        ExistingView: FMS.FMSView.extend({
            template: 'existing',
            id: 'existing',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick #use_report': 'useReport',
                'vclick #save_report': 'saveReport',
                'vclick #discard': 'discardReport'
            },

            _back: function() {
                navigator.app.exitApp();
            },

            setHeight: function(content, height) {
                content.css( 'min-height', content + 'px');
            },

            useReport: function(e) {
                e.preventDefault();
                FMS.setCurrentDraft(this.model);
                this.navigate('around');
            },

            saveReport: function(e) {
                e.preventDefault();
                FMS.clearCurrentDraft();
                this.navigate('around');
            },

            discardReport: function(e) {
                e.preventDefault();
                var reset = FMS.removeDraft(this.model.id, true);
                var that = this;
                reset.done( function() { that.onDraftRemove(); } );
                reset.fail( function() { that.onDraftRemove(); } );
            },

            onDraftRemove: function() {
                FMS.clearCurrentDraft();
                this.navigate( 'around', 'left' );
            }
        })
    });
})(FMS, Backbone, _, $);
