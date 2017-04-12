'use strict';

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var execSync = require('child_process').execSync;

var shouldUseYarn = /^yarn/.test(process.env.npm_config_user_agent || '');

var node_modules = 'node_modules';
var installCmd = shouldUseYarn ? 'yarn' : 'npm i';
var prod = ' --production';

function npmInstall(modulePath, dev) {
	console.log('Installing', modulePath);

	return execSync(installCmd + (dev ? '' : prod), {
		cwd: modulePath,
		stdio: [0, 1, 2]
	});
};

function linkToNodeModules(modulePath, relative) {
	var target = path.resolve(process.cwd(), modulePath);

	var moduleName = modulePath.split('/');
	moduleName = moduleName[moduleName.length - 1];

	var link = path.resolve(process.cwd(), node_modules, moduleName);


	//try to create node_modules
	try {
		fs.mkdirSync(node_modules);
	} catch (e) {
		// remove existing module (will continue if it doesn't exist)
		rimraf.sync(link)
  }

	if (relative) {
		target = relativizePath(target, link);
	}

	console.log(target, '->', link);

	return fs.symlinkSync(target, link, 'junction');
};

function relativizePath(target, link) {
	var separator = /[\\/]/;
	var targetArr = target.split(separator);
	var linkArr = link.split(separator);
	var common = 0;

	while (targetArr[common] === linkArr[common]) {
		++common;
	}

	if (common === 0) { return target; }

	targetArr = targetArr.slice(common);
	linkArr = linkArr.slice(common);

	var prefix = Array(linkArr.length).join('../') || './';

	return prefix + targetArr.join('/');
}

function npmLinkLocal(opts) {
	var modulesPath = opts._;

	for (var i = 0, l = modulesPath.length; i < l; i++) {
		opts.skip || npmInstall(modulesPath[i], opts.dev);
		linkToNodeModules(modulesPath[i], opts.relative);
	}
}

module.exports = npmLinkLocal;
