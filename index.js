'use strict';

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

var shouldUseYarn = /^yarn/.test(process.env.npm_config_user_agent || '');

var node_modules = 'node_modules';
var installCmd = shouldUseYarn ? 'yarn' : 'npm i';
var prod = ' --production';

function deleteFolderRecursive(path) {
  if(fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      var curPath = path + "/" + file;

      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });

    fs.rmdirSync(path);
  }
}

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
    //node_modules already exists
		//try to unlink link
		try {
      fs.unlinkSync(link);
		} catch (e) {
    	//link didn't exists or is a directory
      try {
        deleteFolderRecursive(link);
      } catch (e) {
        //nothing to do here...
      }
		}
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
