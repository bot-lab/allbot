// console app to setup webhook url
// use $ node ./console/kik/getConfigration.js [usename] [apikey]

const request = require('request');

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


// request options
var request_options = {
    url: "https://api.kik.com/v1/config",
    auth: {
        user: username,
        pass: apikey
    },
}

// POST request to create webhook config
request.get(request_options, function (error, response, body) {
  console.log(body)
})