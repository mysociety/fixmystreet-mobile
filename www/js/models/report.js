(function(FMS, Backbone, _, $) {
    _.extend( FMS, {
        Report: Backbone.Model.extend({
            urlRoot: CONFIG.FMS_URL + '/report/ajax',

            defaults: {
                lat: 0,
                lon: 0,
                title: '',
                details: '',
                may_show_name: '',
                category: '',
                phone: '',
                pc: '',
                file: ''
            },

            sync: function(method, model, options) {
                switch (method) {
                    case 'update':
                    case 'create':
                        this.post(model,options);
                        break;
                    case 'read':
                        Backbone.ajaxSync(method, model, options);
                        break;
                    default:
                        return true;
                }
            },

            parse: function(res) {
                if ( res.report && res.report.latitude ) {
                    return {
                        lat: res.report.latitude,
                        lon: res.report.longitude,
                        title: res.report.title,
                        details: res.report.detail,
                        meta: res.report.meta,
                        confirmed_pp: res.report.confirmed_pp,
                        created_pp: res.report.created_pp,
                        category: res.report.category,
                        state: res.report.state,
                        state_t: res.report.state_t,
                        is_fixed: res.report.is_fixed,
                        used_map: res.report.used_map,
                        update_time: res.updates ? res.updates.update_pp : null,
                        update: res.updates ? res.updates.details : null
                    };
                }
                return false;
            },

            post: function(model,options) {

                var params = {
                    service: device.platform,
                    title: model.get('title'),
                    detail: model.get('details'),
                    category: model.get('category'),
                    lat: model.get('lat'),
                    lon: model.get('lon'),
                    pc: model.get('pc'),
                    may_show_name: model.get('may_show_name') ? 1 : 0,
                    used_map: 1,
                    name: model.get('name') || model.get('user').get('name'),
                    email: model.get('email') || model.get('user').get('email'),
                    phone: model.get('phone'),
                    fms_extra_title: model.get('user').get('title')
                };

                var extra_fields = model.get('extra_details');
                if ( extra_fields && extra_fields.length > 0 ) {
                    for ( var i = 0; i < extra_fields.length; i++ ) {
                        params[extra_fields[i]] = model.get(extra_fields[i]);
                    }
                }

                if ( model.get('submit_clicked') == 'submit_sign_in' ) {
                    params.submit_sign_in = 1;
                    params.password_sign_in = model.get('user').get('password');
                    params.remember_me = 1;
                } else {
                    params.password_register = model.get('user').get('password') || '';
                    params.submit_register = 1;
                }

                var that = this;
                if ( model.get('file') && model.get('file') !== '' ) {
                    var fileUploadSuccess = function(r) {
                        FMS.uploading = false;
                        $.mobile.loading('hide');
                        if ( r.response ) {
                            var data;
                            try {
                                data = JSON.parse( decodeURIComponent(r.response) );
                            }
                            catch(err) {
                                data = {};
                            }
                            if ( data.success ) {
                                that.success = 1;
                                that.trigger('sync', that, data, options);
                            } else if ( data.errors ) {
                                that.trigger('invalid', that, data, options);
                            } else {
                                that.trigger('error', that, FMS.strings.report_send_error, options);
                            }
                        } else {
                            that.trigger('error', that, FMS.strings.report_send_error, options);
                        }
                    };

                    var fileUploadFail = function(err) {
                        FMS.uploading = false;
                        $.mobile.loading('hide');
                        if ( err.code == FileTransferError.ABORT_ERR ) {
                            options.aborted = true;
                            that.trigger('error', that, FMS.strings.report_send_error, options);
                        } else {
                            that.trigger('error', that, FMS.strings.report_send_error, options);
                        }
                    };

                    fileURI = model.get('file');

                    var fileOptions = new FileUploadOptions();
                    fileOptions.fileKey="photo";
                    fileOptions.fileName=fileURI.substr(fileURI.lastIndexOf('/')+1);
                    fileOptions.mimeType="image/jpeg";
                    fileOptions.params = params;
                    fileOptions.chunkedMode = false;

                    var ft = new FileTransfer();

                    FMS.uploading = false;
                    var setupChecker = function() {
                        var uploadPcnt = 0;
                        var lastUploadPcnt = 0;
                        var uploadComputable = false;
                        var startTime = Date.now();
                        var checkUpload = function() {
                            if ( !FMS.uploading || ( uploadComputable && uploadPcnt == 80 ) ) {
                                return;
                            }

                            var uploadTime = Date.now() - startTime;
                            if ( ( lastUploadPcnt == 0 && uploadPcnt == 0 ) ||
                                 ( lastUploadPcnt > 0 && uploadPcnt == lastUploadPcnt ) ||
                                 uploadTime > FMS.uploadTimeout
                               ) {
                                ft.abort();
                            } else {
                                window.setTimeout( checkUpload, 15000 );
                            }
                            lastUploadPcnt = uploadPcnt;
                        };
                        ft.onprogress = function(evt) {
                            if (evt.lengthComputable) {
                                uploadComputable = true;
                                uploadPcnt = (evt.loaded/evt.total) * 80;
                                pcnt = uploadPcnt + '%';
                                $('.ui-loader #progress').css('display', 'block');
                                $('.ui-loader #progress').css('width', pcnt);
                                if ( pcnt == '80%' ) {
                                    $('.ui-loader #progress').css('background-color', 'green' );
                                }
                            } else {
                                uploadPcnt++;
                            }
                        };
                        $.mobile.loading('show', {
                            text: FMS.strings.photo_loading,
                            textVisible: true,
                            html: '<span class="ui-icon ui-icon-loading"></span><h1>' + FMS.strings.photo_loading + '</h1><span id="progress"></span>'
                        });
                        window.setTimeout( checkUpload, 15000 );
                        FMS.uploading = true;
                        ft.upload(fileURI, CONFIG.FMS_URL + "/report/new/mobile", fileUploadSuccess, fileUploadFail, fileOptions);
                    };
                    setupChecker();
                } else {
                    $.ajax( {
                        url: CONFIG.FMS_URL + "/report/new/mobile",
                        type: 'POST',
                        data: params,
                        dataType: 'json',
                        timeout: 30000,
                        success: function(data) {
                            if ( data.success ) {
                                that.success = 1;
                                that.trigger('sync', that, data, options);
                            } else {
                                that.trigger('invalid', that, data, options);
                            }
                        },
                        error: function (data, status, errorThrown ) {
                            that.trigger('error', that, data, status, errorThrown );
                        }
                    } );
                }
            },

            getLastUpdate: function(time) {
                if ( time ) {
                    props.time = time;
                }

                if ( !props.time ) {
                    return '';
                }

                var t;
                if ( typeof props.time === 'String' ) {
                    t = new Date( parseInt(props.time, 10) );
                } else {
                    t = props.time;
                }
            }
        })
    });
})(FMS, Backbone, _, $);
