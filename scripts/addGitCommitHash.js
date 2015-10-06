#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files
//
// Look for the string CONFIGURE HERE for areas that need configuration
//


/*
this plugin adds the current git commit has to the build before prepare each environment
from http://devgirl.org/2013/11/12/three-hooks-your-cordovaphonegap-project-needs/
*/
module.exports = function(context) {

  //console.log('running hook');
  var fs = require('fs');
  var path = require('path');
  var git = require('git-rev')



  var rootdir = './';


  //console.log(process.argv);

  function replace_string_in_file(filename, to_replace) {
    return git.long(function (gitCommitHash) {
      //console.log('running git.long');
      //console.log(gitCommitHash);
      var data = fs.readFileSync(filename, 'utf8');
      var result = data.replace(new RegExp(to_replace, "g"), gitCommitHash);
      fs.writeFileSync(filename, result, 'utf8');
      console.log('succesfully ran after_build');
    });

  }

  var target = context.opts.cordova.platforms[0];
  //console.log(rootdir);
  if (rootdir) {
    //var ourconfigfile = path.join(rootdir, "config", "project.json");
    //var configobj = JSON.parse(fs.readFileSync(ourconfigfile, 'utf8'));

    // CONFIGURE HERE
    // with the names of the files that contain tokens you want
    // replaced.  Replace files that have been copied via the prepare step.
    var fileToReplace = "";
    //console.log(target);
    switch(target){
      case 'android':
        fileToReplace = "platforms/android/assets/www/index.html";
        break;
      case 'ios':
        fileToReplace = "platforms/ios/www/index.html";
        break;
    }
    //console.log(fileToReplace);
    //console.log('root dir: ' + rootdir);

    var fullfilename = path.join(rootdir, fileToReplace);
    //console.log(fullfilename);
    if (fs.existsSync(fullfilename)) {
      // CONFIGURE HERE
      // with the names of the token values. For example,
      // below we are looking for the token
      // /*REP*/ 'gitCommitHash' /*REP*/ and will replace
      // that token
      //console.log('before function');
      replace_string_in_file(fullfilename,
        "/\\*REP\\*/ 'gitCommitHash' /\\*REP\\*/");
        // ... any other configuration options
      //console.log('after function');
    }else{
      console.log('AFTER Prepare did not ran correctly!!!');
    }

  }// end of ir rootdir
}
