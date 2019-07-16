var gulp = require('gulp');
var path = require('path');
var zip = require('gulp-zip');
var minimist = require('minimist');

var knownOptions = {
	string: 'packageName',
	string: 'packagePath',
	default: {
		packageName: "GoNorthUITests.zip",
		packagePath: path.join(__dirname, '_package')
	}
}

var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('default', function () {
	var packagePaths = ['**',
		'!**/_package/**',
		'!**/typings/**',
		'!typings',
		'!_package',
		'!**/node_modules/**', // Ignore all node_modules to prevent chrominum to be packaged everytime, instead npm install will be run in release
		'!gulpfile.js',
		'!package_lock.json',
		'!xunit.xml']

	return gulp.src(packagePaths)
		.pipe(zip(options.packageName))
		.pipe(gulp.dest(options.packagePath));
});