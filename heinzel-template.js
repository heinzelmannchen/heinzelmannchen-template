var events = require('events'),
    fs = require('fs'),
    heinzelTemplate = module.exports,
    ON_READ_FILE = 'readFile',
    ON_READ_FILE_ERROR = 'readFileError';

heinzelTemplate.eventEmitter = new events.EventEmitter();

heinzelTemplate.readFile = function(fileName) {
    var options = {
        encoding : 'utf-8'
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
