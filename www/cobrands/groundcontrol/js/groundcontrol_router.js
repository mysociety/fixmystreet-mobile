(function (FMS, Backbone, _, $) {
    FMS.appRouter = FMS.appRouter.extend({
        routes: {
            '': 'home',
            'home': 'home',
            'offline': 'offline',
            'around': 'around',
            'search': 'search',
            'existing': 'existing',
            'photo': 'photo',
            'details': 'details',
            'details_extra': 'details_extra',
            'submit-start': 'submitStart',
            'submit': 'submit',
            'submit-email': 'submitEmail',
            'submit-name': 'submitName',
            'submit-name-set-password': 'submitNameSetPassword',
            'submit-password': 'submitPassword',
            'submit-set-password': 'submitSetPassword',
            'save_offline': 'saveOffline',
            'sent': 'sent',
            'reports': 'reports',
            'login': 'login',

            // Cobrand additions
            'quote': 'quote'
        },

        initialize: function() {
            tpl.loadTemplates(['quote'], function() {});
        },

        quote: function(){
            var quoteView = new FMS.QuoteView({ model: FMS.currentDraft });
            this.changeView(quoteView);
        },
    });
})(FMS, Backbone, _, $);