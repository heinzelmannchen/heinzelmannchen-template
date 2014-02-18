var should = require('should'),
    mockFs = require('mock-fs'),
    heinzelTemplate = require('../heinzel-template');

describe('Template', function() {
    describe('read file', function() {
        beforeEach(function() {
            mockFs({
                'foo': {
                    'bar.tpl': 'hello heinzelmännchen'
                }
            });
        });

        it('should emit a event on read file', function(done) {
            heinzelTemplate.readFile('foo/bar.tpl')
                .then(function() {
                    done();
                });
        });

        it('should read "hello heinzelmännchen"', function(done) {
            heinzelTemplate.readFile('foo/bar.tpl')
                .then(function(data) {
                    data.should.equal('hello heinzelmännchen');
                    done();
                });
        });

        it('should throw an error if file doesn\'t exist', function(done) {
            heinzelTemplate.readFile('not/existing.tpl')
                .fail(function(error) {
                    error.should.be.ok;
                    done();
                });
        });
    });

    describe('process template', function() {
        it('should process the template', function(done) {
            var template = '<%= heinzel %>',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.process(template, data)
                .then(function(result) {
                    result.should.equal('Berti');
                    done();
                });
        });

        it('should process the template and execute the JS', function(done) {
            var template = '<%= heinzel.toUpperCase() %>',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.process(template, data)
                .then(function(result) {
                    result.should.equal('BERTI');
                    done();
                });
        });

        it('should throw an error if the template could not be parsed', function(done) {
            var template = '<%= heinzel.toUpperCase() %>',
                data = {
                    notValid: 'Berti'
                };

            heinzelTemplate.process(template, data)
                .fail(function(error) {
                    error.should.be.ok;
                    done();
                });
        });

        it('should be possible to use _.str in the templates', function(done) {
            var template = '<%= _.str.camelize(heinzel) %>',
                data = {
                    heinzel: 'berti-heinzel'
                };

            heinzelTemplate.process(template, data)
                .then(function(result) {
                    result.should.equal('bertiHeinzel');
                    done();
                });
        });

        after(function() {
            heinzelTemplate.restoreDelimiter();
        });
        it('should be possible to change the delimiters', function(done) {
            var template = '&& heinzel &&',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.setDelimiter('&&');
            heinzelTemplate.process(template, data)
                .then(function(result) {
                    result.should.equal('Berti');
                    done();
                });
        });
    });

    describe('process template file', function() {
        beforeEach(function() {
            mockFs({
                'foo': {
                    'bar.tpl': 'hello <%= heinzel %>',
                    'broken.tpl': 'hello <%= notValid %>'
                }
            });
        });

        afterEach(function() {
            mockFs.restore();
        });

        it('should process the template from a file', function(done) {
            heinzelTemplate.processFile('foo/bar.tpl', {
                heinzel: 'Anton'
            }).then(function(result) {
                result.should.equal('hello Anton');
                done();
            });
        });

        it('should throw an error if the file doesn\'t exist', function(done) {
            heinzelTemplate.processFile('foo/notValid.tpl', {
                heinzel: 'Anton'
            }).fail(function(error) {
                error.should.be.ok;
                done();
            });
        });

        it('should throw an error if the template is broken', function(done) {
            heinzelTemplate.processFile('foo/broken.tpl', {
                heinzel: 'Anton'
            }).fail(function(error) {
                error.should.be.ok;
                done();
            });
        });
    });
});
