var Q = require('q'),
    fs = require('fs'),
    _ = require('underscore'),
    READ_OPTIONS = {
        encoding: 'utf-8'
    },
    me = module.exports,
    defaultInterpolate = _.templateSettings.interpolate;

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string'); // => true

me.readFile = function(fileName) {
    var q = Q.defer();
    fs.readFile(fileName, READ_OPTIONS, function(error, data) {
        if (error) {
            q.reject(error);
        } else {
            q.resolve(data);
        }
    });

    return q.promise;
};

me.processFile = function(templateFileName, data) {
    var q = Q.defer();

    me.readFile(templateFileName, READ_OPTIONS)
        .then(function onReadFile(content) {
            me.process(content, data)
                .then(function onProcessed(result) {
                    q.resolve(result);
                }).fail(function onReadFileError(error) {
                    q.reject(error);
                });
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

me.setDelimiter = function(startDelimiter, endDelimiter) {
    endDelimiter = endDelimiter || startDelimiter;

    _.templateSettings = {
        interpolate: new RegExp(startDelimiter + "(.+?)" + endDelimiter, "g")
    };
};

me.restoreDelimiter = function() {
    _.templateSettings = {
        interpolate: defaultInterpolate
    };
};
