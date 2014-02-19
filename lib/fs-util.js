var Q = require('q'),
    fs = require('fs'),
    readOptions = {
        encoding: 'utf-8'
    },
    me = module.exports;

me.readFileOrReturnData = function(fileName, theReadOptions) {
    var q = Q.defer();
    readOptions = theReadOptions || readOptions;

    if (isFile(fileName)) {
        Q.nfcall(fs.readFile, fileName, readOptions)
            .then(function(result) {
                q.resolve(result);
            })
            .fail(function(error) {
                q.reject(error);
            });
    } else {
        if (typeof fileName !== 'string') {
            q.resolve(fileName);
        } else {
            q.reject(new Error("no such file"));
        }
    }

    return q.promise;
};


function isFile(potentialFile) {
    var lstat;
    if (typeof potentialFile === 'string') {
        try {
            lstat = fs.lstatSync(potentialFile);
        } catch (exception) {
            return false;
        }
        if (lstat) {
            if (lstat.isFile()) {
                return true;
            }
        }
    }
    return false;
}
