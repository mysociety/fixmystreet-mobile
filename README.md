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

To get it up and running you will need to create `www/js/config.js` based
on the `www/js/config.js-example` file. This has configuration for which FMS instance
to use etc.

You should also create a `config.xml` file based on `config.xml-example`.
The only change you should need to make is to add the hostname of your FMS installation
in an `<access origin=""/>` tag.

Setup
-----
This project uses Apache Cordova to produce Android and iOS apps. There is
some mildly complicated configuration and setup required to be able to develop
with it. The following all assumes you're working on a Mac.

1. Make sure you have the latest versions of XCode, JDK 1.8, the Android SDK, node and
npm installed. It's a very good idea to have installed the Intel HAXM versions
of the Android emulator because they're about 100 times faster to run. You need
to download it from the Android SDK Manager (run `android` on the command line)
and then actually run the `.dmg` that this creates in your sdk folder. (Alternatively `brew cask install intel-haxm` if you use [Homebrew Cask](http://caskroom.io).)

2. Install the cordova CLI with npm: `npm install -g cordova`
Note that this is not the same as the phonegap CLI and the two should not be
mixed up. The latter gives you access to Adobe's proprietary phonegap build
service, which we **don't** use!

3. Install the latest android api and build tools packages within the Android
SDK Manager (run `android` on the command line to launch it)

4. Checkout the project

5. `cd` into the project directory and run `cordova prepare` to load up the
cordova platforms and plugins we use.

6. Create a new 'Android Virtual Device' for emulating a real device by running
`android avd` and using one of the 'Device Definitions' on the second tab as a
template. It doesn't matter which one, but set the CPU type to 'Atom (x86)'
otherwise it will be very very slow. Enable 'Use Host GPU', if available, to
massively speed up the UI. Ticking 'Hardware keyboard present' will allow you
to use your keyboard instead of hunting-and-pecking the on-screen keyboard.

7. Copy `www/js/config.js-example to www/js/config.js` and edit if needed

8. To run the project on one of the platforms, use: `cordova emulate ios` or
`cordova emulate android`

Basic structure
---------------
* `www` - JS, HTML, CSS and image files
* `templates` - templates with strings to be translated
* `locale` - gettext translation files
* `bin` - helper scripts for translation

`www` Stucture
------------
* `css` - css files
* `js` - project javascript files
* `js/views` - backbone view files
* `js/models` - backgone model files
* `jslib` - third party javascript libraries and files
* `templates` - underscore templates for the pages
* `cobrands` - template overrides and stylesheets for your own cobrand

Cobranding
----------

If you want to change the appearance of the app (e.g. to change the colour scheme, or provide
your own FAQ/help text), you can use your own templates and stylesheets to achieve this.

Rather than editing the existing templates in `www/templates/en`, you should override the default
template by placing your own version in `www/cobrands/<cobrand name>/templates/en` and set the
`CONFIG.COBRAND` value appropriately in `www/js/config.js`.

For example to change the intro text that's shown when you first launch the app, set
`CONFIG.COBRAND` to `mycobrand` and then copy `www/templates/en/initial_help.html` to
`www/cobrands/mycobrand/templates/en/initial_help.html` and edit it with your new text.

To change the colour theme or other styles used in the app, create
`www/cobrands/mycobrand/css/style.css` and add your own CSS rules. If `CONFIG.COBRAND` is set to
`mycobrand` then this new CSS file will be included in the page HTML automatically.

Translation
-----------
We use gettext for translation with a series of templated files that use the Template Toolkit
Perl module. The scripts are based on those used for the FixMyStreet website. In the templates
directory are a set of page templates marked up for translation. These are parsed by the scripts
and a set of strings to be translated are extracted. These strings are then used to generate a
a set of .po files for each language under locales, which in turn generate a set of translated
template files for use in the app. For more details see the translating file.

The app only supports one language at a time at the moment.

Tips and Tricks
--------------
- Make sure you read the documentation for Cordova from http://cordova.apache.org/
**not the Phonegap site** - the two vary in infuriating and subtle ways and much
of the stackoverflow-esque info on the web is confused about which one it's for.
Particularly in the options for things in `config.xml` which is where all the
magic happens.
- You can use `ios-sim` to launch the iOS emulator directly with something like:
`ios-sim launch platforms/ios/build/emulator/FixMyStreet.app --devicetypeid "com.apple.CoreSimulator.SimDeviceType.iPhone-6, 8.0"` after you've built the project via a previous
emulator run or a direct build via `cordova build ios`. This allows you to
specify a different device than the default one. To see the available options
for `--devicetypeid` run `ios-sim showdevicetypes`.
- You can open the iOS project in XCode if you prefer to run it that way, the
project file is in `platforms/ios`
- To check the console log output when emulating iOS, run: `tail -f console.log`
Cordova by default writes it out to that file in your project root
- To check the console log output when emulating Android, cd to
`platforms/android/cordova` and run `./log`. I found that I needed to be in the
directory for it to actually print anything, YMMV.
- Leave the emulators running once they start, it's much quicker!

Upgrading
---------
Cordova now includes version numbers for the platforms and plugins in
`config.xml` so it's possible to use the command line tools to update
everything.

1. Update the CLI: `npm update cordova`
2. Update each platform: `cordova platform update ios --save`, `cordova platform update android --save`
3. Update each plugin. Unfortunately, it doesn't seem possible to upgrade all
   of the plugins in one go, so you'll have to type out
   `cordova plugin update cordova-plugin-name --save` for every single one.
   You can get a list that's easy to edit into a script from
   `cordova plugin list`.
4. Refer to the upgrade guides:
   https://cordova.apache.org/docs/en/latest/guide/platforms/android/upgrade.html
   and
   https://cordova.apache.org/docs/en/latest/guide/platforms/ios/upgrade.html
   for anything you need to change between versions. The plugins helpfully
   print notices for some things that have changed when you install them.
5. Test the changes

Releasing
---------
### Android
To release the app on Android, you need to do the following:

 1. Change your `config.js` to include production settings
 1. Bump the version code in `config.xml`, both the main one and the android specific one
 1. Clone the mySociety keys repository
 1. Build a release version of the app: `cordova build android --release -- --keystore="/path/to/keys_repo/android/android_keystore" --alias=<fixmystreet|cuidomiciudad|etc>`

### iOS

#### App Store

To release the app in the iTunes App Store you need to do the following:

1. Change your config.js to include production settings
2. Bump the version code in config.xml, both the main one and the android specific one
3. Run the emulator to make sure you've built the latest version of the app: `cordova emulate ios`
4. Open the app in XCode (the xcodeproj project file you need is in `platforms/ios`)
5. Select `Product > Archive` from the XCode menu
6. In the "navigator" window that pops up, select the latest build and then hit "Validate" in the top right. It'll ask to access your keychain, so you'll need to make sure you've installed the latest certificates there already.
7. Once the validation has finished, hit "Submit" and pick the certificate again to actually send it to Apple.
8. Now you need to log into iTunes Connect and add a new version of the app for this build, then submit it for review.

#### Ad-Hoc Distribution

iOS allows you to distribute builds of your app directly to selected testers, either by sending them the `.ipa` file for installation via iTunes or via a specially-crafted web page they visit from their device. [More info](http://help.apple.com/deployment/ios/#/apda0e3426d7).

 1. Gather the device UDIDs from testers and add them to the ['devices' section](https://developer.apple.com/account/ios/device/) of the developer center.
 2. You'll probably have to re-download the provisioning profile for the app into Xcode so subsequent builds include the new device UDIDs.
 3. Open the `.xcodeproj` file in Xcode and run `Product > Archive`
 4. Select the archive in the Organizer window that subsequently pops up, then click `Export` and select `Save for Ad Hoc Deployment`.
 5. Follow the wizard, selecting `Export one app for all compatible devices`, and `Include manifest for over-the-air installation`.
 6. The wizard will ask you to provide values for the App URL, and a couple of image URLs. Put dummy values in if you don't know the final URLs for the `.ipa` and images yet, you can edit the output manifest file later.
 7. Copy the resulting `.ipa` and manifest to your webserver. Make sure they're served over HTTPS or iOS will refuse to install the app.
 8. Users can install the app on their devices by going to a URL of the form `itms-services://?action=download-manifest&url=[MANIFEST URL HERE]`
