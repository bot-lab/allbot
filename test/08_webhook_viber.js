describe('Task WebHook Routes', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Viber Webhook', () => {

            it('Viber Text Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {


                    message.content.type.should.be.equal('text');
                    message.content.text.should.be.equal('test');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "event": "message",
                        "timestamp": 1503315327146,
                        "message_token": 5080382391595440000,
                        "sender": {
                           "id": "B01s8xC+C5Gah3OGX+umjA==",
                           "name": "健安江",
                           "avatar": "https://media-direct.cdn.viber.com/download_photo?dlid=_jEcnG_4b6ZOvnFGq7sf3TPg8fnfYmXsTjog84YeS1DXWtpkBfyNQ-FEUB4&fltp=jpg&imsz=0000",
                           "language": "en",
                           "country": "HR",
                           "api_version": 2
                        },
                        "message": {
                           "text": "test",
                           "type": "text",
                           "tracking_data": "tracking data"
                        },
                        "silent": false
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

    
                });
            });


            it('Viber Pic Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    
                    sessionKeys.viber = sessionKey;
                    userIdentifiers.viber = message.userIdentifier;

                    message.content.type.should.be.equal('image');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send( {
                        "event": "message",
                        "timestamp": 1503315402412,
                        "message_token": 5080382707959209000,
                        "sender": {
                           "id": "B01s8xC+C5Gah3OGX+umjA==",
                           "name": "健安江",
                           "avatar": "https://media-direct.cdn.viber.com/download_photo?dlid=_jEcnG_4b6ZOvnFGq7sf3TPg8fnfYmXsTjog84YeS1DXWtpkBfyNQ-FEUB4&fltp=jpg&imsz=0000",
                           "language": "en",
                           "country": "HR",
                           "api_version": 2
                        },
                        "message": {
                           "type": "picture",
                           "media": "http://clover.studio/temppic.jpeg",
                           "thumbnail": "http://clover.studio/temppic.jpeg",
                           "tracking_data": "tracking data"
                        },
                        "silent": false
                     })
                    .end((err, res) => {
    
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
    
                });
            });

            it('Viber Video Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('video');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .send( {
                        "event": "message",
                        "timestamp": 1503315434908,
                        "message_token": 5080382843678497000,
                        "sender": {
                           "id": "B01s8xC+C5Gah3OGX+umjA==",
                           "name": "健安江",
                           "avatar": "https://media-direct.cdn.viber.com/download_photo?dlid=_jEcnG_4b6ZOvnFGq7sf3TPg8fnfYmXsTjog84YeS1DXWtpkBfyNQ-FEUB4&fltp=jpg&imsz=0000",
                           "language": "en",
                           "country": "HR",
                           "api_version": 2
                        },
                        "message": {
                           "type": "video",
                           "media": "https://dl-media.viber.com/5/media/2/short/any/sig/video/0x0/0d9c/67f65cd02981f8378075cc49d44614494243e3fddc3fdb2c8abe07ff79d70d9c.mp4?Expires=1503319035&Signature=czfQcuquKyFykentlMym0iztknpHywqGeahtQcMLaHFGwYVzVpRkfbun3eTedlIBvekQgZr4Xgx96eWV2DakjmIJUAdnddI9Hi-gjtG8s5myRKS~nIbUZdCZEKXnXIMcbWLuqoNq1zMuIsRieXBOQcvhtghaUxW9b75am6WunoAUyFAm37NVZStKFyithU~NdS5z16qIGaUpKfDB6IM0eQ4DPsff9NaP3jml4tuTM4W8Nqlnkh0d7xoshed6vsg-OqSF4RzgFfr3AwBavpLhf~tmf7Kr286112zWBHSVvcWtswxnJ4bVveWkvr20059rBy2t7a1jnWX1ogo-2ERwbw__&Key-Pair-Id=APKAJ62UNSBCMEIPV4HA",
                           "thumbnail": "https://dl-media.viber.com/5/media/2/short/any/sig/image/400/0d9c/67f65cd02981f8378075cc49d44614494243e3fddc3fdb2c8abe07ff79d70d9c.jpg?Expires=1503319035&Signature=S2mse27h-MLy~s1EcERTMtdQXOgUoCo0TWOgoY9P4CRz6V9JNQq8LkZKCg-Sdpy0Kj41a4HGJO5ktLuIIbFun46GWNETB6IDnAivF-AOGPNDgCmSTzVfcwb8k-BpOHKEoYnp9Ilow5ZnSNcYy0G4YwONwJH0RQ9kMO2liEdaLydvAcdFeIVb1qkmQRszBeQro0ru~6JuDrVjy7mxrVIbEQ-cTiLs4sPVt3kHGF6wg2pMg0cBmPqH7WG23vg2Ez1qOYdtuCXwaya2JclVZIsbFw~Crv~jl1fx49dTWSCnybV9Aqu4FvFsWDSN1XhQxQUveXKcqe5VgMVnb~y~8AqyDA__&Key-Pair-Id=APKAJ62UNSBCMEIPV4HA",
                           "file_name": "null",
                           "size": 250381,
                           "duration": 2466,
                           "tracking_data": "tracking data"
                        },
                        "silent": false
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

    
                });
            });


            it('Viber Location Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('location');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "event": "message",
                        "timestamp": 1503315490313,
                        "message_token": 5080383076000996000,
                        "sender": {
                           "id": "B01s8xC+C5Gah3OGX+umjA==",
                           "name": "健安江",
                           "avatar": "https://media-direct.cdn.viber.com/download_photo?dlid=_jEcnG_4b6ZOvnFGq7sf3TPg8fnfYmXsTjog84YeS1DXWtpkBfyNQ-FEUB4&fltp=jpg&imsz=0000",
                           "language": "en",
                           "country": "HR",
                           "api_version": 2
                        },
                        "message": {
                           "type": "location",
                           "location": {
                              "lat": 45.7949653,
                              "lon": 15.7187165
                           },
                           "tracking_data": "tracking data"
                        },
                        "silent": false
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

    
                });
            });


            it('Viber sticker Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('sticker');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "event": "message",
                        "timestamp": 1503315458952,
                        "message_token": 5080382944467622000,
                        "sender": {
                           "id": "B01s8xC+C5Gah3OGX+umjA==",
                           "name": "健安江",
                           "avatar": "https://media-direct.cdn.viber.com/download_photo?dlid=_jEcnG_4b6ZOvnFGq7sf3TPg8fnfYmXsTjog84YeS1DXWtpkBfyNQ-FEUB4&fltp=jpg&imsz=0000",
                           "language": "en",
                           "country": "HR",
                           "api_version": 2
                        },
                        "message": {
                           "type": "sticker",
                           "media": "http://content.cdn.viber.com/stickers/100/153500/00153500.png",
                           "sticker_id": 153500,
                           "tracking_data": "tracking data"
                        },
                        "silent": false
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

                });
            });


        });
    });