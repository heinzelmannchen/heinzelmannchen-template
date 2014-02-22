var Q = require('q'),
    fs = require('fs'),
    nodeFs = require('node-fs'),
    fsUtil = require('./lib/fs-util'),
    path = require('path'),
    _ = require('underscore'),
    me = module.exports,
    defaultInterpolate = _.templateSettings.interpolate,
    defaultEvaluate = _.templateSettings.evaluate;

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string'); // => true

me.template = function(template, dataOrFile) {
    var q = Q.defer(),
        data;

    fsUtil.readFileOrReturnData(dataOrFile)
        .then(function onDataRead(content) {
            if (typeof content === 'string') {
                data = JSON.parse(content);
            } else {
                data = content;
            }
            return fsUtil.readFileOrReturnData(template);
        })
        .then(function onTemplateRead(template) {
            return me.process(template, data);
        })
        .then(function onProcessed(result) {
            q.resolve(result);
        }).fail(function onReadFileError(error) {
            q.reject(error);
        });

    return q.promise;
};

me.process = function(templateString, data) {
    var q = Q.defer(),
        result;

    try {
        result = _.template(templateString, data);
        q.resolve(result);
    } catch (exception) {
        q.reject(exception);
    }
    return q.promise;
};

me.write = function(file, content, options) {
    var q = Q.defer(),
        filePath = path.dirname(file);

    Q.nfcall(fs.stat, filePath)
        .then(createFile(file, content))
        .catch(function(error) {
            if (error.code === 'ENOENT' && options && options.force) {
                //path doesn't exist and should be created
                Q.nfcall(nodeFs.mkdir, filePath, 0777, true)
                    .then(function() {
                        return createFile(file, content);
                    });
            } 
            q.reject(error);
        });

    return q.promise;
};

function createFile(pathName, content) {
    var q = Q.defer();

    Q.nfcall(fs.writeFile, pathName, content)
        .then(function() {
            console.log('created file;' + pathName);
            q.resolve();
        })
        .catch(function(error) {
            console.log('file not created;' + error);
            q.reject(error);
        });

    return q.promise;
}

me.loadCustomScript = function(fileName) {
    global._custom = require(fileName);
};

me.setDelimiter = function(startDelimiter, endDelimiter) {
    var evaluate, interpolate;
    endDelimiter = endDelimiter || startDelimiter;

    evaluate = new RegExp(startDelimiter + "(.+?)" + endDelimiter, "g");
    interpolate = new RegExp(startDelimiter + "=(.+?)" + endDelimiter, "g");
    setTemplateSettings(evaluate, interpolate);
};

me.restoreDelimiter = function() {
    setTemplateSettings(defaultEvaluate, defaultInterpolate);
};

function setTemplateSettings(evaluate, interpolate) {
    _.templateSettings = {
        evaluate: evaluate,
        interpolate: interpolate
    };
}
