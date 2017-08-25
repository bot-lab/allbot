// console app to register webhook url
// use $ node ./console/twitter/registerWebHook.js [consumerKey] [consumerSecret] [token] [tokenSecret] [URL]

const request = require('request');
const init = require('../../init.js');

var args = process.argv.slice(2);

var consumerKey = args[0];

if(!consumerKey){
    console.log('Please specify consumerKey');
    return;
}

var consumerSecret = args[1];

if(!consumerSecret){
    console.log('Please specify consumerSecret');
    return;
}

var token = args[2];

if(!token){
    console.log('Please specify token');
    return;
}

var tokenSecret = args[3];

if(!tokenSecret){
    console.log('Please specify tokenSecret');
    return;
}

var webHookURL = args[4];

if(!webHookURL){
    console.log('Please specify webhook url');
    return;
}

var twitter_oauth = {
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  token: token,
  token_secret: tokenSecret
}

// request options
var request_options = {
  url: 'https://api.twitter.com/1.1/account_activity/webhooks.json',
  oauth: twitter_oauth,
  headers: {
    'Content-type': 'application/x-www-form-urlencoded'
  },
  form: {
    url: webHookURL
  }
}

// POST request to create webhook config
request.post(request_options, function (error, response, body) {
  console.log(body)
})