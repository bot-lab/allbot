describe('Task WebHook Routes', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Slack Webhook', () => {

             it('Slack Challenge', (done)  =>{
                
                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "token": "GBRcAl6autiMQVtcIZ4QKEjD",
                        "challenge": "80rWChjGv4LEwWcunXUlyN9DLiJxOP4Fao4PAYrlq8oM1FEF1nyL",
                        "type": "url_verification"
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('80rWChjGv4LEwWcunXUlyN9DLiJxOP4Fao4PAYrlq8oM1FEF1nyL');
                        
                        done();
    
                });

            });

            it('Slack Text Message', (done)  =>{

                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('text');
                    message.content.text.should.be.equal('test');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "token": "GBRcAl6autiMQVtcIZ4QKEjD",
                        "team_id": "T09T4GMUN",
                        "api_app_id": "A6H3QQXK3",
                        "event": {
                           "type": "message",
                           "user": "U09T4MTCJ",
                           "text": "test",
                           "ts": "1503299102.000269",
                           "channel": "C09T4E5NX",
                           "event_ts": "1503299102.000269"
                        },
                        "type": "event_callback",
                        "authed_users": [
                           "U09T4MTCJ"
                        ],
                        "event_id": "Ev6R93GD44",
                        "event_time": 1503299102
                     })
                     .end((err, res) => {
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
                        
                });
            });


            it('Slack Pic Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {

                    sessionKeys.slack = sessionKey;
                    userIdentifiers.slack = message.userIdentifier;

                    message.content.type.should.be.equal('image');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "token": "GBRcAl6autiMQVtcIZ4QKEjD",
                        "team_id": "T09T4GMUN",
                        "api_app_id": "A6H3QQXK3",
                        "event": {
                           "type": "message",
                           "subtype": "file_share",
                           "text": "<@U09T4MTCJ|ken> uploaded a file: <https://cloverstudio.slack.com/files/ken/F6QLCPBU0/image_uploaded_from_ios.jpg|Image uploaded from iOS>",
                           "file": {
                              "id": "F6QLCPBU0",
                              "created": 1503313932,
                              "timestamp": 1503313932,
                              "name": "Image uploaded from iOS.jpg",
                              "title": "Image uploaded from iOS",
                              "mimetype": "image/jpeg",
                              "filetype": "jpg",
                              "pretty_type": "JPEG",
                              "user": "U09T4MTCJ",
                              "editable": false,
                              "size": 7511017,
                              "mode": "hosted",
                              "is_external": false,
                              "external_type": "",
                              "is_public": true,
                              "public_url_shared": false,
                              "display_as_bot": false,
                              "username": "",
                              "url_private": "https://files.slack.com/files-pri/T09T4GMUN-F6QLCPBU0/image_uploaded_from_ios.jpg",
                              "url_private_download": "http://clover.studio/temppic.jpeg",
                              "thumb_64": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_64.jpg",
                              "thumb_80": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_80.jpg",
                              "thumb_360": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_360.jpg",
                              "thumb_360_w": 270,
                              "thumb_360_h": 360,
                              "thumb_480": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_480.jpg",
                              "thumb_480_w": 360,
                              "thumb_480_h": 480,
                              "thumb_160": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_160.jpg",
                              "thumb_720": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_720.jpg",
                              "thumb_720_w": 540,
                              "thumb_720_h": 720,
                              "thumb_800": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_800.jpg",
                              "thumb_800_w": 800,
                              "thumb_800_h": 1067,
                              "thumb_960": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_960.jpg",
                              "thumb_960_w": 720,
                              "thumb_960_h": 960,
                              "thumb_1024": "https://files.slack.com/files-tmb/T09T4GMUN-F6QLCPBU0-c55b56897d/image_uploaded_from_ios_1024.jpg",
                              "thumb_1024_w": 768,
                              "thumb_1024_h": 1024,
                              "image_exif_rotation": 1,
                              "original_w": 3024,
                              "original_h": 4032,
                              "permalink": "https://cloverstudio.slack.com/files/ken/F6QLCPBU0/image_uploaded_from_ios.jpg",
                              "permalink_public": "https://slack-files.com/T09T4GMUN-F6QLCPBU0-a2d2ff75ed",
                              "channels": [
                                 "C09T4E5NX"
                              ],
                              "groups": [],
                              "ims": [],
                              "comments_count": 0
                           },
                           "user": "U09T4MTCJ",
                           "upload": true,
                           "display_as_bot": false,
                           "username": "ken",
                           "bot_id": null,
                           "upload_reply_to": "B3899614-6147-4460-A849-C76450A4369B",
                           "ts": "1503313939.000082",
                           "channel": "C09T4E5NX",
                           "event_ts": "1503313939.000082"
                        },
                        "type": "event_callback",
                        "authed_users": [
                           "U09T4MTCJ"
                        ],
                        "event_id": "Ev6RBVM0GL",
                        "event_time": 1503313939
                     })
                    .end((err, res) => {
                            
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');

                });
            });

            it('Slack Video Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {
                    message.content.type.should.be.equal('video');
                    allBot.clearListeners();
                    done();
                });


                chai.request(app)
                    .post('/allbot/webhook')
                    .send( {
                        "token": "GBRcAl6autiMQVtcIZ4QKEjD",
                        "team_id": "T09T4GMUN",
                        "api_app_id": "A6H3QQXK3",
                        "event": {
                           "type": "message",
                           "subtype": "file_share",
                           "text": "<@U09T4MTCJ|ken> uploaded a file: <https://cloverstudio.slack.com/files/ken/F6QLJAGAU/image_uploaded_from_ios.mov|Image uploaded from iOS>",
                           "file": {
                              "id": "F6QLJAGAU",
                              "created": 1503314509,
                              "timestamp": 1503314509,
                              "name": "Image uploaded from iOS.MOV",
                              "title": "Image uploaded from iOS",
                              "mimetype": "video/quicktime",
                              "filetype": "mov",
                              "pretty_type": "QuickTime Movie",
                              "user": "U09T4MTCJ",
                              "editable": false,
                              "size": 113886,
                              "mode": "hosted",
                              "is_external": false,
                              "external_type": "",
                              "is_public": true,
                              "public_url_shared": false,
                              "display_as_bot": false,
                              "username": "",
                              "url_private": "https://files.slack.com/files-pri/T09T4GMUN-F6QLJAGAU/image_uploaded_from_ios.mov",
                              "url_private_download": "https://files.slack.com/files-pri/T09T4GMUN-F6QLJAGAU/download/image_uploaded_from_ios.mov",
                              "permalink": "https://cloverstudio.slack.com/files/ken/F6QLJAGAU/image_uploaded_from_ios.mov",
                              "permalink_public": "https://slack-files.com/T09T4GMUN-F6QLJAGAU-3f3c1ed205",
                              "channels": [
                                 "C09T4E5NX"
                              ],
                              "groups": [],
                              "ims": [],
                              "comments_count": 0
                           },
                           "user": "U09T4MTCJ",
                           "upload": true,
                           "display_as_bot": false,
                           "username": "ken",
                           "bot_id": null,
                           "ts": "1503314510.000112",
                           "channel": "C09T4E5NX",
                           "event_ts": "1503314510.000112"
                        },
                        "type": "event_callback",
                        "authed_users": [
                           "U09T4MTCJ"
                        ],
                        "event_id": "Ev6R82EAHH",
                        "event_time": 1503314510
                     })
                    .end((err, res) => {
    
                        
                        res.should.have.status(200);
                        res.text.should.be.equal('OK');
 
    
                });

            });

        });

    });