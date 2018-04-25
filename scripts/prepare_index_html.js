#!/usr/bin/env node

// This script is run as a hook by Cordova, it's not intended for manual
// execution.

var fs = require('fs');
var path = require('path');
var _ = require("../www/jslib/lodash.min.js");

function processTemplate(filename, context) {
    // Reads a file, processes it as a lodash template with the given context,
    // and writes the result back to the original file.
    var data = fs.readFileSync(filename, 'utf8');
    var template = _.template(data);
    var result = template(context);
    fs.writeFileSync(filename, result, 'utf8');
}

module.exports = function(context) {
    var CONFIG = require("../www/js/config.js");

    var files = [
        "platforms/android/app/src/main/assets/www/index.html",
        "platforms/ios/www/index.html",
    ];
    files.forEach(function(file) {
        if (fs.existsSync(file)) {
            processTemplate(file, {CONFIG: CONFIG});
        } else {
            console.log("file didn't exist: ", file);
        }
    });
}
