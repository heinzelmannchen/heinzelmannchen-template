var fsUtil = require('../lib/fs-util'),
    should = require('should'),
    mockFs = require('mock-fs');

describe('lib/fs-util', function() {
    beforeEach(function() {
        mockFs({
            'foo': {
                'bar.tpl': 'hello Edi'
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
});
