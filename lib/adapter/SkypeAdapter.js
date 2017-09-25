/* this adapter is not stateless */

const request = require('request');
const builder = require('botbuilder');
const mime = require('mime-types')

const Const = require('../../constants');
const BaseAdapter = require('./BaseAdapter');

class SkypeAdapter extends BaseAdapter {

    constructor(config) {
        super(config);
        this.provider = Const.skype;
        this.botbuilders = [];
        this.messageCallbackPool = {};
        this.sessionPool = {};
        this.sessionPoolDrainInterval = 60; //s
    }

    initializeBotbuilders(configAry){

        if(!configAry.length){
            configAry = [configAry];
        }

        configAry.forEach((setting) => {

            const serviceConfig = setting.config;

            const connector = new builder.ChatConnector({
                appId: serviceConfig.appId,
                appPassword: serviceConfig.appPassword
            });

            const bot = new builder.UniversalBot(connector);

            this.botbuilders.push({
                identifier: setting.identifier,
                connector : connector,
                bot: bot,
                listener: connector.listen()
            });

            bot.setting = setting;

            bot.on('conversationUpdate', function (message) {

            });

            bot.dialog('/',(session) => {
                const messageId = session.message.address.id;
                const callBackInfo = this.messageCallbackPool[messageId];

                console.log("messageId",messageId);
                
                if(callBackInfo && callBackInfo.callBack){

                    this.sessionPool[messageId] = {
                        created: new Date().getTime(),
                        session:session
                    };

                    setTimeout(() => {
                        callBackInfo.callBack(
                            Const.eventTypeMessage,
                            this.generateMessageObj(callBackInfo.service,session),
                            messageId
                        );
                    },10);

                    // remove from pool
                    this.messageCallbackPool[messageId] = undefined;
                }
                
            });

        }); 
    }

    processGet(req,res,service,cb){
        return false;
    }

    processPost(req,res,service,cb){

        const data = req.body;

        if(!data.recipient)
            return false;

        if(!data.recipient.id)
            return false;

        const recipientId = data.recipient.id;
        const regex = RegExp(service.config.appId,'i');

        this.logger.debug('Skype Webhook recipientId',recipientId);

        if(!regex.exec(recipientId)){
            return false;
        }

        // find builder for the request
        const builder = this.botbuilders.find((builder) => {
            return builder.identifier == service.identifier;
        });

        // pass to bot 
        // then called "bot.dialog" for this request, which is above
        this.messageCallbackPool[req.body.id] = {
            service: service,
            callBack : cb
        };

        builder.listener(req,res);

        return true;
    }

    generateMessageObj(service,session){

        const messageFromRequest = session.message;
        const addressJson = JSON.stringify(session.message.address);

        const message = {
            userIdentifier:service.provider + ":" + service.identifier + ":" + addressJson,
            providerIdentifier:service.identifier,
            provider:service.provider
        };

        if(messageFromRequest.attachments &&
            messageFromRequest.attachments.length > 0){

            var attachment = messageFromRequest.attachments[0];

            if(attachment.contentType == 'image'){
                message.content = {
                    type: Const.messageTypeImage,
                    url: attachment.contentUrl,
                    thumbnailUrl: attachment.thumbnailUrl
                }
            }

            else if(attachment.contentType == 'video' || /mp4/.test(attachment.name)){
                message.content = {
                    type: Const.messageTypeVideo,
                    url: attachment.contentUrl,
                    thumbnailUrl: attachment.thumbnailUrl
                }
            }

            else{

                message.content = {
                    type: Const.messageTypeUnknown
                }

            }

            this.logger.warn('Skype file',attachment);

        }

        else if(messageFromRequest.text.length > 0){
            message.content = {
                type: Const.messageTypeText,
                text: messageFromRequest.text
            }
        }

        return message;

    }

    replyText(text,messageId,service){

        return new Promise((resolve,reject) => {
                
            const sessionInfo = this.sessionPool[messageId];

            if(sessionInfo && sessionInfo.session)
                sessionInfo.session.send(text);

            this.drainSessionPool();

            resolve({
                code:200,
                body:{}
            });

        });
    }

