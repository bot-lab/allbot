const request = require('request');

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class TwilioAdapter extends BaseAdapter {

    constructor(config) {
        super(config);
        this.provider = Const.twilio;
    }

    processGet(req,res,service,cb){
        return false;
    }

    processPost(req,res,service,cb){

        const data = req.body;

        // do parameter check
        if(!data.To)
            return false;

        if(!data.From)
            return false;

        if(data.To != service.config.number)
            return false;

        this.logger.debug('Twilio Webhook');

        if(cb){
            cb(
                Const.eventTypeMessage,
                this.generateMessageObj(service,data),
                data
            );
        }

        res.send("");

        return true;

    }

    generateMessageObj(service,data){
        
        const message = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + data.From,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:data.From
        };

        if(data.Body && data.Body.length > 0){
            message.content = {
                type: Const.messageTypeText,
                text: data.Body
            }
        }

        return message;

    }

    replyText(text,responseObj,service,cb){

        return new Promise((resolve,reject) => {

            // Twilio Credentials 
            var accountSid = service.config.accountSid; 
            var authToken = service.config.authToken; 
            
            //require the Twilio module and create a REST client 
            var client = require('twilio')(accountSid, authToken); 
            
            client.messages.create({ 
                to: responseObj.From, 
                from: service.config.number, 
                body: text, 
            }, (err, message) => { 
                
                if(err){
                    this.logger.warn('Telegram failed to send message',err);
                    reject();
                    return;
                }

                resolve({
                    code:200,
                    body:message
                });

            });

        });

    }

    sendText(text,userIdentifier,service){

        return new Promise((resolve,reject) => {

            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const from = userIdentifierChunks[2];

            // Twilio Credentials 
            var accountSid = service.config.accountSid; 
            var authToken = service.config.authToken; 
            
            //require the Twilio module and create a REST client 
            var client = require('twilio')(accountSid, authToken); 
            
            client.messages.create({ 
                to: from, 
                from: service.config.number, 
                body: text, 
            }, (err, message) => { 
                
                if(err){
                    this.logger.warn('Telegram failed to send message',err);
                    reject();
                    return;
                }

                resolve({
                    code:200,
                    body:message
                });

            });

        });

    }
    
}

module["exports"] = TwilioAdapter;