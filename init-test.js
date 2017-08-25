const Const = require('./constants');

module["exports"] = {
    port: 8888,
    baseURL:"https://spika.support",
    endpointURL:"/allbot",
    webhookReceiverURL: "/webhook",
    fileSenderURL: "/file",
    downloadPath: "./test/downloads",
    loglevel:"debug",
    service : [
        {
            identifier:'facebook-test',
            isTest: true,
            provider:Const.facebook,
            config:{
                verifyToken: 'blabla',
                accessToken: 'blabla',
                pageId:'1477196405690882',
                replyToBot: false 
           }
        },
        {
            identifier:'line-test',
            isTest: true,
            provider:Const.line,
            config:{
                channelSecret: 'blabla',
                channelAccessToken: 'blabla',
                replyToBot: false // keep this false if you don't know 
            }
        },
        {
            identifier:'slack-test',
            isTest: true,
            provider:Const.slack,
            config:{
                incomingWebHookURL: 'https://hooks.slack.com/services/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',
                appId: 'A6H3QQXK3',
                botToken: 'blabla',
                replyToBot: false // keep this false if you don't know 
            }
        },
        {
            identifier:'skype-test',
            isTest: true,
            provider:Const.skype,
            config:{
                appId: 'blabla',
                appPassword: 'blabla',
            }
        },
        {
            identifier:'telegram-test',
            isTest: true,
            provider:Const.telegram,
            config:{
                botToken:'blabla'
            }
        },
        {
            identifier:'kik-test',
            isTest: true,
            provider:Const.kik,
            config:{
                userName: 'blabla',
                apiKey: 'blabla'
            }
        },
        {
            identifier:'viber-test',
            isTest: true,
            provider:Const.viber,
            config:{
                apiKey: 'blabla',
                botName: 'Ken',
                botAvatar: 'http://clover.studio/user/themes/clover-studio-web2017July/images/team/ken.png'
            }
        },
        {
            identifier:'sms-test',
            isTest: true,
            provider:Const.twilio,
            config:{
                number: '+14158818614',
                accountSid: 'blabla',
                authToken: 'blabla'
            }
        },
        {
            identifier:'twitter-test',
            isTest: true,
            provider:Const.twitter,
            config:{
                consumerSecret: 'blabla',
                consumerKey: 'blabla',
                token: 'blabla',
                tokenSecret: 'blabla',
            }
        },

    ]

};

