
var assert = require('assert');
var GA = require('..');

describe('google-analytics', function () {

  var email = 'email';
  var password = 'password';
  var viewId = 'viewId';

  it('should not query without login', function () {
    var ga = GA(viewId);
    assert.throws(function () {
      ga.query();
    });
  });

  it('should succeed with good login', function (done) {
    var ga = GA(viewId);
    ga.login(email, password, function (err, token) {
      if (err) return done(err);
      done();
    });
  });

  it('should query weekly visitors', function (done) {
    var ga = GA(viewId);
    ga.login(email, password, function (err, token) {
      if (err) return done(err);
      ga.query()
        .visitors()
        .weekly()
        .start(new Date('1/1/2014'))
        .end(new Date('2/1/2014'))
        .get(function (err, res) {
          if (err) return done(err);
          assert(res);
          assert(res.rows);
          done();
        });
    });
  });
});