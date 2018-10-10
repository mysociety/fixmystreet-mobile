## Releases

* v2.3 (10th October 2018)
    - Bugfixes
        - Fixed issue with pins not always appearing when zooming the map.
        - "Show my name publicly" is now unticked by default. #252
        - Fixed bug where "undefined" would show instead of correct text.

* v2.2 (20th June 2018)
    - Bugfixes
        - Displays message if council does not accept reports #266

* v2.1 (3rd May 2018)
    - New features
        - Multiple photo support. #107
        - iPhone X support. #259
        - Button to hide pins on map. #175
    - Bugfixes
        - Skip empty report details screen.
        - Correctly set user title. #156
        - Show more helpful error if server rejects password. #156
        - Allow mailto: links to be followed. #263
        - Stop keyboard obscuring report details text field. #222
    - Development improvements
        - CONFIG.SKIP_CONFIRM_REPORT flag to skip confirmation screen.
        - Ensure compatibility with latest Cordova versions.
        - CONFIG.PASSWORD_MIN_LENGTH key to validate user password.
        - CONFIG.PASSWORD_CHECK_COMMON flag to test password against server.
