var net = require('net');

var logger = require('./mora/logger'),
    client = require('./mora/client'),
    mora = require('./mora/main');

var server;

var self = {
  listenTries: 0, // Number of times the server tried reconnecting if error occurs.

  createServer: function(port, type, id){

    if(!port || !type || !id){ // Invalid configuration, kill the server
      logger.write('Unable to start server, server configuration is invalid.', logger.LEVELS.FATAL);
    }

    var server = net.createServer(function(socket){
      logger.write('A client has connected!');
      
      var clientObj = new client(socket);

      mora.addClient(clientObj);

      socket.on('data', function(data){
        mora.handleData(data.toString(), clientObj);
      });

      socket.on('end', function(){
        mora.removeClient(socket);
        logger.write('A client has disconnected.');
      });

      socket.on('error', function(err){
        if(err.code !== 'ECONNRESET'){ // No need to log this, usually only happens after 10 minute idle timeout
          logger.write(err.toString(), logger.LEVELS.ERROR);
        }
      });

    }).listen(port, function(){
      var serverType = type.charAt(0).toUpperCase() + type.slice(1);
      logger.write(serverType + ' server listening on port ' + port);
    });

    server.on('error', function(err){
      switch(err.code){
        case 'EADDRINUSE':
        case 'EACCES': // TODO: Look into what the EACCES error stands for
          self.listenTries++; // Tried to reconnect, increment value to know when we should stop the server entirely.

          setTimeout(function(){
            self.createServer(port, type, id);
          }, 3000); // Tries to reconnect every 3 seconds

          if(self.listenTries >= 4){ // Stop trying to reconnect after 4 tries and kill the process (using logger.LEVELS.FATAL)
            logger.write('Unable to listen on port ' + port + ' because it is in use.', logger.LEVELS.FATAL);
          } else {
            logger.write('Port ' + port + ' is in use, trying again...', logger.LEVELS.ERROR);
          }
        break;
      }
    });
  }
}

module.exports = self;