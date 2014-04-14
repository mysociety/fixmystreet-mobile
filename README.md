FixMyStreet Mobile App
----------------------

This is the FixMyStreet mobile app for reporting problems to an instance of the
FixMyStreet platform - https://github.com/mysociety/fixmystreet.

**You *must* have your FixMyStreet webserver up and running first:** the mobile app
ultimately sends reports via that. It is not a standalone service. For more information
on FixMyStreet, see http://fixmystreet.org

It's still in development at the moment and only a small amount of time
has been spent on making it re-brandable/re-usable so if you want to
create your own version on top of it you may be in for a bumpy ride.

The FixMyStreet mobile app uses PhoneGap and has versions for Android and iOS.

Running
-------

To get it up and running you will need to create a config.js file in src/js/ based
on the src/js/config-example.js file. This has configuration for which FMS instance
to use etc.

You should then be able to build and run it like any other PhoneGap project.

The platform specific cordova.js files are inside the projects and then the src directory
is included inside the www folders for each platform. On Android this is done with a 
symbolic link, on iOS by a build script.

Basic structure
---------------
* Android - android project
* iPhone - iOS version
* src - JS, HTML, CSS and image files
* templates - templates with strings to be translated
* locale - gettext translation files
* bin - helper scripts for translation

src Stucture
------------
* css - css files
* js - project javascript files
* js/views - backbone view files
* js/models - backgone model files
* jslib - third party javascript libraries and files
* templates - underscore templates for the pages

Translation
-----------
We use gettext for translation with a series of templated files that use the Template Toolkit
Perl module. The scripts are based on those used for the FixMyStreet website. In the templates
directory are a set of page templates marked up for translation. These are parsed by the scripts
and a set of strings to be translated are extracted. These strings are then used to generate a
a set of .po files for each language under locales, which in turn generate a set of translated
template files for use in the app. For more details see the translating file.

The app only supports one language at a time at the moment.
