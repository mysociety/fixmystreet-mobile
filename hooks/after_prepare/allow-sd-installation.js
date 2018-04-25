#!/usr/bin/env node

var fs = require('fs');

var filename = 'platforms/android/app/src/main/AndroidManifest.xml';
if (fs.existsSync(filename)) {
  var manifest = fs.readFileSync(filename).toString();
  if (manifest.indexOf('android:installLocation="auto"') == -1) {
      manifest = manifest.replace(/<manifest/, '<manifest android:installLocation="auto"');
      fs.writeFileSync(filename, manifest);
  }
} else {
  console.log("file didn't exist: ", filename);
}
