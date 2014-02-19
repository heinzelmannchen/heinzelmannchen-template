var Q = require('q'),
    fs = require('fs'),
    readOptions = {
        encoding: 'utf-8'
    },
    me = module.exports;

me.readFileOrReturnData = function(fileOrObject, theReadOptions) {
    var q = Q.defer();
    readOptions = theReadOptions ||  readOptions;

    if (typeof fileOrObject === 'object') {
        q.resolve(fileOrObject);
    }

    Q.nfcall(fs.readFile, fileOrObject, readOptions)
        .then(function(result) {
            q.resolve(result);
        })
        .fail(function(error) {
            q.reject(error);
        });

    return q.promise;
};
