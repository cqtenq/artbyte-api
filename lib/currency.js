'use strict';

var request = require('request');

function CurrencyController(options) {
  this.node = options.node;
  var refresh = options.currencyRefresh || CurrencyController.DEFAULT_CURRENCY_DELAY;
  this.currencyDelay = refresh * 60000;
  this.bitstampRate = 0;
  this.timestamp = Date.now();
}

CurrencyController.DEFAULT_CURRENCY_DELAY = 10;

CurrencyController.prototype.index = function(req, res) {
  var self = this;
  var currentTime = Date.now();
  if (self.bitstampRate === 0 || currentTime >= (self.timestamp + self.currencyDelay)) {
    self.timestamp = currentTime;
    request('https://www.cryptonator.com/api/full/aby-usd/', function(err, response, body) {
      if (err) {
        self.node.log.error(err);
      }
      if (!err && response.statusCode === 200) {
        var ticker = JSON.parse(body).ticker;
        if (ticker !== null) {
          self.bitstampRate = parseFloat(ticker[0].price);
        }
        else {
          self.node.log.error(new Error('Bad cryptonator response: missing ticker'));
        }
      }
      res.jsonp({
        status: 200,
        data: { 
          bitstamp: self.bitstampRate 
        }
      });
    });
  } else {
    res.jsonp({
      status: 200,
      data: { 
        bitstamp: self.bitstampRate 
      }
    });
  }

};

module.exports = CurrencyController;
