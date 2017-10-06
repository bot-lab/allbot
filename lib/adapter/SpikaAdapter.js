const request = require('request');
const mime = require('mime-types')
const fs = require('fs');
const URL = require('url');
const fileType = require('file-type');
const readChunk = require('read-chunk');
const winston = require('winston');
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

            const botInfo = service.config.bot;
            const toUser = responseObj.sender;

            // POST request to create webhook config
            new Promise((resolve2,reject2) => {
    
                const postData = {
                    organization:botInfo.organization,
                    username:botInfo.username,
                    password:botInfo.password
                };
    
                var request_options = {
                    url: service.config.baseURL + '/api/v3/signin',
                    headers: {
                        apikey:service.config.apiKey
                    },
                    json: postData
                };

                
                request.post(request_options, (error, response, body) => {

                    if(error){
                        this.logger.warn('Failed to send message to Spika',error);
                        reject2();
                        return;
                    }

                    resolve2({
                        code:response.statusCode,
                        body:body
                    });

                });

            }).then((signinResult) => {

                return new Promise((resolve2,reject2) => {

                    const accessToken = signinResult.body['access-token'];
    
                    const postData = {
                        targetType:1,
                        target:toUser.userid,
                        messageType:1,
                        message:text,
                    };

                    var request_options = {
                        url: service.config.baseURL + '/api/v3/messages',
                        headers: {
                            apikey:service.config.apiKey,
                            'access-token':accessToken
                        },
                        json: postData
                    };
    
                    request.post(request_options, (error, response, body) => {
    
                        if(error){
                            this.logger.warn('Failed to send message to Spika',error);
                            reject2();
                            return;
                        }
    
                        resolve2({
                            code:response.statusCode,
                            body:body
                        });
    
                    });

                }).then( (sendMessageResponse) => {

                    resolve({
                        code:sendMessageResponse.code,
                        body:sendMessageResponse.body
                    });

                }).catch( (err) => {

                    reject(err);

                });

            });

        });

    }

    sendText(text,userIdentifier,service){

        const userIdentifierChunks = userIdentifier.split(':');
        const provider = userIdentifierChunks[0];
        const serviceIdentifier = userIdentifierChunks[1];
        const userId = userIdentifierChunks[2];

        return new Promise((resolve,reject) => {

            const botInfo = service.config.bot;
            const toUserId = userId;

            // POST request to create webhook config
            new Promise((resolve2,reject2) => {

                const postData = {
                    organization:botInfo.organization,
                    username:botInfo.username,
                    password:botInfo.password
                };

                var request_options = {
                    url: service.config.baseURL + '/api/v3/signin',
                    headers: {
                        apikey:service.config.apiKey
                    },
                    json: postData
                };

                
                request.post(request_options, (error, response, body) => {

                    if(error){
                        this.logger.warn('Failed to send message to Spika',error);
                        reject2();
                        return;
                    }

                    resolve2({
                        code:response.statusCode,
                        body:body
                    });

                });

            }).then((signinResult) => {

                return new Promise((resolve2,reject2) => {

                    const accessToken = signinResult.body['access-token'];

                    const postData = {
                        targetType:1,
                        target:toUserId,
                        messageType:1,
                        message:text,
                    };

                    var request_options = {
                        url: service.config.baseURL + '/api/v3/messages',
                        headers: {
                            apikey:service.config.apiKey,
                            'access-token':accessToken
                        },
                        json: postData
                    };

                    request.post(request_options, (error, response, body) => {

                        if(error){
                            this.logger.warn('Failed to send message to Spika',error);
                            reject2();
                            return;
                        }

                        resolve2({
                            code:response.statusCode,
                            body:body
                        });

                    });

                }).then( (sendMessageResponse) => {

                    resolve({
                        code:sendMessageResponse.code,
                        body:sendMessageResponse.body
                    });

                }).catch( (err) => {

                    reject(err);

                });

            });

        });
    }


    sendFile(fileId,userIdentifier,service){

        return new Promise((resolve,reject) => {
                
            const config = service.config;
            const userIdentifierChunks = userIdentifier.split(':');
            const provider = userIdentifierChunks[0];
            const serviceIdentifier = userIdentifierChunks[1];
            const userId = userIdentifierChunks[2];
            const fileURL = this.config.baseURL + this.config.endpointURL + this.config.fileSenderURL + "/" + fileId;

            const botInfo = service.config.bot;

            // POST request to create webhook config
            new Promise((resolve2,reject2) => {

                const postData = {
                    organization:botInfo.organization,
                    username:botInfo.username,
                    password:botInfo.password
                };

                var request_options = {
                    url: service.config.baseURL + '/api/v3/signin',
                    headers: {
                        apikey:service.config.apiKey
                    },
                    json: postData
                };

                request.post(request_options, (error, response, body) => {

                    if(error){
                        this.logger.warn('Failed to upload file to Spika',error);
                        reject2();
                        return;
                    }

                    resolve2({
                        code:response.statusCode,
                        body:body
                    });

                });

            }).then((signinResult) => {

                return new Promise((resolve2,reject2) => {

                    const accessToken = signinResult.body['access-token'];
                    
                    const postData = {
                        organization:botInfo.organization,
                        username:botInfo.username,
                        password:botInfo.password
                    };

                    var request_options = {
                        url: service.config.baseURL + '/api/v3/files/upload',
                        headers: {
                            apikey:service.config.apiKey,
                            'access-token':accessToken
                        },
                        formData: {
                            file: fs.createReadStream(this.config.downloadPath + "/" + fileId),
                        }
                    };

                    request.post(request_options, (error, response, body) => {

                        if(error){
                            this.logger.warn('Failed to upload file to Spika',error);
                            reject2();
                            return;
                        }

                        resolve2({
                            accessToken : accessToken,
                            code:response.statusCode,
                            body:JSON.parse(body)
                        });

                    });
                
                });

            }).then( (resutlObj) => {

                return new Promise((resolve2,reject2) => {

                    if(!resutlObj.body ||
                        !resutlObj.body.file)
                        return reject2();

                    const file = resutlObj.body.file;

                    const postData = {
                        targetType:1,
                        target:userId,
                        messageType:2,
                        file: {
                            file:{
                                id: file.fileId,
                                name: fileId,
                                size: file.size,
                                mimeType: file.mimeType
                            }
                        }
                    };

                    const thumb = resutlObj.body.thumbnail;

                    if(thumb){
                        postData.file.thumb = {
                            id: thumb.fileId,
                            name: fileId,
                            size: thumb.size,
                            mimeType: thumb.mimeType
                        }
                    }


                    var request_options = {
                        url: service.config.baseURL + '/api/v3/messages',
                        headers: {
                            apikey:service.config.apiKey,
                            'access-token':resutlObj.accessToken
                        },
                        json: postData
                    };

                    request.post(request_options, (error, response, body) => {

                        if(error){
                            this.logger.warn('Failed to send message to Spika',error);
                            reject2();
                            return;
                        }

                        resolve({
                            code:response.statusCode,
                            body:body
                        });

                    });


                });

            }).catch( (err) => {

                reject(err);

            });

        });


    }

    downloadFile(response,path,service){
        
        return new Promise((resolve,reject) => {

            if(!response &&
                ! response.file &&
                ! response.file.file){
                
                return reject();
            }
    
            if(response.file.file.id === ""){
                return reject();
            }
            
            const botInfo = service.config.bot;

            // POST request to create webhook config
            new Promise((resolve2,reject2) => {

                const postData = {
                    organization:botInfo.organization,
                    username:botInfo.username,
                    password:botInfo.password
                };

                var request_options = {
                    url: service.config.baseURL + '/api/v3/signin',
                    headers: {
                        apikey:service.config.apiKey
                    },
                    json: postData
                };

                
                request.post(request_options, (error, response, body) => {

                    if(error){
                        this.logger.warn('Failed to download file from Spika',error);
                        reject2();
                        return;
                    }

                    resolve2({
                        code:response.statusCode,
                        body:body
                    });

                });

            }).then((signinResult) => {

                const accessToken = signinResult.body['access-token'];
                const tmpFilename = this.generateFileName();
                const pathToDownload = path + "/" + tmpFilename;

                return new Promise((resolve2,reject2) => {

                    const accessToken = signinResult.body['access-token'];
        
                    var request_options = {
                        url: service.config.baseURL + '/api/v3/files/download/' + response.file.file.id,
                        headers: {
                            apikey:service.config.apiKey,
                            'access-token':accessToken
                        }
                    };

                    request
                    .get(request_options)
                    .on('response', function(response) {

                    })
                    .on('error', function(err) {
                        reject(err);
                    })
                    .on('end', function(response) {
                        
                        const buffer = readChunk.sync(pathToDownload, 0, 4100);
                        const fileTypeResult = fileType(buffer);
                        let filename = tmpFilename;

                        if(fileTypeResult && fileTypeResult.ext){
                            fs.renameSync(pathToDownload,pathToDownload + "." + fileTypeResult.ext);
                            filename += "." + fileTypeResult.ext;
                        }

                        resolve2(filename);
                    })
                    .pipe(fs.createWriteStream(pathToDownload));


                }).then( (filename) => {

                    resolve(filename);

                }).catch( (err) => {

                    reject(err);

                });

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