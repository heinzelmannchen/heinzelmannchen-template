var mock = require('mockery'),
    mockFs = require('mock-fs'),
    fsUtil = require('heinzelmannchen-fs'),
    heinzelTemplate = require('../heinzel-template');
require('mocha-as-promised')();

describe('Template', function() {
    describe('#process', function() {
        it('should process the template', function() {
            var template = '<%= heinzel %>',
                data = {
                    heinzel: 'Berti'
                };

            return heinzelTemplate.process(template, data).should.become('Berti');
        });

        it('should process the template and execute the JS', function() {
            var template = '<%= heinzel.toUpperCase() %>',
                data = {
                    heinzel: 'Berti'
                };

            return heinzelTemplate.process(template, data).should.become('BERTI');
        });

        it('should throw an error if the template could not be parsed', function() {
            var template = '<%= heinzel.toUpperCase() %>',
                data = {
                    notValid: 'Berti'
                };

            return heinzelTemplate.process(template, data).should.be.rejected;
        });

        it('should be possible to use _.str in the templates', function() {
            var template = '<%= _.str.camelize(heinzel) %>',
                data = {
                    heinzel: 'berti-heinzel'
                };

            return heinzelTemplate.process(template, data).should.become('bertiHeinzel');
        });

        it('should be possible to use custom js-functions in the template', function() {
            var template = 'if (<% function echo(text) { return text + text; } %><%= echo(heinzel)%>) { console.log("graue Mütze") }',
                data = {
                    heinzel: 'Anton'
                };

            return heinzelTemplate.process(template, data).should.become('if (AntonAnton) { console.log("graue Mütze") }');
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

        it('should be possible to use custom js-functions from a script', function() {
            var template = '<%= _custom.initials(heinzel) %>',
                data = {
                    heinzel: 'Anton'
                };

            heinzelTemplate.loadCustomScript('./custom/script');
            global._custom.should.have.property('initials');
            return heinzelTemplate.process(template, data).should.become('A');
        });

        after(function() {
            heinzelTemplate.restoreDelimiter();
        });
        it('should be possible to change the delimiters', function() {
            var template = '&&if(heinzel == "Berti") heinzel = "Anton";&&&&=heinzel&&',
                data = {
                    heinzel: 'Berti'
                };

            heinzelTemplate.setDelimiter('&&');
            return heinzelTemplate.process(template, data).should.become('Anton');
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

        it('should process the template from a file', function() {
            return heinzelTemplate.template('foo/bar.tpl', {
                heinzel: 'Anton'
            }).should.become('hello Anton');
        });

        it('should process the template from a file and the data from a json', function() {
            return heinzelTemplate.template('foo/bar.tpl', 'foo/bar.json').should.become('hello Conni');
        });

        it('should have stored the read jsondata in a object', function() {
            return heinzelTemplate.template('foo/bar.tpl', 'foo/bar.json')
                .then(function() {
                    heinzelTemplate.getData().should.be.like({
                        heinzel: 'Conni'
                    });
                });
        });

        it('should throw an error if the file doesn\'t exist', function() {
            return heinzelTemplate.template('foo/notValid.tpl', {
                heinzel: 'Anton'
            }).should.be.rejected;
        });

        it('should throw an error if the template is broken', function() {
            return heinzelTemplate.template('foo/broken.tpl', {
                heinzel: 'Anton'
            }).should.be.rejected;
        });
    });

    describe('write processed template', function() {
        beforeEach(function() {
            mockFs({
                'foo': {
                    'existing.json': '{ heinzel: \'Conni\' }',
                    'Fritzchen': {}
                }
            });
        });

        afterEach(function() {
            mockFs.restore();
        });

        it('should write a string into a new file', function() {
            return heinzelTemplate.write('foo/newFile.json', 'write me').should.be.fulfilled;
        });

        it('should write to a existing file if override is set', function() {
            return heinzelTemplate.write('foo/existing.json', 'new content', {
                override: true
            }).then(function() {
                return fsUtil.readFileOrReturnData('foo/existing.json');
            }).should.become('new content');
        });

        it('should fail if the file already exists', function() {
            return heinzelTemplate.write('foo/newFile.json', 'write me')
                .then(function() {
                    return fsUtil.readFileOrReturnData('foo/newFile.json');
                }).should.become('write me');
        });

        it('should fail if directory doesn\'t exist', function() {
            return heinzelTemplate.write('foo/nothere/newFile.json', 'write me').should.be.rejected;
        });

        it('should fail if no filename is passed.', function() {
            return heinzelTemplate.write(null, 'write me').should.be.rejected;
        });

        it('should create directory if force option is used', function() {
            return heinzelTemplate.write('foo/bar/newFile.json', 'write me', {
                force: true
            }).then(function() {
                return fsUtil.readFileOrReturnData('foo/bar/newFile.json');
            }).should.become('write me');
        });

        it('should have a dryrun option', function() {
            return heinzelTemplate.write('foo/bar/newFile.json', 'write me', {
                force: true,
                dryRun: true
            }).then(function() {
                return fsUtil.readFileOrReturnData('foo/bar/newFile.json');
            }).should.be.rejected;
        });

        it('should resolve path variables', function() {
            var filePathTemplate = 'foo/<%= heinzel %>/newFile.json',
                data = {
                    heinzel: 'Fritzchen'
                },
                options = {
                    data: data,
                    force: true
                },
                content = 'write me';

            return heinzelTemplate.write(filePathTemplate, content, options).should.become('foo/Fritzchen/newFile.json');
        });
    });
});
