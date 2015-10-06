(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        SaveOfflineView: FMS.FMSView.extend({
            template: 'save_offline',
            id: 'save_offline',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick #save_report': 'saveReport',
                'vclick #discard': 'discardReport'
            },

            saveReport: function() {
                FMS.clearCurrentDraft();
                this.navigate('reports');
            },

            discardReport: function() {
                var reset = FMS.removeDraft(FMS.currentDraft.id, true);
                var that = this;
                reset.done( function() { that.onDraftRemove(); } );
                reset.fail( function() { that.onDraftRemove(); } );
            },

            onDraftRemove: function() {
                this.navigate( 'around', 'left' );
            }
        })
    });
})(FMS, Backbone, _, $);
