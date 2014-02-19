#!/usr/bin/env node

var program = require('commander'),
    winston = require('winston'),
    heinzel = require('./heinzel-template');
winston.cli();
program
    .description('processes a template with the given data')
    .usage('-t [template] -j [dataFile]')
    .option('-t, --template [value]', 'the template')
    .option('-j, --json [value]', 'a json-file containing the data')
    .option('-o, --output [value]', 'output filename')
    .option('-e, --encoding [value]', 'encoding of the files', 'utf-8')
    .option('-d, --debug', 'print stacktrace')
    .version('0.0.1');

program.parse(process.argv);

if (program.template && program.json) {
    run();
} else {
    program.help();
}

function run() {
    winston.info('The heinzelmännchen started working...');
    heinzel.template(program.template, program.json)
        .then(function(result) {
            winston.data(result);
            winston.info('Successfull!');
        }).fail(onFail);
}

function onFail(error) {
    winston.error('Processing template failed!');
    winston.error('Message: ' + error.message);
    if (program.debug) {
        winston.data(error);
    }
}
