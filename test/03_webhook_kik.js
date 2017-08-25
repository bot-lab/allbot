describe('Task WebHook Routes', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Kik Webhook', () => {

            it('Kik Text Message', (done)  =>{

                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('text');
                    message.content.text.should.be.equal('test');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "messages": [
                           {
                              "body": "test",
                              "from": "kenyasue822",
                              "timestamp": 1503295998459,
                              "chatType": "direct",
                              "mention": null,
                              "participants": [
                                 "kenyasue822"
                              ],
                              "readReceiptRequested": true,
                              "type": "text",
                              "id": "bbdf4ea0-1108-478f-8c4e-95acc30ed6a1",
                              "chatId": "a6e9a81f231769e4245c11ae817705743f443d557affb68d2d99f8535a8aa0cc"
                           }
                        ]
                    })
                    .end((err, res) => {
    
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');


                });
            });


            it('Kik Pic Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {

                    sessionKeys.kik = sessionKey;
                    userIdentifiers.kik = message.userIdentifier;

                    message.content.type.should.be.equal('image');
                    allBot.clearListeners();
                    done();
                });
                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "messages": [
                           {
                              "attribution": {
                                 "iconUrl": null,
                                 "style": "overlay",
                                 "name": "Gallery"
                              },
                              "from": "kenyasue822",
                              "timestamp": 1503296063192,
                              "chatType": "direct",
                              "mention": null,
                              "participants": [
                                 "kenyasue822"
                              ],
                              "picUrl": "http://clover.studio/temppic.jpeg",
                              "readReceiptRequested": true,
                              "type": "picture",
                              "id": "aaf06eea-a29c-4bd6-9c79-faedf15633a8",
                              "chatId": "a6e9a81f231769e4245c11ae817705743f443d557affb68d2d99f8535a8aa0cc"
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
    
                });
            });




            it('Kik Video Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('video');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "messages": [
                           {
                              "attribution": {
                                 "iconUrl": null,
                                 "style": "overlay",
                                 "name": "Gallery"
                              },
                              "videoUrl": "http://clover.studio/tempvideo.mp4",
                              "timestamp": 1503296206252,
                              "chatType": "direct",
                              "readReceiptRequested": true,
                              "mention": null,
                              "participants": [
                                 "kenyasue822"
                              ],
                              "from": "kenyasue822",
                              "type": "video",
                              "id": "b98a43d6-6fec-4aff-b949-053f92ad2150",
                              "chatId": "a6e9a81f231769e4245c11ae817705743f443d557affb68d2d99f8535a8aa0cc"
                           }
                        ]
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

                });
            });

        });
    });