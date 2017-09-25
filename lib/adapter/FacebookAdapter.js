/*
    Handle facebook messenger API
*/

const request = require('request');
const mime = require('mime');

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class FacebookAdapter extends BaseAdapter {

    constructor(config) {
        super(config);

        this.provider = Const.facebook;
    }

    processGet(req,res,service,cb){

        var config = service.config;
        
        if(!req.query['hub.verify_token'])
            return false;

        this.logger.info('Facebook get',req.query);

        if(req.query['hub.verify_token'] != config.verifyToken){
            // ignore if the request is not for this service
            return false;
        }

        if (req.query['hub.mode'] === 'subscribe' &&
            req.query['hub.verify_token'] === config.verifyToken) {

            this.logger.info('Facebook verification');
            res.status(200).send(req.query['hub.challenge']);
            
        } else {
            this.logger.warn('Facebook Failed validation. Make sure the validation tokens match.');
            res.sendStatus(403);          
        }  

        return true;

    }

    processPost(req,res,service,cb){

        var data = req.body;

        // reply webhook which is for this service
        if(!data.entry)
            return false;

        if(data.entry.length == 0)
            return false;

        if(!data.entry[0].id)
            return false;

        if(data.entry[0].id != service.config.pageId)
            return false;
        
        var config = service.config;

        // send response immediatelly so prevent re-sending
        res.sendStatus(200);

        // check it is request from facebook
        // Make sure this is a page subscription
        if (data.object === 'page') {

            this.logger.debug('Facebook Webhook');

            // Iterate over each entry - there may be multiple if batched
            data.entry.forEach((entry) => {
                var pageID = entry.id;
                var timeOfEvent = entry.time;

                if(entry.messaging){

                    // Iterate over each messaging event
                    entry.messaging.forEach((event) => {

                        if(event.message && cb){
                            cb(
                                this.generateMessageObj(service,event),
                                event
                            );
                        }


                    });

                }
            
            });

        }

        return true;
        
    }

    generateMessageObj(service,webhookRequest){

        const message = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + webhookRequest.sender.id,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:webhookRequest.sender.id
        };

        // detect type
        if(webhookRequest.message.text){
            message.content = {
                type: Const.messageTypeText,
                text: webhookRequest.message.text
            }
        }

        else if(webhookRequest.message.attachments){

            var atatchment = webhookRequest.message.attachments[0];

            if(!atatchment)
                return message;

            if(atatchment.type == 'image'){

                if(atatchment.payload.sticker_id){
                    message.content = {
                        type: Const.messageTypeSticker,
                        url: atatchment.payload.url
                    }
                }else{
                    message.content = {
                        type: Const.messageTypeImage,
                        url: atatchment.payload.url
                    }
                }

            }

            if(atatchment.type == 'audio'){

                message.content = {
                    type: Const.messageTypeAudio,
                    url: atatchment.payload.url
                }

            }

            if(atatchment.type == 'video'){

                message.content = {
                    type: Const.messageTypeVideo,
                    url: atatchment.payload.url
                }

            }

            if(atatchment.type == 'location'){

                message.content = {
                    type: Const.messageTypeLocation,
                    address:atatchment.payload.address,
                    coordinates: {
                        latitude:atatchment.payload.coordinates.lat,
                        longitude:atatchment.payload.coordinates.long
                    }
                }

            }

        }
        
        return message;
    }

    replyText(text,responseObj,service){
        
        return new Promise((resolve,reject) => {

            var config = service.config;

            // ignore if message doesn't exists
            if(responseObj.message === undefined){
                reject(null);
                return;
            }

            if(config.replyToBot === false &&
                responseObj.message.is_echo && 
                responseObj.message.is_echo === true){
                    reject(null);
                    return;
            }

            var messageData = {
                recipient: {
                    id: responseObj.sender.id
                },
                message: {
                    text: text
                }
            };

            request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: config.accessToken },
                method: 'POST',
                json: messageData
    
            }, (error, response, body) => {

                if(error){
                    this.logger.warn('Facebook failed to reply message',error);
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

    sendText(text,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {

            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];
            
            var config = service.config;

            var messageData = {
                recipient: {
                    id: userId
                },
                message: {
                    text: text
                }
            };

            request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: config.accessToken },
                method: 'POST',
                json: messageData

            },(error, response, body)=> {

                if(error){
                    this.logger.warn('Facebook failed to send message',error);
                    reject();
                    return;
                }

                resolve({
                    code:response.statusCode,
                    body:body
                });

            });  

        })

    }

    sendFile(fileId,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            var config = service.config;

            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            let typeTest = mime.lookup(fileId);
            let type = "";

            if(/image/.test(typeTest)){
                type = 'image';
            };

            if(/video/.test(typeTest)){
                type = 'video';
            }

            if(/audio/.test(typeTest)){
                type = 'audio';
            };

            var messageData = {
                recipient: {
                    id: userId
                },
                message: {
                    attachment: {
                        type: type,
                        payload: {
                            "url": this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId,
                            "is_reusable": true
                        }
                    }
                }
            };

            this.logger.warn('Download URL',this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId);

            request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: config.accessToken },
                method: 'POST',
                json: messageData

            }, function (error, response, body) {

                if(error){
                    this.logger.warn('Facebook failed to send file',error);
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

    downloadFile(response,path,sevice,cb){
        
        return new Promise((resolve,reject) => {
                
            if(!response ||
                !response.message ||
                !response.message.attachments ||
                response.message.attachments.length < 1){

                    reject();
                    return;
            }

            const atatchment = response.message.attachments[0];

            const url = atatchment.payload.url;

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
            const userId = userIdentifierChunks[2];
            
            const config = service.config;
            const url = "https://www.google.com/maps/search/?api=1&query=" + coordinate.latitude + "," + coordinate.longitude;

            var messageData = {
                recipient: {
                    id: userId
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            elements: [{
                                title: 'Location Shared',
                                default_action: {
                                    type: "web_url",
                                    url: url,
                                    messenger_extensions: true,
                                    webview_height_ratio: "tall",
                                },
                                buttons:[{
                                    type:"web_url",
                                    url:url,
                                    title:"Open Map"
                                }] 
                            }]
                        }
                    }
                }
            };

            request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: config.accessToken },
                method: 'POST',
                json: messageData

            }, function (error, response, body) {

                if(error){
                    this.logger.warn('Facebook failed to send location',error);
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

module["exports"] = FacebookAdapter;