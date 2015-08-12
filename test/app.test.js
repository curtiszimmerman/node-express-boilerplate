/**
 * @file app.test.js
 * Test harness for primary application driver.
 */

var __test = (function() {
	"use strict";

	// third-party
	var chai = require('chai');
	var tape = require('tape');
	// local
	var $app = require('../app.js');
	var $log = require('../lib/log.js');
	// auxiliary
	var expect = chai.expect;
	var test = tape.test;

	test('### app.js (primary application driver) tests:', function(t) {
		t.plan(1);

		t.equal('string', typeof($app.__test.util.getID()), "getID should return a string when called with no parameters");
	});
})();