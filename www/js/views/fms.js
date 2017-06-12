(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        FMSView: Backbone.View.extend({
            tag: 'div',
            bottomMargin: 20,
            contentSelector: '[data-role="content"]',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext'
            },

            back: function(e) {
                if ( $('#help #dismiss').is(':visible') ) {
                    FMS.helpHide();
                } else if ( this._back ) {
                    this._back(e);
                } else if ( this.prev ) {
                    this.onClickButtonPrev(e);
                }
            },

            render: function(){
                if ( !this.template ) {
                    FMS.printDebug('no template to render');
                    return;
                }
                template = _.template( tpl.get( this.template ) );
                var args = null;
                if ( this.options.msg ) {
                    args = { msg: this.options.msg };
                }
                if ( this.model ) {
                    if ( args ) {
                        args.model = this.model.toJSON();
                    } else {
                        args = this.model.toJSON();
                    }
                }
                this.$el.html(template(args));
                this.afterRender();
                return this;
            },

            fixPageHeight: function() {
                var header = this.$("div[data-role='header']:visible"),
                content = this.$(this.contentSelector),
                top = content.position().top,
                viewHeight = $(window).height(),
                contentHeight = FMS.windowHeight - header.outerHeight() - this.bottomMargin;

                this.setHeight( content, contentHeight - top );
            },

            setHeight: function(content, height) {
                content.height(height);
            },

            afterRender: function() {},

            beforeDisplay: function() {
                this.fixPageHeight();
            },

            afterDisplay: function() {},

            navigate: function( route, reverse ) {
                if ( FMS.isAndroid ) {
                    cordova.plugins.Keyboard.close();
                }
                if ( reverse ) {
                    FMS.router.reverseTransition();
                }

                FMS.router.navigate( route, { trigger: true } );
            },

            onClickButtonPrev: function(e) {
                e.preventDefault();
                this.navigate( this.prev, true );
            },

            onClickButtonNext: function(e) {
                e.preventDefault();
                this.navigate( this.next );
            },

            displayAlert: function(msg) {
                navigator.notification.alert(msg, null, CONFIG.APP_NAME);
            },

            validationError: function( id, error ) {
                var el_id = '#' + id;
                var el = $(el_id);
                var err = '<div for="' + id + '" class="form-error">' + error + '</div>';
                if ( $('div[for='+id+']').length === 0 ) {
                    el.before(err);
                    el.addClass('form-error');
                }
            },

            clearValidationErrors: function() {
                $('div.form-error').remove();
                $('.form-error').removeClass('form-error');
            },

            destroy: function() { FMS.printDebug('destroy for ' + this.id); this._destroy(); this.remove(); },

            _destroy: function() {}
        })
    });
    _.extend( FMS.FMSView, Backbone.Events );
})(FMS, Backbone, _, $);
