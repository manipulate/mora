var logger = require(__base + 'mora/logger');

var mysql = require('mysql');

var dbConfig = __config.Database;

var pool = mysql.createPool({
  host: dbConfig.Host,
  user: dbConfig.User,
  password: dbConfig.Password,
  database: dbConfig.Database
});

var self = {
  getPlayer: function(player, callback){
    var where = isNaN(player) ? 'username' : 'id';
    pool.getConnection(function(err, conn){
      if(!err){
        conn.query('SELECT * FROM users WHERE ' + where + ' = \'' + player + '\'', function(err, result){
          if(err){
            logger.write(err, logger.LEVELS.ERROR);
          }
          callback((err ? err : undefined), result[0]);
        });
        conn.release();
      } else {
        logger.write(err, logger.LEVELS.ERROR);
      }
    });
  },
  getColumn: function(player, column){
    var where = isNaN(player) ? 'username' : 'id';
    pool.getConnection(function(err, conn){
      if(!err){
        conn.query('SELECT ' + column + ' FROM users WHERE ' + where + ' = ' + player, function(err, result){
          ///
        });
        conn.release();
      } else {
        logger.write(err, logger.LEVELS.ERROR);
      }
    });
  },
  updateColumn: function(player, column, value){
    var where = isNaN(player) ? 'username' : 'id';
    pool.getConnection(function(err, conn){
      if(!err){
        conn.query('UPDATE users SET ? WHERE ' + where + ' = \'' + player + '\'', {[column]: value}, function(err, result){
          if(err){
            return false;
          } else {
            return true;
          }
        });
      }
    });
  },
  getLoginKey: function(player, callback){
    pool.getConnection(function(err, conn){
      if(!err){
        conn.query('SELECT loginKey FROM users WHERE id = \'' + player + '\'', function(err, result){
          callback((err ? err : undefined), result[0].loginKey);
        });
      }
      conn.release();
    });
  },
  verifyPlayer: function(player, callback){
    var where = isNaN(player) ? 'username' : 'id';
    pool.getConnection(function(err, conn){
      if(!err){
        conn.query('SELECT id FROM users WHERE ' + where + ' = \'' + player + '\'', function(err, result){
          if(err){
            logger.write(err, logger.LEVELS.ERROR);
          }
          callback(err, result[0]);
        });
        conn.release();
      } else {
        logger.write(err, logger.LEVELS.ERROR);
      }
    });
  }
};

module.exports = self;