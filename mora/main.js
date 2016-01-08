var logger = require(__base + 'mora/logger'),
    crypto = require(__base + 'mora/crypto'),
    login = require(__base + 'mora/loginHandler'),
    game = require(__base + 'mora/gameHandler');

var self = {
  handleData: function(data, client){
    logger.write('Received data: ' + data, logger.LEVELS.DEBUG);

    data = data.split('\0')[0];

    var dataType = data.charAt(0);

    if(dataType == '<'){
      login.handleXml(data, client);
    } else if(dataType == '%'){
      game.handleXt(data, client);
    }
  },
  addClient: function(client){
    if(client){
      game.clients.push(client);
    }
  },
  removeClient: function(socket){
    for(var i in game.clients){
      var client = game.clients[i];
      if(socket == client.socket){
        logger.write('Removing disconnecting client...');
        game.clients.splice(i, 1);
        var roomManager = game.getRoomManager();
        roomManager.removeUser(client);
        socket.destroy();
      }
    }
  }
}

module.exports = self;