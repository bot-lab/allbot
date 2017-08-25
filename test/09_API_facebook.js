const fs = require("fs");

const nock = require('nock');

    describe('API calls', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Facebook', () => {

            it('Reply Text', (done)  =>{

                const mock = nock('https://graph.facebook.com')
                    .post('/v2.6/me/messages?access_token=blabla')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.replyText(sessionKeys.fb,"test").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });

            it('Send Text', (done)  =>{

                const mock = nock('https://graph.facebook.com')
                    .post('/v2.6/me/messages?access_token=blabla')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.sendText(userIdentifiers.fb,"test").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });

            it('Send File', (done)  =>{
                
                const mock = nock('https://graph.facebook.com')
                    .post('/v2.6/me/messages?access_token=blabla')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.sendFile(userIdentifiers.fb,"dummy.jpg").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });
            
            it('Send Location', (done)  =>{
                
                const mock = nock('https://graph.facebook.com')
                    .post('/v2.6/me/messages?access_token=blabla')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.sendLocation(userIdentifiers.fb,{
                    latitude: 1,
                    longitude: 1
                }).then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });

            it('Download File', (done)  =>{

                const mock = nock('http://clover.studio')
                    .get('/temppic.jpeg')
                    .reply(200, "test");

                allBot.downloadFile(sessionKeys.fb,downloadFilePath).then((filename) => {

                    filename.should.be.a('string');
                    fs.unlinkSync(downloadFilePath + filename);
                    done();

                });

            });


        });

    });