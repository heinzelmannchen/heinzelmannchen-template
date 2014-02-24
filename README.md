<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" valign="top" alt="Promises/A+ logo" />
</a>

heinzelmannchen
===============

[![Build Status](https://travis-ci.org/heinzelmannchen/heinzelmannchen-template.png?branch=master)](https://travis-ci.org/heinzelmannchen/heinzelmannchen-template)

Usage
-----

.h3 CLI

```
  Usage: heinzel-template -t [template] -j [dataFile]

  Options:

    -h, --help              output usage information
    -t, --template [value]  the template
    -j, --json [value]      a json-file containing the data
    -o, --output [value]    output filename
    -e, --encoding [value]  encoding of the files
    -s, --silent            no console output
    -f, --force             create folders if not existing
    -d, --dry-run           don't create files
    -D, --debug             print error object
    -T, --trace             print stacktrace
    -V, --version           output the version number
```

.h3 Node module

```javascript
var ht = require('heinzel-template');

// 1. passing files
ht.template('mytemplate.tpl', 'data.json')
    .then(onProcessed)
    .fail(onFail);

// 2. passing json data
ht.template('mytemplate.tpl', {
        name: 'Anton'
    }).then(onProcessed)
    .fail(onFail);

// 3. processing a string
ht.process('<%= name %>', {
    name: 'Anton'
    }).then(onProcessed)
    .fail(onFail);
```
