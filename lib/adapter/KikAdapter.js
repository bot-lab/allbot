const request = require('request');
const mime = require('mime-types')

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class KikAdapter extends BaseAdapter {

    constructor(config) {
        super(config);

        this.provider = Const.kik;
    }

    registerWebHook(service,webHookURL){

        // request options
        const request_options = {
            url: "https://api.kik.com/v1/config",
            auth: {
                user: service.config.userName,
                pass: service.config.apiKey
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
        request.post(request_options, (error, response, body) => {
            
            if(error)
                this.logger.warn("Failed to setup webhook url to Kik",error); 
            else
                this.logger.info('Kik webhook url is registered.',webHookURL);

        })

    }
    
    processGet(req,res,service,cb){
/*
        if(req.qyuery && req.qyuery.sig){
            // its request from Viber when registrating webhoook
            res.send("OK");
            return true;
        }
*/

        return false;
    }

    processPost(req,res,service,cb){

        const data = req.body;
        
        // do parameter check
        if(!data.messages)
            return false;

        if(data.messages.length < 1)
            return false;

        if(!data.messages[0].chatId)
            return false;

        this.logger.debug('Kik Webhook');

        data.messages.forEach((message) => {
            if(cb){
                cb(
                    Const.eventTypeMessage,
                    this.generateMessageObj(service,message),
                    message
                );
            }
        });

        res.send("OK");

        return true;

    }

    generateMessageObj(service,message){

        const messageObj = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + message.from + ":"+ message.chatId,
            providerIdentifier:service.identifier,
            provider:service.provider
        };

        // detect type
        if(message.type == 'text'){
            messageObj.content = {
                type: Const.messageTypeText,
                text: message.body
            }
        }

        if(message.type == 'picture'){
            messageObj.content = {
                type: Const.messageTypeImage,
                url: message.picUrl
            }
        }

        if(message.type == 'video'){
            messageObj.content = {
                type: Const.messageTypeVideo,
                url: message.videoUrl
            }
        }

        if(message.type == 'sticker'){
            messageObj.content = {
                type: Const.messageTypeSticker,
                styckerId: message.stickerPackId,
                url: message.stickerUrl
            }
        }

        return messageObj;

    }

    replyText(text,responseObj,service){

        return new Promise((resolve,reject) => {

            var request_options = {
                url: "https://api.kik.com/v1/message",
                auth: {
                    user: service.config.userName,
                    pass: service.config.apiKey
                },
                json: {
                    "messages": [
                        {
                            "body": text, 
                            "to": responseObj.from, 
                            "type": "text", 
                            "chatId": responseObj.chatId
                        }
                    ]
                }
            };

            // POST request to create webhook config
            request.post(request_options, (error, response, body) => {

                if(error){
                    this.logger.warn('Kik failed to send message',error);
                    reject();
                    return;
                }

                resolve({
                    code:response.statusCode,
                    body:body
                });

            });

        });

    }

    sendText(text,userIdentifier,service){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userName = userIdentifierChunks[2];
            const chatId = userIdentifierChunks[3];

            
            var request_options = {
                url: "https://api.kik.com/v1/message",
                auth: {
                    user: service.config.userName,
                    pass: service.config.apiKey
                },
                json: {
                    "messages": [
                        {
                            "body": text, 
                            "to": userName, 
                            "type": "text", 
                            "chatId": chatId
                        }
                    ]
                }
            };

            // POST request to create webhook config
            request.post(request_options,(error, response, body) => {

                if(error){
                    this.logger.warn('kik failed to send text',error);
                    reject();
                    return;
                }

                resolve({
                    code:response.statusCode,
                    body:body
                });

            });

        });
    }


    sendFile(fileId,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            const config = service.config;
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userName = userIdentifierChunks[2];
            const chatId = userIdentifierChunks[3];
            const fileURL = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId;

            // get file type
            let typeTest = mime.lookup(fileId);
            let type = "";

            if(/image/.test(typeTest)){
                type = 'picture'
            }
            if(/video/.test(typeTest)){
                type = 'video'
            }

            if(!type){

                if(cb)
                    cb(0,null);

                return;
            }

            const message = {
                "to": userName, 
                "chatId": chatId,
                "type":type
            }

            if(type == 'picture'){
                message.picUrl = fileURL;
            }
            if(type == 'video'){
                message.videoUrl = fileURL;
                message.muted = true;
                message.autoplay = true;
                message.attribution = "camera";
            }

            var request_options = {
                url: "https://api.kik.com/v1/message",
                auth: {
                    user: service.config.userName,
                    pass: service.config.apiKey
                },
                json: {
                    "messages": [
                        message
                    ]
                }
            };

            // POST request to create webhook config
            request.post(request_options,(error, response, body) => {

                if(error){
                    this.logger.warn('Kik failed to send file',error);
                    reject();
                    return;
                }

                resolve({
                    code:response.statusCode,
                    body:body
                });

            }) 

        });

    }

    downloadFile(response,path,sevice,cb){

        return new Promise((resolve,reject) => {
                
            let url = "";

            if(!response){
                if(cb)
                    cb(null);
                return;
            }

            if(response.picUrl)
                url = response.picUrl;

            if(response.videoUrl)
                url = response.videoUrl;

            if(url === ""){
                if(cb)
                    cb(null);
                return;
            }

            this.saveFileFromUrl(url,path,(filename) => {

                resolve(filename);

            });
        
        });

    }

    sendLocation(userIdentifier,coordinate,service,cb){
        
        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userName = userIdentifierChunks[2];
            const chatId = userIdentifierChunks[3];

            const url = "https://www.google.com/maps/search/?api=1&query=" + coordinate.latitude + "," + coordinate.longitude;
            
            var request_options = {
                url: "https://api.kik.com/v1/message",
                auth: {
                    user: service.config.userName,
                    pass: service.config.apiKey
                },
                json: {
                    "messages": [
                        {
                            "url": url, 
                            "to": userName, 
                            "type": "link", 
                            "chatId": chatId
                        }
                    ]
                }
            };

            // POST request to create webhook config
            request.post(request_options,(error, response, body) => {

                if(error){
                    this.logger.warn('Kik failed to send file',error);
                    reject();
                    return;
                }

                resolve({
                    code:response.statusCode,
                    body:body
                });

            });
        
        });

    }

}

module["exports"] = KikAdapter;