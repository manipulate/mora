global.__settings = {
  'logging': true, // Enables or disables loggings for server events
  'debug': true // Enables or disables debug logging for general server events
}

// Set global path & objects
global.__base   = __dirname + '/';
global.__config = require(__base + 'config');
global.__db     = require(__base + 'mora/database');