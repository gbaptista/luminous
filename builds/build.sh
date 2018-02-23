FROM=0.0.18
TO=0.0.18

FROM_T="${FROM/./-}"
FROM_T="${FROM_T/./-}"

TO_T="${TO/./-}"
TO_T="${TO_T/./-}"

# Create an new empty build folder

rm -rf builds/current

mkdir builds/current

# Copy all files to new build folder

ls | grep -v build | xargs -I % cp -r % builds/current

# Replace all old versions number

find . -type f \
  | grep -v vendor \
  | grep '.js\|.css\|.md\|.html' \
  | xargs sed -i "s/$FROM/$TO/g"

find . -type f \
  | grep -v vendor \
  | grep '.js\|.css\|.md\|.html' \
  | xargs sed -i "s/$FROM_T/$TO_T/g"

# Generate the interceptor injection file

find builds/current/js/content/interceptors -type f \
  | while read PATH
      do {
        SHORT_PATH="// ${PATH/builds\/current\/js\/content\//}"
        SHORT_PATH="${SHORT_PATH//\//\\\\\/}"

        echo "/$SHORT_PATH/{r $PATH"
      }
    done \
  | xargs -I SED_COMMAND \
    sed -i -e SED_COMMAND -e 'd}' \
    builds/current/js/content/interceptor.js

uglifyjs -c -m \
  -o builds/current/js/content/minified_interceptor.js \
  -- builds/current/js/content/interceptor.js

printf "  var content = '" > builds/current/js/content/minified_variable.js
cat builds/current/js/content/minified_interceptor.js >> builds/current/js/content/minified_variable.js
printf "';" >> builds/current/js/content/minified_variable.js
echo "" >> builds/current/js/content/minified_variable.js

sed -i \
  -e '/UGLIFYJS_RESULT/{r builds/current/js/content/minified_variable.js' \
  -e 'd}' \
  builds/current/js/content/injections/interceptor_build.js

rm builds/current/js/content/injections/interceptor.js

mv builds/current/js/content/injections/interceptor_build.js \
   builds/current/js/content/injections/interceptor.js

rm builds/current/js/content/minified_variable.js
rm builds/current/js/content/minified_interceptor.js

# Remove unused files

rm -rf builds/current/doc

rm builds/current/html/demo-page-interceptor.html
rm builds/current/html/demo-page.html
rm builds/current/html/external-content.txt
rm builds/current/html/interface-sample.html

rm -rf builds/current/images/doc
rm -rf builds/current/images/inkscape-files
rm -rf builds/current/images/krita-files
rm -rf builds/current/images/stores

rm -rf builds/current/js/content/interceptors
rm builds/current/js/content/interceptor.js

rm builds/current/_config.yml
rm builds/current/README.md

# Clear web_accessible_resources

cp builds/current/manifest.json \
   builds/current/manifest.json.tmp

cat builds/current/manifest.json.tmp \
  | tr "\n" "~" \
  | sed -e 's/,~  "web_accessible_resources.*\]//' \
  | tr "~" "\n" > builds/current/manifest.json

rm builds/current/manifest.json.tmp

# Generate zip build
cd builds/current/ && zip -r "$TO_T.zip" *
