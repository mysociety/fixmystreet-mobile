#!/usr/bin/env node

var fs = require('fs');

if (process.env.CORDOVA_PLATFORMS.match(/android/)) {
  var filename = 'platforms/android/app/src/main/AndroidManifest.xml';
  if (fs.existsSync(filename)) {
    var manifest = fs.readFileSync(filename).toString();
    if (manifest.indexOf('android:installLocation="auto"') == -1) {
        manifest = manifest.replace(/<manifest/, '<manifest android:installLocation="auto"');
        fs.writeFileSync(filename, manifest);
    }
  } else {
    console.error("\x1b[31m[ERROR]\x1b[0m allow-sd-installation.js: file didn't exist: ", filename);
    if (process.env.CORDOVA_CMDLINE.match(/cordova build/)) {
      process.exit(1);
    }
  }
}