    sendText(text,userIdentifier,service){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            
            const prefix = provider + ":" + serviceIdentifier + ":";
            const addressStr = userIdentifier.replace(prefix,"");
            const address = JSON.parse(addressStr);

            if(address){

                const serviceConfig = service.config;

                const connector = new builder.ChatConnector({
                    appId: serviceConfig.appId,
                    appPassword: serviceConfig.appPassword
                });

                var bot = new builder.UniversalBot(connector);

                var msg = new builder.Message().address(address);
                msg.text(text);
                msg.textLocale('en-US');
                bot.send(msg);
            
            }

            resolve({
                code:200,
                body:{}
            });

        });

    }

    drainSessionPool(){

        let counter = 0;
        const keysToDelete = [];
        const now = new Date().getTime();
        const keys = [];

        for(var key in this.sessionPool){

            const sessionInfo = this.sessionPool[key];

            if(sessionInfo){
                counter++;

                const interval = now - sessionInfo.created;

                if(interval / 1000 > this.sessionPoolDrainInterval)
                    keysToDelete.push(key);
            }

        }

        keysToDelete.forEach((key) => {

            this.sessionPool[key] = undefined;

        });

    }


    downloadFile(messageId,path,service){
        
        return new Promise((resolve,reject) => {
                
            const config = service.config;
            const sessionInfo = this.sessionPool[messageId];

            if(!sessionInfo ||
                !sessionInfo.session ||
                !sessionInfo.session.message ||
                !sessionInfo.session.message.attachments ||
                sessionInfo.session.message.attachments.length < 1){

                    reject();
                    return;
            }

            const message = sessionInfo.session.message;
            const attachment = sessionInfo.session.message.attachments[0];

            const connector = new builder.ChatConnector({
                appId: config.appId,
                appPassword: config.appPassword
            });

            const obtainToken = () => {
                return new Promise((resolve, reject) => {
                    connector.getAccessToken((err,token) => {
                        resolve(token);
                    });
                    
                });
            };

            const checkRequiresToken = (message) => {
                return message.source === 'skype' || message.source === 'msteams';
            };
            
            // Request file with Authentication Header
            const requestWithToken = (url) => {
                return obtainToken().then((token) => {
                    return request({
                        url: url,
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/octet-stream'
                        }
                    });
                });
            };


            var fileDownload = checkRequiresToken(message)
            ? requestWithToken(attachment.contentUrl)
            : request(attachment.contentUrl);

            fileDownload.then((response) => {

                this.saveFileFromResponse(response,path,(fileId) => {
                    
                    resolve(fileId)

                });

            }).catch(function (err) {
                this.logger.warn('Skype: Failed to attachment ',err); 
                reject(err);

            });

        });
        
    }

    sendFile(fileId,userIdentifier,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            
            const prefix = provider + ":" + serviceIdentifier + ":";
            const addressStr = userIdentifier.replace(prefix,"");
            const address = JSON.parse(addressStr);
            const messageId = address.id;

            const sessionInfo = this.sessionPool[messageId];
            let contentType = mime.lookup(fileId);


            const serviceConfig = service.config;
            const connector = new builder.ChatConnector({
                appId: serviceConfig.appId,
                appPassword: serviceConfig.appPassword
            });

            var msg = new builder.Message().address(address);
            msg.text("");
            msg.addAttachment({
                contentUrl:this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId,
                contentType: contentType,
                name: 'file'
            });

            if(sessionInfo && sessionInfo.session)
                sessionInfo.session.send(msg);
            else
                this.logger.warn('Skype','session doesnt exist'); 

            resolve({
                code:200,
                body:{}
            });

        });

    }
        

    sendLocation(userIdentifier,coordinate,service,cb){

        return new Promise((resolve,reject) => {
                
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            
            const prefix = provider + ":" + serviceIdentifier + ":";
            const addressStr = userIdentifier.replace(prefix,"");
            const address = JSON.parse(addressStr);

            const url = "https://www.google.com/maps/search/?api=1&query=" + coordinate.latitude + "," + coordinate.longitude;

            if(address){

                const serviceConfig = service.config;

                const connector = new builder.ChatConnector({
                    appId: serviceConfig.appId,
                    appPassword: serviceConfig.appPassword
                });

                var bot = new builder.UniversalBot(connector);

                var msg = new builder.Message().address(address);
                msg.text(url);
                msg.textLocale('en-US');
                bot.send(msg);

                resolve({
                    code:200,
                    body:{}
                });

                return;
            }

            reject();

        });

    }
    
}

module["exports"] = SkypeAdapter;