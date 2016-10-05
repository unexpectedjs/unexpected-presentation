var html = require("html");
var path = require('path')
var fs = require('fs')
var async = require('async')
var ncp = require('ncp')
var rmdir = require('rmdir')
var UnexpectedMarkdown = require('unexpected-markdown')

var noteRegex = /Note:([^]*?)\n\n/mg;

module.exports = {
    build: function (presentation) {
        var directory = path.dirname(presentation)
        var destination = path.join(directory, 'build')

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
                        return '<aside class="notes">' + $1.trim() + '</aside>\n\n\n';
                    })
                );
            },
            function (content, cb) {
                new UnexpectedMarkdown(content).toHtml({
                    expect: require('unexpected')
                }, cb);
            },
            function (content, cb) {
                cb(
                    null,
                    content.split(/<!-- section -->/gm).map(function (section, i) {
                        return (
                            '<section class="section" id="section-' + i + '">' +
                            section.split(/<!-- slide -->/gm).map(function (slide, j) {
                                return (
                                    '<section class="slide" id="slide-' + i + '-' + j + '">' +
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
                    '<script src="./static/presentation.js"></script>' +
                    '</body>' +
                    '<html>'
                )
            },
            function (content, cb) {
                cb(null, html.prettyPrint(content, {
                    indent_size: 2
                }));
            },
            function (content, cb) {
                fs.writeFile(path.join(destination, path.basename(presentation, '.md')) + '.html', content, cb)
            }
        ], function (err, result) {
            if (err) {
                console.error(err);
            }
        })
    }
};
