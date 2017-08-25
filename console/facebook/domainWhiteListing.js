// console app to setup webhook url
// use $ node ./console/facebook/domainWhiteListing.js [token] [domain]

const request = require('request');

var args = process.argv.slice(2);

var token = args[0];

if(!token){
    console.log('Please specify token');
    return;
}

var domain = args[1];

if(!domain){
    console.log('Please specify domain');
    return;
}

var url = 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + token;

// request options
var request_options = {
  url: url,
  json: {
    setting_type:"domain_whitelisting",
    whitelisted_domains:[domain],
    domain_action_type: "add"
  }
}

// POST request to create webhook config
request.post(request_options, function (error, response, body) {
  console.log(body)
})