var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs361_perick',
  password        : 'group18',
  database        : 'cs361_perick',
  dateStrings     : 'date'
});

module.exports.pool = pool;
