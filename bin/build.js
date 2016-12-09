#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var unexpectedPresentation = require('../index');

var options = argv
options.presentation = argv._[0]

function printUsage () {
    console.log([
        'Usage:',
        'unexpected-presentation [--require setup.js] presentation.md',
        '',
        'Options:',
        ' --require file: require a file to setup the environment',
        ' -h or --help: show this help'
    ].join('\n'))
}

if (!options.presentation) {
    printUsage()
    process.exit(1)
} else if (options.h || options.help) {
    printUsage()
} else {
    unexpectedPresentation.build(argv)
}
