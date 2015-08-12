/**
 * @file routes.js
 * Server routes.
 * @author curtis zimmerman
 * @contact software@curtisz.com
 * @license GPLv3
 * @version 0.0.1a
 */

module.exports = function( $app ) {
	"use strict";

	var express           = require('express');
	var $log              = require('../lib/log.js');

	$log.debug('initializing routes...');

	//app.

	$app.use(express.static(__dirname+'/pub', {
		index: 'index.html'
	}));
};
