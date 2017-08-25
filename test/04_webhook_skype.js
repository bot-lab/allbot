describe('Task WebHook Routes', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Skype Webhook', () => {


            it('Skype Text Message', (done)  =>{
                
                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "text": "123",
                        "type": "message",
                        "timestamp": "2017-08-21T06:49:52.198Z",
                        "localTimestamp": "2017-08-21T08:49:52.198+02:00",
                        "id": "1503298192189",
                        "channelId": "skype",
                        "serviceUrl": "https://smba.trafficmanager.net/apis/",
                        "from": {
                           "id": "29:1llWoLkHE-zcJaOk_VC7vR5AVw_F2K1Bmm58KrVizpuc",
                           "name": "Ken Yasue"
                        },
                        "conversation": {
                           "id": "29:1llWoLkHE-zcJaOk_VC7vR5AVw_F2K1Bmm58KrVizpuc"
                        },
                        "recipient": {
                           "id": "28:ea28273f-0155-4771-9e9d-ffada7881b54",
                           "name": "TomodachiBot"
                        },
                        "entities": [
                           {
                              "locale": "en-US",
                              "country": "HR",
                              "platform": "Mac",
                              "type": "clientInfo"
                           }
                        ],
                        "channelData": {
                           "text": "123"
                        }
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('');
                        
                        done();
    
                });
            });


            it('Skype Pic Message', (done)  =>{
                
                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "attachments": [
                           {
                              "contentType": "image",
                              "contentUrl": "https://smba.trafficmanager.net/apis/v3/attachments/0-weu-d1-e3165ed580154618e7dfa5c5c15c0be7/views/original",
                              "thumbnailUrl": "https://smba.trafficmanager.net/apis/v3/attachments/0-weu-d1-e3165ed580154618e7dfa5c5c15c0be7/views/thumbnail",
                              "name": "temppic.jpeg"
                           }
                        ],
                        "type": "message",
                        "timestamp": "2017-08-21T06:54:05.784Z",
                        "localTimestamp": "2017-08-21T08:54:05.784+02:00",
                        "id": "1503298445587",
                        "channelId": "skype",
                        "serviceUrl": "https://smba.trafficmanager.net/apis/",
                        "from": {
                           "id": "29:1llWoLkHE-zcJaOk_VC7vR5AVw_F2K1Bmm58KrVizpuc",
                           "name": "Ken Yasue"
                        },
                        "conversation": {
                           "id": "29:1llWoLkHE-zcJaOk_VC7vR5AVw_F2K1Bmm58KrVizpuc"
                        },
                        "recipient": {
                           "id": "28:ea28273f-0155-4771-9e9d-ffada7881b54",
                           "name": "TomodachiBot"
                        },
                        "entities": [
                           {
                              "locale": "en-US",
                              "country": "HR",
                              "platform": "Mac",
                              "type": "clientInfo"
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('');
                        
                        done();
    
                });
            });

            it('Skype Video Message', (done)  =>{
                
                chai.request(app)
                    .post('/allbot/webhook')
                    .send( {
                        "attachments": [
                           {
                              "contentType": "application/octet-stream",
                              "contentUrl": "https://smba.trafficmanager.net/apis/v3/attachments/0-weu-d1-6c0ec3bfdfd2412bb93d316ed65fba6b/views/original",
                              "thumbnailUrl": "https://smba.trafficmanager.net/apis/v3/attachments/0-weu-d1-6c0ec3bfdfd2412bb93d316ed65fba6b/views/thumbnail",
                              "name": "tempvideo.mp4"
                           }
                        ],
                        "type": "message",
                        "timestamp": "2017-08-21T06:54:28.877Z",
                        "localTimestamp": "2017-08-21T08:54:28.877+02:00",
                        "id": "1503298468759",
                        "channelId": "skype",
                        "serviceUrl": "https://smba.trafficmanager.net/apis/",
                        "from": {
                           "id": "29:1llWoLkHE-zcJaOk_VC7vR5AVw_F2K1Bmm58KrVizpuc",
                           "name": "Ken Yasue"
                        },
                        "conversation": {
                           "id": "29:1llWoLkHE-zcJaOk_VC7vR5AVw_F2K1Bmm58KrVizpuc"
                        },
                        "recipient": {
                           "id": "28:ea28273f-0155-4771-9e9d-ffada7881b54",
                           "name": "TomodachiBot"
                        },
                        "entities": [
                           {
                              "locale": "en-US",
                              "country": "HR",
                              "platform": "Mac",
                              "type": "clientInfo"
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('');
                        
                        done();
    
                });
            });

            it('Skype Sticker Message', (done)  =>{
                
                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "text": ":x",
                        "type": "message",
                        "timestamp": "2017-08-21T06:55:06.955Z",
                        "localTimestamp": "2017-08-21T08:55:06.955+02:00",
                        "id": "1503298506947",
                        "channelId": "skype",
                        "serviceUrl": "https://smba.trafficmanager.net/apis/",
                        "from": {
                           "id": "29:1llWoLkHE-zcJaOk_VC7vR5AVw_F2K1Bmm58KrVizpuc",
                           "name": "Ken Yasue"
                        },
                        "conversation": {
                           "id": "29:1llWoLkHE-zcJaOk_VC7vR5AVw_F2K1Bmm58KrVizpuc"
                        },
                        "recipient": {
                           "id": "28:ea28273f-0155-4771-9e9d-ffada7881b54",
                           "name": "TomodachiBot"
                        },
                        "entities": [
                           {
                              "locale": "en-US",
                              "country": "HR",
                              "platform": "Mac",
                              "type": "clientInfo"
                           }
                        ],
                        "channelData": {
                           "text": "<ss type=\"lipssealed\">:x</ss>"
                        }
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('');
                        
                        done();
    
                });
            });

        });

    });