var crypto = require('crypto');

var self = {
  generateKey: function(){
    var key = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_+=:;,./[]`~';
    for(var i = 0; i < 12; i++){
      var rand = Math.floor(Math.random() * chars.length);
      key += chars.charAt(rand);
    }
    return key;
  },
  generateMD5: function(data){
    var hash = crypto.createHash('md5').update(data).digest('hex');
    return hash;
  },
  swapHash: function(hash){
    var swap = hash.substr(16, 16);
    swap += hash.substr(0, 16);
    return swap;
  },
  encryptPassword: function(pass, key){
    var encrypt = self.swapHash(pass);
    encrypt += key;
    encrypt += 'Y(02.>\'H}t":E1';
    encrypt = self.generateMD5(encrypt);
    encrypt = self.swapHash(encrypt);
    return encrypt;
  }
};

module.exports = self;