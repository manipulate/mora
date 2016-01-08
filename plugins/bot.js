var self = {
  id: 0, name: 'Mora',
  generateString: function(){
    var colors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    var randColor = Math.floor(Math.random() * colors.length);
    var playerArr = [
      0,
      self.name,
      1,
      randColor, // color
      413, // head
      103, // face
      169, // neck
      240, // body
      0, // hand
      0, // feet
      0, // flag
      0, // photo
      0, // x
      0, // y
      1, // frame
      1,
      876
    ];
    return playerArr.join('|')
  },
  sendMessage: function(msg, client){
    client.sendXt('sm', -1, self.id, msg);
  }
};

module.exports = self;