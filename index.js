/*global unexpected*/
var path = require('path')
var fs = require('fs')
var async = require('async')
var ncp = require('ncp')
var rmdir = require('rmdir')
var UnexpectedMarkdown = require('unexpected-markdown')

var noteRegex = /Note:([^]*?)\n\n/mg;

function createExpect(options) {
    if (typeof unexpected !== 'undefined') {
        return unexpected.clone();
    }

    return require('unexpected').clone();
}

module.exports = {
    build: function (options) {
        var presentation = options.presentation
        var directory = path.dirname(presentation)
        var destination = path.join(directory, 'build')

        if (options.require) {
            var moduleName = options.require;
            if (/^[\.\/]/.test(moduleName)) {
                moduleName = path.resolve(process.cwd(), moduleName);
            }
            require(moduleName);
        }


        async.waterfall([
            function (cb) {
                fs.stat(destination, function (err, stats) {
                    if (!err && stats.isDirectory()) {
                        rmdir(destination, function (err, dirs, files) {
                            fs.mkdir(destination, cb)
                        })
                    } else {
                        fs.mkdir(destination, cb)
                    }
                })
            },
            function (cb) {
                ncp(
                    path.join(directory, 'assets'),
                    path.join(destination, 'assets'),
                    { dereference: true },
                    cb
                );
            },
            function (cb) {
                ncp(
                    path.join(__dirname, 'static'),
                    path.join(destination, 'static'),
                    { dereference: true },
                    cb
                );
            },
            function (cb) {
                fs.readFile(presentation, 'utf8', cb);
            },
            function (content, cb) {
                cb(
                    null,
                    content
                        .replace(/^===$/gm, '<!-- section -->')
                        .replace(/^---$/gm, '<!-- slide -->')
                );
            },
            function (content, cb) {
                cb(
                    null,
                    content.replace(noteRegex, function ($0, $1) {
                        return '<!-- note start -->\n' + $1.trim() + '\n<!-- note end -->\n\n\n';
                    })
                );
            },
            function (content, cb) {
                new UnexpectedMarkdown(content).toHtml({
                    expect: createExpect(options)
                }, cb);
            },
            function (content, cb) {
                cb(
                    null,
                    content
                        .replace(/<!-- note start -->/g, '<aside class="notes">')
                        .replace(/<!-- note end -->/g, '</aside>')
                )
            },
            function (content, cb) {
                cb(
                    null,
                    content.split(/<!-- section -->/gm).map(function (section, i) {
                        return (
                            '<section class="section" id="section-' + i + '">' +
                            section.split(/<!-- slide -->/gm).map(function (slide, j) {
                                var backgroundAttribute = ''

                                slide = slide.replace(/<!-- background: "(.*?)" -->/g, function ($0, $1) {
                                    backgroundAttribute = ' data-background="' + $1 + '"'
                                    return ''
                                })

                                return (
                                    '<section class="slide" id="slide-' + i + '-' + j + '"' + backgroundAttribute + '>' +
                                    slide +
                                    '</section>'
                                )
                            }).join('') +
                            '</section>'
                        )
                    }).join('')
                )
            },
            function (content, cb) {
                cb(
                    null,
                    '<!DOCTYPE html>' +
                    '<html>' +
                    '<head>' +
                    '<title>Presentation</title>' +
                    '<meta charset="utf-8">' +
                    '<link href="./static/normalize.css" rel="stylesheet" type="text/css">' +
                    '<link href="./static/base.css" rel="stylesheet" type="text/css">' +
                    '</head>' +
                    '<body>' +
                    '<article>' +
                    content +
                    '</article>' +
                    '<script src="./static/vanilla-touchwipe.js"></script>' +
                    '<script src="./static/presentation.js"></script>' +
                    '</body>' +
                    '</html>'
                )
            },
            function (content, cb) {
                fs.writeFile(path.join(destination, 'index.html'), content, cb)
            },
            function (cb) {
                fs.writeFile(path.join(destination, '.nojekyll'), '', cb)
            }
        ], function (err, result) {
            if (err) {
                console.error(err);
            }
        })
    }
};
