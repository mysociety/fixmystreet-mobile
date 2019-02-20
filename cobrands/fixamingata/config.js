var CONFIG = {
    // Language of templates to use ( should be name of directory under www/templates/ )
    LANGUAGE: 'sv',

    // Name of app to use in alert dialog titles amongst other things
    APP_NAME: 'FixaMinGata',

    // URL of the fixmystreet install to report to. See also config.xml-example
    // Make sure it does *not* end with a slash.
    FMS_URL: 'https://fixamingata.se',

    // Name of the cobrand to use for templates, stylesheets etc.
    // Cobrand files should be placed in a new directory within www/cobrands/
    // Leave as null to use the default templates.
    COBRAND: 'fixamingata',

    // Type of map to use; possible options currently are 'OSM', 'Bing' or
    // 'FMS' (UK only). The default is OSM.
    MAP_TYPE: 'OSM',

    // namespace for storing drafts etc in. Should not need to change
    NAMESPACE: 'fixmystreet',

    // directory to store draft photos in. Should not need to change
    FILES_DIR: 'photos',

    // accuracy in meters required before geolocation is successful
    ACCURACY: 100,

    // how long, in milliseconds, before photo uploads timeout. Defaults to 120000 ( 2 minutes )
    UPLOAD_TIMEOUT: 120000,

    // Set to 1 to log debug messages to the console
    DEBUG: 0,

    // Bing Maps API key if needed
    BING_MAPS_API_KEY: '',

    PINS: {
        location: {
            image: 'cobrands/fixamingata/images/fmg-pin.png',
            background: 'cobrands/fixamingata/images/fmg-pin_shadow.png',
            image_svg: 'cobrands/fixamingata/images/fmg-pin.svg',
            background_svg: 'cobrands/fixamingata/images/fmg-pin_shadow.svg'
        }
    },

    // Set this to true if you want to disable the help button on the right hand
    // side of the screen. NB you'll also need to hide #display-help and #help
    // elements in your CSS.
    HELP_DISABLED: false,

    // Set this to true if the user must provide at least one photo when making
    // a report. If this is true the 'skip' button on the photo page is removed
    // and 'next' doesn't appear until at least one photo is attached.
    PHOTO_REQUIRED: false,

    // The maximum number of photos the user can attach to a report.
    MAX_PHOTOS: 3,

    // If this is true then the user must login as the first step after
    // installing the app, and before making any reports.
    LOGIN_REQUIRED: false,

    // The ratio of the data bounds to the viewport bounds (in each dimension).
    // See http://dev.openlayers.org/releases/OpenLayers-2.13.1/doc/apidocs/files/OpenLayers/Strategy/BBOX-js.html
    MAP_LOADING_RATIO: 2,

    // If the user is logged in and this setting is true, the 'Your details'
    // page is skipped and the report is sent immediately after the report
    // details have been entered.
    SKIP_CONFIRM_REPORT: false,

    // You can optionally enforce a minimum password length if the user is
    // registering an account when submitting a report. This should match the
    // same minimum length required by your FixMyStreet server.
    // Set this to 0 if you wish to disable this check. NB: If the check is
    // active on the server the user's password may still be rejected if it's
    // too short.
    PASSWORD_MIN_LENGTH: 6,

    // FMS provides a mechanism for rejecting passwords that are too common.
    // Set this flag to true if the password should be checked against the
    // server when a user registers an account via the app.
    // NB: If this flag is false here but the check is active on the FMS server,
    // common passwords will still be rejected at the point the report is sent
    // from the app to the server - which may be a large POST if the report has
    // photos attached.
    PASSWORD_CHECK_COMMON: true
};

// This bit is so this can be imported as a nodejs module for hook processing
var module = module || {};
module.exports = CONFIG;
