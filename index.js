'use strict';

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

var node_modules = 'node_modules';
var installCmd = 'npm install --production';

var npmInstall = function(modulePath) {
	console.log('Installing', modulePath);

	return execSync(installCmd, {
		cwd: modulePath,
		stdio: [0, 1, 2]
	});
};

var linkToNodeModules = function(modulePath) {
	var target = path.resolve(process.cwd(), modulePath);

	var moduleName = modulePath.split('/');
	moduleName = moduleName[moduleName.length - 1];

	var link = path.resolve(process.cwd(), node_modules, moduleName);

	//try to create node_modules
	try {
		fs.mkdirSync(node_modules);
	} catch (e) {
		//node_modules already exists
		//try to unlink link
		try {
			fs.unlinkSync(link);
		} catch (e) {
			//link didn't exists
		}
	}

	console.log(link, '->', target);

	return fs.symlinkSync(target, link, 'junction');
};

var npmLinkLocal = function(modulesPath) {
	if (typeof modulesPath=== 'string') {
		modulesPath= [modulesPath];
	}

	for (var i = 0, l = modulesPath.length; i < l; i++) {
		npmInstall(modulesPath[i]);
		linkToNodeModules(modulesPath[i]);
	}
};

module.exports = npmLinkLocal;
