// console app to setup webhook url
// use $ node ./telegram/console/setupWebhook.js [token] [url] 
// it doesn't work if you are using self-certificaeted certificate
// in the case plase do the post manually.
// https://core.telegram.org/bots/api#setwebhook

const request = require('request');

var args = process.argv.slice(2);

var token = args[0];

if(!token){
    console.log('Please specify token');
    return;
}

var webHookURL = args[1];

if(!webHookURL){
    console.log('Please specify webhook url');
    return;
}

var url = 'https://api.telegram.org/bot' + token + '/setWebhook';

// request options
var request_options = {
  url: url,
  headers: {
    'Content-type': 'application/x-www-form-urlencoded'
  },
  formData: {
    url: webHookURL
  }
}

// POST request to create webhook config
request.post(request_options, function (error, response, body) {
  console.log(body)
})