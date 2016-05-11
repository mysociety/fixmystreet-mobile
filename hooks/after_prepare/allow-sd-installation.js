#!/usr/bin/env node

var fs = require('fs');

if (fs.existsSync('platforms/android')) {
  var filename = 'platforms/android/AndroidManifest.xml',
      manifest = fs.readFileSync(filename).toString();
  if (manifest.indexOf('android:installLocation="auto"') == -1) {
      manifest = manifest.replace(/<manifest/, '<manifest android:installLocation="auto"');
      fs.writeFileSync(filename, manifest);
  }
}
