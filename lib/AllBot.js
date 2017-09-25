/*
   Chatbothub 
*/
const fs = require('fs');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const mime = require('mime-types')
const express = require('express');
const request = require('request');
const router = express.Router();
const winston = require('winston');

const FacebookAdapter = require('./adapter/FacebookAdapter');
const LineAdapter = require('./adapter/LineAdapter');

const SessionPool = require('./SessionPool');
const Const = require('../constants');

class AllBot {

    constructor(configuration,logger) {

        if(logger){
            this.logger = logger;
        }else{
            this.logger = new (winston.Logger)({
                level: configuration.loglevel,
                transports: [
                    new (winston.transports.Console)()
                ]
            });
        }

        this.configuration = configuration;
        this.listeners = [];
        this.adapters = {}

        this.configuration.logger = this.logger;

        const path = __dirname + "/adapter";

        // Autoload adapters
        fs.readdir(path, (err, items) => {

            for (var i=0; i<items.length; i++) {

                var fileName = items[i];
                var fullPath = path + '/' + items[i];

                const adapterName = require(fullPath);
                const adapterInstance = new adapterName(this.configuration);
                const adapterServiceName = adapterInstance.provider;

                if(adapterServiceName && adapterServiceName !== ''){
                    this.adapters[adapterServiceName] = adapterInstance;
                    this.logger.debug('loadad ' + adapterServiceName + ' apapter.');

                    if(adapterServiceName == Const.skype){

                        // Skype adapter needs initialize botbuilder framework.
                        const skypeListers = configuration.service.filter((service) => {
                            return service.provider == Const.skype;
                        });

                        if(skypeListers && skypeListers.length > 0)
                            adapterInstance.initializeBotbuilders(skypeListers);
                        
                    } else if(adapterServiceName == Const.telegram){

                        // telegram has to register webhook dynamically
                        const telegramServices = configuration.service.filter((service) => {
                            return service.provider == Const.telegram;
                        });

                        telegramServices.forEach((service) => {

                            if(service.isTest) return;

                            adapterInstance.registerWebHook(
                                service,
                                configuration.baseURL + 
                                configuration.endpointURL + 
                                configuration.webhookReceiverURL + 
                                "/" + service.identifier
                            );

                        });

                    } else if(adapterServiceName == Const.kik){

                        // kik has to register webhook dynamically too...
                        const kikServices = configuration.service.filter((service) => {
                            return service.provider == Const.kik;
                        });

                        kikServices.forEach((service) => {

                            if(service.isTest) return;

                            adapterInstance.registerWebHook(
                                service,
                                configuration.baseURL + 
                                configuration.endpointURL + 
                                configuration.webhookReceiverURL + 
                                "/" + service.identifier
                            );

                        });

                    } else if(adapterServiceName == Const.viber){

                        // kik has to register webhook dynamically too...
                        const viberServices = configuration.service.filter((service) => {
                            return service.provider == Const.viber;
                        });

                        viberServices.forEach((service) => {

                            if(service.isTest) return;
                            
                            adapterInstance.registerWebHook(
                                service,
                                configuration.baseURL + 
                                configuration.endpointURL + 
                                configuration.webhookReceiverURL + 
                                "/" + service.identifier
                            );

                        });

                    } else {

                    }
                }
                
            }
        });

        router.get(this.configuration.webhookReceiverURL, (req,res) => {

            this.logger.debug('Received GET request. Proceed to adapters.');
            this.handleGetRequest(req,res);
        });

        router.post(this.configuration.webhookReceiverURL, (req,res) => {

            this.logger.debug('Received POST request. Proceed to adapters.');
            this.handlePostRequest(req,res);
            
        });

        router.get(this.configuration.webhookReceiverURL + '/:serviceIdentifier', (req,res) => {

            const serviceIdentifier = req.params.serviceIdentifier;

            const service = configuration.service.find((service) => {
                return service.identifier == serviceIdentifier;
            });

            this.handleGetRequest(req,res,service);

        });

        router.post(this.configuration.webhookReceiverURL + '/:serviceIdentifier', (req,res) => {
            const serviceIdentifier = req.params.serviceIdentifier;

            const service = configuration.service.find((service) => {
                return service.identifier == serviceIdentifier;
            });

            this.handlePostRequest(req,res,service);
        });
        
        // file sender URL
        router.get(this.configuration.fileSenderURL + '/:fileId', (req,res) => {

            const fileId = req.params.fileId;
            const filePath = this.configuration.downloadPath + "/" + fileId;
            const buffer = readChunk.sync(filePath, 0, 4100);
            
            let type = mime.lookup(fileId);

            if(!type){
                const typeObj = fileType(buffer);
                if(typeObj)
                    type = type.mime;

            }

            if(type){

                var options = {
                    root: this.configuration.downloadPath,
                    headers: {
                        'x-timestamp': Date.now(),
                        'x-sent': true
                    }
                };

                res.contentType(type);
                res.sendFile(fileId, options);

            } else {

                res.download(this.configuration.downloadPath + "/" + fileId);

            }
            

        });

        this.router = router;

    }

