(function (FMS, Backbone, _, $) {
    var PotholeSizeSubmitMixin = {
        onPreReportSync: function(report, params) {
            // Each photo should have a pothole size set by the user,
            // these need to be sent to the server in the POST params.
            if (report.get('files') && report.get('files').length > 0) {
                var sizes = report.get('pothole_sizes') || {};
                report.get('files').forEach(function(uri, index) {
                    // Photo param names are 1-indexed, except for the
                    // first which is just 'photo', of course.
                    if (index == 0) {
                        index = '';
                    } else {
                        index++;
                    }
                    params['photo' + index + '_pothole_size'] = sizes[uri];
                });
            }
        },

        navigateToSuccessPage: function() {
            // We need to determine whether a quote has been generated for this
            // report, and show it to the user if so.
            $.mobile.loading('show');
            console.log(this);
            var id = FMS.createdReport.get('site_id');
            var that = this;
            $.getJSON(CONFIG.FMS_URL + '/groundcontrol/quote/' + id)
                .done(function(data) {
                    console.log("AJAX quote success", that, this, arguments);
                    if (data.quote) {
                        FMS.createdReport.set('quote', data.quote);
                        FMS.createdReport.set('quote_rendered', data.quote_rendered);
                        FMS.createdReport.set('quote_title', data.quote_title);
                        FMS.createdReport.set('quote_controls', data.quote_controls);

                        $.mobile.loading('hide');
                        that.navigate('quote');
                    } else {
                        $.mobile.loading('hide');
                        that.navigate('sent');
                   }
                })
                .fail(function() {
                    console.log("AJAX error", that, this, arguments);
                    $.mobile.loading('hide');
                    that.navigate('sent');
                });
        },

    };

    // Because there are lots of different ways to submit a report, there are
    // lots of views to handle submission. Not all of these apply for GC,
    // because we know the user will be logged in. But belt-and-braces.
    ['SubmitView', 'SubmitInitialPageView', 'SubmitEmailView',
     'SubmitConfirmView', 'SubmitNameView', 'SubmitNameSetPasswordView',
     'SubmitPasswordView', 'SubmitSetPasswordView'].forEach(function(viewClass) {
        FMS[viewClass] = FMS[viewClass].extend(PotholeSizeSubmitMixin);
    });
})(FMS, Backbone, _, $);
