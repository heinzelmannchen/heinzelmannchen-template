var events = require('events'),
    fs = require('fs'),
    _ = require('underscore'),
    ON_READ_FILE = 'readFile',
    ON_PROCESSED = 'processed',
    ON_ERROR = 'error',
    READ_OPTIONS = {
        encoding: 'utf-8'
    },
    me = module.exports;

me.eventEmitter = new events.EventEmitter();

me.readFile = function (fileName) {

    fs.readFile(fileName, READ_OPTIONS, function (err, data) {
        if (err) {
            me.eventEmitter.emit(ON_ERROR, err);
        } else {
            me.eventEmitter.emit(ON_READ_FILE, data);
        }
    });
};

me.onceReadFile = function (callback) {
    me.eventEmitter.once(ON_READ_FILE, callback);
};

me.onReadFile = function (callback) {
    me.eventEmitter.on(ON_READ_FILE, callback);
};

me.processFile = function (templateFileName, data) {
    me.onceReadFile(function (content) {
        me.process(content, data);
    });
    me.readFile(templateFileName, READ_OPTIONS);
};

me.process = function (template, data) {
    var result;
    try {
        result = _.template(template, data);
        me.eventEmitter.emit(ON_PROCESSED, result);
    } catch (exception) {
        me.eventEmitter.emit(ON_ERROR, exception);
    }
};

me.onProcessed = function (callback) {
    me.eventEmitter.on(ON_PROCESSED, callback);
};

me.onError = function (callback) {
    me.eventEmitter.on(ON_ERROR, callback);
};
