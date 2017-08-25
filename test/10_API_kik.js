const fs = require("fs");

const nock = require('nock');

    describe('API calls', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Kik', () => {

            it('Reply Text', (done)  =>{

                const mock = nock('https://api.kik.com')
                    .post('/v1/message')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.replyText(sessionKeys.kik,"test").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });

            it('Send Text', (done)  =>{

                const mock = nock('https://api.kik.com')
                    .post('/v1/message')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.sendText(userIdentifiers.kik,"test").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });

            it('Send File', (done)  =>{
                
                const mock = nock('https://api.kik.com')
                    .post('/v1/message')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.sendFile(userIdentifiers.kik,"dummy.jpg").then((result) => {

                    result.code.should.be.equal(200);
                    done();

                });

            });
            
            it('Send Location', (done)  =>{
            
                const mock = nock('https://api.kik.com')
                    .post('/v1/message')
                    .reply(200, {
                        mock: true,
                        result: 'OK'
                });

                allBot.sendLocation(userIdentifiers.kik,{
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

                allBot.downloadFile(sessionKeys.kik,downloadFilePath).then((filename) => {

                    filename.should.be.a('string');
                    fs.unlinkSync(downloadFilePath + filename);
                    done();

                });

            });


        });

    });