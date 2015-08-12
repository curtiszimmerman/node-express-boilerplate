/**
 * @project node-express-boilerplate
 * Node.js/Express Site Boilerplate
 * @file app.js
 * Primary application driver
 * @author curtis zimmerman
 * @contact software@curtisz.com
 * @license GPLv3
 * @version 0.0.1a
 */

var app = (function() {
	"use strict";

	// core
	var events        = require('events');
	var fs            = require('fs');
	// third-party
	var errorHandler  = require('errorhandler');
	var express       = require('express');
	var session       = require('express-session');
	var yaml          = require('js-yaml');
	var logger        = require('morgan');
	var multer        = require('multer');
	var passport      = require('passport');
	var favicon       = require('serve-favicon');
	// local
	var $log          = require(__dirname+'/lib/log');
	// auxiliary
	var $app = express();
	var $pubsub = new events.EventEmitter();
	var $router = express.Router();

	// data storage object
	var $data = {
		cache: {},
		config: {},
		database: {
			enabled: false
		},
		server: {
			config: {
				dir: 'config/'
			},
			cors: false,
			environment: 'development',
			log: {
				level: 3,
				quiet: false
			},
			maintenance: {
				enabled: true,
				interval: 60
			},
			port: 8080,
			stats: {
				id: {
					length: 8,
					value: null
				},
				processed: 0
			},
			time: {
				up: 0,
				now: 0
			}
		}
	};

	var $func = {
		maintenance: function() {
			return $data.server.maintenance.enabled ? setTimeout($func.maintenance, $data.server.maintenance.interval*1000) : false;
		}
	};

	var $util = {
		/**
		 * @function getID
		 * Get a pseudorandom string of characters.
		 * @param {integer=6} Length of string to generate.
		 * @returns {string} Pseudo-random string.
		 */
		getID: function( length ) {
			if (typeof(length) === 'undefined') {
				return Math.floor(Math.random()*1e10).toString(36);
			} else {
				var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345689';
				var id = '';
				for (var i=0; i<length; i++) id += charset.substr(Math.floor(Math.random()*charset.length), 1);
				return id;
			}
		}
	};

	var initialize = function() {
		$pubsub.on('/core/server/init', server);
		$pubsub.on('/core/initialize/done', function() {
			$pubsub.emit('/core/server/init');
		});
		// config file parse
		var environment = typeof(process.env.NODE_ENV) !== 'undefined' ? process.env.NODE_ENV : 'default';
		var configType = typeof(process.env.NODE_CONFIG) !== 'undefined' && process.env.NODE_CONFIG === 'env' ? 'env' : 'yaml';
		if (configType === 'env') {
			// we want to use environment variables for our configuration data
			if (typeof(process.env.NODE_ENVIRONMENT) !== 'undefined' && process.env.NODE_ENVIRONMENT === 'production') $data.server.environment = 'production';
			if (typeof(process.env.NODE_CORS) !== 'undefined' && process.env.NODE_CORS === 'true') $data.server.cors = true;
			if (typeof(process.env.NODE_DATABASE) !== 'undefined' && process.env.NODE_DATABASE === 'true') $data.database.enabled = true;
			if (typeof(process.env.NODE_PORT) !== 'undefined') $data.server.port = process.env.NODE_PORT;
			if (typeof(process.env.NODE_LOGLEVEL) !== 'undefined') $data.server.log.level = process.env.NODE_LOGLEVEL-1;
			if (typeof(process.env.NODE_QUIET) !== 'undefined' && process.env.NODE_QUIET === 'true') $data.server.log.quiet = true;
		} else {
			// we want to use yaml config file for our configuration data
			var configFile = $data.server.config.dir+environment+'.yaml';
			try {
				$data.config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
				if (typeof($data.config) === 'undefined') throw new Error();
			} catch(e) {
				$log.critical('Could not read config file: '+configFile);
			}
			if (typeof($data.config.server.environment) !== 'undefined' && $data.config.server.environment === 'production') $data.server.environment = 'production';
			if (typeof($data.config.server.cors) !== 'undefined') $data.server.cors = true;
			if (typeof($data.config.server.port) !== 'undefined') $data.server.port = $data.config.port;
			if (typeof($data.config.server.log) !== 'undefined') {
				if ($data.config.server.log.level) $data.server.log.level = $data.config.server.log.level-1;
				$data.server.log.quiet = $data.server.log.level === -1 ? true : false;
			}
			if (typeof($data.config.server.database) !== 'undefined') {
				if ($data.config.server.database.enabled === true) $data.database.enabled = true;
			}
		}

		// initialize application instance data
		$data.server.stats.id.value = $util.getID($data.server.stats.id.length);
		$data.server.time.now = $data.server.time.up = Math.round(new Date().getTime()/1000.0);

		// initialize maintenance function cycle
		setTimeout($func.maintenance, $data.server.maintenance.interval*1000);
		$pubsub.emit('/core/initialize/done');
	};

	var server = function() {
		// request log handler
		$app.use(logger( $data.server.environment === 'development' ? 'dev' : 'combined' ));
		
		// favicon handler
		$app.use(favicon(__dirname+'/pub/favicon.ico'));
		
		// session handler
		// note: ugly hack! proper session secret generation should not 
		//  blindly rotate since it will invalidate any active sessions.
		$app.use(session({
			name: 'template',
			resave: true,
			saveUninitialized: true,
			secret: $util.getID(20)
		}));

		// multipart request handler
		$app.use(multer());

		// set global headers
		//$app.use(function(req, res) {
		//	if ($data.config.cors) res.setHeader('Access-Control-Allow-Origin', '*');
		//});

		// route handler
		require(__dirname+'/routes/routes.js')($app);
		
		// development error handler
		if ($data.server.environment === 'development') $app.use(errorHandler());
		
		$app.listen($data.server.port);
		$log.log('---------------------------------------');
		$log.log('listening on '+$data.server.port);
		$log.log('---------------------------------------');
		$pubsub.emit('/core/server/init/done');
	};

	// fire off server (unless we're testing)
	if (require.main === module) {
		initialize();
	} else {
		module.exports = {
			__test: {
				func: $func,
				util: $util
			}
		};
	}
})();
