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

    var appJSFiles = [
        '<%= cfg.lib %>/core/*.js',
        '<%= cfg.lib %>/format/*.js',
        '<%= cfg.lib %>/editor/*.js',
        '<%= cfg.lib %>/component/*.js',
        '<%= cfg.lib %>/shell/*.js',
        '<%= cfg.lib %>/framework/*.js',
        '<%= cfg.lib %>/application/*.js'
    ];

    var appCSSFiles = [
        '<%= cfg.lib %>/core/*.css',
        '<%= cfg.lib %>/format/*.css',
        '<%= cfg.lib %>/editor/*.css',
        '<%= cfg.lib %>/component/*.css',
        '<%= cfg.lib %>/shell/*.css',
        '<%= cfg.lib %>/framework/*.css',
        '<%= cfg.lib %>/application/*.css'
    ];

    function getAppCopyFiles(dest) {
        return [
            {
                expand: true,
                dot: true,
                cwd: 'assets/editor',
                dest: dest,
                src: '{,*/}*.*'
            },
            {
                expand: true,
                dot: true,
                cwd: 'assets/framework',
                dest: dest,
                src: '{,*/}*.*'
            },
            {
                expand: true,
                dot: true,
                cwd: 'assets/application',
                dest: dest,
                src: '{,*/}*.*'
            },
            {
                expand: true,
                dot: true,
                cwd: 'bower_components/font-awesome/fonts',
                dest: dest + 'font',
                src: '{,*/}*.*'
            }
        ]
    };

    grunt.initConfig({
        cfg: cfg,
        pkg: pgk,

        watch: {
            compass: {
                files: ['style/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'src/*.html',
                    '<%= cfg.tmp %>/{,*/}*.css',
                    '{<%= cfg.tmp %>,src/{,*/}*.js,test/{,*/}*.js',
                    'assets/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
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
                        '<%= cfg.tmp %>',
                        'assets/application',
                        'assets/editor',
                        'assets/framework',
                        'src',
                        '.'
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        '<%= cfg.tmp %>',
                        'assets/application',
                        'assets/editor',
                        'assets/framework',
                        'test',
                        'src',
                        '.'
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
                sassDir: 'style',
                cssDir: '<%= cfg.tmp %>',
                generatedImagesDir: '<%= cfg.tmp %>/image/generated',
                imagesDir: 'assets/image/images',
                javascriptsDir: 'src',
                fontsDir: '<%= cfg.tmp %>/font',
                httpImagesPath: '/image',
                httpGeneratedImagesPath: '/image/generated',
                httpFontsPath: '/font',
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
                    '<%= cfg.app %>/browser/app.js': appJSFiles.concat(
                        'src/host/browser/*.js',
                        'src/application/browser/*.js'
                    ),
                    '<%= cfg.app %>/browser/app.css': appCSSFiles,

                    // Chrome
                    '<%= cfg.app %>/chrome/app.js': appJSFiles.concat(
                        'src/host/chrome/*.js',
                        '!src/host/chrome/background.js'
                    ),
                    '<%= cfg.app %>/chrome/app.css': appCSSFiles,

                    // System
                    '<%= cfg.tmp %>/__app_system/app.js': appJSFiles.concat(
                        'src/host/system/*.js'
                    ),
                    '<%= cfg.tmp %>/__app_system/app.css': appCSSFiles
                }
            }
        },
        uglify: {
            app: {
                files: {
                    // Browser
                    '<%= cfg.app %>/browser/app.js': ['<%= cfg.app %>/browser/app.js'],

                    // Chrome
                    '<%= cfg.app %>/chrome/app.js': ['<%= cfg.app %>/chrome/app.js'],

                    // System
                    '<%= cfg.tmp %>/__app_system/app.js': ['<%= cfg.tmp %>/__app_system/app.js']
                }
            }
        },
        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/font-awesome/fonts',
                        dest: '<%= cfg.tmp %>/font/',
                        src: '{,*/}*.*'
                    }
                ]
            },
            app: {
                files: [
                    // Browser
                    {
                        expand: true,
                        cwd: 'src/application/browser',
                        dest: '<%= cfg.app %>/browser/',
                        src: ['index.html']
                    },

                    // Chrome
                    {
                        expand: true,
                        cwd: 'src/application/chrome',
                        dest: '<%= cfg.app %>/chrome/',
                        src: ['index.html', 'manifest.json', 'background.js']
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/jquery/dist/',
                        dest: '<%= cfg.app %>/chrome/',
                        src: 'jquery.min.js'
                    },

                    // System
                    {
                        expand: true,
                        cwd: 'src/application/system',
                        dest: '<%= cfg.tmp %>/__app_system/',
                        src: ['index.html', 'Info.plist', 'package.json']
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/jquery/dist/',
                        dest: '<%= cfg.tmp %>/__app_system/',
                        src: 'jquery.min.js'
                    },
                ]
                    .concat(getAppCopyFiles('<%= cfg.app %>/browser/'))
                    .concat(getAppCopyFiles('<%= cfg.app %>/chrome/'))
                    .concat(getAppCopyFiles('<%= cfg.tmp %>/__app_system/'))
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
                version: '0.10.1',
                platforms: ['win', 'osx', 'linux64'],
                cacheDir: './node-webkit',
                buildDir: '<%= cfg.app %>',
                buildType: function () {
                    return 'system';
                },
                macIcns: 'src/application/system/appicon.icns',
                macZip: false,
                winIco: 'src/application/system/appicon.ico'
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
            './node_modules/appdmg/bin/appdmg ./src/application/system/package/osx/dmg.json ' + cfg.dist + '/gravit-osx.dmg'
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

        exec('zip -r -X ../../../../' + cfg.dist + '/gravit-windows.zip *', {cwd: cfg.build + '/system-binaries/Gravit/win'}, function (error, stdout, stderr) {
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

        exec('zip -r -X ../../../../' + cfg.dist + '/gravit-linux64.zip *', {cwd: cfg.build + '/system-binaries/Gravit/linux64'}, function (error, stdout, stderr) {
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

        exec('zip -r -X ../../' + cfg.dist + '/gravit-chrome.zip *', {cwd: cfg.build + '/chrome'}, function (error, stdout, stderr) {
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
            'copy:dev',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', function (target) {
        grunt.task.run([
            'clean:dev',
            'compass:dev',
            'copy:dev',
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
            'uglify:generated'
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