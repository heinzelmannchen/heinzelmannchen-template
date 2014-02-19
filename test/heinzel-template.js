var should = require('should'),
    mock = require('mockery'),
    mockFs = require('mock-fs'),
    heinzelTemplate = require('../heinzel-template');

describe('Template', function() {
    describe('process template', function() {
        it('should process the template', function(done) {
            var template = '<%= heinzel %>',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.process(template, data)
                .then(resultShouldBe('Berti', done));
        });

        it('should process the template and execute the JS', function(done) {
            var template = '<%= heinzel.toUpperCase() %>',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.process(template, data)
                .then(resultShouldBe('BERTI', done));
        });

        it('should throw an error if the template could not be parsed', function(done) {
            var template = '<%= heinzel.toUpperCase() %>',
                data = {
                    notValid: 'Berti'
                };

            heinzelTemplate.process(template, data)
                .fail(shouldBeCalled(done));
        });

        it('should be possible to use _.str in the templates', function(done) {
            var template = '<%= _.str.camelize(heinzel) %>',
                data = {
                    heinzel: 'berti-heinzel'
                };

            heinzelTemplate.process(template, data)
                .then(resultShouldBe('bertiHeinzel', done));
        });

        it('should be possible to use custom js-functions in the template', function(done) {
            var template = 'if (<% function echo(text) { return text + text; } %><%= echo(heinzel)%>) { console.log("graue Mütze") }',
                data = {
                    heinzel: 'Anton'
                };

            heinzelTemplate.process(template, data)
                .then(resultShouldBe('if (AntonAnton) { console.log("graue Mütze") }', done));
        });

        before(function() {
            mock.enable();
            var mockFunction = {
                initials: function(name) {
                    return name[0];
                }
            };
            mock.registerMock('./custom/script', mockFunction);
        });

        after(function() {
            mock.disable();
        });

        it('should be possible to use custom js-functions from a script', function(done) {
            var template = '<%= _custom.initials(heinzel) %>',
                data = {
                    heinzel: 'Anton'
                };

            heinzelTemplate.loadCustomScript('./custom/script');
            global._custom.should.have.property('initials');
            heinzelTemplate.process(template, data)
                .then(resultShouldBe('A', done));
        });

        after(function() {
            heinzelTemplate.restoreDelimiter();
        });
        it('should be possible to change the delimiters', function(done) {
            var template = '&&if(heinzel == "Berti") heinzel = "Anton";&&&&=heinzel&&',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.setDelimiter('&&');
            heinzelTemplate.process(template, data)
                .then(resultShouldBe('Anton', done));
        });
    });

    describe('process template file', function() {
        beforeEach(function() {
            mockFs({
                'foo': {
                    'bar.tpl': 'hello <%= heinzel %>',
                    'bar.json': '{ "heinzel": "Conni" }',
                    'broken.tpl': 'hello <%= notValid %>'
                }
            });
        });

        afterEach(function() {
            mockFs.restore();
        });

        it('should process the template from a file', function(done) {
            heinzelTemplate.template('foo/bar.tpl', {
                heinzel: 'Anton'
            }).then(resultShouldBe('hello Anton', done));
        });

        it('should process the template from a file and the data from a json', function(done) {
            heinzelTemplate.template('foo/bar.tpl', 'foo/bar.json')
                .then(resultShouldBe('hello Conni', done));
        });

        it('should throw an error if the file doesn\'t exist', function(done) {
            heinzelTemplate.template('foo/notValid.tpl', {
                heinzel: 'Anton'
            }).fail(shouldBeCalled(done));
        });

        it('should throw an error if the template is broken', function(done) {
            heinzelTemplate.template('foo/broken.tpl', {
                heinzel: 'Anton'
            }).fail(shouldBeCalled(done));
        });
    });

    function resultShouldBe(expected, done) {
        return function(result) {
            result.should.equal(expected);
            done();
        }
    }

    function shouldBeCalled(done) {
        return function(result) {
            result.should.be.ok;
            done();
        }
    }
});
