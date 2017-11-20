// COURSE:  CS 361 SOFTWARE ENGINEERING I
// PROJECT: Extension Agent Application
// STUDENTS (GROUP 18):
//   BRIAN BRUCKNER (BRUCKNEB@OREGONSTATE.EDU)
//   
//   
//   
// DATE:    19-NOV-2017
// ============================================================================
// File: extagent.js
// Description: Web client for Extension Agent application. RESTful APIs for 
//              managing related application data in MySQL server
// 
// Web API definition:
// Select:
//     GET /api/workouts         all workout items
//     GET /api/workouts/:id     single workout item
// Insert:
//     POST /api/workouts
// Update:
//     PUT /api/workouts/:id     update a workout
// Delete:
//     DELETE /api/workouts/:id  delete a workout
//     DELETE /api/workouts      delete all workouts (refresh the DB)
// ============================================================================

// SETUP
// ============================================================================
// setup the packages
var express = require('express');
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser');
var mysql = require('./private/js/dbcon.js');
var appConfig = require('./private/js/config.js');
var request = require('request');

// setup bodyParser() for parsing POSTs
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// setup session, if needed, e.g., for work-on-behalf-of variable
//var session = require('express-session');
//app.use(session({secret:'SuperSecretPassword'}));

// setup handlebars
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// setup app variables
app.set('port', appConfig.serverPorts.serverPort);
app.locals.title = 'Extension Agent';
/*
app.use(function(req, res, next){
	res.locals.pageTitle = "page title";
	next();
});
*/
// EVENT LISTENERS
// ============================================================================


// ROUTES FOR PAGES
// ============================================================================

// ------------------------------------
// Route:  main page
// Method: GET /
// ------------------------------------
app.get('/',function(req,res){
  console.log('In UI route: default (/)');
  app.locals.subtitle = 'Main Menu';
  var context = {};
  res.render('home',context);
});

// ------------------------------------
// UI Route: overview tool
// GET /overview
// ------------------------------------
app.get('/overview',function(req,res){
  console.log('In UI route: overview (/)');
  app.locals.subtitle = 'Overview Tool';
  res.render('overview');
});

// ------------------------------------
// UI Route: user registration tool
// GET /register
// ------------------------------------
app.get('/register',function(req,res){
  console.log('In UI route: register (/)');
  app.locals.subtitle = 'Overview Tool: Registration';
  res.render('register');
});

// ------------------------------------
// UI Route: details - fields
// GET /farmFields
// ------------------------------------
app.get('/farmFields',function(req,res){
	console.log('In UI route: farmFields (/)');
	app.locals.subtitle = 'Planner Tool: Manage Fields';
	var sSql = 'SELECT id, FieldNumber, FieldName, Acreage, FieldLocation, crop,'
									+ ' husbandry, technique FROM FarmField;';
	mysql.pool.query(sSql, function(err, rows, fields){
	if(err){
	  next(err);
	  return;
	}
	//console.log({rows: {rows}});
	var obj = {rows};

	res.render('farmFields', {obj});
	});
});

// ------------------------------------
// UI Route: details - fields
// GET /farmFields
// ------------------------------------
app.get('/farmFields2',function(req,res){
	console.log('In UI route: farmFields (/)');
	app.locals.subtitle = 'Planner Tool: Manage Fields';
	var sSql = 'SELECT id, Name'
	+ ' FROM Farm;';
	mysql.pool.query(sSql, function(err, rows, fields){
	if(err){
	  next(err);
	  return;
	}
	//console.log({rows: {rows}});
	var obj = {rows};

	res.render('farmFields2', {obj});
	});
});


// ------------------------------------
// UI Route: details - crops
// GET /farmCrops
// ------------------------------------
app.get('/farmCrops',function(req,res){
  console.log('In UI route: farmCrops (/)');
  app.locals.subtitle = 'Planner Tool: Manage Crops (by field)';
  res.render('farmCrops');
});

