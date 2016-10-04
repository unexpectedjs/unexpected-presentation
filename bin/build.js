#!/usr/bin/env node

var unexpectedPresentation = require('../index');

unexpectedPresentation.build.apply(null, process.argv.slice(2))
