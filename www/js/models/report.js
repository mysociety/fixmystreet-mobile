(function(FMS, Backbone, _, $) {
    _.extend( FMS, {
        Report: Backbone.Model.extend({
            urlRoot: CONFIG.FMS_URL + '/report/ajax',

            defaults: function() {
                return {
                    lat: 0,
                    lon: 0,
                    title: '',
                    details: '',
                    may_show_name: '',
                    category: '',
                    phone: '',
                    pc: '',
                    files: []
                };
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

            _readFileAsBase64String: function(file, success, error) {
                return this._readFileAsBinaryString(file, function(data) {
                    var b64 = btoa(data);
                    success(b64);
                }, error);
            },

            _readFileAsBinaryString: function(file, success, error) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    success(this.result);
                };
                reader.onerror = error;
                return reader.readAsBinaryString(file);
            },

            _getParamName: function(field, encoding, length) {
                // The FileTransfer plugin technically only supports a single
                // file in each upload. However, we can force other files to
                // be added with a little workaround.
                // FileTransfer allows extra parameters to be sent with the
                // HTTP POST request, each of which is its own part of the
                // multipart-encoded request.
                // For a part to be treated as a file by the backend we need
                // to provide a 'filename' value in the Content-Disposition
                // header. The FileTransfer code doesn't escape the names of
                // extra POST parameters[0][1], so we can take advantage of this
                // and essentially inject our own header lines and filename
                // value with a carefully-crafted HTTP POST field name that's
                // passed to FileTransfer.upload.
                // FIXME: This is basically a hack, and needs a better
                // solution at some point.
                // [0]: https://github.com/apache/cordova-plugin-file-transfer/blob/49c21f951f51381d887646b38823222ed11c60c1/src/ios/CDVFileTransfer.m#L208
                // [1]: https://github.com/apache/cordova-plugin-file-transfer/blob/49c21f951f51381d887646b38823222ed11c60c1/src/android/FileTransfer.java#L369
                var name = field + '"; filename="' + field + '.jpg"\r\n';
                name += "Content-Type: image/jpeg\r\n";
                name += "Content-Transfer-Encoding: " + encoding + "\r\n";
                name += "Content-Length: " + length + "\r\n";
                name += 'X-Ignore-This-Header: "'; // to close the open quotes
                return name;
            },

            _addExtraPhotos: function(files, options, success, error) {
                var photos = [];
                for (var i = 0; i < files.length; i++) {
                    var uri = files[i];
                    photos.push({field: "photo"+(i+2), uri: uri});
                }
                this._addNextExtraPhoto(photos, options, success, error);
            },

            _addNextExtraPhoto: function(photos, options, success, error) {
                var photo = photos.shift();
                if (photo === undefined) {
                    success();
                    return;
                }
                var self = this;
                resolveLocalFileSystemURL(photo.uri, function(fileentry) {
                    fileentry.file(function(file) {
                        self._readFileAsBase64String(file, function(data) {
                            options.params[self._getParamName(photo.field, "base64", data.length)] = data;
                            self._addNextExtraPhoto(photos, options, success, error);
                        }, error);
                    }, error);
                }, error);
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
                if ( model.get('files') && model.get('files').length > 0 ) {
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

                    var files = model.get('files').slice();
                    fileURI = files.shift();

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

                        // If file2 or file3 have been set on this model we need to
                        // add the photos to the file upload request manually
                        // as FileTransfer only supports a single file upload.
                        that._addExtraPhotos(
                            files,
                            fileOptions,
                            function() {
                                $.mobile.loading('show', {
                                    text: FMS.strings.photo_loading,
                                    textVisible: true,
                                    html: '<span class="ui-icon ui-icon-loading"></span><h1>' + FMS.strings.photo_loading + '</h1><span id="progress"></span>'
                                });
                                window.setTimeout( checkUpload, 15000 );
                                FMS.uploading = true;
                                ft.upload(fileURI, CONFIG.FMS_URL + "/report/new/mobile", fileUploadSuccess, fileUploadFail, fileOptions);
                            },
                            fileUploadFail
                        );
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
