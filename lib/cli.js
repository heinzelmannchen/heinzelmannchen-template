var program = require('commander'),
    winston = require('winston'),
    heinzel = require('..'),
    me = module.exports;

me.start = function(argv) {
    me.setup();
    program.parse(argv);
    me.run();
};

me.setup = function() {
    program
        .description('processes a template with the given data')
        .usage('-t [template] -j [dataFile]')
        .option('-t, --template [value]', 'the template')
        .option('-j, --json [value]', 'a json-file containing the data')
        .option('-s, --script [value]', 'load a custom js-script, to use in a templat under the global _custom')
        .option('-o, --output [value]', 'output filename')
        .option('-e, --encoding [value]', 'encoding of the files', 'utf-8')
        .option('-l, --delimiter [value]', 'template delimiter')
        .option('-s, --silent', 'no console output')
        .option('-f, --force', 'create folders if not existing')
        .option('-d, --dry-run', 'don\'t create files')
        .option('-D, --debug', 'print error object')
        .option('-T, --trace', 'print stacktrace')
        .version('0.0.1');
    winston.cli();
};

me.run = function() {
    if (program.silent) {
        winston.clear();
    }

    if (program.delimiter) {
        heinzel.setDelimiter(program.delimiter);
    }

    if (program.script) {
        heinzel.loadCustomScript(program.script);
    }

    if (program.template && program.json) {
        me.process();
    } else {
        program.help();
    }
};

me.process = function() {
    if (program.dryRun) {
        winston.warn('THIS IS A DRY RUN');
    }
    winston.info('The heinzelmännchen started working...');
    heinzel.template(program.template, program.json)
        .then(function(result) {
            var options = {
                override: program.force ||  false,
                ensureDirExists: program.force ||  false,
                dryRun: program.dryRun ||  false,
                data: heinzel.getData()
            };
            winston.data('Template: ', program.template);
            winston.data('Data: ', program.json);
            winston.data('Ouput: ', program.output || 'stdout');
            if (program.debug) {
                winston.data(result);
            }
            if (program.output) {
                return heinzel.write(program.output, result, options);
            } else {
                winston.data(result);
                return;
            }
        })
        .then(finished)
        .fail(onFail);
};

function finished(path) {
    if (path) {
        winston.info('File writen to: ', path);
    }
    winston.info('Successfull!');
    if (program.dryRun) {
        winston.warn('THIS WAS A DRY RUN');
        winston.warn('nothing has been writen');
    }
}

function onFail(error) {
    winston.error('Processing template failed!');
    winston.error('Message: ' + error.message);
    if (program.debug) {
        winston.data(error);
    }
    if (program.trace) {
        console.trace();
    }
}
