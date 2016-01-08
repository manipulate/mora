module.exports = {
  LEVELS: {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    FATAL: 'FATAL',
    DEBUG: 'DEBUG'
  },

  write: function(msg, level){
    if(__settings.logging){
      if(level == undefined) level = this.LEVELS.INFO;
      if(level == 'DEBUG' && !__settings.debug) return false;
      console.log('[' + level + '] > ' + msg);

      if(level == this.LEVELS.FATAL) process.exit();
    }
  }
};