var logger = require(__base + 'mora/logger'),
    bot = require(__base + 'plugins/bot');

var self = {
  commands: {
    'ping': 'handlePing',
    'id': 'getPlayerId',
    'ai': 'addItem',
    'ac': 'addCoins',
    'af': 'addFurniture',
    'color': 'handleUpdateColor'
  },
  handlePing: function(cmd, client){
    bot.sendMessage('Pong', client);
  },
  handleUpdateColor: function(cmd, client){
    var color = cmd[0];
    if((color.length > 8) || (color.length < 6))
      return;
    if((color.length == 8) && (color.substring(0, 2) !== '0x'))
      return;
    if(color.length == 6)
      color = '0x' + color; // convert to flash supported hex
    client.updateClothing('color', color);
  },
  getPlayerId: function(cmd, client){
    bot.sendMessage('Your ID is: ' + client.get('id'), client);
  },
  addItem: function(cmd, client){
    var item = parseInt(cmd[0]);
    if(!isNaN(item)){
      client.addItem(item);
    }
  },
  addCoins: function(cmd, client){
    var coins = parseInt(cmd[0]);
    if(!isNaN(coins)){
      if(coins > 50000) coins = 50000;
      if(coins < 0) coins = 50;
      client.addCoins(coins);
      client.sendXt('zo', -1, client.get('coins'));
    }
  }
};

module.exports = self;