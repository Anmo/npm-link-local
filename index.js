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

var linkToNodeModules = function(modulePath, relative) {
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
	if (relative) {
		target = relativizePath(target, link);
	}
	console.log(link, '->', target);


	return fs.symlinkSync(target, link, 'junction');
};

function relativizePath(target, link) {
	var separator = /[\\/]/
	var targetArr = target.split(separator),
	    linkArr = link.split(separator),
	    common = 0;
	while (targetArr[common] === linkArr[common]) ++common
	if (common === 0) return target;
	targetArr = targetArr.slice(common)
	linkArr = linkArr.slice(common)
	var prefix = Array(linkArr.length).join('../') || './'
	return prefix + targetArr.join('/')
}

var npmLinkLocal = function(opts) {
    var modulesPath = opts._;
	for (var i = 0, l = modulesPath.length; i < l; i++) {
		npmInstall(modulesPath[i]);
		linkToNodeModules(modulesPath[i], opts.relative);
	}
};

module.exports = npmLinkLocal;
