#!/usr/bin/env node

var program = require('commander'),
    heinzel = require('./heinzel-template');

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
    heinzel.template(program.template, program.json)
        .then(function(result) {
            console.log(result);
        }).fail(onFail);
}

function onFail(error) {
    console.error(error);
    if (program.debug) {
        console.trace();
    }
}
