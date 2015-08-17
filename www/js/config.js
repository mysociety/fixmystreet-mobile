var CONFIG = {
    // Language of templates to use ( should be name of directory under src/templates/ )
    LANGUAGE: 'en',

    // Name of app to use in alert dialog titles amongst other things
    APP_NAME: 'ATLAS Curridabat',

    // URL of the fixmystreet install to report to
    //FMS_URL: '192.168.1.204',
    FMS_URL: '186.15.86.26',

    // namespace for storing drafts etc in. Should not need to change
    NAMESPACE: 'fixmystreet',

    // directory to store draft photos in. Should not need to change
    FILES_DIR: 'photos',

    // accuracy in meters required before geolocation is successful
    ACCURACY: 500,

    // how long, in milliseconds, before photo uploads timeout. Defaults to 120000 ( 2 minutes )
    UPLOAD_TIMEOUT: 120000
};
