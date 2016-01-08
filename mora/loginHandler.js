var logger = require(__base + 'mora/logger'),
    crypto = require(__base + 'mora/crypto'),
    utils = require(__base + 'mora/utils');

var parseXml = require('xml2js').parseString;

var self = {
  xmlHandlers: {
    'sys': {
      'verChk': 'handleVerChk',
      'rndK': 'handleRndK',
      'login': 'handleLogin'
    }
  },
  handleXml: function(data, client){
    if(data == '<policy-file-request/>'){
      client.write('<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>');
    } else {
      parseXml(data, function(err, res){
        var type = res.msg['$'].t,
            action = res.msg.body[0]['$'].action;

        var method = self.xmlHandlers[type][action];

        if (typeof self[method] == 'function'){
          self[method](data, client);
        }
      });
    }
  },
  handleVerChk: function(data, client){
    client.write('<msg t="sys"><body action="apiOK" r="0"></body></msg>');
  },
  handleRndK: function(data, client){
    var randomKey = crypto.generateKey();
    client.set('randomKey', randomKey);
    client.write('<msg t="sys"><body action="rndK" r="-1"><k>' + randomKey + '</k></body></msg>');
  },
  handleLogin: function(data, client){
    parseXml(data, function(err, res){
      var username = res.msg.body[0].login[0].nick[0],
          pass = res.msg.body[0].login[0].pword[0];
      __db.verifyPlayer(username, function(err, result){
        if(!result){
          client.sendError(100);
        } else {
          var loginPort = self.getLoginPort();
          if(!loginPort){
            logger.write('Login port not defined?', logger.LEVELS.FATAL);
          }
          __db.getPlayer(username, function(err, result){
            if(!err && result){
              var userId = result.id,
                  userPass = result.password.toUpperCase(),
                  userArr = result;

              if(client.socket.localPort == loginPort){
                var loginKey = crypto.generateMD5(crypto.generateKey()),
                    encrypt = crypto.encryptPassword(userPass, client.get('randomKey'));
                if(encrypt !== pass){
                  client.sendError(101);
                  client.socket.end();
                  client.socket.destroy();
                } else {
                  var serverList = self.getServerList();
                  client.sendXt('sd', -1, serverList);
                  client.sendXt('l', -1, userId, loginKey, '', '101,5');
                  __db.updateColumn(userId, 'loginKey', loginKey);
                  client.socket.end('Login complete');
                  client.socket.destroy();
                }
              } else {
                var hash = pass.substr(32);
                __db.getLoginKey(userId, function(err, result){
                  if(!err){
                    loginKey = result;
                    if(hash !== '' || loginKey !== ''){
                      if(hash == loginKey){
                        client.sendXt('l', -1);
                        client.setClient(userArr);
                        __db.updateColumn(userId, 'loginKey', '');
                      } else {
                        client.sendError(101);
                        __db.updateColumn(userId, 'loginKey', '');
                        client.socket.end();
                        client.socket.destroy();
                      }
                    }
                  }
                });
              }
            }
          });
        }
      });
    });
  },
  getServerByPort: function(port){ // ... lame
    var servers = __config.Servers;
    if(!isNaN(port)){
      for(var id in servers){
        var server = servers[id];
        if(server.Port == port){
          return server;
        }
      }
    }
    return false;
  },
  getLoginPort: function(){
    var servers = __config.Servers;
    for(var id in servers){
      if(servers[id].Type.toLowerCase() == 'login'){
        return servers[id].Port;
      }
    }
    return false;
  },
  getServerList: function(){
    var servers = __config.Servers;
    var serverArr = [];
    for(var id in servers){
      var server = servers[id];
      var serverType = server.Type.toLowerCase();
      if(serverType == 'game'){
        serverArr.push(id + '|' + server.Name + '|' + server.Host + '|' + server.Port);
      }
    }
    return serverArr.join('%');
  }
}

module.exports = self;