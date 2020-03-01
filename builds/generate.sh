TO=$1
FROM=$2

if [[ -z "$TO" ]]; then
  TO=$(cat .version)
fi

if [[ -z "$FROM" ]]; then
  FROM=$(cat .version)
fi

printf "\n-------------------------------------------\n\n"

if [ $FROM != $TO ]; then
  printf " Bulding Luminous $TO (from $FROM):\n\n"
else
  printf " Bulding Luminous $TO:\n\n"
fi

FROM_T="${FROM/./-}"
FROM_T="${FROM_T/./-}"

TO_T="${TO/./-}"
TO_T="${TO_T/./-}"


printf "  - Removing old build folder..."

rm -rf builds/current

printf " 🗸\n"

printf "  - Creating an new empty build folder..."

mkdir builds/current

printf " 🗸\n"

printf "  - Copying all files..."

ls | grep -v build | xargs -I % cp -r % builds/current

printf " 🗸\n"

printf "  - Updating version..."

find . -type f \
  | grep -v vendor \
  | grep '.js\|.css\|.md\|.html\|.version' \
  | xargs sed -i "s/$FROM/$TO/g"

find . -type f \
  | grep -v vendor \
  | grep '.js\|.css\|.md\|.html\|.version' \
  | xargs sed -i "s/$FROM_T/$TO_T/g"

printf " 🗸\n"

printf "  - Generating js/content/interceptor.js..."

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

printf " 🗸\n"

printf "  - Minifying js/content/interceptor.js with uglifyjs..."

uglifyjs -c -m \
  -o builds/current/js/content/minified_interceptor.js \
  -- builds/current/js/content/interceptor.js

printf " 🗸\n"

printf "  - Generating content variable with minified JavaScript..."

printf "  var content = '" > builds/current/js/content/minified_variable.js
cat builds/current/js/content/minified_interceptor.js >> builds/current/js/content/minified_variable.js
printf "';" >> builds/current/js/content/minified_variable.js
echo "" >> builds/current/js/content/minified_variable.js

sed -i \
  -e '/UGLIFYJS_RESULT/{r builds/current/js/content/minified_variable.js' \
  -e 'd}' \
  builds/current/js/utils/injections/interceptor_build.js

printf " 🗸\n"

printf "  - Rearranging js/utils/injections/interceptor.js file..."

rm builds/current/js/utils/injections/interceptor.js

mv builds/current/js/utils/injections/interceptor_build.js \
   builds/current/js/utils/injections/interceptor.js

printf " 🗸\n"

printf "  - Removing unused files..."

rm builds/current/js/content/minified_variable.js
rm builds/current/js/content/minified_interceptor.js

rm -rf builds/current/doc

rm -rf builds/current/html/demos

rm -rf builds/current/images/doc
rm -rf builds/current/images/inkscape-files
rm -rf builds/current/images/krita-files
rm -rf builds/current/images/stores

rm -rf builds/current/js/content/interceptors
rm builds/current/js/content/interceptor.js

rm builds/current/_config.yml
rm builds/current/README.md

printf " 🗸\n"

printf "  - Removing web_accessible_resources from manifest.json..."

cp builds/current/manifest.json \
   builds/current/manifest.json.tmp

cat builds/current/manifest.json.tmp \
  | tr "\n" "~" \
  | sed -e 's/,~  "web_accessible_resources.*\]//' \
  | tr "~" "\n" > builds/current/manifest.json

rm builds/current/manifest.json.tmp

printf " 🗸\n"

printf "  - Creating $TO_T.zip..."

cd builds/current/ && zip -r "$TO_T.zip" * > /dev/null

printf " 🗸\n"

printf "\n Finished!\n"

printf "\n-------------------------------------------\n\n"
