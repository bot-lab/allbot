/*
    Base of all adopters
*/

const https = require('https');
const fs = require('fs');
const URL = require('url');
const mime = require('mime-types');
const fileType = require('file-type');
const readChunk = require('read-chunk');
const winston = require('winston');

class BaseAdapter {

    constructor(config) {
        this.config = config;
        this.provider = "";
        this.logger = config.logger;

    }

    // public methods
    generateFileName(){
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( let i=0; i < 32; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    
    saveFileFromUrl(url,path,cb){
        
        const protocol = URL.parse(url).protocol.slice(0, -1);
        const request = require('follow-redirects')[protocol].get(url,(response) => {

            this.saveFileFromResponse(response,path,cb);

        }).on('error', function(err) { 
            this.logger.warn("saveFileFromUrl",err); 
            if (cb) cb(null);
        });

    }

    saveFileFromResponse(response,path,cb){

        const contentType = response.headers['content-type'];
        let extension = "";

        if(contentType && contentType.split('/').length > 1){
            extension = contentType.split('/')[1];
        }

        let filename = this.generateFileName();

        if(extension && !/octet/.test(extension))
            filename += "." + extension;

        else{

            let typeTest = mime.lookup(response.responseUrl);

            if(typeTest){

                const tempAry = typeTest.split("/");

                if(tempAry.length > 1){
                    extension = tempAry[1];
                    filename += "." + extension;
                }

            }

        }

        const pathToDownload = path + "/" + filename;
        const file = fs.createWriteStream(pathToDownload);

        response.pipe(file);

        file.on('error', (error) => {
            
            this.logger.warn("saveFileFromResponse",error); 

            if(cb)
                setTimeout(() => {
                    cb(null)
                },10);
                
        });
        
        file.on('finish', () => {

            file.end();
        });

        file.on('close', () => {
            
            if(extension === "" || /octet/.test(extension)){
                
                const buffer = readChunk.sync(pathToDownload, 0, 4100);
                const fileTypeResult = fileType(buffer);

                if(fileTypeResult && fileTypeResult.ext){

                    fs.renameSync(pathToDownload,pathToDownload + "." + fileTypeResult.ext);
                    filename += "." + fileTypeResult.ext;
                }

            }

            if(cb)
                setTimeout(() => {
                    cb(filename)
                },10);

            
        });

    }

    // interfaces
    checkRequest(req,service){
        return false;
    }

    processGet(req,res,config){
        return fales;
    }

    processPost(req,res,config){
        return fales;
    }

    generateMessageObj(obj){
        
    }

    replyText(text,sessionKey,sevice){

    }

    sendFile(fileId,userIdentifier,service,cb){

    }

    sendText(text,userIdentifier,sevice,cb){
        
    }

    downloadFile(response,path,sevice,cb){
        
    }

    sendlocation(userIdentifier,coordinate,sevice,cb){

    }


}

module["exports"] = BaseAdapter;