describe('Task WebHook Routes', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Line Webhook', () => {

            it('Line Verification', (done)  =>{
    
                chai.request(app)
                    .post('/allbot/webhook')
                    .set({
                        'x-line-signature':'g4y/CaBw+Ku+xle6uyKnkiWwIPfP8TZTjRfI/+SOHUA='
                    })
                    .send( {
                        "events": [
                           {
                              "replyToken": "00000000000000000000000000000000",
                              "type": "message",
                              "timestamp": 1451617200000,
                              "source": {
                                 "type": "user",
                                 "userId": "Udeadbeefdeadbeefdeadbeefdeadbeef"
                              },
                              "message": {
                                 "id": "100001",
                                 "type": "text",
                                 "text": "Hello,world"
                              }
                           },
                           {
                              "replyToken": "ffffffffffffffffffffffffffffffff",
                              "type": "message",
                              "timestamp": 1451617210000,
                              "source": {
                                 "type": "user",
                                 "userId": "Udeadbeefdeadbeefdeadbeefdeadbeef"
                              },
                              "message": {
                                 "id": "100002",
                                 "type": "sticker",
                                 "packageId": "1",
                                 "stickerId": "1"
                              }
                           }
                        ]
                     }) 
                    .end((err, res) => {
    
                        //const signatureGenerated = crypto.createHmac('SHA256', 'blabla').update(body).digest('base64');

                        res.should.have.status(200);
                        res.text.should.be.equal('ok');
                        
                        done();
    
                });
            });

            it('Line Text Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('text');
                    message.content.text.should.be.equal('test');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .set({
                        'x-line-signature':'q9sc8r6e1OKsa+zRPpCb4USGfPvwdG03LpxoXFKRnFU='
                    })
                    .send({
                        "events": [
                           {
                              "type": "message",
                              "replyToken": "016f53911b0e494f9b6ecc5d0290abc9",
                              "source": {
                                 "userId": "Ua3abc55386827265cbd75c8948c56247",
                                 "type": "user"
                              },
                              "timestamp": 1503308684410,
                              "message": {
                                 "type": "text",
                                 "id": "6577130902493",
                                 "text": "test"
                              }
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('ok');
                        
                });
            });


            it('Line Pic Message', (done)  =>{

                allBot.onMessage((sessionKey,message) => {

                    sessionKeys.line = sessionKey;
                    userIdentifiers.line = message.userIdentifier;

                    message.content.type.should.be.equal('image');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .set({
                        'x-line-signature':'HGvxPDV6ebhmgwFPV0y7WV7vU0w8b2CSkyiZb3A+99M='
                    })
                    .send({
                        "events": [
                           {
                              "type": "message",
                              "replyToken": "636b3b748f564d4594e5b3610aab4238",
                              "source": {
                                 "userId": "Ua3abc55386827265cbd75c8948c56247",
                                 "type": "user"
                              },
                              "timestamp": 1503297142369,
                              "message": {
                                 "type": "image",
                                 "id": "6576332892126"
                              }
                           }
                        ]
                     })
                    .end((err, res) => {
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('ok');
    
                });
            });

            it('Line Video Message', (done)  =>{

                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('video');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .set({
                        'x-line-signature':'VNKWFdSiPc7vnqq38+uJJWQzmKSfuFpLNLE9SlCk4U8='
                    })
                    .send({
                        "events": [
                           {
                              "type": "message",
                              "replyToken": "5dbcc0e6a1824defb99569d3d69b3d78",
                              "source": {
                                 "userId": "Ua3abc55386827265cbd75c8948c56247",
                                 "type": "user"
                              },
                              "timestamp": 1503297172786,
                              "message": {
                                 "type": "video",
                                 "id": "6576334740845"
                              }
                           }
                        ]
                     })
                    .end((err, res) => {
    
            
                        res.should.have.status(200);
                        res.text.should.be.equal('ok');
    
                });
            });


            it('Line Audio Message', (done)  =>{

                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('audio');
                    allBot.clearListeners();
                    done();
                });

                
                chai.request(app)
                    .post('/allbot/webhook')
                    .set({
                        'x-line-signature':'9/kkt0E8ZBC71BKzRrVjvC469lAAPPvweZM6nQjhbOo='
                    })
                    .send({
                        "events": [
                           {
                              "type": "message",
                              "replyToken": "636b3b748f564d4594e5b3610aab4238",
                              "source": {
                                 "userId": "Ua3abc55386827265cbd75c8948c56247",
                                 "type": "user"
                              },
                              "timestamp": 1503297142369,
                              "message": {
                                 "type": "audio",
                                 "id": "6576332892126"
                              }
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('ok');
                        
                });
            });


            it('Line Sticker Message', (done)  =>{

                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('sticker');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .set({
                        'x-line-signature':'D1Vi3Tq9bSJxZrw2v5EyEcnMYC/EBbcfW+6jze/gcS0='
                    })
                    .send( {
                        "events": [
                           {
                              "type": "message",
                              "replyToken": "1f9276eda9ee42d8bb19027a10e0de3b",
                              "source": {
                                 "userId": "Ua3abc55386827265cbd75c8948c56247",
                                 "type": "user"
                              },
                              "timestamp": 1503297204631,
                              "message": {
                                 "type": "sticker",
                                 "id": "6576336682668",
                                 "stickerId": "4",
                                 "packageId": "1"
                              }
                           }
                        ]
                     })
                    .end((err, res) => {
                            
                        res.should.have.status(200);
                        res.text.should.be.equal('ok');

                });
            });


            it('Line Location Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('location');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .set({
                        'x-line-signature':'v1AmILeuWdBmz1DK+J+oeEKO72sbbMYvBEdREILXjpY='
                    })
                    .send( {
                        "events": [
                        {
                            "type": "message",
                            "replyToken": "26254a9575054677aa3b9d8bf898aa7b",
                            "source": {
                                "userId": "Ua3abc55386827265cbd75c8948c56247",
                                "type": "user"
                            },
                            "timestamp": 1503297224885,
                            "message": {
                                "type": "location",
                                "id": "6576337898812",
                                "title": "Location",
                                "address": "Mirnovečka ulica 46a 10430, Samobor",
                                "latitude": 45.794703370041454,
                                "longitude": 15.71937058120966
                            }
                        }
                        ]
                    })
                    .end((err, res) => {

                        res.should.have.status(200);
                        res.text.should.be.equal('ok');

                });
            });
            
        });

    });