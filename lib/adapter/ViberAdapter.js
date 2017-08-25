const request = require('request');
const fs = require("fs");
const easyimg = require('easyimage');
const mime = require('mime-types');
const Thumbler = require('thumbler');
const mm = require('music-metadata');

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class ViberAdapter extends BaseAdapter {

    constructor(config) {
        super(config);
        this.provider = Const.viber;
    }

    registerWebHook(service,webHookURL){

        // request options
        const request_options = {
            url: "https://chatapi.viber.com/pa/set_webhook",
            headers: {
                "X-Viber-Auth-Token":service.config.apiKey
            },
            json: {  
                "url": webHookURL,  
                "event_types": ["delivered", "seen", "failed", "subscribed", "unsubscribed", "conversation_started"]  
            }
        };
        
        // POST request to create webhook config
        request.post(request_options, (error, response, body) => {
            
            if(body.status_message != 'ok')
                this.logger.warn('Viber Failed to setup webhook url to Viber',body);
            else
                this.logger.info('Viber webhook url is registered.',webHookURL);

        })

    }

    processGet(req,res,service,cb){
        return false;
    }

    processPost(req,res,service,cb){

        const data = req.body;
        
        // do parameter check
        if(!data.event)
            return false;

        if(data.event == 'webhook'){
            res.send("OK");
            return true;
        }

        if(data.event == 'message'){
            if(!data.sender)
                return false;

            if(!data.sender.id)
                return false;

            this.logger.debug('Viber Webhook');

            if(cb){
                cb(
                    this.generateMessageObj(service,data),
                    data
                );
            }

            res.send("OK");
            return true;
        }

        
        return true;

    }

    generateMessageObj(service,data){

        const message = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + data.sender.id,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:data.sender.id,
        };

        if(data.message.type == 'text'){
            message.content = {
                type: Const.messageTypeText,
                text: data.message.text
            }
        }

        else if(data.message.type == 'picture'){
            message.content = {
                type: Const.messageTypeImage,
                url: data.message.media,
                thumbnailUrl: data.message.thumbnail
            }
        }

        else if(data.message.type == 'video'){
            message.content = {
                type: Const.messageTypeVideo,
                url: data.message.media,
                thumbnailUrl: data.message.thumbnail
            }
        }

        else if(data.message.type == 'sticker'){
            message.content = {
                type: Const.messageTypeSticker,
                url: data.message.media,
                styckerId: data.message.sticker_id
            }
        }

        else if(data.message.type == 'location'){
            message.content = {
                type: Const.messageTypeLocation,
                coordinates: {
                    latitude: data.message.location.lat,
                    longitude: data.message.location.lon
                }
            }
        }

        else if(data.message.sticker){
            message.content = {
                type: Const.messageTypeSticker,
                styckerId: data.message.sticker.file_id
            }
        }

        else if(data.message.voice){

            message.content = {
                type: Const.messageTypeAudio,
                url: undefined,
                id:data.message.voice.file_id
            }

        }

        return message;

    }

    replyText(text,responseObj,service,cb){

        return new Promise((resolve,reject) => {
                
            var request_options = {
                url: "https://chatapi.viber.com/pa/send_message",
                headers: {
                    "X-Viber-Auth-Token":service.config.apiKey
                },
                json: {
                    "receiver": responseObj.sender.id,
                    "min_api_version": 1,
                    "sender": {
                        "name": service.config.botName,
                        "avatar": service.config.botAvatar
                    },
                    "tracking_data": "tracking data",
                    "type": "text",
                    "text": text
                }
            };

            // POST request to create webhook config
            request.post(request_options, (error, response, body) => {

                if(error){
                    this.logger.warn('Slack failed to send message',error);
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

    sendText(text,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            var request_options = {
                url: "https://chatapi.viber.com/pa/send_message",
                headers: {
                    "X-Viber-Auth-Token":service.config.apiKey
                },
                json: {
                    "receiver": userId,
                    "min_api_version": 1,
                    "sender": {
                        "name": service.config.botName,
                        "avatar": service.config.botAvatar
                    },
                    "tracking_data": "tracking data",
                    "type": "text",
                    "text": text
                }
            };

            // POST request to create webhook config
            request.post(request_options, function (error, response, body) {

                if(error){
                    this.logger.warn('Slack failed to send message',error);
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

    downloadFile(response,path,sevice){

        return new Promise((resolve,reject) => {
                
            let url = "";

            if(!response ||
                !response.message ||
                !response.message.media){
                
                reject();

                return;

            }

            this.saveFileFromUrl(response.message.media,path,(filename) => {

                resolve(filename);

            });

        });

    }
    
    sendFile(fileId,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {

            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            const sendData = {
                "receiver": userId,
                "min_api_version": 1,
                "sender": {
                    "name": service.config.botName,
                    "avatar": service.config.botAvatar
                },
                "tracking_data": "tracking data",
            };


            // get file type
            let typeTest = mime.lookup(fileId);
            let type = "";

            const fileNameChunk = fileId.split(".");
            let thumbName = fileNameChunk[0] + "_thumb";
            if(fileNameChunk.length > 1)
                thumbName += ".jpg";

            const stats = fs.statSync(this.config.downloadPath + "/" + fileId);
            const fileSizeInBytes = stats.size

            if(/image/.test(typeTest)){
                
                sendData.type = "picture";

                easyimg.thumbnail({
                    src:this.config.downloadPath + "/" + fileId, 
                    dst:this.config.downloadPath + "/" + thumbName, 
                    width:240, height:240,
                    x:0, y:0
                }).then((file) => {
                    
                    sendData.media = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId;
                    sendData.thumbnail = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + thumbName;

                    doSend(sendData).then( (result) => {
                        resolve(result);
                    }).catch((err) => {
                        reject(err);
                    });
                    
                });

            }else if(/video/.test(typeTest)){

                Thumbler({
                    type: 'video', 
                    input: this.config.downloadPath + "/" + fileId, 
                    output: this.config.downloadPath + "/" + thumbName, 
                    time: '00:00:00'
                }, (err, path) => {

                    if (err) {
                        this.logger.warn('Viber failed generate thumbnail',err);
                        return;
                    };

                    sendData.type = "video";
                    sendData.media = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId;
                    sendData.thumbnail = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + thumbName;
                    sendData.size = fileSizeInBytes;

                    doSend(sendData).then( (result) => {
                        resolve(result);
                    }).catch((err) => {
                        reject(err);
                    });

                });

            } else {

                sendData.type = "file";
                sendData.media = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId;
                sendData.size = fileSizeInBytes;

                doSend(sendData).then( (result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });

            }

            function doSend(sendData) {

                return new Promise((resolve,reject) => {

                    var request_options = {
                        url: "https://chatapi.viber.com/pa/send_message",
                        headers: {
                            "X-Viber-Auth-Token":service.config.apiKey
                        },
                        json: sendData
                    };
            
                    // POST request to create webhook config
                    request.post(request_options, (error, response, body) => {
            
                        if(error){
                            this.logger.warn('Slack failed to send message',error);
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
        
        }); // Promise
    }


    sendLocation(userIdentifier,coordinate,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            var request_options = {
                url: "https://chatapi.viber.com/pa/send_message",
                headers: {
                    "X-Viber-Auth-Token":service.config.apiKey
                },
                json: {
                    "receiver": userId,
                    "min_api_version": 1,
                    "sender": {
                        "name": service.config.botName,
                        "avatar": service.config.botAvatar
                    },
                    "tracking_data": "tracking data",
                    "type": "location",
                    "location": {
                        lat: coordinate.latitude,
                        lon: coordinate.longitude
                    }
                }
            };

            request.post(request_options, (error, response, body) => {

                if(error){
                    this.logger.warn('Slack failed to send message',error);
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
    
}

module["exports"] = ViberAdapter;