var Q = require('q'),
    fsUtil = require('heinzelmannchen-fs'),
    path = require('path'),
    _ = require('underscore'),
    me = module.exports,
    defaultInterpolate = _.templateSettings.interpolate,
    defaultEvaluate = _.templateSettings.evaluate,
    data;

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

me.template = function(template, dataOrFile) {
    return fsUtil.readFileOrReturnData(dataOrFile)
        .then(function onDataRead(content) {
            data = parseJson(content);
            return fsUtil.readFileOrReturnData(template);
        })
        .then(function onTemplateRead(template) {
            return me.process(template, data);
        });
};

me.templateFromNpm = function(template, dataOrFile) {
    var q = Q.defer(),
        packagePath;

    try {
        packagePath = require.resolve(template);
    } catch (error) {
        q.reject(error);
    }

    me.template(packagePath, dataOrFile)
        .then(function(data){
            q.resolve(data);
        });

    return q.promise;
};

me.process = function(templateString, data) {
    var templateData = data || {};

    return Q.fcall(_.template, templateString, templateData);
};

me.write = function(file, content, options) {
    var q = Q.defer(),
        filePathAndName;
    options = options || {};

    me.process(file, options.data)
        .then(function onPathVariablesProcessed(processedPath) {
            var filePath = path.dirname(processedPath);
            filePathAndName = processedPath;

            if (options.dryRun) {
                q.resolve(filePathAndName);
            } else {
                return fsUtil.ensurePathExists(filePath, options.force);
            }
        })
        .then(function onPathExists() {
            if (options.override)  {
                return fsUtil.removeFile(filePathAndName);
            } else {
                return;
            }
        })
        .then(function() {
            return fsUtil.createFile(filePathAndName, content);
        })
        .then(function onFileCreated() {
            q.resolve(filePathAndName);
        })
        .fail(onFail(q));

    return q.promise;
};

me.loadCustomScript = function(fileName) {
    global._custom = require(fileName);
};

me.setDelimiter = function(startDelimiter, endDelimiter) {
    var evaluate, interpolate;
    endDelimiter = endDelimiter || startDelimiter;

    evaluate = new RegExp(startDelimiter + '(.+?)' + endDelimiter, 'g');
    interpolate = new RegExp(startDelimiter + '=(.+?)' + endDelimiter, 'g');
    setTemplateSettings(evaluate, interpolate);
};

me.restoreDelimiter = function() {
    setTemplateSettings(defaultEvaluate, defaultInterpolate);
};

me.getData = function() {
    return data;
};

function setTemplateSettings(evaluate, interpolate) {
    _.templateSettings = {
        evaluate: evaluate,
        interpolate: interpolate
    };
}

function parseJson(content) {
    var data;
    if (typeof content === 'string') {
        data = JSON.parse(content);
    } else {
        data = content;
    }
    return data;
}

function onFail(q) {
    return function(error) {
        q.reject(error);
    };
}
