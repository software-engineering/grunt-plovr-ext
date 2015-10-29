/*
 * grunt-plovr-extended
 * https://github.com/ITspirit/grunt-plovr-extended
 *
 * Copyright (c) 2014 Michael Frank
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var shell = require('shelljs'),
        path = require('path');

    grunt.registerMultiTask('plovr_extended', 'Grunt plugin wrapper for google closure tool plovr - includes all Features without the need of an external config File for Plovr', function () {

        // config filename - check if file already exists - if yes: delete them first
        var configfilename = 'plovr.config.js';

        if (grunt.file.exists(configfilename)) {
            grunt.file.delete(configfilename);
        }

        var configFileContent = '{\n',
            cwd,
            cd_cwd = '';


        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({});

        var options_ = '';
        var seperator = '';
        for (var key in options) {
            var switchkey = key.toLowerCase();
            switch (switchkey) {
                // String Input Values
                case "id":
                case "closure-library":
                case "mode":
                case "level":
                case "inherits":
                //case "output-file": ==> triggered via "dest" Files !
                case "output-charset":
                case "module-output-path":
                case "module-production-uri":
                case "module-info-path":
                case "global-scope-name":
                case "jsdoc-html-output-path":
                case "variable-map-input-file":
                case "variable-map-output-file":
                case "property-map-input-file":
                case "property-map-output-file":
                case "module-source-map-name":
                case "test-template":
                    if ((typeof options[key] == "string") && (options[key] !== null)) {
                        configFileContent += seperator + '"' + switchkey + '": "' + options[key] + '"';
                    } else {
                        grunt.fail.warn('Option "' + switchkey + '" is not type of string!');
                    }
                    break;
                // boolean Input Values
                case "custom-externs-only":
                case "debug":
                case "experimental-exclude-closure-library":
                case "pretty-print":
                case "print-input-delimiter":
                case "fingerprint":
                case "treat-warnings-as-errors":
                case "export-test-functions":
                case "ambiguate-properties":
                case "disambiguate-properties":
                case "add-sourcemap-url":
                    if ((typeof options[key] == "boolean") && (options[key] !== null)) {
                        configFileContent += seperator + '"' + switchkey + '": ' + options[key];
                    }
                    else {
                        grunt.fail.warn('Option "' + switchkey + '" is not type of boolean!');
                    }
                    break;
                // object Input Values
                case "define":
                case "checks":
                case "experimental-compiler-options":
                    if ((typeof options[key] == "object") && (options[key] !== null)) {
                        configFileContent += seperator + '"' + switchkey + '": ' + JSON.stringify(options[key], null, "    ");
                    }
                    else {
                        grunt.fail.warn('Option "' + switchkey + '" is not type of object!');
                    }
                    break;
                case "paths":
                case "externs":
                case "modules":
                case "output-wrapper":
                case "name-suffixes-to-strip":
                case "type-prefixes-to-strip":
                case "id-generators":
                case "soy-function-plugins":
                case "test-excludes":
                    if ((typeof options[key] == "string") && (options[key] !== null)) {
                        configFileContent += seperator + '"' + switchkey + '": ' + options[key];
                    } else if ((typeof options[key] == "object") && (options[key] !== null)) {
                        configFileContent += seperator + '"' + switchkey + '": ' + JSON.stringify(options[key], null, "            ");
                    } else {
                        grunt.fail.warn('Option "' + switchkey + '" is not type of string or array - is type:' + typeof options[key]);
                    }
                    break;
                default:
                    options_ += ' --' + key + ' ' + options[key];
                    break;
            }
            seperator = ',\n';
        }

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {

            var files = f.src.filter(function (filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.fail.warn('File ' + filepath + ' does not exist!');
                    return false;
                }
                else if (grunt.file.isDir(filepath)) {
                    grunt.fail.warn('File ' + filepath + ' is a directory!');
                    return false;
                }
                else {
                    return true;
                }
            });

            if (files.length > 0) {
                configFileContent += seperator + '"inputs": [\n';
                for (var i = 0; i < files.length; i++) {
                    configFileContent += (i > 0 ? ',\n' : '') + '            "' + files[i] + '"';
                }
                configFileContent += '\n          ]';
            }

            if ((typeof f.dest == "string") && (f.dest !== null)) {
                configFileContent += seperator + '"output-file": "' + f.dest + '"';
            }
        });

        configFileContent += '\n}';
        if (this.data.cwd) {
            cwd = this.data.cwd;
            cd_cwd = 'cd ' + cwd + ' &&';
            configfilename = path.join(cwd, configfilename);
        };

        // Write configFileContent
        grunt.file.write(configfilename, configFileContent);

        // do the plovr job
        var cmd = cd_cwd + ' java -jar ' + path.join(__dirname, '..', 'bin', '/') + 'plovr.jar build ' + configfilename + options_;
        console.log(cmd);
        var prog = shell.exec(cmd);
        // delete temporary configfile
        grunt.file.delete(configfilename);
        if (prog.code !== 0) {
            grunt.fail.warn(cmd);
        }

    });

};

