var logger = require(__base + 'mora/logger'),
    utils = require(__base + 'mora/utils');

var self = {
  bots: [],
  generateBots: function(amount){
    if(isNaN(amount)) amount = 50;
    
    var bots = [];

    for(i = 0; i < amount; i++){
      var botArr = self.buildString(i).split('@');
      self.bots.push(botArr[0]);
      bots.push(botArr[1]);
    }

    return bots;
  },
  buildString: function(num){
    var color = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    var head = [0, 413, 444, 414, 1098, 403, 424, 1119, 1933, 423];
    var face = [0, 101, 106, 118, 138, 102, 2112, 107];
    var neck = [0, 193, 172, 301, 171, 189, 314, 170, 313];
    var body = [0, 4046, 274, 283, 4058, 224, 244, 251, 773, 229, 270];
    var hand = [0, 5014, 5337, 5112, 332, 220, 335, 325, 5004];
    var feet = [0, 366, 352, 352, 358, 369, 6004, 375, 380, 354];
    var photo = [0, 904, 906, 907, 929, 902, 911, 942, 905, 927];
    var flag = [0, 550, 577, 576, 608, 7003, 7030, 632, 609];

    var botId = utils.randNum(50000, 9999999);

    var position = [utils.randNum(220, 430), utils.randNum(20, 705)];
    var frame = utils.randNum(1, 30);

    var botString = [
      botId,
      'bot' + (num ? num : botId),
      1,
      utils.getRandom(color),
      utils.getRandom(head),
      utils.getRandom(face),
      utils.getRandom(neck),
      utils.getRandom(body),
      utils.getRandom(hand),
      utils.getRandom(feet),
      utils.getRandom(flag),
      utils.getRandom(photo),
      position[0], //x
      position[1], //y
      frame, // frame
      1,
      876
    ];

    return botId + '@' + botString.join('|');
  }
};

module.exports = self;