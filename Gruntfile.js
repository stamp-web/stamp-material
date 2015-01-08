module.exports = function (grunt) {

    var targetdir = grunt.option('distdir') || 'dist';
    console.log("target directory is: " + targetdir);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        distdir: targetdir,

        copy: {
            deploy: {
                files: [
                    {
                        cwd: 'app/',
                        src: ['**'],
                        dest: '<%= distdir %>',
                        expand: true,
                        verbose: true
                    }
                ]
            }
        },
        watch : {
            resources: {
                files: ['app/components/**',
                    'app/views/**',
                    'app/resources/**',
                    'app/index*.html',
                    'app/app.css',
                    'app/app.js'],
                tasks: ['dev'],
                options: {
                    nospawn: true
                }
            }
        },
        clean: {
            working: {
                src: [
                    '!<%= distdir %>/app/components/**',
                    '!<%= distdir %>/app/views/**',
                    '!<%= distdir %>/app/resources/**',
                    '<%= distdir %>/app/index*.html',
                    '<%= distdir %>/app/app.css',
                    '<%= distdir %>/app/app.js',
                ]
            }
        }
    });

    grunt.registerTask('dev', ['clean:working','copy:deploy' ] );


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
};