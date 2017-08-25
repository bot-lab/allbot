const request = require('request');
const crypto = require('crypto');

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class TwitterAdapter extends BaseAdapter {

    constructor(config) {
        super(config);
        this.provider = Const.twitter;
    }

    processGet(req,res,service,cb){

        return false;


        const crcToken = req.query.crc_token;

        if(crcToken){

            var hmac = crypto.createHmac('sha256', service.config.twitterConsumerSecret).update(crcToken).digest('base64');

            res.send({
                response_token: 'sha256=' + hmac
            })

            res.send("OK");

            return true;;
        }
        
        return false;

    }

    processPost(req,res,service,cb){


        return false;
    }

    generateMessageObj(service,data){
        
        const message = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + data.From,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:data.From,
            message: data.Body
        };

        return message;

    }

    replyText(text,responseObj,service,cb){

        // Twilio Credentials 
        var accountSid = service.config.accountSid; 
        var authToken = service.config.authToken; 
        
        //require the Twilio module and create a REST client 
        var client = require('twilio')(accountSid, authToken); 
        
        client.messages.create({ 
            to: responseObj.From, 
            from: service.config.number, 
            body: text, 
        }, function(err, message) { 
            
            if(cb){
                if(err)
                    cb(500,err);
                else
                    cb(200,message);
            }

        });

    }

}

module["exports"] = TwitterAdapter;