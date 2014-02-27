<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" valign="top" alt="Promises/A+ logo" />
</a>

heinzelmannchen-template
========================

heinzel-template is part of heinzelmannchen. It is a CLI- and node tool to process template files.
It uses underscore as the templateeninge of choice.

[![Build Status](https://travis-ci.org/heinzelmannchen/heinzelmannchen-template.png?branch=master)](https://travis-ci.org/heinzelmannchen/heinzelmannchen-template)

Usage
-----

### CLI

```
  Usage: heinzel-template -t [template] -j [dataFile]

  Options:

    -h, --help              output usage information
    -t, --template [value]  the template
    -j, --json [value]      a json-file containing the data
    -s, --script [value]    load a custom js-script, to use in a templat under the global _custom
    -o, --output [value]    output filename
    -e, --encoding [value]  encoding of the files
    -s, --silent            no console output
    -f, --force             create folders if not existing
    -d, --dry-run           don't create files
    -D, --debug             print error object
    -T, --trace             print stacktrace
    -V, --version           output the version number
```

### Node module

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

### Template

The templateengine under the hood is [http://documentcloud.github.io/underscore/#template](underscorejs).
By default it uses ERB-style.
Additional to the functionality provided by undescorejs you can use [http://epeli.github.io/underscore.string/](underscorejs.string)
or load your own module, which will be available under "_custom".


