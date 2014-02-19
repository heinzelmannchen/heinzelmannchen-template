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
    describe('#isFile', function() {
        beforeEach(function() {
            mockFs({
                'foo': {
                    'bar.tpl': 'hello Edi'
                }
            });
        });

        it('should return true if it is a file', function() {
            fsUtil.isFile('foo/bar.tpl').should.be.ok;
        });

        it('should return false if it is not a file', function() {
            fsUtil.isFile('not/existing.tpl').should.be.not.ok;
            fsUtil.isFile(1).should.be.not.ok;
            fsUtil.isFile().should.be.not.ok;
        });
    });
});
