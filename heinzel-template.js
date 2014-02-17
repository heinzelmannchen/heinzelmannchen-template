var events = require('events'),
    fs = require('fs'),
    _ = require('underscore'),
    heinzelTemplate = module.exports,
    ON_READ_FILE = 'readFile',
    ON_READ_FILE_ERROR = 'readFileError',
    ON_PROCESSED = 'processed',
    ON_PROCESS_ERROR = 'processError';

heinzelTemplate.eventEmitter = new events.EventEmitter();

heinzelTemplate.readFile = function(fileName) {
    var options = {
        encoding: 'utf-8'
    };

    fs.readFile(fileName, options, function(err, data) {
        if (err) {
            heinzelTemplate.eventEmitter.emit(ON_READ_FILE_ERROR, err);
        } else {
            heinzelTemplate.eventEmitter.emit(ON_READ_FILE, data);
        }
    });
}

heinzelTemplate.onReadFile = function(callback) {
    heinzelTemplate.eventEmitter.on(ON_READ_FILE, callback);
}

heinzelTemplate.onReadFileError = function(callback) {
    heinzelTemplate.eventEmitter.on(ON_READ_FILE_ERROR, callback);
}

heinzelTemplate.process = function(template, data) {
    var result;
    try {
        result = _.template(template, data);
        heinzelTemplate.eventEmitter.emit(ON_PROCESSED, result);
    } catch (exception) {
        heinzelTemplate.eventEmitter.emit(ON_PROCESS_ERROR, exception);
    }
}

heinzelTemplate.onProcessed = function(callback) {
    heinzelTemplate.eventEmitter.on(ON_PROCESSED, callback);
}

heinzelTemplate.onProcessError = function(callback) {
    heinzelTemplate.eventEmitter.on(ON_PROCESS_ERROR, callback);
}
