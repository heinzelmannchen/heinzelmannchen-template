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
        afterEach(function() {
            heinzelTemplate.eventEmitter.removeAllListeners();
        });

        it('should process the template', function(done) {
            var template = '<%= heinzel %>',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.onProcessed(function(result) {
                result.should.equal('Berti');
                done();
            });
            heinzelTemplate.process(template, data);
        });

        it('should process the template and execute the JS', function(done) {
            var template = '<%= heinzel.toUpperCase() %>',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.onProcessed(function(result) {
                result.should.equal('BERTI');
                done();
            });
            heinzelTemplate.process(template, data);
        });

        it('should throw an error if the template could not be parsed', function(done) {
            var template = '<%= heinzel.toUpperCase() %>',
                data = {
                    notValid: 'Berti'
                };

            heinzelTemplate.onProcessError(function(error) {
                error.should.be.ok;
                done();
            });
            heinzelTemplate.process(template, data);
        });
    });

    describe.skip('process template file', function() {
    });
});
