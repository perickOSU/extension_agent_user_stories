var express = require('express');                                                    
var mysql = require('./dbcon.js');                                                   
                                                                                     
var app = express();                                                                 
var handlebars = require('express-handlebars').create({defaultLayout:'main'});       
var body_parser = require("body-parser")                                             
                                                                                     
app.use(body_parser.json());                                                         
                                                                                     
app.engine('handlebars', handlebars.engine);                                         
app.set('view engine', 'handlebars');                                                
app.set('port', 3001);                                                               
                                                                                     
app.use(express.static('public'));                                                   





/*
 * gets all table rows and reders home page.
 */
app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM farm', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = rows;
    res.render('home', context);
  });
});




/*
 * gets all table rows and reders home page.
 */
app.post('/insert',function(req,res,next){
    var payload = {};
	mysql.pool.query("INSERT INTO farm (`f1`,`f2`,`f3`) VALUES (?,?,?)", [req.body.f1, req.body.f2, req.body.f3], function(err, result) {
		if(err)
		{
			  next(err);
			  return;
		}
		/* retrieve and log last inserted id # from sql table */
		payload.id = result.insertId;
		console.log(result.insertId);

		res.json(payload); /* must go in here, otherwise it sets the json response before the sql resopnse comes... */
	});
});


app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS farm", function(err){
    var createString = "CREATE TABLE farm(" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "f1 VARCHAR(255)," +
    "f2 VARCHAR(255)," +
    "f3 VARCHAR(255))";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});


app.use(function(req,res){
  res.status(404);
  res.render('404');
});


app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
