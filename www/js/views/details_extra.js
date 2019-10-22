(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        DetailsExtraView: FMS.FMSView.extend({
            template: 'details_extra',
            id: 'details-extra-page',
            prev: 'details',
            next: 'submit-start',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext',
                'vclick #start-new-report': 'startNewReport',
                'blur textarea': 'updateCurrentReport',
                'change select': 'updateSelect',
                'blur input': 'updateCurrentReport'
            },

            afterRender: function() {
                this.populateFields();
                this.enableScrolling();
                this.checkForDisabledForm();

                // Make sure the emergency message is right at the top of
                // the screen.
                this.$("#form-disabled-banner").css('padding-top', $("#details-extra-page").css('padding-top'));

                // If there are any links in the category extra, e.g. a
                // "use this other service" link, then they need to be
                // handled correctly by calling FMS.openExternal
                // otherwise tapping them doesn't do anything at all.
                this.$("#category_meta a").click(function(e) {
                    FMS.openExternal(e.originalEvent);
                    return false;
                });
            },

            onClickButtonPrev: function(e) {
                e.preventDefault();
                this.disableScrolling();
                this.model.set('hasExtras', 0);
                this.updateCurrentReport();
                this.navigate( this.prev, true );
            },

            onClickButtonNext: function() {
                this.disableScrolling();
                this.clearValidationErrors();
                var valid = 1;
                var that = this;

                var isRequired = function(index) {
                    var el = $(this);
                    if ( el.attr('required') && el.val() === '' ) {
                        valid = 0;
                        that.validationError(el.attr('id'), FMS.strings.required);
                    }
                };
                // do validation
                $('input').each(isRequired);
                $('textarea').each(isRequired);
                $('select').each(isRequired);
                this.model.set('hasExtras', 1);

                if ( valid ) {
                    this.clearValidationErrors();
                    this.updateCurrentReport();
                    this.navigate( this.next );
                } else {
                    this.enableScrolling();
                }
            },

            validationError: function(id, error) {
                var el_id = '#' + id;
                var el = $(el_id);

                el.addClass('error');
                if ( el.val() === '' ) {
                    el.attr('orig-placeholder', el.attr('placeholder'));
                    el.attr('placeholder', error);
                }
            },

            clearValidationErrors: function() {
                $('.error').removeClass('error');
                $('.error').each(function(el) { if ( el.attr('orig-placeholder') ) { el.attr('placeholder', el.attr('orig-placeholder') ); } } );
            },

            updateSelect: function() {
                this.updateCurrentReport();
                this.checkForDisabledForm();
            },

            checkForDisabledForm: function() {
                var disabled = false;
                var disabled_message = null;

                var that = this;
                this.$("#category_meta select").each(function() {
                    var key = $(this).val();
                    var name = $(this).attr('name');
                    var extra = that.model.get('category_extras')[name];
                    if (!extra || !extra.values) {
                        return;
                    }
                    $.each(extra.values, function(i, v) {
                        if (v.disable === "1" && v.key === key) {
                            disabled_message = v.disable_message;
                            disabled = true;
                        }
                    });
                });

                if (disabled) {
                    this.$("#form-disabled-message").html(disabled_message);
                    // If there are any links in the message, e.g. a
                    // "use this other service" link, then they need to be
                    // handled correctly by calling FMS.openExternal
                    // otherwise tapping them doesn't do anything at all.
                    this.$("#form-disabled-message a").click(function(e) {
                        FMS.openExternal(e.originalEvent);
                        that.$("#start-new-report-wrapper").show();
                        return false;
                    }).attr('data-role', 'none');

                    this.$("#form-disabled-banner").show();
                    this.$("#next").hide();
                    // Make sure the message comes into view fully.
                    $(document).scrollTop(0);
                } else {
                    this.$("#form-disabled-message").empty();
                    this.$("#form-disabled-banner").hide();
                    this.$("#start-new-report-wrapper").hide();
                    this.$("#next").show();
                }
            },

            startNewReport: function() {
                var that = this;
                FMS.removeDraft(this.model.id, true).done(
                    function() { that.onDraftRemove(); }
                ).fail(
                    function() { that.onDraftRemove(); }
                );

            },

            onDraftRemove: function() {
                FMS.clearCurrentDraft();
                this.navigate( 'around', 'left' );
            },

            updateCurrentReport: function() {
                var fields = [];
                var that = this;
                var update = function(index) { 
                    var el = $(this);
                    if ( el.val() !== '' ) {
                        that.model.set(el.attr('name'), el.val());
                        fields.push(el.attr('name'));
                    } else {
                        that.model.set(el.attr('name'), '');
                    }

                };

                $('input').each(update);
                $('select').each(update);
                $('textarea').each(update);

                this.model.set('extra_details', fields);
                FMS.saveCurrentDraft();
            },

            populateFields: function() {
                var that = this;
                var populate = function(index) {
                    that.$(this).val(that.model.get(that.$(this).attr('name')));
                };
                this.$('input').each(populate);
                this.$('select').each(populate);
                this.$('textarea').each(populate);
            }
        })
    });
})(FMS, Backbone, _, $);
