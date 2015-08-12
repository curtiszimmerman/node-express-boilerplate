/**
 * @file log.js
 * Simple log object.
 */

"use strict";

var $data = {
	loglevel: 5
};

var _con = function( data, loglevel ) {
	var pre = [' [CRIT] ',' [EROR] ',' [WARN] ',' [LOG ] ',' [INFO] ',' [DBUG] '];
	return console.log(_time()+pre[loglevel]+data);
};

var _time = function() { return new Date().toJSON();}

exports.critical = function( data ) {
	this.log(data, 0);
	throw new Error(data);
};

exports.debug = function( data ) { return this.log(data, 5);};

exports.error = function( data ) { return this.log(data, 1);};

exports.info = function( data ) { return this.log(data, 4);};

exports.log = function( data, loglevel ) {
	var loglevel = typeof(loglevel) === 'undefined' ? 3 : loglevel > 5 ? 5 : loglevel;
	return $data.loglevel === -1 ? loglevel === 0 && _con(data, 0) : loglevel <= $data.loglevel && _con(data, loglevel);
};

exports.loglevel = function( loglevel ) {
	_loglevel = loglevel;
};

exports.warn = function( data ) { return this.log(data, 2);};