// ------------------------------------
// UI Route: details - livestock
// GET /farmLivestock
// ------------------------------------
app.get('/farmLivestock',function(req,res){
  console.log('In UI route: farmLivestock (/)');
  app.locals.subtitle = 'Planner Tool: Manage Livestock (by field)';
  res.render('farmLivestock');
});


// ROUTES FOR APIs (CRUD operations for each db "object")
// ============================================================================
// ------------------------------------
// Route: Farm - create (for farm's id)
// POST /api/farm
// ------------------------------------
app.post('/api/farm',function(req,res,next){
	console.log('In route: post farm');
	var context = {};
	var sSql = "INSERT INTO Farm (Name, FarmInfo, TotalAcreage) VALUES (?, ?, ?)";
	mysql.pool.query(sSql, [req.body.properties.Name, req.body.properties.FarmInfo, req.body.properties.TotalAcreage], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: Farm - retrieve (for farmId)
// GET /api/farm
// ------------------------------------
app.get('/api/farm',function(req,res,next){
	console.log('In route: get farm');
	var context = {};
	var sSql = "SELECT * FROM Farm WHERE id = (?)";
	mysql.pool.query(sSql, req.query.farmId, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: Farm - update (for farm's id)
// PUT /api/farm
// ------------------------------------

// ------------------------------------
// Route: Farm - delete (for farm's id)
// DELETE /api/farm
// ------------------------------------
app.delete('/api/farm',function(req,res,next){
	console.log('In route: delete farm');
	var context = {};
	var sSql = "DELETE FROM Farm WHERE id = (?)";
	mysql.pool.query(sSql, [req.body.properties.id_Farm], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: Farms - retrieve (all farms)
// GET /api/farms
// ------------------------------------
app.get('/api/farms',function(req,res,next){
	console.log('In route: get farms');
	var context = {};
	var sSql = "SELECT * FROM Farm";
	mysql.pool.query(sSql, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmField - create (for farm's id)
// POST /api/farmField
// ------------------------------------
app.post('/api/farmField',function(req,res,next){
	console.log('In route: post farmField');
	var context = {};
	var sSql = "INSERT INTO FarmField (id_Farm, FieldNumber, FieldName, Acreage, FieldLocation) VALUES (?, ?, ?, ?, ?)";
	mysql.pool.query(sSql, [req.body.properties.Farm.id_Farm, req.body.properties.Farm.Fields.Field.FieldNumber, req.body.properties.Farm.Fields.Field.FieldName, req.body.properties.Farm.Fields.Field.Acreage, req.body.properties.Farm.Fields.Field.FieldLocation], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmField - retrieve (individual field by field's id)
// GET /api/farmField
// ------------------------------------
app.get('/api/farmField',function(req,res,next){
	console.log('In route: get farmField');
	var context = {};
	var sSql = "SELECT ff.FieldNumber, ff.FieldName, ff.Acreage, ff.FieldLocation"
	  + " FROM `FarmField` ff"
	  + " WHERE id = (?)";
	mysql.pool.query(sSql, req.query.id, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmField - update (for field's id)
// PUT /api/farmField
// ------------------------------------

// ------------------------------------
// Route: farmField - delete (for field's id)
// DELETE /api/farmField
// ------------------------------------
app.delete('/api/farmField',function(req,res,next){
  console.log('In route: delete farmField');
  var context = {};
  var sSql = "DELETE FROM `FarmField` WHERE id = (?)";
  mysql.pool.query(sSql, [req.body.properties.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    res.json(result);
	//res.json({message: 'Record deleted'});
  });
});

// ------------------------------------
// Route: farmFields - retrieve (all for farm's id)
// GET /api/farmFields
// ------------------------------------
app.get('/api/farmFields',function(req,res,next){
	console.log('In route: get farmFields');
	var context = {};
	var sSql = "SELECT ff.id, ff.FieldNumber, ff.FieldName, ff.Acreage, ff.FieldLocation"
	  + " FROM `FarmField` ff"
	  + " WHERE id_Farm = (?)";
	mysql.pool.query(sSql, req.query.farmId, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ROUTES FOR ERRORS
// ============================================================================

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
