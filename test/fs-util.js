var fsUtil = require('../lib/fs-util'),
    should = require('should'),
    mockFs = require('mock-fs');

describe('lib/fs-util', function() {
    describe('#readFileOrReturnData', function() {
        beforeEach(function() {
            mockFs({
                'foo': {
                    'bar.tpl': 'hello Edi',
                    'no.one' : {
                        mode: '000'
                    }
                }
            });
        });

        it('should read "hello Edi"', function(done) {
            fsUtil.readFileOrReturnData('foo/bar.tpl')
                .then(function(data) {
                    data.should.equal('hello Edi');
                    done();
                });
        });

        it('should throw an error if file doesn\'t exist', function(done) {
            fsUtil.readFileOrReturnData('not/existing.tpl')
                .fail(function(error) {
                    error.should.be.ok;
                    done();
                });
        });

        it('should fail if no permission', function(done) {
            fsUtil.readFileOrReturnData('foo/no.one')
                .fail(function(error) {
                    error.should.be.ok;
                    done();
                });
        });

        it('should return the object if not a file and typeof object', function(done) {
            fsUtil.readFileOrReturnData({
                foo: 'bar'
            }).then(function(obj) {
                obj.should.have.property('foo');
                done();
            });
        });
    });

    describe('#createFile', function() {
        beforeEach(function() {
            mockFs({
                'foo': {}
            });
        });

        it('should create a file', function(done) {
            fsUtil.createFile('foo/newFile.x', 'content')
                .then(function() {
                    return fsUtil.readFileOrReturnData('foo/newFile.x');
                }).then(function(readContent) {
                    readContent.should.equal('content');
                    done();
                });
        });

        it('should file if path doesn\'t exist', function(done) {
            fsUtil.createFile('foo/bar/newFile.x', 'content')
                .catch(function(error) {
                    error.should.be.ok;
                    done();
                });
        });
    });

    describe('#pathExists', function() {
        beforeEach(function() {
            mockFs({
                'foo/bar/test/file.x': {}
            });
        });

        it('should return true if paths exists', function(done) {
            fsUtil.pathExists('foo/bar/test')
                .then(function(exists) {
                    exists.should.equal(true);
                    done();
                });
        });

        it('should return false if path doesn\'t exst', function(done) {
            fsUtil.pathExists('foo/secret/bar')
                .then(function(exists) {
                    exists.should.equal(false);
                    done();
                });
        });
    });

});
