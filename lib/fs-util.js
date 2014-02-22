var Q = require('q'),
    fs = require('fs'),
    nodeFs = require('node-fs'),
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

me.enurePathExists = function(path, createMissingFolders) {
    var q = Q.defer();

    me.pathExists(path)
        .then(function(exists) {
            if (exists) {
                q.resolve();
            } else if (createMissingFolders) {
                return Q.nfcall(nodeFs.mkdir, path, 0777, true);
            } else {
                q.reject('path doesn\'t exist');
            }
        })
        .then(function() {
            q.resolve();
        })
        .catch(function(error) {
            console.log(error);
            q.reject(error);
        });

    return q.promise;
};

me.pathExists = function(path) {
    var q = Q.defer();

     Q.nfcall(fs.stat, path)
        .then(function() {
             q.resolve(true);
         })
        .catch(function(error) {
            if (error.code === 'ENOENT') {
                q.resolve(false);
            } 
            q.reject(error);
        });

    return q.promise;
};

me.createFile = function(pathName, content) {
    var q = Q.defer();

    Q.nfcall(fs.writeFile, pathName, content)
        .then(function() {
            q.resolve();
        })
        .catch(function(error) {
            console.log('file not created:' + error);
            q.reject(error);
        });

    return q.promise;
};