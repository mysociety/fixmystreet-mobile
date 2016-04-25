#!/usr/bin/env node
var fs = require('fs');

if(fs.existsSync('platforms/android')) {
  var PERMISSIONS_TO_REMOVE = [
    'READ_PHONE_STATE',
    'RECORD_AUDIO',
    'MODIFY_AUDIO_SETTINGS',
    'RECORD_VIDEO'
  ];
  var MANIFEST = 'platforms/android/AndroidManifest.xml';
  var manifestLines = fs.readFileSync(MANIFEST).toString().split('\n');
  var newManifestLines = [];
  var PERMISSIONS_REGEX = PERMISSIONS_TO_REMOVE.join('|');

  manifestLines.forEach(function(line) {
    if(!line.match(PERMISSIONS_REGEX)) {
      newManifestLines.push(line);
    }
  });

  fs.writeFileSync(MANIFEST, newManifestLines.join('\n'));
}