(function (FMS, Backbone, _, $) {
    _.extend( FMS, {
        ReportsView: FMS.FMSView.extend({
            template: 'reports',
            id: 'reports',
            next: 'around',
            prev: 'around',
            contentSelector: '#drafts',

            events: {
                'pagehide': 'destroy',
                'pagebeforeshow': 'beforeDisplay',
                'pageshow': 'afterDisplay',
                'vclick .del_report': 'deleteReport',
                'vclick .use_report': 'useReport',
                'vclick .ui-btn-left': 'onClickButtonPrev',
                'vclick .ui-btn-right': 'onClickButtonNext'
            },

            onClickButtonPrev: function(e) {
                $('#drafts').hide();
                $('body')[0].scrollTop = 0;
                e.preventDefault();
                this.navigate( this.prev, true );
            },

            onClickButtonNext: function(e) {
                $('#drafts').hide();
                $('body')[0].scrollTop = 0;
                e.preventDefault();
                this.navigate( this.next );
            },

            deleteReport: function(e) {
                e.preventDefault();
                var el = $(e.target);
                var id = el.parents('li').attr('id');
                var del = FMS.removeDraft( id, true );
                var that = this;
                del.done( function() { that.onRemoveDraft(el); } );
                del.fail( function() { that.onRemoveDraft(el); } );
            },

            setHeight: function(content, height) {
                content.css( 'min-height', content + 'px');
            },

            beforeDisplay: function() {
                if ( FMS.allDrafts.length === 0 ) {
                    $('#noreports').show();
                } else {
                    $('#report-list').show();
                }
            },

            useReport: function(e) {
                e.preventDefault();
                var el = $(e.target);
                var id = el.parents('li').attr('id');
                FMS.currentDraft = FMS.allDrafts.get(id);
                $('#drafts').hide();
                if ( FMS.currentDraft && FMS.currentDraft.get('lat') ) {
                    var coords = { latitude: FMS.currentDraft.get('lat'), longitude: FMS.currentDraft.get('lon') };
                    fixmystreet.latitude = coords.latitude;
                    fixmystreet.longitude = coords.longitude;

                    if ( fixmystreet.map ) {
                        var centre = new OpenLayers.LonLat( coords.longitude, coords.latitude );
                        centre.transform(
                            new OpenLayers.Projection("EPSG:4326"),
                            fixmystreet.map.getProjectionObject()
                        );

                        fixmystreet.map.panTo(centre);
                    }
                }
                this.navigate('around');
            },

            onRemoveDraft: function(el) {
                el.parents('li').remove();
                if ( FMS.allDrafts.length === 0 ) {
                    $('#report-list').hide();
                    $('#noreports').show();
                }
            },

            render: function(){
                if ( !this.template ) {
                    FMS.printDebug('no template to render');
                    return;
                }
                template = _.template( tpl.get( this.template ) );
                if ( this.model ) {
                    this.$el.html(template({ model: this.model.toJSON(), drafts: FMS.allDrafts }));
                } else {
                    this.$el.html(template());
                }
                this.afterRender();
                return this;
            }
        })
    });
})(FMS, Backbone, _, $);
