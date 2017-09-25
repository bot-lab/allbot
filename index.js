const express = require('express');
const bodyParser = require("body-parser");
const router = express.Router();

const init = require('./init');
const Const = require('./constants');
const AllBot = require('./lib/AllBot');

const app = express();

const rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: function () { return true } }));
app.use(function(req, res, next) {
  var data = '';
  req.on('data', function(chunk) { 
    data += chunk;
  });
  req.on('end', function() {
    req.rawBody = data;
  });
  next();
});

var allBot = new AllBot(init);

allBot.onMessage((sessionKey,message) => {
  
/*
  let text = "";

  if(message.content.type == Const.messageTypeText){

    text = message.providerIdentifier + " : " + message.content.text;  
    
    allBot.replyText(sessionKey,text + ": reply message",(messageData,next) => {

      messageData.message.text = 'ssssss';
      next();

    }).then((result) => {

        console.log("message sent httpcode : " + result);
        
    }).then((result) => {
      
      return allBot.sendText(message.userIdentifier,text + ": send message");

    }).then((result) => {

      console.log("message sent httpcode : " + result);

    }).catch((err) => {

      console.log("faled to send message",err);

    });

  
    if(message.content.text == 'loc'){

      allBot.sendLocation(message.userIdentifier,{
        address:"test",
        latitude:45.81593968082424,
        longitude:15.956570059061052,
      },(code,body) => {
        console.log("location sent",body);
      });

    }else{
      allBot.replyText(sessionKey,text + ": reply message",(code,body) => {
        console.log("message sent",body);
      });
      
      allBot.sendText(message.userIdentifier,text + ": direct message",(code,body) => {
        console.log("message sent",body);
      });
  
    }


  }

  if(message.content.type == Const.messageTypeImage ||
    message.content.type == Const.messageTypeAudio ||
    message.content.type == Const.messageTypeVideo){
      
      allBot.downloadFile(sessionKey,init.downloadPath).then((fileId) => {
      
        console.log("download done fileId",fileId);
        return allBot.sendFile(message.userIdentifier,fileId);

      }).then((result) => {

          console.log("file sent",result);

      });

  }

  if(message.content.type == Const.messageTypeSticker){
    text = message.providerIdentifier + ": got sticker";
  }

  if(message.content.type == Const.messageTypeLocation){
    
    allBot.sendLocation(message.userIdentifier,{
      address:message.content.address,
      latitude:message.content.coordinates.latitude,
      longitude:message.content.coordinates.longitude,

    }).then((result) => {
      console.log("location sent",result);
      
    });
    
  }
*/
});


router.use(init.endpointURL, allBot.router);
app.use('', router);

app.get('/', function (req, res) {
  res.send('hello')
})

app.listen(init.port, function () {
  console.log('allBot is listening on port ' + init.port);
})

// for testing
module.exports = app;