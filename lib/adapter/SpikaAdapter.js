const request = require('request');
const mime = require('mime-types')

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class SpikaAdapter extends BaseAdapter {

    constructor(config) {
        super(config);

        this.provider = Const.spika;
    }

    
    processGet(req,res,service,cb){

        return false;
    }

    processPost(req,res,service,cb){

        const data = req.body;
        const spikaKey = req.headers['spika-key'];

        if(!spikaKey)
            return false;

        if(spikaKey != service.config.key)
            return false;

        this.logger.debug('spika Webhook');

        if(data.event == 'message' && 
            data.receiver && 
            data.receiver.userid == service.config.bot.username &&
            cb){

            cb(
                Const.eventTypeMessage,
                this.generateMessageObj(service,data),
                data
            );
        }

        else if(data.event == 'start_conversation' &&
                data.user && 
                data.user.userid == service.config.bot.username &&
                //data.isFirst == true && 
                cb){
                    
            cb(
                Const.eventTypeNewChat,
                this.generateOpenChatObj(service,data),
                data
            );
        }

        res.send("OK");

        return true;

    }

    generateOpenChatObj(service,data){
        
        const messageObj = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + data.from.userid,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:data.from.userid
        };
        
        return messageObj;
    }
    
    generateMessageObj(service,data){

        const messageObj = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + data.sender.userid,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:data.sender.userid
        };

        const message = data.message;
        const file = data.file;

        // detect type
        if(message.type == 1){
            messageObj.content = {
                type: Const.messageTypeText,
                text: message.message
            }
        }

        if(message.type == 2 &&
            file && 
            file.file &&
            /image/.test(file.file.mimeType)){

            messageObj.content = {
                type: Const.messageTypeImage,
                url: service.config.baseURL + "/api/v2/file/" + file.file.id
            }

        }

        if(message.type == 2 &&
            file && 
            file.file &&
            /video/.test(file.file.mimeType)){

            messageObj.content = {
                type: Const.messageTypeVideo,
                url: service.config.baseURL + "/api/v2/file/" + file.file.id
            }

        }

        if(message.type == 5){
            messageObj.content = {
                type: Const.messageTypeSticker,
                url: service.config.baseURL + message.message
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

module["exports"] = SpikaAdapter;