#! /usr/bin/env node
'use strict'

var npmLinkLocal = require('./');

npmLinkLocal(require('optimist').argv)
