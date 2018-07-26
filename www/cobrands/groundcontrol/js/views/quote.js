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
                'vclick #accept_quote': 'onAcceptOrRejectQuote',
                'vclick #reject_quote': 'onAcceptOrRejectQuote'
            },

            beforeDisplay: function() {
                this.fixPageHeight();
                $("#map_box").addClass("blurred");
                $("#quote_rendered").replaceWith(FMS.createdReport.get('quote_rendered'));

                var quote_controls = FMS.createdReport.get('quote_controls');
                if (typeof quote_controls !== "undefined") {
                    $("#quote_controls").replaceWith(quote_controls);

                    // Tell jQuery UI to redraw the widgets from the new HTML
                    $("#quote-page").trigger('create');
                }
            },

            onAcceptOrRejectQuote: function(e) {
                e.preventDefault();
                console.log("onAcceptOrRejectQuote");

                $.mobile.loading('show');
                var accept = e.target.dataset.accept;
                var id = FMS.createdReport.get('site_id');
                var that = this;
                $.ajax({
                    url: CONFIG.FMS_URL + '/groundcontrol/accept',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        report_id: id,
                        accept: accept
                    }
                })
                .done(function(data) {
                    console.log("AJAX accept quote success", that, this, arguments);
                    if (data.ok == 1) {
                        FMS.createdReport.set('quote_accepted', !!parseInt(accept));
                    } else {
                        FMS.createdReport.set('quote_accepted', 'error');
                    }

                    // Server may have supplied a custom confirmation message
                    // as an HTML string, store it for rendering by the template.
                    FMS.createdReport.set('quote_confirmation_message', data.quote_confirmation_message);

                    $.mobile.loading('hide');
                    $("#map_box").removeClass("blurred");
                    that.navigate('sent');
                })
                .fail(function() {
                    console.log("AJAX error", that, this, arguments);
                    FMS.createdReport.set('quote_accepted', 'error');
                    $.mobile.loading('hide');
                    $("#map_box").removeClass("blurred");
                    that.navigate('sent');
                });
            }
        })
    });
})(FMS, Backbone, _, $);
