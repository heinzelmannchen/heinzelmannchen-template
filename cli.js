#!/usr/bin/env node

var program = require('commander'),
    heinzel = require('./heinzel-template');

program
    .description('processes a template with the given data')
    .usage('-t [template] -j [dataFile]')
    .option('-t, --template [value]', 'the template')
    .option('-j, --json [value]', 'a json-file containing the data')
    .option('-o, --output [value]', 'output filename')
    .option('-d, --debug', 'print stacktrace')
    .version('0.0.1');

program.parse(process.argv);

if (program.template && program.json) {
    run();
} else {
    program.help();
}

function run() {
    heinzel.readFile(program.json, {
        charset: 'utf-8'
    })
        .then(function onReadFile(content) {
            return heinzel.processFile(program.template, JSON.parse(content));
        })
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
