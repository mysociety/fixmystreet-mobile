(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        QuoteView: FMS.FMSView.extend({
            template: 'quote',
            id: 'quote-page',
            next: 'sent',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick #accept_quote': 'onAcceptQuote',
                'vclick #reject_quote': 'onRejectQuote'
            },

            beforeDisplay: function() {
                this.fixPageHeight();
                $("#map_box").addClass("blurred");
            },

            onAcceptQuote: function(e) {
                e.preventDefault();
                console.log("onAcceptQuote");

            },

            onRejectQuote: function(e) {
                e.preventDefault();
                console.log("onRejectQuote");
            }

        })
    });
})(FMS, Backbone, _, $);
