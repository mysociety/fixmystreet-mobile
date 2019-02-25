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
                'vclick #quote_controls .handle_quote': 'onHandleQuote',
                'vclick #quote_controls .handle_quote': 'onHandleQuote'
            },

            beforeDisplay: function() {
                if (window.MobileAccessibility) {
                    window.MobileAccessibility.usePreferredTextZoom(false);
                }
                this.fixPageHeight();
                $("#map_box").addClass("blurred");
                $("#quote_rendered").replaceWith(FMS.createdReport.get('quote_rendered'));
                $("#report-created-header h1").text(FMS.createdReport.get('quote_title'));

                var quote_controls = FMS.createdReport.get('quote_controls');
                if (typeof quote_controls !== "undefined") {
                    $("#quote_controls").replaceWith(quote_controls);

                    // Tell jQuery UI to redraw the widgets from the new HTML
                    $("#quote-page").trigger('create');
                }
            },

            _destroy: function() {
                if (window.MobileAccessibility) {
                    window.MobileAccessibility.usePreferredTextZoom(true);
                }
            },

            onHandleQuote: function(e) {
                e.preventDefault();
                console.log("onHandleQuote");

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

                    // Server may have supplied a custom confirmation message
                    // as an HTML string, store it for rendering by the template.
                    FMS.createdReport.set('quote_confirmation_message', data.quote_confirmation_message);

                    $.mobile.loading('hide');
                    $("#map_box").removeClass("blurred");
                    that.navigate('sent');
                })
                .fail(function() {
                    console.log("AJAX error", that, this, arguments);
                    $.mobile.loading('hide');
                    $("#map_box").removeClass("blurred");
                    that.navigate('sent');
                });
            }
        })
    });
})(FMS, Backbone, _, $);
