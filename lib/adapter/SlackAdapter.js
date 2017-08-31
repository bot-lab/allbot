const request = require('request');
const fs = require('fs');
const mime = require('mime-types');
const easyimg = require('easyimage');
const Thumbler = require('thumbler');

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class SlackAdapter extends BaseAdapter {

    constructor(config) {
        super(config);
        this.provider = Const.slack;
    }

    processGet(req,res,service,cb){
        return false;
    }

    processPost(req,res,service,cb){

        const data = req.body;
        const appId = data.api_app_id;

        // get challenge
        const reqType = data.type;

        if(reqType == 'url_verification'){

            this.logger.debug('Receive slack url_verification webhook');
            res.send(data.challenge);
            
            return true;

        } else if(reqType == 'event_callback'){

            this.logger.debug('Receive slack event_callback webhook appId is',appId);

            if(appId && appId !== service.config.appId)
                return false;

            var eventObj = data.event;
            var eventType = eventObj.type;
            var eventSubType = eventObj.subtype;

            if(eventObj.type == "message" && 
                ( 
                    eventSubType === undefined ||
                    eventSubType == 'file_share'
                )){

                if(cb){
                    cb(
                        this.generateMessageObj(service,eventObj),
                        eventObj
                    );
                }

            }

            res.send("OK");
            return true;

        }

        return false;

    }

    generateMessageObj(service,event){

        const message = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + event.channel,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:event.channel
        };
        
        if(event.file){
            
            var file = event.file;

            if(/image/.test(file.mimetype)){
                message.content = {
                    type: Const.messageTypeImage,
                    url: file.url_private_download,
                    thumbnailUrl: file.thumb_720
                }
            }

            else if(/video/.test(file.mimetype)){
                message.content = {
                    type: Const.messageTypeVideo,
                    url: file.url_private_download
                }
            }

        } else {

            message.content = {
                type: Const.messageTypeText,
                text: event.text
            }

        }

        return message;

    }

    replyText(text,responseObj,service,cb){

        return new Promise((resolve,reject) => {
                
            var message = {
                text: text
            }

            request({
                uri: service.config.incomingWebHookURL,
                method: 'POST',
                json: message

            },(error, response, body) => {

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

    sendText(text,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];

            var message = {
                text: text
            }

            request({
                uri: service.config.incomingWebHookURL,
                method: 'POST',
                json: message

            }, (error, response, body) => {

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

    downloadFile(response,path,service,cb){
        
        return new Promise((resolve,reject) => {
                
            if(!response ||
                !response.file ||
                !response.file.url_private_download ){

                    reject();

                    return;
            }
            
            let url = response.file.url_private_download;
            const config = service.config;

            request({
                method: 'get',
                url:url,
                encoding: null,
                headers: {
                    Authorization: "Bearer " + config.botToken
                }
            },(error, response, body) => {

                const contentType = response.headers['content-type'];
                let exension = "";
        
                if(contentType && contentType.split('/').length > 1){
                    exension = contentType.split('/')[1];
                }
        
                let filename = this.generateFileName();
                if(exension)
                    filename += "." + exension;
        
                const pathToDownload = path + "/" + filename;
                const file = fs.createWriteStream(pathToDownload);

                file.write(body);
                file.end();
                
                resolve(filename);

            });
        });
    }


    sendFile(fileId,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            

            const fileURL = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId;

            // get file type
            let typeTest = mime.lookup(fileId);
            let type = "";

            if(/image/.test(typeTest)){

                const fileNameChunk = fileId.split(".");
                let thumbName = fileNameChunk[0] + "_thumb";
                if(fileNameChunk.length > 1)
                    thumbName += "." + fileNameChunk[1];

                return easyimg.thumbnail({
                    src:this.config.downloadPath + "/" + fileId, 
                    dst:this.config.downloadPath + "/" + thumbName, 
                    width:240, height:240,
                    x:0, y:0
                }).then((file) => {
                    
                    return doSend({
                        type:"image",
                        downloadURL:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId ,
                        thumbnailURL:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + thumbName,
                    });
                    
                }).then((result) => {
                    
                    resolve(result);

                }).catch((err) => {

                    reject();

                });

            }

            if(/video/.test(typeTest) || /quicktime/.test(fileId)){
                type = 'video'

                const fileNameChunk = fileId.split(".");
                let thumbName = fileNameChunk[0] + "_thumb";
                if(fileNameChunk.length > 1)
                    thumbName += ".jpg";

                return Thumbler({
                    type: 'video', 
                    input: this.config.downloadPath + "/" + fileId, 
                    output: this.config.downloadPath + "/" + thumbName, 
                    time: '00:00:00'
                }, (err, path) => {

                    doSend({type:"video",
                        downloadURL:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId ,
                        thumbnailURL:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + thumbName,
                    }).then((result) => {
                        
                        resolve(result);
    
                    }).catch((err) => {
    
                        reject();
    
                    });

                });

            }

            if(/audio/.test(typeTest)){
                type = 'audio'

                doSend({
                    type:"audio",
                    downloadURL:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId ,
                }).then((result) => {
                    
                    resolve(result);

                }).catch((err) => {

                    reject();

                });

            }

            function doSend(messageObj) {

                var message = {
                    "text": "",
                    "attachments": [
                        {
                            "title": "Download File From Here",
                            "title_link": messageObj.downloadURL,
                            "image_url": messageObj.thumbnailURL
                        }
                    ]
                }
                
                return new Promise((resolve,reject) => {

                    request({
                        uri: service.config.incomingWebHookURL,
                        method: 'POST',
                        json: message
            
                    }, (error, response, body) => {
            
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

        });
    }

    sendLocation(userIdentifier,coordinate,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];

            const url = "https://www.google.com/maps/search/?api=1&query=" + coordinate.latitude + "," + coordinate.longitude;

            var message = {
                "text": "",
                "attachments": [
                    {
                        "title": "Location Sent",
                        "title_link": url
                    }
                ]
            }

            request({
                uri: service.config.incomingWebHookURL,
                method: 'POST',
                json: message

            },(error, response, body) => {

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
    
}

module["exports"] = SlackAdapter;