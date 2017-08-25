const express = require('express');
const bodyParser = require("body-parser");
const router = express.Router();

const init = require('./init-test');
const Const = require('./constants');
const AllBot = require('./lib/AllBot');

const app = express();

const rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: function () { return true } }));
app.use(function(req, res, next) {
  var data = '';
  req.on('data', function(chunk) { 
    data += chunk;
  });
  req.on('end', function() {
    req.rawBody = data;
  });
  next();
});

const allBot = new AllBot(init);

router.use(init.endpointURL, allBot.router);
app.use('', router);

app.get('/', function (req, res) {
  res.send('hello')
})

app.listen(init.port, function () {
  console.log('Chatbothub is listening on port ' + init.port);
})

global.allBot = allBot;

// for testing
module.exports = app;