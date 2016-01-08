var logger = require('./logger');

var client = function(socket){
  var self = this;

  this.socket = socket;
  this.randomKey = undefined;
  this.x = 0;
  this.y = 0;
  this.frame = 1;

  this.write = function(data){
    if(self.socket){
      logger.write('Outgoing data: ' + data, logger.LEVELS.DEBUG);
      self.socket.write(data + '\0');
    }
  }

  this.sendError = function(error){
    self.write('%xt%e%-1%' + error + '%');
  }

  this.sendXt = function(){
    var args = Array.prototype.join.call(arguments, '%');
    self.write('%xt%' + args + '%');
  }

  this.updateColumn = function(column, value){
    return __db.updateColumn(self.id, column, value);
  }

  this.setClient = function(data){
    self.id = data.id;
    self.username = data.username;
    self.nickname = data.nickname;
    self.coins = data.coins;
    self.rank = data.rank;
    self.moderator = data.moderator == 1 ? true : false;
    self.muted = data.muted == 1 ? true : false;
    self.inventory = data.inventory ? JSON.parse(data.inventory) : [];
    self.color = data.color;
    self.head = data.head;
    self.face = data.face;
    self.neck = data.neck;
    self.body = data.body;
    self.hand = data.hand;
    self.feet = data.feet;
    self.flag = data.flag;
    self.photo = data.photo;
  }

  this.buildPlayerString = function(){
    var playerArr = [
      self.id,
      self.nickname,
      1,
      self.color,
      self.head,
      self.face,
      self.neck,
      self.body,
      self.hand,
      self.feet,
      self.flag,
      self.photo,
      self.x,
      self.y,
      self.frame,
      1,
      self.rank * 146
    ];
    return playerArr.join('|')
  }

  this.getInventory = function(){
    return self.inventory.join('%');
  }

  this.updateMute = function(){
    if(self.muted){
      self.set('muted', false);
      self.updateColumn('muted', 0);
    } else {
      self.set('muted', true);
      self.updateColumn('muted', 1);
    }
  }

  this.updateClothing = function(type, item){
    self.set(type, item);
    self.updateColumn(type, item);
  }

  this.addItem = function(item){
    if(self.inventory.indexOf(item) == -1){
      self.inventory.push(item);
      self.updateColumn('inventory', JSON.stringify(self.inventory));
      self.sendXt('ai', -1, item, self.get('coins'));
    }
  }

  this.addCoins = function(coins){
    var newCoins = (self.get('coins') + coins);
    self.updateColumn('coins', newCoins);
    self.set('coins', newCoins);
  }

  this.delCoins = function(coins){
    var newCoins = (self.get('coins') - coins);
    self.updateColumn('coins', newCoins);
    self.set('coins', newCoins);
  }

  this.get = function(get){
    return self[get];
  }

  this.set = function(set, value){
    self[set] = value;
  }
};

module.exports = client;