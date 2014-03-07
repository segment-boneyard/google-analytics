
# google-analytics

  Query Google Analytics data from node.

## Installation

    $ npm install segmentio/google-analytics

## Example

Create a new Google Analytics instance with a `viewId`, and then login:

```js
var GA = require('google-analytics');

var ga = GA('67032470');
ga.login('user@gmail.com', 'password', function (err) {
    // login first
});
```

Then you can query unique visitors:

```js
ga.query()
  .visitors()
  .weekly()
  .start(new Date('1/1/2014'))
  .end(new Date('2/1/2014'))
  .get(function (err, res) {

});
```

Or form a generic query:

```js
ga.query()
  .dimension('ga:source')
  .metric('ga:visits')
  .filter('ga:medium==referral')
  .segment('segment=gaid::10 OR dynamic::ga:medium==referral')
  .start(new Date('1/1/2014'))
  .end(new Date('2/1/2014'))
  .index(10)
  .results(100)
  .get(function (err, res) {
  // ..
});
```

The [data feed request format](https://developers.google.com/analytics/devguides/reporting/core/v2/gdataReferenceDataFeed) explains the different arguments that can be used in a Google Analytics data request. You can play around with sample requests in the [GA dev tools query explorer](http://ga-dev-tools.appspot.com/explorer/?csw=1).

### Custom Dynamic Segments

You can create powerful dynamic segments on demand using [filter operators](https://developers.google.com/analytics/devguides/reporting/core/v3/reference#filterOperators), like so:

```js
ga.query()
  .visitors()
  .daily()
  .start(start)
  .end(end)
  .segment('dynamic::ga:pagePath==/,ga:pagePath==/signup,ga:pagePath==/pricing,ga:pagePath=@/docs')
  .get(function (err, res) {
    if (err) return callback(err);
    var visitors = res.rows.reduce(function (memo, row) {
      return memo + parseInt(row[1], 10); 
    }, 0);
    callback(null, visitors);
  });
```

## License

MIT