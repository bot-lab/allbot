describe('Task WebHook Routes', () => {  
    
        // Testing the save task expecting status 201 of success
        describe('Twilio Webhook', () => {

            it('Twilio Text Message', (done)  =>{
                
                allBot.onMessage((sessionKey,message) => {

                    sessionKeys.twilio = sessionKey;
                    userIdentifiers.twilio = message.userIdentifier;

                    message.content.type.should.be.equal('text');
                    message.content.text.should.be.equal('test');
                    allBot.clearListeners();
                    done();
                });

                chai.request(app)
                    .post('/allbot/webhook')
                    .send({
                        "ToCountry": "US",
                        "ToState": "CA",
                        "SmsMessageSid": "SMc6065e56160e05adb994aae94560a913",
                        "NumMedia": "0",
                        "ToCity": "IGNACIO",
                        "FromZip": "",
                        "SmsSid": "SMc6065e56160e05adb994aae94560a913",
                        "FromState": "",
                        "SmsStatus": "received",
                        "FromCity": "",
                        "Body": "test",
                        "FromCountry": "HR",
                        "To": "+14158818614",
                        "ToZip": "94949",
                        "NumSegments": "1",
                        "MessageSid": "SMc6065e56160e05adb994aae94560a913",
                        "AccountSid": "ACa25b18aa620f194a8f2f3cf76230fa70",
                        "From": "+385912555174",
                        "ApiVersion": "2010-04-01"
                     })
                    .end((err, res) => {
    
                        res.should.have.status(200);
                        res.text.should.be.equal('');
                        
                });
            });

        });
    });