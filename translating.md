Translating
-----------
The translation code here currently relies on you having the main
FixMyStreet codebase checked out in the same directory as the
FixMyStreet mobile code.

Quickstart
----------
./bin/gettext-extract
./bin/gettext-merge
../fixmystreet/commonlib/bin/gettext-makemo FixMyStreetMobileApp
perl -I../fixmystreet/commonlib/perllib -I../fixmystreet/local  bin/localise_templates

copy compiled/$lang/*.html to www/templates/$lang
copy compiled/$lang/strings.js to www/js/strings.$short_lang.js

(NB `$short_lang` should match `CONFIG.LANGUAGE` in your config.js)

The list of languages to generate templates for should be included in
locale/lang_list and should look like locale/lang_list.example
