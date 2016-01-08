var self = {
  getRandom: function(array){
    return array[Math.floor(Math.random() * array.length)];
  },
  randNum: function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = self;