    onMessage(listener){

        this.listeners.push(listener);

    }

    clearListeners(){
        this.listeners = [];
    }
    
    handleGetRequest(req,res,service){

        this.logger.debug('GET Request',JSON.stringify(req.query, null, 3));  

        if(service)
            this.processToAdaptersWithService(req,res,service);
        else
            this.processToAdapters(req,res);

    }

    handlePostRequest(req,res,service){

        this.logger.debug('POST Request',JSON.stringify(req.body, null, 3));  

        if(service)
            this.processToAdaptersWithService(req,res,service);
        else
            this.processToAdapters(req,res);

    }

    processToAdaptersWithService(req,res,service){

        let processed = false;

        const adapter = this.adapters[service.provider];

        if(!adapter)
            return false;

        if(req.method == "POST"){
            
            processed |= adapter.processPost(req,res,service,(message,responseFromProvider) => {

                // save to pool
                var sesssionKey = SessionPool.set(
                    service.identifier,
                    service.provider,
                    message,
                    responseFromProvider);
                
                this.listeners.forEach((listener) => {

                    if(typeof listener === 'function'){
                        setTimeout(() => {
                            listener(sesssionKey,message,responseFromProvider);
                        },10);
                    }

                });

            });

        } else if(req.method == "GET"){

            processed |= adapter.processGet(req,res,service);

        }

        return processed;

    }

    processToAdapters(req,res){

        let processed = false;

        this.logger.debug('Adapters',this.configuration.service);

        this.configuration.service.forEach((service) => {

            if(this.adapters[service.provider]){

                this.logger.debug('find ' + service.provider + ' apapter.',service.identifier);
                processed |= this.processToAdaptersWithService(req,res,service);

            }

        });
        
        if(!processed){
            this.logger.debug('Received unhandled request');
            res.send('');
        }

    }


    replyText(sessionId,text,hook){

        const sessionObj = SessionPool.get(sessionId);

        const service = this.configuration.service.find((service) => {
            return service.identifier == sessionObj.identifier;
        });

        if(this.adapters[sessionObj.provider]){
            return this.adapters[sessionObj.provider].replyText(
                text,
                sessionObj.originalReposonse,
                service,
                hook
            );
        }

    }
    
    sendText(userIdentifier,text,cb){

        const userIdentifierChunks = userIdentifier.split(':');
        const provider = userIdentifierChunks[0];
        const serviceIdentifier = userIdentifierChunks[1];
        
        const service = this.configuration.service.find((service) => {
            return service.identifier == serviceIdentifier;
        });

        if(this.adapters[provider]){

            return this.adapters[provider].sendText(
                text,
                userIdentifier,
                service
            );

        }

    }

    sendFile(userIdentifier,fileId){

        const userIdentifierChunks = userIdentifier.split(':');
        const provider = userIdentifierChunks[0];
        const serviceIdentifier = userIdentifierChunks[1];

        const service = this.configuration.service.find((service) => {
            return service.identifier == serviceIdentifier;
        });

        if(this.adapters[provider]){
            return this.adapters[provider].sendFile(
                fileId,
                userIdentifier,
                service
            );
        }

    }

    downloadFile(sessionId,path){

        const sessionObj = SessionPool.get(sessionId);

        const service = this.configuration.service.find((service) => {
            return service.identifier == sessionObj.identifier;
        });

        if(this.adapters[sessionObj.provider]){
            return this.adapters[sessionObj.provider].downloadFile(
                sessionObj.originalReposonse,
                path,
                service
            );
        }

    }

    sendLocation(userIdentifier,coordinate){

        const userIdentifierChunks = userIdentifier.split(':');
        const provider = userIdentifierChunks[0];
        const serviceIdentifier = userIdentifierChunks[1];
        
        const service = this.configuration.service.find((service) => {
            return service.identifier == serviceIdentifier;
        });

        if(this.adapters[provider]){

            return this.adapters[provider].sendLocation(
                userIdentifier,
                coordinate,
                service
            );

        }

    }
    

}

module["exports"] = AllBot;