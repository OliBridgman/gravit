var exec = require('child_process').exec;

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var pgk = grunt.file.readJSON('package.json');

    var cfg = {
        lib: 'lib',
        app: 'app',
        dist: 'dist',
        tmp: 'tmp',
        macBundleId: 'com.quasado.gravit',
        macSignIdentity: '1269B5CE3B0DCC676DA70011A618EB6FA95F8F50'
    };

    // Take care of order!!
    var modules = ['core', 'format', 'editor', 'component', 'shell', 'framework', 'application'];

    var appJSFiles = [];
    var appCSSFiles = [];

    for (var i = 0; i < modules.length; ++i) {
        appJSFiles.push('<%= cfg.lib %>/' + modules[i] + '/js/*.js');
        appCSSFiles.push('<%= cfg.lib %>/' + modules[i] + '/style/*.css');
    }

    var getAppAssetFiles = function (dest) {
        var result = [];

        for (var i = 0; i < modules.length; ++i) {
            result.push({
                expand: true,
                cwd: '<%= cfg.lib %>/' + modules[i] + '/assets',
                dest: dest + '/assets/' + modules[i] + '/',
                src: '**/*'
            });
        }

        return result;
    };

    grunt.initConfig({
        cfg: cfg,
        pkg: pgk,

        watch: {
            compass: {
                files: ['src/style/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'src/*.html',
                    'src/js/{,*/}*.js,test/{,*/}*.js',
                    'src/assets/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        connect: {
            options: {
                port: 8999,
                livereload: 35728,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        'src'
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        'test',
                        'src'
                    ]
                }
            }
        },
        clean: {
            dev: ['<%= cfg.tmp %>'],
            lib: ['<%= cfg.tmp %>', '<%= cfg.lib %>'],
            app: ['<%= cfg.app %>'],
            dist: ['<%= cfg.dist %>']
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
                }
            }
        },
        compass: {
            options: {
                sassDir: 'src/style',
                cssDir: 'src/style',
                javascriptsDir: 'src/js',
                httpImagesPath: '/image',
                httpGeneratedImagesPath: '/image/generated',
                relativeAssets: false,
                debugInfo: true
            },
            dev: {
                options: {
                    debugInfo: true
                }
            },
            lib: {
                options: {
                    debugInfo: false
                }
            }
        },
        concat: {
            app: {
                files: {
                    // Browser
                    '<%= cfg.app %>/browser/js/app.js': appJSFiles.concat(
                        'src/js/host/browser/*.js'
                    ),
                    '<%= cfg.app %>/browser/style/app.css': appCSSFiles,

                    // Chrome
                    '<%= cfg.app %>/chrome/js/app.js': appJSFiles.concat(
                        'src/js/host/chrome/*.js'
                    ),
                    '<%= cfg.app %>/chrome/style/app.css': appCSSFiles,

                    // System
                    '<%= cfg.tmp %>/__app_system/js/app.js': appJSFiles.concat(
                        'src/js/host/system/*.js'
                    ),
                    '<%= cfg.tmp %>/__app_system/style/app.css': appCSSFiles
                }
            }
        },
        uglify: {
            app: {
                files: {
                    // Browser
                    '<%= cfg.app %>/browser/js/app.js': ['<%= cfg.app %>/browser/js/app.js'],

                    // Chrome
                    '<%= cfg.app %>/chrome/js/app.js': ['<%= cfg.app %>/chrome/js/app.js'],

                    // System
                    '<%= cfg.tmp %>/__app_system/js/app.js': ['<%= cfg.tmp %>/__app_system/js/app.js']
                }
            }
        },
        copy: {
            lib: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/application',
                        dest: '<%= cfg.lib %>/application/assets',
                        src: '**/*'
                    },
                    {
                        expand: true,
                        cwd: 'src/assets/editor',
                        dest: '<%= cfg.lib %>/editor/assets',
                        src: '**/*'
                    },
                    {
                        expand: true,
                        cwd: 'src/assets/framework',
                        dest: '<%= cfg.lib %>/framework/assets',
                        src: '**/*'
                    },
                    {
                        expand: true,
                        cwd: 'src/assets/shell',
                        dest: '<%= cfg.lib %>/shell/assets',
                        src: '**/*'
                    }
                ]
            },

            app: {
                files: [
                    // Browser
                    {
                        expand: true,
                        cwd: 'src/package/browser',
                        dest: '<%= cfg.app %>/browser/',
                        src: ['index.html']
                    },

                    // Chrome
                    {
                        expand: true,
                        cwd: 'src/package/chrome',
                        dest: '<%= cfg.app %>/chrome/',
                        src: ['index.html', 'manifest.json', 'background.js']
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'src/bower_components/jquery/dist/',
                        dest: '<%= cfg.app %>/chrome/js/',
                        src: 'jquery.min.js'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'src/bower_components/font-awesome/css',
                        dest: '<%= cfg.app %>/chrome/font-awesome/css/',
                        src: 'font-awesome.min.css'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'src/bower_components/font-awesome/fonts',
                        dest: '<%= cfg.app %>/chrome/font-awesome/fonts/',
                        src: '{,*/}*.*'
                    },

                    // System
                    {
                        expand: true,
                        cwd: 'src/package/system',
                        dest: '<%= cfg.tmp %>/__app_system/',
                        src: ['index.html', 'Info.plist', 'package.json']
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'src/bower_components/jquery/dist/',
                        dest: '<%= cfg.tmp %>/__app_system/js/',
                        src: 'jquery.min.js'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'src/bower_components/font-awesome/css',
                        dest: '<%= cfg.tmp %>/__app_system/font-awesome/css/',
                        src: 'font-awesome.min.css'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'src/bower_components/font-awesome/fonts',
                        dest: '<%= cfg.tmp %>/__app_system/font-awesome/fonts/',
                        src: '{,*/}*.*'
                    }
                ].concat(
                    getAppAssetFiles('<%= cfg.app %>/browser'),
                    getAppAssetFiles('<%= cfg.app %>/chrome'),
                    getAppAssetFiles('<%= cfg.app %>/system')
                )
            }
        },
        replace: {
            app: {
                src: ['<%= cfg.tmp %>/__app_system/package.json', '<%= cfg.tmp %>/__app_system/Info.plist', '<%= cfg.app %>/chrome/manifest.json'],
                overwrite: true,
                replacements: [
                    {
                        from: '%name%',
                        to: '<%= pkg.name %>'
                    },
                    {
                        from: '%description%',
                        to: '<%= pkg.description %>'
                    },
                    {
                        from: '%version%',
                        to: '<%= pkg.version %>'
                    },
                    {
                        from: '%mac-bundle-id%',
                        to: '<%= cfg.macBundleId %>'
                    }
                ]
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= cfg.lib %>'
            },
            html: 'src/index.html'
        },
        nodewebkit: {
            options: {
                version: '0.11.1',
                platforms: ['win', 'osx', 'linux64'],
                cacheDir: './node-webkit',
                buildDir: '<%= cfg.app %>',
                buildType: function () {
                    return 'system';
                },
                macIcns: 'src/package/system/appicon.icns',
                macZip: false,
                winIco: 'src/package/system/appicon.ico'
            },
            src: '<%= cfg.tmp %>/__app_system/**/*'
        }
    });

    // Private tasks
    grunt.registerTask('_dist_osx', function () {
        var done = this.async();

        var gravitAppDir = cfg.app + '/system/osx/Gravit.app';

        var commands = [
            // sign
                'codesign --deep -f -v -s ' + cfg.macSignIdentity + ' -i ' + cfg.macBundleId + ' "' + gravitAppDir + '/Contents/Frameworks/node-webkit Helper.app"',
                'codesign --deep -f -v -s ' + cfg.macSignIdentity + ' -i ' + cfg.macBundleId + ' "' + gravitAppDir + '/Contents/Frameworks/node-webkit Helper EH.app"',
                'codesign --deep -f -v -s ' + cfg.macSignIdentity + ' -i ' + cfg.macBundleId + ' "' + gravitAppDir + '/Contents/Frameworks/node-webkit Helper NP.app"',
                'codesign --deep -f -v -s ' + cfg.macSignIdentity + ' -i ' + cfg.macBundleId + ' "' + gravitAppDir + '"',

            // verify
                'spctl --assess -vvvv "' + gravitAppDir + '/Contents/Frameworks/node-webkit Helper.app"',
                'spctl --assess -vvvv "' + gravitAppDir + '/Contents/Frameworks/node-webkit Helper EH.app"',
                'spctl --assess -vvvv "' + gravitAppDir + '/Contents/Frameworks/node-webkit Helper NP.app"',
                'spctl --assess -vvvv "' + gravitAppDir + '"',

            // package
            'test -f ./dist/gravit-osx.dmg && rm ./dist/gravit-osx.dmg',
            'mkdir ./dist',
                './node_modules/appdmg/bin/appdmg ./src/package/system/package/osx/dmg.json ' + cfg.dist + '/gravit-osx.dmg'
        ];

        console.log('Sign & Package for OS-X');

        var index = 0;

        var _exec = function () {
            exec(commands[index], function (error, stdout, stderr) {
                if (stdout) console.log(stdout);
                if (stderr) console.log(stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }

                if (++index < commands.length) {
                    _exec();
                } else {
                    done();
                }
            });
        }

        _exec();
    })

    grunt.registerTask('_dist_win', function () {
        // TODO : Build installer
        var done = this.async();

        exec('zip -r -X ../../../' + cfg.dist + '/gravit-windows.zip *', {cwd: cfg.app + '/system/win'}, function (error, stdout, stderr) {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done();
        });
    })

    grunt.registerTask('_dist_linux', function () {
        var done = this.async();

        exec('zip -r -X ../../../' + cfg.dist + '/gravit-linux64.zip *', {cwd: cfg.app + '/system/linux64'}, function (error, stdout, stderr) {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done();
        });
    })

    grunt.registerTask('_dist_chrome', function () {
        var done = this.async();

        exec('zip -r -X ../../' + cfg.dist + '/gravit-chrome.zip *', {cwd: cfg.app + '/chrome'}, function (error, stdout, stderr) {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done();
        });
    })

    // Public tasks
    grunt.registerTask('dev', function (target) {
        grunt.task.run([
            'clean:dev',
            'compass:dev',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', function (target) {
        grunt.task.run([
            'clean:dev',
            'compass:dev',
            'connect:test',
            'mocha'
        ]);
    });

    grunt.registerTask('lib', function (target) {
        grunt.task.run([
            'clean:lib',
            'useminPrepare',
            'compass:lib',
            'concat:generated',
            'cssmin:generated',
            'uglify:generated',
            'copy:lib'
        ]);
    });

    grunt.registerTask('app', function (target) {
        grunt.task.run([
            'lib',
            'clean:app',
            'concat:app',
            'uglify:app',
            'copy:app',
            'replace:app',
            'nodewebkit'
        ]);
    });

    grunt.registerTask('dist', function (target) {
        grunt.task.run([
            'test',
            'app',
            'clean:dist',
            '_dist_osx',
            '_dist_linux',
            '_dist_win',
            '_dist_chrome'
        ]);
    });


    // By default we'll run the development task
    grunt.registerTask('default', [
        'dev'
    ]);
};