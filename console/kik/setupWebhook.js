// console app to setup webhook url
// use $ node ./kik/console/setupWebhook.js [usename] [apikey] [url] 
// configure init.js before doing this

const request = require('request');
const init = require('../../init.js');

var args = process.argv.slice(2);

var username = args[0];

if(!username){
    console.log('Please specify username');
    return;
}

var apikey = args[1];

if(!apikey){
    console.log('Please specify apikey');
    return;
}


var webHookURL = args[2];

if(!webHookURL){
    console.log('Please specify webHookURL');
    return;
}


// request options
var request_options = {
    url: "https://api.kik.com/v1/config",
    auth: {
        user: username,
        pass: apikey
    },
    json: {
        "webhook": webHookURL, 
        "features": {
            "receiveReadReceipts": false, 
            "receiveIsTyping": false, 
            "manuallySendReadReceipts": false, 
            "receiveDeliveryReceipts": false
        }
    }
};

// POST request to create webhook config
request.post(request_options, function (error, response, body) {
  console.log(body)
})