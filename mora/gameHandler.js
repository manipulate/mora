var logger = require(__base + 'mora/logger'),
    roomManager = require(__base + 'mora/roomManager'),
    itemCrumbs = require(__base + 'crumbs/items.json');

var plugins = [];

__config.Plugins.forEach(function(plugin){
  logger.write('Loading plugin \'' + plugin + '\'');
  plugins[plugin] = require('../plugins/' + plugin);
});

var self = {
  xtHandlers: {
    's': {
      'j#js': 'handleJoinServer',
      'u#h': 'handleHeartBeat',
      'i#gi': 'handleGetInventory',
      'b#gb': 'handleGetBuddies',
      'n#gn': 'handleGetIgnored',
      'l#mst': 'handleStartMail',
      'u#glr': 'handleGetRevision',
      'l#mg': 'handleGetMail',
      'p#pgu': 'handleGetPuffleUser',
      'u#gp': 'handleGetPlayer',
      'j#jr': 'handleJoinRoom',
      'u#sp': 'handleSendPosition',
      'm#sm': 'handleSendMessage',
      'u#sa': 'handleSendAction',
      'u#sb': 'handleSnowball',
      'u#se': 'handleSendEmote',
      'u#sf': 'handleSendFrame',
      'u#sg': 'handleSendTourGuide',
      'u#sj': 'handleSendJoke',
      'u#ss': 'handleSendSafeMessage',
      's#upc': 'handleUpdateClothing',
      's#uph': 'handleUpdateClothing',
      's#upf': 'handleUpdateClothing',
      's#upn': 'handleUpdateClothing',
      's#upb': 'handleUpdateClothing',
      's#upa': 'handleUpdateClothing',
      's#upe': 'handleUpdateClothing',
      's#upl': 'handleUpdateClothing',
      's#upp': 'handleUpdateClothing',
      'o#k': 'handleKick',
      'o#m': 'handleMute',
      'o#b': 'handleBan',
      'i#ai': 'handleAddItem'
    },
    'z': {
      
    }
  },
  getRoomManager: function(){
    return roomManager;
  },
  getPlayerObj: function(id){
    for(var i in self.clients){
      if(self.clients[i].get('id') == id){
        logger.write('Client found!');
        return self.clients[i];
      }
    }
    return false;
  },
  handleXt: function(data, client){
    var dataArr = data.split('%');
    dataArr.shift();

    var type = dataArr[1];
    var handler = dataArr[2];

    var method = self.xtHandlers[type][handler];

    if(typeof self[method] == 'function'){
      self[method](dataArr, client);
    } else {
      logger.write('Unhandled packet received: ' + handler, logger.LEVELS.WARN);
    }
  },
  handleHeartBeat: function(data, client){
    client.sendXt('h', -1);
  },
  handleJoinServer: function(data, client){
    var timeStamp = Math.floor(new Date() / 1000);
    client.sendXt('js', -1, 0, 1, client.get('moderator') ? 1 : 0);
    client.sendXt('gps', -1, '');
    client.sendXt('lp', -1, client.buildPlayerString(), client.get('coins'), 0, 1440, timeStamp, timeStamp, 1000, 233, '', 7)
    self.handleJoinRoom({4: 100}, client);
  },
  handleJoinRoom: function(data, client){
    var room = data[4];
    var x = data[5] ? data[5] : 0;
    var y = data[6] ? data[6] : 0;
    roomManager.removeUser(client);
    if(roomManager.roomExists(room)){
      roomManager.addUser(room, client, [x, y]);
    } else {
      roomManager.addUser(100, client, [0, 0]);
    }
    if(plugins['bot']){
      client.sendXt('rp', -1, plugins['bot'].id);
      client.sendXt('ap', -1, plugins['bot'].generateString());
    }
    if(plugins['test']){
      var bots = plugins['test'].generateBots(50); // 50 bots
      bots.forEach(function(bot){
        client.sendXt('ap', -1, bot);
      });
    }
  },
  handleAddItem: function(data, client){
    var item = parseInt(data[4]);
    if(itemCrumbs[item]){
      logger.write('Adding item: ' + item);
      var cost = itemCrumbs[item].Cost;
      if(client.get('coins') < cost){
        client.sendError(401);
        return;
      }
      if(client.get('inventory').indexOf(item) > -1){
        client.sendError(400);
        return;
      }
      client.delCoins(cost);
      client.addItem(item);
    } else {
      client.sendError(402);
    }
  },
  handleGetInventory: function(data, client){
    client.sendXt('gi', -1, client.getInventory());
  },
  handleGetRevision: function(data, client){
    client.sendXt('glr', -1, 1337);
  },
  handleKick: function(data, client){
    var player = data[4];
    if(client.get('moderator')){
      var playerObj = self.getPlayerObj(player);
      if(playerObj){
        logger.write('Kicking user \'' + playerObj.get('username') + '\'...');
        playerObj.sendError(1); // kick error (5?) doesn't seem to be working...
        //self.serverObj.removeClient(client.get('socket'));
      }
    }
  },
  handleMute: function(data, client){
    var player = data[4];
    if(client.get('moderator')){
      var playerObj = self.getPlayerObj(player);
      if(playerObj){
        playerObj.updateMute();
      }
    }
  },
  handleStartMail: function(data, client){
    client.sendXt('mst', -1, 0, 0);
  },
  handleGetBuddies: function(data, client){
    client.sendXt('gb', -1, '');
  },
  handleGetIgnored: function(data, client){
    client.sendXt('gn', -1, '');
  },
  handleGetMail: function(data, client){
    client.sendXt('mg', -1, '');
  },
  handleGetPuffleUser: function(data, client){
    client.sendXt('pgu', -1, '');
  },
  handleSendMessage: function(data, client){
    var message = data[5];
    if(message.charAt(0) == '!' && plugins['commands']){
      var commandArr = message.substr(1).split(' ');
      var method = plugins['commands'].commands[commandArr[0]];
      if(typeof plugins['commands'][method] == 'function'){
        commandArr.shift();
        plugins['commands'][method](commandArr, client);
      }
    } else {
      if(!client.get('muted')){
        roomManager.sendXt(client.get('room'), ['sm', -1, client.get('id'), message]);
      }
    }
  },
  handleSendPosition: function(data, client){
    var x = data[4], y = data[5];
    client.set('x', x);
    client.set('y', y);
    roomManager.sendXt(client.get('room'), ['sp', -1, client.get('id'), x, y]);
  },
  handleSnowball: function(data, client){
    var x = data[4], y = data[5];
    roomManager.sendXt(client.get('room'), ['sb', -1, client.get('id'), x, y]);
  },
  handleSendAction: function(data, client){
    var action = data[4];
    roomManager.sendXt(client.get('room'), ['sa', -1, client.get('id'), action]);
  },
  handleSendEmote: function(data, client){
    var emote = data[4];
    roomManager.sendXt(client.get('room'), ['se', -1, client.get('id'), emote]);
  },
  handleSendFrame: function(data, client){
    var frame = data[4];
    roomManager.sendXt(client.get('room'), ['sa', -1, client.get('id'), frame]);
  },
  handleSendJoke: function(data, client){
    var joke = data[4];
    roomManager.sendXt(client.get('room'), ['sj', -1, client.get('id'), joke]);
  },
  handleSendTourGuide: function(data, client){
    var guide = data[4];
    roomManager.sendXt(client.get('room'), ['sg', -1, client.get('id'), guide]);
  },
  handleUpdateClothing: function(data, client){
    var item = data[4], type = data[2].substr(2);
    var inventory = client.get('inventory');
    var itemTypes = {
      'upc': 'color',
      'uph': 'head',
      'upf': 'face',
      'upn': 'neck',
      'upb': 'body',
      'upa': 'hand',
      'upe': 'feet',
      'upl': 'flag',
      'upp': 'photo'
    };
    if(itemTypes[type]){
      roomManager.sendXt(client.get('room'), [type, -1, client.get('id'), item]);
      client.updateClothing(itemTypes[type], item);
    } else {
      logger.write('Item type doesn\'t exist.', logger.LEVELS.WARN);
    }
  },
  handleGetPlayer: function(data, client){
    var player = data[4];
    if(player == 0) return;
    __db.verifyPlayer(player, function(err, result){
      if(!err && result){
        logger.write('Player ' + player + ' exists!');
        __db.getPlayer(player, function(err, result){
          if(!err){
            console.log(result);
          } else {
            logger.write(err, logger.LEVELS.ERROR);
          }
        });
      }
    });
  },
  clients: [],
  serverObj: null
}

module.exports = self;