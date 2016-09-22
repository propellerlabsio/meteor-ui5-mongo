"use strict";

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: ['src/**/*.js']
    },
    clean: ['doc', 'dist', 'temp'],
    jsdoc: {
      doc: {
        src: ['src/**/*.js', 'README.md'],
        options: {
          destination: 'doc',
          template: 'node_modules/ink-docstrap/template',
          configure: 'jsdoc.conf.json'
        }
      }
    },
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      babel_out: {
        files: [{
          expand: true,
          cwd: 'src/model',
          src: ['**/*.js'],
          dest: 'temp/babel_out/model',
          ext: '.js'
        }]
      }
    },
    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: 'temp/babel_out',
          src: ['**/*.js'],
          dest: 'dist',
        }]
      }
    },
    openui5_preload: {
      library: {
        options: {
          resources: {
            cwd: 'dist', // this should point to the entry folder
            prefix: 'meteor-ui5-mongo', // this should be your component namespace
            src: [
              // src patterns start within the "cwd"
              '**/*.js',
              '**/*.fragment.html',
              '**/*.fragment.json',
              '**/*.fragment.xml',
              '**/*.view.html',
              '**/*.view.json',
              '**/*.view.xml',
              '**/*.properties',
              '!package.js',
              '!**/*-dbg.js'
            ],
          },

          dest: 'dist', // to put the file in the same folder

          compress: true
        },
        libraries: true
      }
    }
  });

  // Load grunt plugin tasks from pre-installed npm packages
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-openui5');

  // Local task: Copy README
  grunt.registerTask(
    'create_readme',
    'Copy README to package dist',
    function() {
      grunt.file.copy('README.md', 'dist/README.md');
      grunt.log.ok('Copied README to package dist.');
    }
  );

  // Local task: Create UI5 library file
  grunt.registerTask(
    'create_library_js',
    'Create libary file',
    function() {
      grunt.file.copy('src/library.js', 'dist/library.js');
      grunt.file.copy('src/library.js', 'dist/library-dbg.js');
      grunt.log.ok('library.js copied from src/.');
    }
  );

  // Local task: Create meteor package file
  grunt.registerTask(
    'create_package_js',
    'Create meteor package file',
    function() {
      // TODO rather than just copy package.js, build list of files for
      // api.addFiles() method based on current UI5 models and controls.
      grunt.file.copy('src/package.js', 'dist/package.js');
      grunt.log.ok('Meteor package.js copied from src/.');
    }
  );

  // Local task: Create UI5 debug files
  grunt.registerTask(
    'create_ui5_debug_files',
    'Create UI5 debug files ("-dbg")',
    function() {
      // TODO move this into outside function so the grunt file is easier to
      // to follow. I tried but couldn't get a reference to the grunt object
      let debugFilesCreated = 0;
      let sourceMapsCopied = 0;

      // Recurse babel output directory copying unminfied javascript to dist
      // directory but with '-dbg' in the name before the first dot.
      grunt.file.recurse(
        'temp/babel_out',
        function(abspath, root, subdir, filename) {
          // Ignore root directory
          if (subdir) {
            // Only create -dbg versions of javascript files
            if (filename.endsWith('.js')) {
              // Source file is absolute path
              var sourceFile = abspath;

              // Destination file name has '-dbg' in the filename before first period
              var firstPeriod = filename.indexOf('.');
              var destFileName = [
                filename.slice(0, firstPeriod),
                '-dbg',
                filename.slice(firstPeriod)
              ].join('');

              // Destination is in 'dist' directory
              const destFile = 'dist/' + subdir + '/' + destFileName;

              // Copy file
              grunt.file.copy(sourceFile, destFile);
              debugFilesCreated++;
            } else if (filename.endsWith('.map')) {
              // Just copy source maps as is.  Babel includes the original
              // name at the bottom of the javascript file.
              var sourceFile = abspath;

              // Destination is in 'dist' directory
              var destFile = 'dist/' + subdir + '/' + filename;

              // Copy file
              grunt.file.copy(sourceFile, destFile);
              sourceMapsCopied++;
            }
          }
        }
      );

      // Finished
      grunt.log.ok(
        debugFilesCreated + ' debug files created. ' +
        sourceMapsCopied + ' source maps copied.'
      );
    }
  );

  // Complete, combined build task
  grunt.registerTask('build', [
    'eslint',
    'clean',
    'jsdoc',
    'babel',
    'uglify',
    'create_package_js',
    'create_library_js',
    'create_ui5_debug_files',
    'openui5_preload',
    'create_readme'
  ]);

};
