var Q = require('q'),
    fs = require('fs'),
    fsUtil = require('heinzelmannchen-fs'),
    path = require('path'),
    _ = require('underscore'),
    me = module.exports,
    defaultInterpolate = _.templateSettings.interpolate,
    defaultEvaluate = _.templateSettings.evaluate,
    data;

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string'); // => true

me.template = function(template, dataOrFile) {
    var q = Q.defer();

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
        templateData = data || {},
        result;

    try {
        result = _.template(templateString, templateData);
        q.resolve(result);
    } catch (exception) {
        q.reject(exception);
    }
    return q.promise;
};

me.write = function(file, content, options) {
    var q = Q.defer(),
        options = options || {},
        filePath,
        filePathAndName;

    me.process(file, options.data)
        .then(function onPathVariablesProcessed(processedPath) {
            filePathAndName = processedPath;
            filePath = path.dirname(filePathAndName);
            if (options.dryRun) {
                q.resolve(filePathAndName);
            } else {
                return fsUtil.enurePathExists(filePath, options.force);
            }
        })
        .then(function onPathExists() {
            if (options.override) {
                return fsUtil.removeFile(filePathAndName); 
            } else {
                return q.promise;
            }
        })
        .then(function () {
            return fsUtil.createFile(filePathAndName, content);
        })
        .then(function onFileCreated() {
            q.resolve(filePathAndName);
        })
        .fail(function onError(error) {
            q.reject(error);
        });

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

me.getData = function() {
    return data;
}

function setTemplateSettings(evaluate, interpolate) {
    _.templateSettings = {
        evaluate: evaluate,
        interpolate: interpolate
    };
}
