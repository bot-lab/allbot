// console app to setup webhook url
// use $ node ./telegram/console/getWebhookInfo.js [token] 

const request = require('request');

var args = process.argv.slice(2);

var token = args[0];

if(!token){
    console.log('Please specify token');
    return;
}

var url = 'https://api.telegram.org/bot' + token + '/getWebhookInfo';

// request options
var request_options = {
  url: url
}

// POST request to create webhook config
request.get(request_options, function (error, response, body) {
  console.log(body)
})