var exec = require('child_process').exec;

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var pgk = grunt.file.readJSON('package.json');

    var cfg = {
        build: 'build',
        dist: 'dist',
        tmp: 'tmp',
        macBundleId: 'com.quasado.gravit',
        macSignIdentity: '1269B5CE3B0DCC676DA70011A618EB6FA95F8F50'
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
                    'assets/image/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
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
                        'assets',
                        'src',
                        '.'
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        '<%= cfg.tmp %>',
                        'assets',
                        'test',
                        'src',
                        '.'
                    ]
                }
            }
        },
        clean: {
            dev: '<%= cfg.tmp %>',
            build: '<%= cfg.build %>',
            dist: '<%= cfg.dist %>'
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
                relativeAssets: false
            },
            dev: {
                options: {
                    debugInfo: true
                }
            },
            build: {
                options: {
                    debugInfo: false,
                    generatedImagesDir: '<%= cfg.build %>/source/image/generated'
                }
            }
        },
        concat: {
            build: {
                files: {
                    '<%= cfg.build %>/browser/gravit-shell.js': ['shell/browser/*.js'],
                    '<%= cfg.build %>/chrome/gravit-shell.js': ['shell/chrome/*.js', '!shell/chrome/background.js'],
                    '<%= cfg.build %>/system/gravit-shell.js': ['shell/system/*.js']
                }
            }
        },
        uglify: {
            build: {
                files: {
                    '<%= cfg.build %>/browser/gravit-shell.js': ['<%= cfg.build %>/browser/gravit-shell.js'],
                    '<%= cfg.build %>/chrome/gravit-shell.js': ['<%= cfg.build %>/chrome/gravit-shell.js'],
                    '<%= cfg.build %>/system/gravit-shell.js': ['<%= cfg.build %>/system/gravit-shell.js']
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
            preBuild: {
                files: [
                    // Source Assets
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/font-awesome/fonts',
                        dest: '<%= cfg.build %>/source/font/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'assets/cursor',
                        dest: '<%= cfg.build %>/source/cursor/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'assets/font',
                        dest: '<%= cfg.build %>/source/font/',
                        src: '{,*/}*.*'
                    },

                    // Chrome Assets
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/jquery/dist/',
                        dest: '<%= cfg.build %>/chrome/',
                        src: 'jquery.min.js'
                    },

                    // System assets
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/jquery/dist/',
                        dest: '<%= cfg.build %>/system/',
                        src: 'jquery.min.js'
                    }
                ]
            },
            postBuild: {
                files: [
                    // Copy some files for mac binary
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/system/',
                        dest: '<%= cfg.build %>/system-binaries/Gravit/osx/Gravit.app/Contents/',
                        src: ['Info.plist']
                    },
                    {
                        expand: true,
                        cwd: 'shell/system/',
                        dest: '<%= cfg.build %>/system-binaries/Gravit/osx/Gravit.app/Contents/Resources/',
                        src: ['doc.icns']
                    }
                ]
            },
            build: {
                files: [
                    // Browser
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.build %>/browser/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        cwd: 'assets/icon/',
                        dest: '<%= cfg.build %>/browser/icon',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/browser/',
                        dest: '<%= cfg.build %>/browser/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: 'shell/browser/',
                        dest: '<%= cfg.build %>/browser/',
                        src: ['index.html']
                    },

                    // Chrome
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/chrome/',
                        dest: '<%= cfg.build %>/chrome/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.build %>/chrome/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: 'shell/chrome/',
                        dest: '<%= cfg.build %>/chrome/',
                        src: ['index.html', 'manifest.json', 'background.js']
                    },
                    {
                        expand: true,
                        cwd: 'assets/icon/',
                        dest: '<%= cfg.build %>/chrome/icon',
                        src: ['**']
                    },

                    // System
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.build %>/system/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: 'shell/system/',
                        dest: '<%= cfg.build %>/system/',
                        src: ['index.html', 'package.json', 'Info.plist']
                    }
                ]
            },
            dist: {
                files: [
                    // ..
                ]
            }
        },
        replace: {
            build: {
                src: ['<%= cfg.build %>/system/package.json', '<%= cfg.build %>/system/Info.plist', '<%= cfg.build %>/chrome/manifest.json'],
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
                dest: '<%= cfg.build %>/source'
            },
            html: 'src/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= cfg.build %>/source']
            },
            html: ['<%= cfg.build %>/source/{,*/}*.html'],
            css: ['<%= cfg.build %>/source/{,*/}*.css']
        },
        nodewebkit: {
            options: {
                version: '0.10.1',
                platforms: ['win', 'osx', 'linux64'],
                cacheDir: './node-webkit',
                buildDir: '<%= cfg.build %>/system-binaries',
                macIcns: 'shell/system/appicon.icns',
                macZip: false,
                winIco: 'shell/system/appicon.ico'
            },
            src: '<%= cfg.build %>/system/**/*'
        },
        compress: {
            dist: {
                options: {
                    mode: 'zip',
                    archive: '<%= cfg.dist %>/gravit-chrome.zip'
                },
                expand: true,
                cwd: '<%= cfg.build %>/chrome',
                src: ['**/**'],
                dest: '/'
            }
        }
    });

    // Private tasks
    grunt.registerTask('_dist_osx', function () {
        var done = this.async();

        var gravitAppDir = cfg.build + '/system-binaries/Gravit/osx/Gravit.app';

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
            './node_modules/appdmg/bin/appdmg ./shell/system/package/osx/dmg.json ' + cfg.dist + '/gravit-osx.dmg'
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
        var done = this.async();
        // TODO
        done();
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

    grunt.registerTask('build', function (target) {
        grunt.task.run([
            'clean:build',
            'useminPrepare',
            'compass:build',
            'concat',
            'cssmin',
            'uglify',
            'usemin',
            'copy:preBuild',
            'copy:build',
            'replace:build',
            'nodewebkit',
            'copy:postBuild'
        ]);
    });

    grunt.registerTask('dist', function (target) {
        grunt.task.run([
            'test',
            'build',
            'clean:dist',
            'copy:dist',
            '_dist_osx',
            'compress:dist'
        ]);
    });


    // By default we'll run the development task
    grunt.registerTask('default', [
        'dev'
    ]);
};