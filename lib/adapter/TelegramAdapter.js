const request = require('request');
const mime = require('mime-types');

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class TelegramAdapter extends BaseAdapter {

    constructor(config) {
        super(config);
        this.provider = Const.telegram;
    }

    registerWebHook(service,webHookURL){

        const token = service.config.botToken;

        var url = 'https://api.telegram.org/bot' + token + '/setWebhook';

        // request options
        var request_options = {
        url: url,
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        formData: {
            url: webHookURL
        }
        }

        // POST request to create webhook config
        request.post(request_options, (error, response, body) => {
            
            if(error)
                this.logger.warn('Telegram Failed to setup webhook url to Telegram',error)
            else
                this.logger.info('Telegram webhook url is registered.',webHookURL);

        })

    }

    processGet(req,res,service,cb){
        return false;
    }

    processPost(req,res,service,cb){

        const data = req.body;

        // do parameter check
        if(!data.update_id)
            return false;

        if(!data.message)
            return false;

        if(!data.message.message_id)
            return false;

        this.logger.debug('Telegram Webhook');

        if(cb){
            cb(
                Const.eventTypeMessage,
                this.generateMessageObj(service,data),
                data
            );
        }

        res.send("OK");

        return true;

    }

    generateMessageObj(service,data){

        const message = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + data.message.from.id,
            providerIdentifier:service.identifier,
            provider:service.provider,
            providerUserId:data.message.from.id
        };

        if(data.message.text){
            message.content = {
                type: Const.messageTypeText,
                text: data.message.text
            }
        }

        else if(data.message.photo){

            var lastElm = data.message.photo[data.message.photo.length - 1];

            message.content = {
                type: Const.messageTypeImage,
                id: lastElm.file_id
            }

        }

        else if(data.message.video){
            message.content = {
                type: Const.messageTypeVideo,
                id: data.message.video.file_id
            }
        }


        else if(data.message.location){

                message.content = {
                    type: Const.messageTypeLocation,
                    coordinates: {
                        latitude: data.message.location.latitude,
                        longitude: data.message.location.longitude
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

        } else {

            message.content = {
                type: Const.messageTypeUnknown,
                url: undefined,
                id:undefined
            }

        }

        return message;

    }

    replyText(text,responseObj,service){

        return new Promise((resolve,reject) => {
                
            const url = 'https://api.telegram.org/bot' + service.config.botToken + '/sendMessage';

            const request_options = {
                url: url,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                formData: {
                    chat_id: responseObj.message.chat.id,
                    text: text
                }
            }

            // POST request to create webhook config
            request.post(request_options, (error, response, body) => {

                if(error){
                    this.logger.warn('Telegram failed to send message',error);
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

    sendText(text,userIdentifier,service){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            const url = 'https://api.telegram.org/bot' + service.config.botToken + '/sendMessage';

            const request_options = {
                url: url,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                formData: {
                    chat_id: userId,
                    text: text
                }
            }

            // POST request to create webhook config
            request.post(request_options, (error, response, body) => {

                if(error){
                    this.logger.warn('Telegram failed to send message',error);
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

    downloadFile(response,path,service){
        
        return new Promise((resolve,reject) => {
                
            if(!response ||
                !response.message){

                    reject();

                    return;
            }
            
            let dataType = "";
            const message = response.message;
            let fileId = "";

            if(message.photo){
                dataType = Const.messageTypeImage;
                fileId = message.photo[message.photo.length - 1].file_id;
            }

            else if(message.video){
                dataType = Const.messageTypeVideo;
                fileId = message.video.file_id;
            }
            else if(message.voice){
                dataType = Const.messageTypeAudio;
                fileId = message.voice.file_id;
            } 

            const getFileURL = 'https://api.telegram.org/bot' + service.config.botToken + '/getFile?file_id=' + fileId;

            request.get(getFileURL,(err,response) => {

                const body = JSON.parse(response.body);

                if(!body)
                    return;

                const filePath = body.result.file_path;

                const downloadURL = 'https://api.telegram.org/file/bot' + service.config.botToken + '/' + filePath;

                this.saveFileFromUrl(downloadURL,path,(filename) => {
    
                    resolve(filename);
    
                });

            });

        });

    }

    sendFile(fileId,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            const fileURL = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId;

            // get file type
            let typeTest = mime.lookup(fileId);
            let type = "";

            let url = 'https://api.telegram.org/bot' + service.config.botToken + '/';
            let forms = {
                chat_id: userId,
            };

            if(/image/.test(typeTest)){
                url += "sendPhoto";
                forms.photo = fileURL;
            }

            if(/video/.test(typeTest)){
                url += "sendVideo";
                forms.video = fileURL;
            }

            if(/audio/.test(typeTest)){
                url += "sendAudio";
                forms.audio = fileURL;
            }

            const request_options = {
                url: url,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                formData: forms
            }

            // POST request to create webhook config
            request.post(request_options,(error, response, body) => {


                if(error){
                    this.logger.warn('Telegram failed to send message',error);
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
    

    sendLocation(userIdentifier,coordinate,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];

            const url = 'https://api.telegram.org/bot' + service.config.botToken + '/sendLocation';

            const request_options = {
                url: url,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                formData: {
                    chat_id: userId,
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude
                }
            }

            // POST request to create webhook config
            request.post(request_options,(error, response, body) => {

                if(error){
                    this.logger.warn('Telegram failed to send message',error);
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

module["exports"] = TelegramAdapter;