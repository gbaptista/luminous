# Luminous ![Icon](../images/icons/48.png)

## Build Instructions

### Requirements

Basic *Unix* tools:

- `bash`
- `grep` `sed` `xargs`
- `cp` `mkdir` `mv` `rm`
- `cat` `find` `ls`
- `echo` `printf`

[*npm*](https://www.npmjs.com/):
```
sudo apt-get install npm
```

[*UglifyJS*](https://github.com/mishoo/UglifyJS):
```shell
sudo npm install uglify-js -g
```

### Generating a new build

Generate current build:
```bash
bash builds/generate.sh
```

Generate current build with a new version:
```bash
bash builds/generate.sh 0.0.2
```

Generate current build with a new version from some specific version:
```bash
bash builds/generate.sh 0.0.2 0.0.1
```

Expected output:
```
-------------------------------------------

 Bulding Luminous 0.0.2 (from 0.0.1):

  - Removing old build folder... 🗸
  - Creating an new empty build folder... 🗸
  - Copying all files... 🗸
  - Updating version... 🗸
  - Generating js/content/interceptor.js... 🗸
  - Minifying js/content/interceptor.js with uglifyjs... 🗸
  - Generating content variable with minified JavaScript... 🗸
  - Rearranging js/content/injections/interceptor.js file... 🗸
  - Removing unused files... 🗸
  - Removing web_accessible_resources from manifest.json... 🗸
  - Creating 0-0-2.zip... 🗸

 Finished!

-------------------------------------------
```

Test the current build at least in these 4 browsers:

- *Chromium*
- *Google Chrome*
- *Mozilla Firefox*
- *Opera*

Run the cleanup tool:

```shell
bash builds/cleanup.sh
```

Expected output:

```
-------------------------------------------

Note for reviewers:

The non-minified version for the code in "js/content/injections/interceptor.js" is available at:

 - https://github.com/gbaptista/luminous/blob/0.0.2/js/content/interceptor.js
 - https://github.com/gbaptista/luminous/blob/0.0.2/js/content/interceptors/

-------------------------------------------
```

Contact some repository owner to publish in all stores.
