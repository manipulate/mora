var settings = require('./settings'),
    version = require(__base + 'package').version,
    logger = require(__base + 'mora/logger');

var http = require('http');

console.log('\n888b     d888                           ');
console.log('8888b   d8888                           ');
console.log('88888b.d88888                           ');
console.log('888Y88888P888   .d88b.   888d888 8888b. ');
console.log('888 Y888P 888  d88""88b  888P"      "88b');
console.log('888  Y8P  888  888  888  888    .d888888');
console.log('888   "   888  Y88..88P  888    888  888');
console.log('888       888   "Y88P"   888    "Y888888 \n');

console.log('Mora: a Club Penguin emulator, version: ' + version + ' ALPHA \n');

var serverId = process.argv[2]; // Server ID from command line arguments
var serverConfig = __config.Servers[serverId];

if(serverConfig){
  require(__base + 'startServer').createServer(serverConfig.Port, serverConfig.Type, serverId);
} else {
  logger.write('Server ID is either invalid or not specified.', logger.LEVELS.FATAL);
}