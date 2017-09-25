/*
    Handle facebook messenger API
*/

const request = require('request');
const crypto = require('crypto');
const line = require('@line/bot-sdk');
const fs = require('fs');
const URL = require('url');
const easyimg = require('easyimage');
const mime = require('mime-types');
const Thumbler = require('thumbler');
const mm = require('music-metadata');

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class LineAdapter extends BaseAdapter {

    constructor(config) {
        super(config);

        this.provider = Const.line;
    }

    processGet(req,res,service,cb){

        return false;

    }

    processPost(req,res,service,cb){

        const data = req.body;
        const signatureOrig = req.headers['x-line-signature'];

        if(!signatureOrig)
            return false;

        if(!data.events)
            return false;

        if(data.events.length < 1)
            return false;

        const channelSecret = service.config.channelSecret;
        const body = req.rawBody; // Request body string

        const signatureGenerated = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
        
        // process if signature is matched
        if(signatureGenerated == signatureOrig){

            this.logger.debug('Line Webhook');

            // Iterate over each entry - there may be multiple if batched
            data.events.forEach((event) => {

                if(event.type == 'message'){
                    
                    if(cb){
                        cb(
                            Const.eventTypeMessage,
                            this.generateMessageObj(service,event),
                            event
                        );
                    }

                }

            });
            
            res.send('ok');

            return true;

        } else {
            
            this.logger.warn('Line wrong signature ' + signatureOrig + ' expected ' + signatureGenerated);

        }
        
        
        return false;

    }

    generateMessageObj(service,event){

        const message = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + event.source.userId,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:event.source.userId,
        };

        // detect type
        if(event.message.type == 'text'){
            message.content = {
                type: Const.messageTypeText,
                text: event.message.text
            }
        }

        if(event.message.type == 'image'){
            message.content = {
                type: Const.messageTypeImage,
                url: undefined,
                id:event.message.id
            }
        }

        if(event.message.type == 'video'){
            message.content = {
                type: Const.messageTypeVideo,
                url: undefined,
                id:event.message.id
            }
        }

        if(event.message.type == 'audio'){
            message.content = {
                type: Const.messageTypeAudio,
                url: undefined,
                id:event.message.id
            }
        }

        if(event.message.type == 'sticker'){
            message.content = {
                type: Const.messageTypeSticker,
                styckerId: event.message.stickerId
            }
        }

        if(event.message.type == 'location'){

            message.content = {
                type: Const.messageTypeLocation,
                address:event.message.address,
                coordinates: {
                    latitude: event.message.latitude,
                    longitude: event.message.longitude
                }
            }

        }

        return message;

    }

    replyText(text,responseObj,service,cb){

        return new Promise((resolve,reject) => {

            const client = new line.Client({
                channelAccessToken: service.config.channelAccessToken
            });

            const message = {
                type: 'text',
                text: text
            };

            client.replyMessage(responseObj.replyToken, message)

                .then((result) => {
    
                    resolve({
                        code:200,
                        body:result
                    });

                })
                .catch((err) => {

                    this.logger.warn('Line failed to send message',err);
                    reject();

            });

        });
    }

    sendText(text,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            const client = new line.Client({
                channelAccessToken: service.config.channelAccessToken
            });

            const message = {
                type: 'text',
                text: text
            };

            client.pushMessage(userId, message)
            .then((result) => {

                resolve({
                    code:200,
                    body:result
                });

            })
            .catch((err) => {

                this.logger.warn('line failed to send message',err);
                reject();

            });

        });

    }

    downloadFile(response,path,service,cb){
        
        return new Promise((resolve,reject) => {
                
            if(!response ||
                !response.message ||
                !response.message.id ){

                    reject();

                    return;
            }

            let extension = "";

            if(response.message.type == 'image'){
                extension = ".jpg";
            }

            if(response.message.type == 'audio'){
                extension = ".m4a";
            }

            if(response.message.type == 'video'){
                extension = ".mp4";
            }

            const messageId = response.message.id;
            
            const client = new line.Client({
                channelAccessToken: service.config.channelAccessToken
            });

            let filename = this.generateFileName() + extension;
            const pathToDownload = path + "/" + filename;
            const file = fs.createWriteStream(pathToDownload);

            const stream = client.getMessageContent(messageId);
            stream.pipe(file);

            file.on('finish', function() {
                file.close(resolve(filename)); 
            });
        
        });

    }

    sendFile(fileId,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            const config = service.config;
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            const fileURL = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId;

            // get file type
            let typeTest = mime.lookup(fileId);
            let type = "";

            if(/image/.test(typeTest)){

                const fileNameChunk = fileId.split(".");
                let thumbName = fileNameChunk[0] + "_thumb";
                if(fileNameChunk.length > 1)
                    thumbName += "." + fileNameChunk[1];

                easyimg.thumbnail({
                    src:this.config.downloadPath + "/" + fileId, 
                    dst:this.config.downloadPath + "/" + thumbName, 
                    width:240, height:240,
                    x:0, y:0
                }).then((file) => {
                    
                    return doSend(userId,{
                        type:"image",
                        originalContentUrl:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId ,
                        previewImageUrl:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + thumbName,
                    });
                    
                }).then((result) => {
                    
                    resolve({
                        code:200,
                        body:result
                    });

                }).catch((err) => {

                    this.logger.warn('Line failed to send message',err);
                    reject();

                });

            }
            if(/video/.test(typeTest)){
                type = 'video'

                const fileNameChunk = fileId.split(".");
                let thumbName = fileNameChunk[0] + "_thumb";
                if(fileNameChunk.length > 1)
                    thumbName += ".jpg";

                Thumbler({
                    type: 'video', 
                    input: this.config.downloadPath + "/" + fileId, 
                    output: this.config.downloadPath + "/" + thumbName, 
                    time: '00:00:00'
                }, (err, path) => {

                    if (err) {
                        this.logger.warn('Line failed to generate thumbnail',err);
                        return;
                    };

                    doSend(userId,{
                        type:"video",
                        originalContentUrl:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId ,
                        previewImageUrl:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + thumbName,
                    }).then((result) => {
                        
                        resolve({
                            code:200,
                            body:result
                        });
        
                    }).catch((err) => {
        
                        this.logger.warn('Line failed to send message',err);
                        reject();
        
                    });

                });

            }

            if(/audio/.test(typeTest)){
                type = 'audio'

                const readStream = fs.createReadStream(this.config.downloadPath + "/" + fileId);

                mm.parseFile(this.config.downloadPath + "/" + fileId, {native: true})
                    .then((metadata) => {

                        return doSend(userId,{
                            type:"audio",
                            originalContentUrl:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId ,
                            duration:metadata.format.duration * 1000
                        });

                    })
                    .then((result) => {
                        
                        resolve({
                            code:200,
                            body:result
                        });

                    }).catch((err) => {

                        this.logger.warn('Line failed to send message',err);
                        reject();

                });

            }

            function doSend(userId,message) {

                const client = new line.Client({
                    channelAccessToken: service.config.channelAccessToken
                });

                return client.pushMessage(userId, message);
                
            }

        });

    }

    sendLocation(userIdentifier,coordinate,service){
        
        return new Promise((resolve,reject) => {
            
            this.logger.debug('Line location message sending start');

            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            const client = new line.Client({
                channelAccessToken: service.config.channelAccessToken
            });

            const message = {
                type: 'location',
                title: 'Location',
                address: coordinate.address,
                latitude: coordinate.latitude,
                longitude: coordinate.longitude
            };

            this.logger.debug('Line location message sending',message);

            client.pushMessage(userId, message)

                .then((result) => {

                    this.logger.debug('Line location message sent',result);

                    resolve({
                        code:200,
                        body:result
                    });

                })
                .catch((err) => {

                    this.logger.warn('Line failed to send message',err);
                    reject();

            });

        });

    }

}

module["exports"] = LineAdapter;