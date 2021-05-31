module.exports = function(grunt){

 

grunt.loadNpmTasks('@sap/grunt-sapui5-bestpractice-build');
//register the task
grunt.registerTask('default', ['clean','build']);

 

};