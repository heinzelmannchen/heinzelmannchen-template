#!/usr/bin/env node

var program = require('commander'),
    winston = require('winston'),
    heinzel = require('./heinzel-template');
program
    .description('processes a template with the given data')
    .usage('-t [template] -j [dataFile]')
    .option('-t, --template [value]', 'the template')
    .option('-j, --json [value]', 'a json-file containing the data')
    .option('-o, --output [value]', 'output filename')
    .option('-e, --encoding [value]', 'encoding of the files', 'utf-8')
    .option('-s, --silent', 'no console output')
    .option('-f, --force', 'create folders if not existing')
    .option('-d, --dry-run', 'don\'t create files')
    .option('-D, --debug', 'print error object')
    .option('-T, --trace', 'print stacktrace')
    .version('0.0.1');

program.parse(process.argv);

winston.cli();
if (program.silent) {
    winston.clear();
}

if (program.template && program.json) {
    run();
} else {
    program.help();
}

function run() {
    if (program.dryRun) {
        winston.warn('THIS IS A DRY RUN');
    }
    winston.info('The heinzelmännchen started working...');
    heinzel.template(program.template, program.json)
        .then(function(result) {
            var options = {
                force: program.force ||  false,
                dryRun: program.dryRun ||  false,
                data: heinzel.getData()
            };
            winston.data('Template: ', program.template);
            winston.data('Data: ', program.json);
            winston.data('Ouput: ', program.output);
            if (program.debug) {
                winston.data(result);
            }
            if (program.output) {
                return heinzel.write(program.output, result, options);
            } else {
                return;
            }
        })
        .then(finished)
        .fail(onFail);
}

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
