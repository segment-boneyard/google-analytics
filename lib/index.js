
var debug = require('debug')('google-analytics');
var login = require('google-client-login');
var Query = require('./query');

/**
 * Expose `GA`.
 */

module.exports = GA;

/**
 * Initialize a new `GA` client with the `viewId`.
 *
 * @param {String} viewId
 */

function GA (viewId) {
  if (!(this instanceof GA)) return new GA(viewId);
  if (!viewId) throw new Error('GA requires a view id.');
  this.viewId = viewId;
}

/**
 * Log into Google Analytics.
 *
 * @param {String} email
 * @param {String} password
 * @param {Function} callback
 */

GA.prototype.login = function (email, password, callback) {
  if (!email) throw new Error('Email is required.');
  if (!password) throw new Error('Password is required.');
  var self = this;
  debug('logging in %s ..', email);
  login(email, password, 'analytics', function (err, token) {
    if (err) {
      debug('login failed: %s', err);
      if (callback) return callback(err);
    } else {
      self.token = token;
      debug('logged in: %s', token);
      if (callback) callback();
    }
  });
};

/**
 * Create a new Google Analytics query.
 *
 * @param {Object} options
 * @returns {Query}
 */

GA.prototype.query = function (options) {
  if (!this.token) throw new Error('Login to GA first.');
  return new Query(this.token, this.viewId, options);
};


