var tpl = {

    // Hash of preloaded templates for the app
    templates:{},

    // Recursively pre-load all the templates for the app.
    // This implementation should be changed in a production environment. All the template files should be
    // concatenated in a single file.
    loadTemplates:function (names, callback) {

        var that = this;

        var loadTemplate = function (index) {
            var name = names[index];
            console.log('Loading template: ' + name + ', index: ' + index);
            $.get('templates/' + CONFIG.LANGUAGE + '/' + name + '.html', function (data) {
                that.templates[name] = data;
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            });
        };

        loadTemplate(0);
    },

    // Get template by name from hash of preloaded templates
    get:function (name) {
        return this.templates[name];
    }

};


(function (FMS, Backbone, _, $) {
    _.extend(FMS, {
        templates: [
            'home', 'help', 'around', 'offline', 'save_offline', 'reports', 'login', 'address_search', 'existing', 'photo', 'details', 'details_extra', 'submit', 'submit_email', 'submit_name', 'submit_set_password', 'submit_password', 'submit_confirm', 'sent'
        ],

        usedBefore: 0,
        isLoggedIn: 0,
        isOffline: 0,
        initialized: 0,
        users: new FMS.Users(),
        currentUser: null,
        currentPosition: null,
        isAndroid: false,
        iPhoneModel: 0,
        uploadTimeout: CONFIG.UPLOAD_TIMEOUT || 120000,

        currentDraft: new FMS.Draft(),
        allDrafts: new FMS.Drafts(),

        reportToView: null,

        online: function() {
            FMS.isOffline = 0;
        },

        offline: function() {
            FMS.isOffline = 1;
        },

        checkOnlineStatus: function() {
            if ( navigator && navigator.connection && ( navigator.connection.type == Connection.NONE ||
                    navigator.connection.type == Connection.UNKNOWN ) ) {
                FMS.offline();
            } else {
                FMS.online();
            }
        },

        checkLoggedInStatus: function() {
            if ( FMS.isOffline ) {
            } else {
                $.ajax( {
                    url: CONFIG.FMS_URL + '/auth/ajax/check_auth',
                    type: 'GET',
                    dataType: 'json',
                    timeout: 30000,
                    success: function( data, status ) {
                        FMS.isLoggedIn = 1;
                    },
                    error: function() {
                        FMS.isLoggedIn = 0;
                    }
                } );
            }
        },

        saveCurrentDraft: function(force) {
            FMS.router.pause();
            if ( force || FMS.currentDraft.isPartial() ) {
                FMS.allDrafts.add( FMS.currentDraft );
                FMS.currentDraft.save();
                localStorage.currentDraftID = FMS.currentDraft.id;
            }
        },

        loadCurrentDraft: function() {
            if ( localStorage.currentDraftID && localStorage.currentDraftID != 'null' ) {
                var r = FMS.allDrafts.get( localStorage.currentDraftID );
                if ( r ) {
                    FMS.currentDraft = r;
                }
            }
            localStorage.currentDraftID = null;
        },

        removeDraft: function(draftID, removePhoto) {
            var draft = FMS.allDrafts.get(draftID);
            var uri = draft.get('file');
            FMS.allDrafts.remove(draft);
            draft.destroy();

            if ( removePhoto && uri ) {
                return FMS.files.deleteURI( uri );
            }
            var p = $.Deferred();
            p.resolve();
            return p;
        },

        setCurrentDraft: function(draft) {
            FMS.currentDraft = draft;
            localStorage.currentDraftID = draft.id;
        },

        clearCurrentDraft: function() {
            FMS.currentDraft = new FMS.Draft();
            localStorage.currentDraftID = null;
        },

        openExternal: function(e) {
            e.preventDefault();
            var el = $(e.srcElement);
            window.open(el.attr('href'), '_system');
            return false;
        },

        setupHelp: function() {
            var help = $('#help'),
            helpContent = $('#helpContent'),
            viewWidth = $(window).width(),
            viewHeight = $(window).height(),
            helpHeight = viewHeight;

            var template = _.template( tpl.get('help') );
            helpContent.html(template());

            if ( !help.hasClass('android2') ) {
                helpContent.height(helpHeight - 60);
            }
            help.css('left', viewWidth);
            help.show();
        },

        helpShow: function(e) {
            if (e) {
                e.preventDefault();
            }
            var help = $('#help');
            $('#display-help').hide();
            var onShow = function() {
                $('#help').show();
                $('#dismiss').show(); 
            };
            help.animate({left: 0}, onShow );
        },

        helpHide: function(e) {
            if (e) {
                e.preventDefault();
            }
            var help = $('#help'),
            viewWidth = $(window).width();

            $('#dismiss').hide();
            if ( help.hasClass('android2') ) {
                $('body').scrollTop(0);
            }
            var onHide = function() { 
                $('#display-help').show();
                $('#helpContent').scrollTop(0);
            };
            help.animate({left: viewWidth}, 400, 'swing', onHide );
        },

        helpViewed: function() {
            FMS.usedBefore = 1;
            localStorage.usedBefore = 1;
        },

        initialize: function () {
            if ( this.initialized == 1 ) {
                return this;
            }
            $('#load-screen').height( $(window).height() );
            FMS.initialized = 1;
            if ( navigator && navigator.splashscreen ) {
                navigator.splashscreen.hide();
            }
            tpl.loadTemplates( FMS.templates, function() {

                if ( typeof device !== 'undefined' && device.platform === 'Android' ) {
                    $.mobile.defaultPageTransition = 'none';
                    FMS.isAndroid = true;
                    if ( parseInt(device.version) < 3 ) {
                        $('#help').addClass('android2');
                    }
                }

                if ( typeof device !== 'undefined' && device.platform === 'iOS' ) {
                    var model = parseInt(device.model.replace('iPhone',''), 10);
                    FMS.iPhoneModel = model;
                }

                _.extend(FMS, {
                    router: new FMS.appRouter(),
                    locator: new FMS.Locate()
                });
                _.extend( FMS.locator, Backbone.Events );

                // we only ever have the details of one user
                FMS.users.fetch();
                if ( FMS.users.length > 0 ) {
                    FMS.currentUser = FMS.users.get(1);
                }
                if ( FMS.currentUser === null ) {
                    FMS.currentUser = new FMS.User({id: 1});
                }

                if ( localStorage.usedBefore ) {
                    FMS.usedBefore = 1;
                }

                document.addEventListener('pause', function() { FMS.locator.stopTracking(); FMS.saveCurrentDraft(); }, false);
                document.addEventListener('resume', onResume, false);
                document.addEventListener('backbutton', function(e) { FMS.router.back(e); }, true);
                document.addEventListener('offline', function() { FMS.offline(); }, true);
                document.addEventListener('online', function() { FMS.online(); }, true);

                $(document).on('ajaxStart', function() { $.mobile.loading('show'); } );
                $(document).on('ajaxStop', function() { $.mobile.loading('hide'); } );

                $('#display-help').on('vclick', function(e) { FMS.helpShow(e); } );
                $('#dismiss').on('vclick', function(e) { FMS.helpHide(e); } );

                FMS.allDrafts.comparator = function(a,b) { var a_date = a.get('created'), b_date = b.get('created'); return a_date === b_date ? 0 : a_date < b_date ? 1 : -1; };
                FMS.allDrafts.fetch();
                FMS.checkOnlineStatus();
                FMS.loadCurrentDraft();
                FMS.checkLoggedInStatus();
                FMS.setupHelp();

                Backbone.history.start();
                navigator.splashscreen.hide();
                $('#display-help').show();
            });
        }
    });

    function onResume() {
        FMS.checkOnlineStatus();
        FMS.loadCurrentDraft();
        if ( ( FMS.router.currentView.id == 'front-page' || FMS.router.currentView.id == 'around-page' ) && FMS.currentPosition !== null ) {
            FMS.locator.trackPosition();
        }
    }
})(FMS, Backbone, _, $);

var androidStartUp = function() {
    // deviceready does not fire on some android versions very reliably so
    // we do this instead

    if (FMS.initialized === 1) {
        return;
    }

    if ( typeof device != 'undefined' ) {
        if ( device.platform == 'Android' ) {
            FMS.initialize();
        }
    } else {
        window.setTimeout( androidStartUp, 1000 );
    }
};

function onload() {
    document.addEventListener('deviceready', FMS.initialize, false);
    window.setTimeout( androidStartUp, 2000 );
}
