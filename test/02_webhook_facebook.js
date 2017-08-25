describe('Task WebHook Routes', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Facebook Webhook', () => {

            it('Facebook Get Verification', (done)  =>{

                chai.request(app)
                    .get('/allbot/webhook')
                    .query({
                        "hub.verify_token": 'blabla',
                        "hub.mode": 'subscribe',
                        "hub.challenge": 'testtest'
                    }) 
                    .end((err, res) => {

                        res.should.have.status(200);
                        res.text.should.be.equal('testtest');

                        done();
    
                });
            });

            it('Facebook Text Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {

                    message.content.type.should.be.equal('text');
                    message.content.text.should.be.equal('test');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "object": "page",
                        "entry": [
                           {
                              "id": "1477196405690882",
                              "time": 1503089178840,
                              "messaging": [
                                 {
                                    "sender": {
                                       "id": "1366591080115824"
                                    },
                                    "recipient": {
                                       "id": "1477196405690882"
                                    },
                                    "timestamp": 1503089178266,
                                    "message": {
                                       "mid": "mid.$cAAU_gLN-6rFkKF3-mld9xi2HJGfw",
                                       "seq": 122643,
                                       "text": "test"
                                    }
                                 }
                              ]
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
    
                });
            });

            it('Facebook Pic Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {

                    sessionKeys.fb = sessionKey;
                    userIdentifiers.fb = message.userIdentifier;
                    
                    message.content.type.should.be.equal('image');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "object": "page",
                        "entry": [
                           {
                              "id": "1477196405690882",
                              "time": 1503089233679,
                              "messaging": [
                                 {
                                    "sender": {
                                       "id": "1366591080115824"
                                    },
                                    "recipient": {
                                       "id": "1477196405690882"
                                    },
                                    "timestamp": 1503089233169,
                                    "message": {
                                       "mid": "mid.$cAAU_gLN-6rFkKF7VEVd9xmHStIwK",
                                       "seq": 122648,
                                       "attachments": [
                                          {
                                             "type": "image",
                                             "payload": {
                                                "url": "http://clover.studio/temppic.jpeg",
                                             }
                                          }
                                       ]
                                    }
                                 }
                              ]
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
    
                });
            });

            it('Facebook Video Message', (done)  =>{
                
                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "object": "page",
                        "entry": [
                           {
                              "id": "1477196405690882",
                              "time": 1503089367282,
                              "messaging": [
                                 {
                                    "sender": {
                                       "id": "1366591080115824"
                                    },
                                    "recipient": {
                                       "id": "1477196405690882"
                                    },
                                    "timestamp": 1503089366773,
                                    "message": {
                                       "mid": "mid.$cAAU_gLN-6rFkKGDe9Vd9xuGtTES9",
                                       "seq": 122669,
                                       "attachments": [
                                          {
                                             "type": "video",
                                             "payload": {
                                                "url": "http://clover.studio/tempvideo.mp4"
                                             }
                                          }
                                       ]
                                    }
                                 }
                              ]
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
                        
                        done();
    
                });
            });


            it('Facebook Audio Message', (done)  =>{
                
                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "object": "page",
                        "entry": [
                           {
                              "id": "1477196405690882",
                              "time": 1503089388619,
                              "messaging": [
                                 {
                                    "sender": {
                                       "id": "1366591080115824"
                                    },
                                    "recipient": {
                                       "id": "1477196405690882"
                                    },
                                    "timestamp": 1503089388108,
                                    "message": {
                                       "mid": "mid.$cAAU_gLN-6rFkKGEyTFd9xvkOcgM2",
                                       "seq": 122671,
                                       "attachments": [
                                          {
                                             "type": "audio",
                                             "payload": {
                                                "url": "http://clover.studio/tempaudio.aac"
                                             }
                                          }
                                       ]
                                    }
                                 }
                              ]
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
                        
                        done();
    
                });
            });


            it('Facebook Location Message', (done)  =>{
                
                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "object": "page",
                        "entry": [
                           {
                              "id": "1477196405690882",
                              "time": 1503089413773,
                              "messaging": [
                                 {
                                    "sender": {
                                       "id": "1366591080115824"
                                    },
                                    "recipient": {
                                       "id": "1477196405690882"
                                    },
                                    "timestamp": 1503089413266,
                                    "message": {
                                       "mid": "mid.$cAAU_gLN-6rFkKGGUkld9xxJQTC3s",
                                       "seq": 122673,
                                       "attachments": [
                                          {
                                             "title": "Ken's Location",
                                             "url": "https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3D45.794808672386%252C%2B15.718798857858%26FORM%3DFBKPL1%26mkt%3Den-US&h=ATPvWCV1O_yaCMjXeTQsh9b_ZOLmHGZWTHTz476NCE3YLEp78-uYc-1zleR_FVSx4hY2rBK_8JjfObkiOqPXqs9i7BkoXZnSaVdCilNbX-g1RvcJDg&s=1&enc=AZNntqLAt_QqX0JynGW334F8-s5h6WeO_lPnreaUa4alCOnPcTTrZXgtFf2kEmLtIVpIumuj6WwrMp_ZBmAi3D64",
                                             "type": "location",
                                             "payload": {
                                                "coordinates": {
                                                   "lat": 45.794808672386,
                                                   "long": 15.718798857858
                                                }
                                             }
                                          }
                                       ]
                                    }
                                 }
                              ]
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
                        
                        done();
    
                });
            });

        });
    });