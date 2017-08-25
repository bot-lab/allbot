const fs = require("fs");

const nock = require('nock');

    describe('API calls', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Line', () => {

            it('Reply Text', (done)  =>{

                const mock = nock('https://api.line.me')
                    .post('/v2/bot/message/reply')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.replyText(sessionKeys.line,"test").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });

            it('Send Text', (done)  =>{

                const mock = nock('https://api.line.me')
                    .post('/v2/bot/message/push')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });


                allBot.sendText(userIdentifiers.line,"test").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });

            it('Send File', (done)  =>{
                
                const mock = nock('https://api.line.me')
                    .post('/v2/bot/message/push')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.sendFile(userIdentifiers.line,"dummy.jpg").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });
            
            it('Send Location', (done)  =>{
            
                const mock = nock('https://api.line.me')
                    .post('/v2/bot/message/push')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.sendLocation(userIdentifiers.line,{
                    latitude: 1,
                    longitude: 1
                }).then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });

            it('Download File', (done)  =>{

                const mock = nock('https://api.line.me')
                    .get('/v2/bot/message/6576332892126/content')
                    .reply(200, "test");

                allBot.downloadFile(sessionKeys.line,downloadFilePath).then((filename) => {

                    filename.should.be.a('string');
                    fs.unlinkSync(downloadFilePath + filename);
                    done();

                });

            });


        });

    });