const Const = require('./constants');

module["exports"] = {
    port: 8888,
    baseURL:"",
    endpointURL:"/allbot",
    webhookReceiverURL: "/webhook",
    fileSenderURL: "/file",
    downloadPath: "./downloads",
    loglevel:"debug",
    service : [
        {
            identifier:'facebook',
            provider:Const.facebook,
            config:{
                verifyToken: '',
                accessToken: '',
                pageId:'',
                replyToBot: false 
           }
        },
        {
            identifier:'line',
            provider:Const.line,
            config:{
                channelSecret: '',
                channelAccessToken: '',
                replyToBot: false // keep this false if you don't know 
            }
        },
        {
            identifier:'slack',
            provider:Const.slack,
            config:{
                incomingWebHookURL: '',
                appId: '',
                botToken: '',
                replyToBot: false // keep this false if you don't know 
            }
        },
        {
            identifier:'skype',
            provider:Const.skype,
            config:{
                appId: '',
                appPassword: '',
            }
        },
        {
            identifier:'telegram',
            provider:Const.telegram,
            config:{
                botToken:''
            }
        },
        {
            identifier:'kik',
            provider:Const.kik,
            config:{
                userName: '',
                apiKey: ''
            }
        },
        {
            identifier:'viber',
            provider:Const.viber,
            config:{
                apiKey: '',
                botName: '',
                botAvatar: ''
            }
        },
        {
            identifier:'sms',
            isTest: true,
            provider:Const.twilio,
            config:{
                number: '',
                accountSid: '',
                authToken: ''
            }
        },
        {
            identifier:'twitter',
            provider:Const.twitter,
            config:{
                consumerSecret: '',
                consumerKey: '',
                token: '',
                tokenSecret: '',
            }
        },

    ]

};

