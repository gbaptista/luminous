ls builds/current | grep -v .zip | xargs -I PATH rm -rf "builds/current/PATH"

BUILD_VERSION=$(cat .version)

printf "\n-------------------------------------------\n\n"

printf 'Note for reviewers:\n\n'
printf 'The non-minified version for the code in '
printf '"js/content/injections/interceptor.js"'
printf ' is available at: \n\n'
printf " - https://github.com/gbaptista/luminous/blob/$BUILD_VERSION/js/content/interceptor.js\n"
printf " - https://github.com/gbaptista/luminous/blob/$BUILD_VERSION/js/content/interceptors/"

printf "\n\n-------------------------------------------\n\n"
