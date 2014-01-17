'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);
    
    var buildConfig = {
        app: 'lib',
        dist: 'dist',
        release: '../adk.gravit.io/release'
    };

    var pkgInfo = grunt.file.readJSON('package.json');

    grunt.initConfig({
        build: buildConfig,
        pkg: pkgInfo,
        watch: {
            compass: {
                files: ['<%= build.app %>/assets/style/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },
            styles: {
                files: ['<%= build.app %>/assets/style/{,*/}*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= build.app %>/*.html',
                    '.tmp/assets/style/{,*/}*.css',
                    '{.tmp,<%= build.app %>}/scripts/{,*/}*.js,<%= build.app %>}/test/{,*/}*.js',
                    '<%= build.app %>/assets/image/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        connect: {
            options: {
                port: 8999,
                livereload: 35728,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        buildConfig.app
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        '.tmp',
                        'test',
                        buildConfig.app,
                    ]
                }
            },
            dist: {
                options: {
                    open: true,
                    base: buildConfig.dist
                }
            }
        },
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= build.dist %>/*',
                            '!<%= build.dist %>/.git*'
                        ]
                    }
                ]
            },
            release: {
                files: [
                    {
                        dot: true,
                        src: [
                            '<%= build.release %>/*',
                            '!<%= build.release %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= build.app %>/scripts/{,*/}*.js',
                'test/spec/**/*.js'
            ]
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
                sassDir: '<%= build.app %>/assets/style',
                cssDir: '.tmp/assets/style',
                generatedImagesDir: '.tmp/assets/image/generated',
                imagesDir: '<%= build.app %>/assets/image/images',
                javascriptsDir: '<%= build.app %>/scripts',
                fontsDir: '.tmp/assets/font',
                importPath: '<%= build.app %>/bower_components',
                httpImagesPath: '/assets/image',
                httpGeneratedImagesPath: '/assets/image/generated',
                httpFontsPath: '/assets/font',
                relativeAssets: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= build.dist %>/assets/image/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/assets/style/',
                        src: '{,*/}*.css',
                        dest: '.tmp/assets/style/'
                    }
                ]
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= build.dist %>'
            },
            html: '<%= build.app %>/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= build.dist %>']
            },
            html: ['<%= build.dist %>/{,*/}*.html'],
            css: ['<%= build.dist %>/assets/style/{,*/}*.css']
        },
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= build.app %>/assets/image',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= build.dist %>/assets/image'
                    },
                    {
                        expand: true,
                        cwd: '<%= build.app %>/assets/icon',
                        src: '**/*.{png,jpg,jpeg,ico}',
                        dest: '<%= build.dist %>/assets/icon'
                    }
                ]
            }
        },
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= build.app %>/assets/image',
                        src: '**/*.svg',
                        dest: '<%= build.dist %>/assets/image'
                    }
                ]
            }
        },
        // Copy files without replacements
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= build.app %>',
                        dest: '<%= build.dist %>',
                        src: [
                            'assets/icon/**/*.ico',
                            'assets/font/**/*.*',
                            'assets/cursor/**/*.*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/assets/font/',
                        src: '{,*/}*.*',
                        dest: '<%= build.dist %>/assets/font/'
                    }
                ]
            },
            release: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= build.dist %>',
                        dest: '<%= build.release %>',
                        src: '**/*.*'
                    }
                ]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= build.app %>/assets/style',
                dest: '.tmp/assets/style/',
                src: '{,*/}*.css'
            },
            fonts: {
                expand: true,
                dot: true,
                cwd: '<%= build.app %>/bower_components/font-awesome/fonts',
                dest: '.tmp/assets/font/',
                src: '{,*/}*.*'
            }
        },
        concurrent: {
            server: [
                'compass',
                'copy:styles',
                'copy:fonts'
            ],
            test: [
                'copy:styles',
                'copy:fonts'
            ],
            dist: [
                'compass',
                'copy:styles',
                'copy:fonts',
                'imagemin',
                'svgmin'
            ]
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',
        'usemin'
    ]);

    grunt.registerTask('release', [
        'clean:release',
        'build',
        'copy:release'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
