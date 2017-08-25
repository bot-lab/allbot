/* SessionPool is singleton which handles platform's sessionId and Chatbohhub's sessionId */

const Const = require('../constants');

class SessionPool {

  constructor() {
    this.pool = {};
  }

  set(identifier, provider, message, originalReposonse) {

    var newSessionKey = this.newSessionKey();

    this.pool[newSessionKey] = {
        identifier: identifier,
        provider: provider,
        message: message,
        originalReposonse: originalReposonse
    }

    return newSessionKey;

  }

  get(sessionId) {

    return this.pool[sessionId];

  }

  newSessionKey(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for( var i=0; i < 32; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}

if(global.sessionPool){

}else{
    global.sessionPool = new SessionPool();
}

module["exports"] = global.sessionPool;

