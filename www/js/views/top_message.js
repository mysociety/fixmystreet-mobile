(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        TopMessageView: FMS.FMSView.extend({
            template: 'top_message',
            id: 'top_message-page',
            prev: 'around',
            next: 'photo',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext',
            },

            afterRender: function() {
                this.$("#top_message_wrapper a").click(function(e) {
                    FMS.openExternal(e.originalEvent);
                    return false;
                });
            },
        })
    });
})(FMS, Backbone, _, $);
