#!/usr/bin/env node
var fs = require('fs');

if (process.env.CORDOVA_PLATFORMS.match(/android/)) {
  var filename = 'platforms/android/app/src/main/AndroidManifest.xml';
  if (fs.existsSync(filename)) {
    var PERMISSIONS_TO_REMOVE = [
      'READ_PHONE_STATE',
      'RECORD_AUDIO',
      'MODIFY_AUDIO_SETTINGS',
      'RECORD_VIDEO'
    ];
    var manifestLines = fs.readFileSync(filename).toString().split('\n');
    var newManifestLines = [];
    var PERMISSIONS_REGEX = PERMISSIONS_TO_REMOVE.join('|');

    manifestLines.forEach(function(line) {
      if(!line.match(PERMISSIONS_REGEX)) {
        newManifestLines.push(line);
      }
    });

    fs.writeFileSync(filename, newManifestLines.join('\n'));
  } else {
    console.error("\x1b[31m[ERROR]\x1b[0m remove-permissions.js: file didn't exist: ", filename);
    if (process.env.CORDOVA_CMDLINE.match(/cordova build/)) {
      process.exit(1);
    }
  }
}