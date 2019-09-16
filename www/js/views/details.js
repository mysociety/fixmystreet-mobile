(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        DetailsView: FMS.FMSView.extend({
            template: 'details',
            id: 'details-page',
            prev: 'photo',
            next: 'submit-start',
            bottomMargin: -20,

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext',
                'blur textarea': 'updateCurrentReport',
                'change select': 'updateSelect',
                'blur input': 'updateCurrentReport'
            },

            initialize: function() {
                var that = this;
                window.addEventListener('native.keyboardshow', function(e) {
                    that.fixDetailTextAreaHeight(e.keyboardHeight);
                });
                window.addEventListener('native.keyboardhide', function(e) {
                    that.fixDetailTextAreaHeight();
                });
            },

            afterRender: function() {
                this.$('#form_category').attr('data-role', 'none');

                if ( this.model.get('category') ) {
                    this.$('#form_category').val( this.model.get('category') );
                }
                this.setSelectClass();
                this.checkForDisabledForm();
            },

            beforeDisplay: function(extra) {
                this.fixDetailTextAreaHeight();
            },

            fixDetailTextAreaHeight: function(extra) {
                extra = extra || 0;
                this.fixPageHeight(extra);
                var header = this.$("div[data-role='header']:visible"),
                detail = this.$('#form_detail'),
                top = detail.position().top,
                viewHeight = $(window).height(),
                contentHeight = viewHeight - header.outerHeight() + 15 - extra;

                detail.height( contentHeight - top );
            },

            onClickButtonPrev: function(e) {
                e.preventDefault();
                this.updateCurrentReport();
                this.navigate( this.prev, true );
            },

            onClickButtonNext: function(e) {
                e.preventDefault();
                // dismiss on screen keyboard
                $('.ui-btn-right').focus();
                this.clearValidationErrors();
                var valid = 1;

                if ( !$('#form_title').val() ) {
                    valid = 0;
                    this.validationError( 'form_title', FMS.validationStrings.title );
                }

                if ( !$('#form_detail').val() ) {
                    valid = 0;
                    this.validationError( 'form_detail', FMS.validationStrings.detail );
                }

                var cat = $('#form_category').val();
                if ( cat == '-- Pick a category --' ) {
                    valid = 0;
                    this.validationError( 'form_category', FMS.validationStrings.category );
                }

                if ( valid ) {
                    this.clearValidationErrors();
                    this.updateCurrentReport();
                    if ( FMS.isOffline ) {
                        this.navigate( 'save_offline' );
                    } else {
                        var category = this.model.get('categories')[this.model.get('category')];
                        if ( category && category.category_extra && category.category_extra.length > 0 ) {
                            // Some categories have only hidden fields - in that case we
                            // don't want to navigate to the details_extra view.
                            var all_hidden = category.category_extra_json.reduce(function(accumulator, field) {
                                return accumulator && (field.automated === "hidden_field");
                            }, true);

                            if (all_hidden && !category.unresponsive) {
                                this.navigate( this.next );
                            } else {
                                this.model.set('category_extras_html', category.category_extra);
                                var extras = {};
                                $.each(category.category_extra_json, function(i, extra) {
                                    extras[extra.code] = extra;
                                });
                                this.model.set('category_extras', extras);
                                this.navigate('details_extra');
                            }
                        } else {
                            this.navigate( this.next );
                        }
                    }
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

            setSelectClass: function() {
                var cat = this.$('#form_category');
                if ( cat.val() !== "" && cat.val() !== '-- Pick a category --' ) {
                    cat.removeClass('noselection');
                } else {
                    cat.addClass('noselection');
                }
            },

            updateSelect: function() {
                this.updateCurrentReport();
                this.setSelectClass();
                this.checkForDisabledForm();
            },

            checkForDisabledForm: function() {
                var categories = this.model.get('categories');
                var category = categories[this.$('#form_category').val()];

                if (category && category.disable_form && category.disable_form.all) {
                    this.disableForm(category.disable_form.all);
                } else {
                    this.enableForm();
                }
            },

            enableForm: function() {
                this.$(".form-enabled").show();
                this.$(".form-disabled").hide();
                this.$("#next").show();
                this.$("#form-disabled-message").empty();
            },

            disableForm: function(message) {
                this.$(".form-disabled").show();
                this.$(".form-enabled").hide();
                this.$("#next").hide();
                this.$("#form-disabled-message").html(message);
                // If there are any links in the message, e.g. a
                // "use this other service" link, then they need to be
                // handled correctly by calling FMS.openExternal
                // otherwise tapping them doesn't do anything at all.
                var that = this;
                this.$("#form-disabled-message a").click(function(e) {
                    FMS.openExternal(e.originalEvent);
                    FMS.removeDraft(that.model.id, true).done(
                        function() { that.onDraftRemove(); }
                    ).fail(
                        function() { that.onDraftRemove(); }
                    );
                    return false;
                }).attr('data-role', 'none');
            },

            onDraftRemove: function() {
                FMS.clearCurrentDraft();
                this.navigate( 'around', 'left' );
            },

            updateCurrentReport: function() {
                var category = $('#form_category').val();
                if ( category === '-- Pick a category --' ) {
                    category = '';
                }
                if ( category && $('#form_title').val() && $('#form_detail').val() ) {
                    $('#next').addClass('page_complete_btn');
                } else {
                    $('#next').removeClass('page_complete_btn');
                }
                this.model.set('category', category);
                this.model.set('title', $('#form_title').val());
                this.model.set('details', $('#form_detail').val());
                FMS.saveCurrentDraft();
            }
        })
    });
})(FMS, Backbone, _, $);
