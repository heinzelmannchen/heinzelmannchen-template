var should = require('should'),
    mockFs = require('mock-fs'),
    heinzelTemplate = require('../heinzel-template');

describe('Template', function() {
    describe('read file', function() {
        beforeEach(function() {
            mockFs({
                'foo' : {
                    'bar.tpl': 'hello heinzelmännchen'
                }
            });
        });

        afterEach(function() {
            heinzelTemplate.eventEmitter.removeAllListeners();
            mockFs.restore();
        });

        it('should emit a event on read file', function(done) {
            heinzelTemplate.onReadFile(function() {
                done();
            });
            heinzelTemplate.readFile('foo/bar.tpl');
        });

        it('should read "hello heinzelmännchen"', function(done) {
            heinzelTemplate.onReadFile(function(data) {
                data.should.equal('hello heinzelmännchen');
                done();
            });
            heinzelTemplate.readFile('foo/bar.tpl');
        });

        it('should throw an error if file doesn\'t exist', function(done) {
            heinzelTemplate.onReadFileError(function(error) {
                error.should.be.ok;
                done();
            });
            heinzelTemplate.readFile('not/existing.tpl');
        });
    });

    describe('process template', function() {
        it('should process the template', function(done) {
            var template = '<%= berti %>';
        });
    });
});
