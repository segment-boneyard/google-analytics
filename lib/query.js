
var Dates = require('date-math');
var debug = require('debug')('google-analytics');
var defaults = require('defaults');
var request = require('superagent');
var util = require('util');

/**
 * Expose `Query`.
 */

module.exports = Query;

/**
 * Base URL.
 */

var url = 'https://www.googleapis.com/analytics/v3/data/ga';

/**
 * Create a new `Query` operation with `options`.
 *
 * @param {String} token
 * @param {String} viewId
 * @param {Object} options
 */

function Query (token, viewId, options) {
  this.token = token;
  this.viewId = viewId;
  this.options = defaults(options, {
    dimensions: [],
    metrics: [],
    filters: [],
    segment: null,
    sort: null,
    start: new Date(),
    end: Dates.month.shift(new Date(), -1),
    index: 1,
    results: 100,
    pretty: true
  });

  var self = this;

  // add the dimension shortcut methods
  Object.keys(this.dimensions).forEach(function (method) {
    var val = self.dimensions[method];
    self[method] = function () {
      return self.dimension(val);
    };
  });

  // add the metric shortcut methods
  Object.keys(this.metrics).forEach(function (method) {
    var val = self.metrics[method];
    self[method] = function () {
      return self.metric(val);
    };
  });
}

/**
 * Methods to dimensions map.
 * @type {Object}
 */
Query.prototype.dimensions = {
  minutely: 'ga:minute',
  hourly: 'ga:hour',
  date: 'ga:date',
  daily: 'ga:day',
  weekly: 'ga:week',
  monthly: 'ga:month',
  yearly: 'ga:year'
};

/**
 * Methods to metrics map.
 * @type {Object}
 */
Query.prototype.metrics = {
  visitors: 'ga:visits'
};

/**
 * Set a query dimension.
 *
 * @param {String} dimension
 * @return {Query}
 */

Query.prototype.dimension = function (dimension) {
  this.options.dimensions.push(dimension);
  return this;
};

/**
 * Set a query metric.
 *
 * @param {String} metric
 * @return {Query}
 */

Query.prototype.metric = function (metric) {
  this.options.metrics.push(metric);
  return this;
};

/**
 * Set a query filter.
 *
 * @param {String} filter
 * @return {Query}
 */

Query.prototype.filter = function (filter) {
  this.options.filters.push(filter);
  return this;
};

/**
 * Set a query segment.
 *
 * @param {String} segment
 * @return {Query}
 */

Query.prototype.segment = function (segment) {
  this.options.segment = segment;
  return this;
};

/**
 * Set a query start.
 *
 * @param {Date} start
 * @return {Query}
 */

Query.prototype.start = function (start) {
  if (util.isDate(start)) start = dateString(start);
  this.options.start = start;
  return this;
};

/**
 * Set a query end.
 *
 * @param {Date} end
 * @return {Query}
 */

Query.prototype.end = function (end) {
  if (util.isDate(end)) end = dateString(end);
  this.options.end = end;
  return this;
};

/**
 * Set a query number of results to return.
 *
 * @param {Number} results
 * @return {Query}
 */

Query.prototype.results = function (results) {
  this.options.results = results;
  return this;
};

/**
 * Run the Google Analytics query.
 *
 * @param {Function} callback
 * @return {Query}
 */

Query.prototype.get = function (callback) {

  // docs: https://developers.google.com/analytics/devguides/reporting/core/v3/reference#startDate
  var payload = {
    'ids': 'ga:' + this.viewId,
    'dimensions': this.options.dimensions.join(','),
    'metrics': this.options.metrics.join(','),
    'filters': this.options.filters.join(','),
    'start-date': this.options.start,
    'end-date': this.options.end,
    'max-results': this.options.results,
    'prettyprint': false,
    'start-index': this.options.index,
  };

  if (this.options.sort) payload.sort = this.options.sort;
  if (this.options.segment) payload.segment = this.options.segment;
  if (this.options.filters) payload.filters = this.options.filters;

  debug('querying %s ..', payload);

  request
    .get(url)
    .set('Authorization', 'GoogleLogin ' + this.token)
    .query(payload)
    .end(function (err, res) {
      if (err) return callback(err);
      var json = res.text;
      debug('finished query [%d]: %s', res.statusCode, json);
      if (res.statusCode !== 200) return callback(new Error('Bad GA query: ' + json));
      try {
        var parsed = JSON.parse(json);
        callback(null, parsed);
      } catch (e) {
        callback(e);
      }
    });

  return this;
};

/**
 * Return the GA `date` string.
 *
 * @param {Date} date
 * @return {String}
 */

function dateString (date) {
  return [
    date.getFullYear(),
    pad(date.getMonth()+1, 2),
    pad(date.getDate(), 2)
  ].join('-');
}

/**
 * Pad the `number` with `width` leading zeros.
 *
 * Credit: https://github.com/puckey/pad-number/blob/master/index.js
 *
 * @param {Number} number
 * @param {Number} width
 * @param {Number} padding
 * @return {String}
 */
function pad(number, width, padding) {
  padding = padding || '0';
  number = number + '';
  var length = number.length;
  return !width || length >= width
    ? '' + number
    : new Array(width - length + 1).join(padding) + number;
}