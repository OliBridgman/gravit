'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var buildConfig = {
        dist: 'build',
        deploy: 'deploy'
    };

    var pkgInfo = grunt.file.readJSON('package.json');

    grunt.initConfig({
        build: buildConfig,
        pkg: pkgInfo,
        watch: {
            compass: {
                files: ['assets/style/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },
            styles: {
                files: ['assets/style/{,*/}*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'src/*.html',
                    '.tmp/assets/style/{,*/}*.css',
                    '{.tmp,src/{,*/}*.js,test/{,*/}*.js',
                    'assets/image/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
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
                        'src',
                        '.'
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        '.tmp',
                        'test',
                        'src',
                        '.'
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
            deploy : {
                files: [
                    {
                        dot: true,
                        src: [
                            '<%= build.deploy %>/*',
                            '!<%= build.deploy %>/.git*'
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
                'src/{,*/}*.js',
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
                sassDir: 'assets/style',
                cssDir: '.tmp/assets/style',
                generatedImagesDir: '.tmp/assets/image/generated',
                imagesDir: 'assets/image/images',
                javascriptsDir: 'src',
                fontsDir: '.tmp/assets/font',
                importPath: 'src/bower_components',
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
            html: 'src/index.html'
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
                        cwd: 'assets/image',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= build.dist %>/assets/image'
                    },
                    {
                        expand: true,
                        cwd: 'assets/icon',
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
                        cwd: 'assets/image',
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
            deploy: {
                files: [
                    // Web-Shell
                    {
                        expand: true,
                        dot: true,
                        cwd: 'shell/web/',
                        dest: '<%= build.deploy %>/web/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= build.dist %>/',
                        dest: '<%= build.deploy %>/web/',
                        src: '{,**/}*.*'
                    },
                    // Native-Shell
                    {
                        expand: true,
                        dot: true,
                        cwd: 'shell/native/',
                        dest: '<%= build.deploy %>/native/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= build.dist %>/',
                        dest: '<%= build.deploy %>/native/',
                        src: '{,**/}*.*'
                    },
                ]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: 'assets/style',
                dest: '.tmp/assets/style/',
                src: '{,*/}*.css'
            },
            fonts: {
                expand: true,
                dot: true,
                cwd: 'src/bower_components/font-awesome/fonts',
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

    grunt.registerTask('dist', [
        'jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('deploy', [
        'dist',
        'clean:deploy',
        'copy:deploy'
    ]);

    grunt.registerTask('default', [
        'server'
    ]);
};
