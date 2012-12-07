/*jshint node:true*/
(function () {
	'use strict';
	
	var fs = require('fs'),
		clone = require('clone'),
		_ = require('underscore');

	function Cubby ($config) {
		$config = $config || {};

		this._connection = $config.connection;
		this._table = $config.table || 'cubby';
		this._name = $config.name || 'default';
	}

	Cubby.prototype = {
		get: function (key) {
			if (key in this._db) {
				return _.isObject(this._db[key]) ? clone(this._db[key]) : this._db[key];
			} else {
				return null;
			}
		},

		set: function (key, value) {
			if (arguments.length === 1) {
				var values = arguments[0];
				for (key in values) this._db[key] = _.isObject(values[key]) ? clone(values[key]) : values[key];
			} else {
				this._db[key] = _.isObject(value) ? clone(value) : value;
			}
			this._save();
		},

		remove: function (key) {
			delete this._db[key];
			this._save();
		},

		empty: function () {
			var self = this;
			Object.keys(this._db).forEach(function (key) {
				self._db[key] = undefined;
				delete self._db[key];
			});
			this._save();
		},

		setPath: function (path, value) {
			var current = this._db;

			path = path.split('.');

			path.forEach(function (segment, key) {
				if (!_.isObject(current) && key !== path.length-1) {
					throw new Error('trying to store a value into a ' + typeof current);
				} else if (!(segment in current)) {
					current = current[segment] = key === path.length-1 ? value : Object.create(null);
				} else {
					if (key === path.length-1) {
						current[segment] = _.isObject(value) ? clone(value) : value;
					} else {
						current = current[segment];
					}
				}
			}, this);

			this._save();
		},

		getPath: function (path) {
			var current = this._db;
			
			path = path.split('.');

			for (var segment = 0; segment < path.length; segment++) {
				if (!_.isObject(current[path[segment]]) && segment !== path.length-1 || !(path[segment] in current)) {
					return undefined;
				} else {
					current = current[path[segment]];
				}
			}

			return _.isObject(current) ? clone(current) : current;
		},

		load: function (callback) {
			var self = this;

			this._setup(function (cubby) {
				self._db = JSON.parse(cubby);
				callback();
			});
		},

		_setup: function (callback) {
			var self = this,
				table = this._table,
				name = this._name;

			self._connection.query('SHOW TABLES LIKE ?', table, function(err, rows, fields) {
				if (err) throw err;

				if (!rows.length) {
					self._connection.query('CREATE TABLE `' + table + '` (`name` varchar(255) NOT NULL, `data` longtext, UNIQUE KEY `name` (`name`))', function (err, rows, fields) {
						self._connection.query('INSERT INTO `' + table + '` (`name`, `data`) VALUES (?, ?)', [name, '{}'], function (err, rows, fields) {
							callback('{}');
						});
					});
				} else {
					self._connection.query('SELECT * FROM `' + table + '` WHERE `name` = ? LIMIT 1', [name], function (err, rows, fields) {
						if (!rows.length) {
							self._connection.query('INSERT INTO `' + table + '` (`name`, `data`) VALUES (?, ?)', [name, '{}'], function (err, rows, fields) {
								callback('{}');
							});
						} else {
							callback(rows[0].data);
						}
					});
				}
			});
		},

		_save: function () {
			this._connection.query('UPDATE `' + this._table + '` SET `data` = ? WHERE `name` = ?', [JSON.stringify(this._db), this._name]);
		}
	};

	module.exports = Cubby;
})();