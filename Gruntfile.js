module.exports = function(grunt) {
  grunt.initConfig({
    babel: {
      scripts: {
        files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.js',
          dest: 'build/'
        }]
      }
    },
		clean: {
			files: ['build/**/*.js']
		},
    watch: {
      scripts: {
        files: ['src/**/*.js', 'server/**/*.js'],
        tasks: ['babel']
      }
    }
  });

  grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['clean', 'babel']);
};
