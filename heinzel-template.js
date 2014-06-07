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
    return exists(template)
        .then(function(packagePath) {
            template = packagePath;
            return exists(dataOrFile);
        })
        .then(function(dataPathOrData) {
            return me.template(template, dataPathOrData);
        });
};

function exists(module) {
    var q = Q.defer(),
        packagePath;
    try {
        packagePath = require.resolve(module);
        q.resolve(packagePath);
    } catch (error) {
        q.resolve(module);
    }
    return q.promise;
}

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
                return fsUtil.ensurePathExists(filePath, options.ensurePathExists);
            }
        })
        .then(function() {
            return fsUtil.createFile(filePathAndName, content, options);
        })
        .then(function onFileCreated() {
            q.resolve(filePathAndName);
        })
        .fail(onFail(q));

    return q.promise;
};

me.loadCustomScript = function(fileName) {
    global._custom = require(process.cwd() + '/' + fileName);
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
