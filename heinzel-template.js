var Q = require('q'),
    fs = require('fs'),
    _ = require('underscore'),
    READ_OPTIONS = {
        encoding: 'utf-8'
    },
    me = module.exports,
    defaultInterpolate = _.templateSettings.interpolate,
    defaultEvaluate = _.templateSettings.evaluate;

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string'); // => true

me.readFile = function(fileName) {
    var q = Q.defer();
    Q.nfcall(fs.readFile, fileName, READ_OPTIONS)
        .then(function(result) {
            q.resolve(result);
        })
        .fail(function(error) {
            q.reject(error);
        });

    return q.promise;
};

me.processFile = function(templateFileName, data) {
    var q = Q.defer();

    me.readFile(templateFileName, READ_OPTIONS)
        .then(function onReadFile(content) {
            return me.process(content, data)
        })
        .then(function onProcessed(result) {
            q.resolve(result);
        }).fail(function onReadFileError(error) {
            q.reject(error);
        });

    return q.promise;
};

me.process = function(template, data) {
    var q = Q.defer(),
        result;

    try {
        result = _.template(template, data);
        q.resolve(result);
    } catch (exception) {
        q.reject(exception);
    }

    return q.promise;
};

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
