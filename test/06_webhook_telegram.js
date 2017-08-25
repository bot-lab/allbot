describe('Task WebHook Routes', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Telegram Webhook', () => {

            it('Telegram Text Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('text');
                    message.content.text.should.be.equal('test');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "update_id": 820919880,
                        "message": {
                           "message_id": 146,
                           "from": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "language_code": "en-HR"
                           },
                           "chat": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "type": "private"
                           },
                           "date": 1503314629,
                           "text": "test"
                        }
                     }
                     )
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
                        
    
                });
            });


            it('Telegram Pic Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {

                    sessionKeys.telegram = sessionKey;
                    userIdentifiers.telegram = message.userIdentifier;
                    
                    message.content.type.should.be.equal('image');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send( {
                        "update_id": 820919881,
                        "message": {
                           "message_id": 149,
                           "from": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "language_code": "en-HR"
                           },
                           "chat": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "type": "private"
                           },
                           "date": 1503314735,
                           "photo": [
                              {
                                 "file_id": "AgADBAADbaoxG9LN2VDmriGo-hWnmULf4RkABJGM8itwGT-GAAH9AAIC",
                                 "file_size": 1681,
                                 "width": 67,
                                 "height": 90
                              },
                              {
                                 "file_id": "AgADBAADbaoxG9LN2VDmriGo-hWnmULf4RkABMjHXao5TlPBAf0AAgI",
                                 "file_size": 21312,
                                 "width": 240,
                                 "height": 320
                              },
                              {
                                 "file_id": "AgADBAADbaoxG9LN2VDmriGo-hWnmULf4RkABLoiGiisgu7eAv0AAgI",
                                 "file_size": 83621,
                                 "width": 600,
                                 "height": 800
                              },
                              {
                                 "file_id": "AgADBAADbaoxG9LN2VDmriGo-hWnmULf4RkABLdlRbW3GDD-__wAAgI",
                                 "file_size": 146636,
                                 "width": 960,
                                 "height": 1280
                              }
                           ]
                        }
                     })
                    .end((err, res) => {
                            
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

                });
            });

            it('Telegram Video Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('video');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "update_id": 820919882,
                        "message": {
                           "message_id": 151,
                           "from": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "language_code": "en-HR"
                           },
                           "chat": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "type": "private"
                           },
                           "date": 1503314776,
                           "video": {
                              "duration": 2,
                              "width": 464,
                              "height": 848,
                              "mime_type": "video/mp4",
                              "thumb": {
                                 "file_id": "AAQEABPxOvcZAAS6ebYLIPQXnH0XAAIC",
                                 "file_size": 2719,
                                 "width": 50,
                                 "height": 90
                              },
                              "file_id": "BAADBAADiwIAAtFNuFDlwpCQ7wb7fgI",
                              "file_size": 368237
                           }
                        }
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
                        
    
                });
            });


            it('Telegram Audio Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('audio');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "update_id": 820919883,
                        "message": {
                           "message_id": 153,
                           "from": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "language_code": "en-HR"
                           },
                           "chat": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "type": "private"
                           },
                           "date": 1503314803,
                           "voice": {
                              "duration": 1,
                              "mime_type": "audio/ogg",
                              "file_id": "AwADBAADnwIAAtLN2VCiPkV20ILgHAI",
                              "file_size": 3921
                           }
                        }
                     })
                    .end((err, res) => {
                            
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

                });
            });


            it('Telegram Location Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('location');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "update_id": 820919884,
                        "message": {
                           "message_id": 155,
                           "from": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "language_code": "en-HR"
                           },
                           "chat": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "type": "private"
                           },
                           "date": 1503314825,
                           "location": {
                              "latitude": 45.794982,
                              "longitude": 15.719273
                           }
                        }
                     })
                    .end((err, res) => {
                            
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

    
                });
            });


            it('Telegram sticker Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('sticker');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "update_id": 820919885,
                        "message": {
                           "message_id": 157,
                           "from": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "language_code": "en-HR"
                           },
                           "chat": {
                              "id": 373216046,
                              "first_name": "Ken",
                              "last_name": "Yasue iphone",
                              "type": "private"
                           },
                           "date": 1503314960,
                           "sticker": {
                              "width": 438,
                              "height": 512,
                              "emoji": "💪",
                              "set_name": "TelegramGreatMinds",
                              "thumb": {
                                 "file_id": "AAQEABN_aWkwAASsVVouYSPXAYdXAAIC",
                                 "file_size": 2800,
                                 "width": 77,
                                 "height": 90
                              },
                              "file_id": "CAADBAADOgADyIsGAAH3hdtO3aqUpwI",
                              "file_size": 51308
                           }
                        }
                     }
                     )
                    .end((err, res) => {
                            
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

                });
            });


        });
    });