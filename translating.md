Translating
-----------
The translation code here currently relies on you having the main
FixMyStreet codebase checked out in the same directory as the
FixMyStreet mobile code.

Quickstart
----------
On Debian, install "liblocale-maketext-lexicon-perl" and
"libtemplate-perl". On Fedora, install "perl-Locale-gettext" and
"perl-Locale-Maketext-Lexicon".

- ./bin/gettext-extract
- ./bin/gettext-merge
- ../fixmystreet/commonlib/bin/gettext-makemo FixMyStreetMobileApp
- perl -I../fixmystreet/commonlib/perllib -I../fixmystreet/local bin/localise_templates
- Copy compiled/$lang/*.html to www/templates/$lang
- Copy compiled/lang/strings.js to www/js/strings.$short_lang.js

The list of languages to generate templates for should be included in
locale/lang_list and should look like locale/lang_list.example
