(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        SentView: FMS.FMSView.extend({
            template: 'sent',
            id: 'sent-page',
            prev: 'around',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick #id_report_another': 'onClickButtonPrev',
                'vclick #open_report': 'onClickOpenReport',
                'vclick #rate_app': 'onClickRateApp'
            },

            render: function(){
                if ( !this.template ) {
                    FMS.printDebug('no template to render');
                    return;
                }
                template = _.template( tpl.get( this.template ) );
                this.$el.html(template(FMS.createdReport.toJSON()));
                this.afterRender();
                return this;
            },

            onClickOpenReport: function(e) {
                e.preventDefault();
                FMS.openExternalURL(FMS.createdReport.get('site_url'));
                return false;
            },

            onClickRateApp: function(e) {
                e.preventDefault();
                var el = $('#rate_app');
                var href = el.attr('href');
                FMS.openExternalURL(href);
                return false;
            }
        })
    });
})(FMS, Backbone, _, $);
