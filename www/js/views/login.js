(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        LoginView: FMS.FMSView.extend({
            template: 'login',
            id: 'login',
            next: 'around',
            prev: 'around',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick #login': 'onClickLogin',
                'submit #signinForm': 'onClickLogin',
                'vclick #logout': 'onClickLogout',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext'
            },

            onClickLogin: function(e) {
                // prevent form submission from onscreen keyboard
                e.preventDefault();
                $('#login').focus();
                if ( this.validate() ) {
                    var that = this;
                    $.ajax( {
                        url: CONFIG.FMS_URL + '/auth/ajax/sign_in',
                        type: 'POST',
                        data: {
                            email: $('#form_email').val(),
                            password_sign_in: $('#form_password').val(),
                            remember_me: 1
                        },
                        dataType: 'json',
                        timeout: 30000,
                        success: function( data, status ) {
                            if ( data.name ) {
                                that.model.set('password', $('#form_password').val());
                                that.model.set('email', $('#form_email').val());
                                that.model.set('name', data.name);
                                that.model.save();
                                FMS.isLoggedIn = 1;
                                that.$('#password_row').hide();
                                that.$('#success_row').show();
                            } else {
                                that.validationError('signinForm', FMS.strings.login_details_error);
                            }
                        },
                        error: function() {
                            that.validationError('signinForm', FMS.strings.login_error);
                        }
                    } );
                }
            },

            onClickLogout: function(e) {
                e.preventDefault();
                var that = this;
                $.ajax( {
                    url: CONFIG.FMS_URL + '/auth/ajax/sign_out',
                    type: 'GET',
                    dataType: 'json',
                    timeout: 30000,
                    success: function( data, status ) {
                        FMS.isLoggedIn = 0;
                        that.model.set('password', '');
                        that.model.save();
                        that.$('#form_email').val('');
                        that.$('#form_password').val('');
                        that.$('#success_row').hide();
                        that.$('#signed_in_row').hide();
                        that.$('#password_row').show();
                    },
                    error: function() {
                        that.validationError('err', FMS.strings.logout_error);
                    }
                } );
            },

            validate: function() {
                this.clearValidationErrors();
                var isValid = 1;

                if ( !$('#form_password').val() ) {
                    isValid = 0;
                    this.validationError('form_password', FMS.validationStrings.password );
                }

                var email = $('#form_email').val();
                if ( !email ) {
                    isValid = 0;
                    this.validationError('form_email', FMS.validationStrings.email.required);
                // regexp stolen from jquery validate module
                } else if ( ! /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email) ) {
                    isValid = 0;
                    this.validationError('form_email', FMS.validationStrings.email.email);
                }

                if ( !isValid ) {
                    // this makes sure the onscreen keyboard is dismissed
                    $('#login').focus();
                }

                return isValid;
            }
        })
    });
})(FMS, Backbone, _, $);
