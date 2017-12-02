// COURSE:  CS 361 SOFTWARE ENGINEERING I
// PROJECT: Extension Agent Application
// STUDENTS (GROUP 18):
//   BRIAN BRUCKNER (BRUCKNEB@OREGONSTATE.EDU)
//   ALEX “JAKE” GILMOUR (GILMOURA@OREGONSTATE.EDU)
//   KRUNO PERIC (PERICK@OREGONSTATE.EDU)
//   NICK MASIE (MASIEN@OREGONSTATE.EDU)
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

// application routing
var router = express.Router();

// setup bodyParser() for parsing POSTs
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// setup session, if needed, e.g., for work-on-behalf-of variable
var session = require('express-session');
var sess = {
  secret: 'keyboard cat',
  cookie: {}
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))


// var session = require('express-session');
// app.use(session({secret:'SuperSecretPassword'}));
// var sess;

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
// Route:  sandbox
// Method: GET /sandbox
// ------------------------------------
app.get('/sandbox',function(req,res){
	console.log('In UI route: sandbox (/sandbox)');
	app.locals.subtitle = 'Sandbox';
	
	var sSql = "SELECT id, Name, FarmInfo, TotalAcreage"
		+ " FROM Farm"
		+ " WHERE id_User = 3";
	mysql.pool.query(sSql, function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		//console.log({rows: {rows}});
		var farms = {rows};
		
		res.render('sandbox', {farms});
	});
});

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
	var myUserId;
	if (req.session.id_User) {
		myUserId = req.session.id_User;
	} else {
		myUserId = 1;
	}
	console.log([sess]);
	console.log('In UI route: farmFields (/) for user id ' + myUserId);
	app.locals.subtitle = 'Planner Tool: Manage Fields';
	var sSql = 'SELECT id, FieldNumber, FieldName, Acreage, FieldLocation, Crop, Husbandry, Technique'
		+ ' FROM FarmField;';
		+ ' WHERE id_user = ' + myUserId;
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
// GET /farmFields2
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
// app.use('/api', router);

// Registering
////////////////////////////////////////////////////////////////////////

// ------------------------------------
// Route: post registerUser
// POST /api/registerUser
// ------------------------------------
app.post('/api/registerUser',function(req,res,next){
	sess = req.session;
	console.log('In route: post registerUser');
	var context = {};
	var sSql = "CALL sp_registerUser(?, ?, ?, ?, ?, ?, ?, ?);"
	mysql.pool.query(sSql, [req.body.properties.FirstName, req.body.properties.LastName, req.body.properties.Handle, req.body.properties.FarmName, req.body.properties.TotalAcreage, req.body.properties.PostalCode, req.body.properties.Crop, req.body.properties.Livestock], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
		console.log(result);
		var myUserId = [result[0][0].id_User]; //JSON.parse(req.response)[0][0].id_User;
		console.log('  created user id ' + myUserId);
		
		req.session.id_User = myUserId;
		console.log ('  sess.id_User = ' + req.session.id_User );
	});
});

// ------------------------------------
// Route: get registeredUsers
// GET /api/registeredUsers
// ------------------------------------
app.get('/api/registeredUsers',function(req,res,next){
	console.log('In route: get registeredUsers');
	var context = {};
	var sSql = "SELECT * FROM vFarmRegistration;"
	mysql.pool.query(sSql, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// Managing Users
////////////////////////////////////////////////////////////////////////

// ------------------------------------
// Route: user - post (for ?)
// POST /api/user
// ------------------------------------
app.post('/api/user', function(req,res,next){
	console.log('In route: post user');
	var context = {};
	var sSql = "INSERT INTO User (FirstName, LastName, Handle)"
	  + " VALUES (?, ?, ?)";
	mysql.pool.query(sSql, [req.body.properties.FirstName, req.body.properties.LastName, req.body.properties.Handle], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: user - get (for ?)
// GET /api/user/:id_User
// ------------------------------------
app.get('/api/user/:id_User', function(req,res,next){
	console.log('In route: get user');
	var context = {};
	var sSql = "SELECT FirstName, LastName, Handle, DateRegistered"
	  + " FROM User"
	  + " WHERE id = ?";
	mysql.pool.query(sSql, [req.params.id_User], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: user - put (for ?)
// PUT /api/user/:id_User
// ------------------------------------
// PENDING...

// ------------------------------------
// Route: user - delete (for ?)
// DELETE /api/user/:id_User
// ------------------------------------
app.get('/api/user/:id_User', function(req,res,next){
	console.log('In route: delete user');
	var context = {};
	var sSql = "DELETE FROM User WHERE id = (?)";
	mysql.pool.query(sSql, [req.params.id_User], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: users - get (for ?)
// GET /api/users
// ------------------------------------
app.get('/api/users', function(req,res,next){
	console.log('In route: get users');
	var context = {};
	var sSql = "SELECT FirstName, LastName, Handle, DateRegistered"
	  + " FROM User";
	mysql.pool.query(sSql, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});


// Managing Farm Basics
////////////////////////////////////////////////////////////////////////

// ------------------------------------
// Route: Farm - create (for farm's id)
// POST /api/farm
// ------------------------------------
app.post('/api/farm',function(req,res,next){
	console.log('In route: post farm');
	var context = {};
	var sSql = "INSERT INTO Farm (id_User, Name, FarmInfo, TotalAcreage) VALUES (?, ?, ?, ?)";
	mysql.pool.query(sSql, [req.body.properties.id_User, req.body.properties.Name, req.body.properties.FarmInfo, req.body.properties.TotalAcreage], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: Farm - retrieve (for farmId)
// GET /api/farm/:id_Farm
// ------------------------------------
app.get('/api/farm/:id_Farm',function(req,res,next){
	console.log('In route: get farm for id = ' + [req.params.id_Farm]);
	var context = {};
	var sSql = "SELECT id, Name, FarmInfo, TotalAcreage FROM Farm WHERE id = (?)";
	mysql.pool.query(sSql, [req.params.id_Farm], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: Farm - update (for farm's id)
// PUT /api/farm/:id_Farm
// ------------------------------------
// PENDING...

// ------------------------------------
// Route: Farm - delete (for farm's id)
// DELETE /api/farm/:id_Farm
// TO DO: Deal with Farm-Address and other tables with FKs to Farm
// ------------------------------------
app.delete('/api/farm/:id_Farm',function(req,res,next){
	console.log('In route: delete farm');
	var context = {};
	var sSql = "DELETE FROM Farm WHERE id = (?)";
	mysql.pool.query(sSql, [req.params.id_Farm], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: Farms - retrieve user's farms
// GET /api/user/:id_User/farms
// ------------------------------------
app.get('/api/user/:id_User/farms',function(req,res,next){
	console.log('In route: get farms');
	var context = {};
	var sSql = "SELECT id, Name, FarmInfo, TotalAcreage FROM Farm where id_User = (?)";
	mysql.pool.query(sSql, [req.params.id_User], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// Managing Farm details - farm fields
////////////////////////////////////////////////////////////////////////

// ------------------------------------
// Route: farmField - create (for farm's id)
// POST /api/farmField
// TO DO: switch from fields in FarmField to using FarmCropUsagePlan and FarmHusbandryUsagePlan and 
// ------------------------------------
app.post('/api/farm/:id_Farm/farmField',function(req,res,next){
	console.log('In route: post farmField');
	var context = {};
	var sSql = "INSERT INTO FarmField (id_Farm, FieldNumber, FieldName, Acreage, FieldLocation, Crop, Husbandry, Technique) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
	mysql.pool.query(sSql, [req.params.id_Farm, req.body.properties.Farm.Fields.Field.FieldNumber, req.body.properties.Farm.Fields.Field.FieldName, req.body.properties.Farm.Fields.Field.Acreage, req.body.properties.Farm.Fields.Field.FieldLocation, req.body.properties.Farm.Fields.Field.Crop, req.body.properties.Farm.Fields.Field.Husbandry, req.body.properties.Farm.Fields.Field.Technique], function(err, result) {
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
app.get('/api/farm/:id_Farm/farmField/:id_FarmField',function(req,res,next){
	console.log('In route: get farmField');
	var context = {};
	var sSql = "SELECT ff.FieldNumber, ff.FieldName, ff.Acreage, ff.FieldLocation"
	  + " FROM `FarmField` ff"
	  + " WHERE id = (?)";
	mysql.pool.query(sSql, req.params.id_FarmField, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmField - update (for field's id)
// PUT /api/farm/:id_Farm/farmField/:id_FarmField
// ------------------------------------
app.put('/api/farm/:id_Farm/farmField/:id_FarmField',function(req,res,next){
	console.log('In route: put farmField');
	var context = {};
	var sSql = "UPDATE FarmField"
	  + " SET FieldNumber = (?), FieldName = (?), Acreage = (?), FieldLocation = (?)"
	  + " WHERE id = (?)";
	mysql.pool.query(sSql, [req.body.properties.Farm.Fields.Field.FieldNumber, req.body.properties.Farm.Fields.Field.FieldName, req.body.properties.Farm.Fields.Field.Acreage, req.body.properties.Farm.Fields.Field.FieldLocation, req.params.id_FarmField], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmField - delete (for field's id)
// DELETE /api/farm/:id_Farm/farmField/:id_FarmField
// ------------------------------------
app.delete('/api/farm/:id_Farm/farmField/:id_FarmField',function(req,res,next){
  console.log('In route: delete farmField');
  var context = {};
  var sSql = "DELETE FROM `FarmField` WHERE id = (?)";
  mysql.pool.query(sSql, [req.params.id_FarmField], function(err, result){
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
// GET /api/farm/:id_Farm/farmFields
// ------------------------------------
app.get('/api/farm/:id_Farm/farmFields',function(req,res,next){
	console.log('In route: get farmFields');
	var context = {};
	var sSql = "SELECT ff.id, ff.FieldNumber, ff.FieldName, ff.Acreage, ff.FieldLocation"
	  + " FROM `FarmField` ff"
	  + " WHERE id_Farm = (?)";
	mysql.pool.query(sSql, req.params.id_Farm, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// Managing Farm details - farm equipment
////////////////////////////////////////////////////////////////////////

// ------------------------------------
// Route: farmInvEquipment - post (for ?)
// POST /api/farm/:id_Farm/farmInvEquipment
// ------------------------------------
app.post('/api/farm/:id_Farm/farmInvEquipment', function(req,res,next){
	console.log('In route: post farmInvEquipment');
	var context = {};
	var sSql = "INSERT INTO FarmInvEquipment (id_Farm, id_EquipmentType, Count) VALUES (?, ?, ?)";
	mysql.pool.query(sSql, [req.params.id_Farm, req.body.properties.id_EquipmentType, req.body.properties.Count], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmInvEquipment - get (for ?)
// GET /api/farm/:id_Farm/farmInvEquipment/:id_FarmInvEquipment
// ------------------------------------
// Deferring individual record get in favor of getting for farm...

// ------------------------------------
// Route: farmInvEquipment - put (for ?)
// PUT /api/farm/:id_Farm/farmInvEquipment/:id_FarmInvEquipment
// ------------------------------------
// PENDING...

// ------------------------------------
// Route: farmInvEquipment - delete (for ?)
// DELETE /api/farmInvEquipment
// ------------------------------------
app.delete('/api/farm/:id_Farm/farmInvEquipment/:id_FarmInvEquipment', function(req,res,next){
	console.log('In route: delete farmInvEquipment');
	var context = {};
	var sSql = "DELETE FROM FarmInvEquipment WHERE id = (?)";
	mysql.pool.query(sSql, [req.params.id_FarmInvEquipment], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmInvEquipment - get (for ?)
// GET /api/farmInvEquipment
// ------------------------------------
app.get('/api/farm/:id_Farm/farmInvEquipment', function(req,res,next){
	console.log('In route: get farmInvEquipment');
	var context = {};
	var sSql = "SELECT et.EquipmentType, fie.Count"
	  + " FROM FarmInvEquipment fie"
	  + " INNER JOIN dmnEquipmentType et ON et.id = fie.id_EquipmentType"
	  + " WHERE fie.id_Farm = (?)";
	mysql.pool.query(sSql, [req.params.id_Farm], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// Managing Farm details - farm livestock
////////////////////////////////////////////////////////////////////////
// ------------------------------------
// Route: farmInvLivestock - post (for ?)
// POST /api/farm/:id_Farm/farmInvLivestock
// ------------------------------------
app.post('/api/farm/:id_Farm/farmInvLivestock', function(req,res,next){
	console.log('In route: post farmInvLivestock');
	var context = {};
	var sSql = "INSERT INTO FarmInvLivestock (id_Farm, id_LivestockType, Count) VALUES (?, ?, ?)";
	mysql.pool.query(sSql, [req.params.id_Farm, req.body.properties.id_LivestockType, req.body.properties.Count], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmInvLivestock - get (for ?)
// GET /api/farm/:id_Farm/farmInvLivestock/:id_FarmInvLivestock
// ------------------------------------
// Deferring individual record get in favor of getting for farm...

// ------------------------------------
// Route: farmInvLivestock - put (for ?)
// PUT /api/farmInvLivestock
// ------------------------------------
// PENDING...

// ------------------------------------
// Route: farmInvLivestock - delete (for ?)
// DELETE /api/farmInvLivestock
// ------------------------------------
app.delete('/api/farm/:id_Farm/farmInvLivestock/:id_FarmInvLivestock', function(req,res,next){
	console.log('In route: delete farmInvLivestock');
	var context = {};
	var sSql = "DELETE FROM FarmInvLivestock WHERE id = (?)";
	mysql.pool.query(sSql, [req.params.id_FarmInvLivestock], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: farmInvLivestock - get (for ?)
// GET /api/farm/:id_Farm/farmInvLivestock
// ------------------------------------
app.get('/api/farm/:id_Farm/farmInvLivestock', function(req,res,next){
	console.log('In route: get farmInvLivestock');
	var context = {};
	var sSql = "SELECT lt.LivestockType, fil.Count"
	  + " FROM FarmInvLivestock fil"
	  + " INNER JOIN dmnLivestockType lt ON lt.id = fil.id_LivestockType"
	  + " WHERE fil.id_Farm = (?)";
	mysql.pool.query(sSql, [req.params.id_Farm], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// Managing Farm details - farm produce
////////////////////////////////////////////////////////////////////////
// DEFERRED. Not including inventory of produce in this project

// Getting recommendations
////////////////////////////////////////////////////////////////////////
// ------------------------------------
// Route: geoRecommendation - get (for ?)
// GET /api/geoRecommendation
// ------------------------------------
app.get('/api/geoRecommendation/:geoCode', function(req,res,next){
	console.log('In route: get geoRecommendation');
	var context = {};
	var sSql = "SELECT geoCode, recommendation"
	  + " FROM geoRecommendation"
	  + " WHERE geoCode = ?";
	mysql.pool.query(sSql, [req.params.geoCode], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});


// Managing Farm planning / usage - field crop usage
////////////////////////////////////////////////////////////////////////

// ------------------------------------
// Route: field crop usage and harvesting - create (for ?)
// POST /api/farm/:id_Farm/farmField/:id_FarmField/
// ------------------------------------
app.post('/api/farm/:id_Farm/farmField/:id_FarmField/CropPlan', function(req,res,next){
	console.log('In route: post farm crop usage and harvesting');
	var context = {};
	var sSql = "CALL sp_setupFieldCropUsage(?, ?, ?, ?, ?, ?, ?, ?);";
	mysql.pool.query(sSql, [req.params.id_FarmField, req.body.properties.idProduce, req.body.properties.idUOM, req.body.properties.PlantingPlannedStartDate, req.body.properties.PlantingPlannedStartDate, req.body.properties.ExpectedYield, req.body.properties.HarvestPlannedStartDate, req.body.properties.HarvestPlannedEndDate], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: field crop usage and harvesting - retrieve (for field)
// GET /api/farm/:id_Farm/farmField/:id_FarmField/cropUsage
// ------------------------------------
app.get('/api/farm/:id_Farm/farmField/:id_FarmField/CropPlan', function(req,res,next){
	console.log('In route: post farm crop usage and harvesting');
	var context = {};
	var sSql = "SELECT *"
	  + " FROM vFarmFieldCropPlan"
	  + " WHERE id_FarmField = (?)";
	mysql.pool.query(sSql, [req.params.id_FarmField], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: field crop usage and harvesting - retrieve (for ?)
// GET /api/farm/:id_Farm/farmField/:id_FarmField/cropUsage/:id_fieldCropUsage
// ------------------------------------
// Deferring individual record get in favor of getting for farm...

// ------------------------------------
// Route: field crop usage and harvesting - update (for ?)
// POST /api/farm/:id_Farm/farmField/:id_FarmField/cropUsage/:id_fieldCropUsage
// ------------------------------------
// PENDING...

// ------------------------------------
// Route: field crop usage and harvesting - delete (for ?)
// DELETE /api/farm/:id_Farm/farmField/:id_FarmField/cropUsage/:id_fieldCropUsage
// TO DO: handle cascading delete
// ------------------------------------
app.delete('/api/farm/:id_Farm/farmField/:id_FarmField/cropUsage/:id_fieldCropUsage', function(req,res,next){
	console.log('In route: delete farm crop usage and harvesting');
	var context = {};
	var sSql = "DELETE FieldCropUsagePlan WHERE id = (?)";
	mysql.pool.query(sSql, [req.params.id_fieldCropUsage], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: field crop usage and harvesting - get (for farmField)
// GET /api/farm/:id_Farm/farmField/:id_FarmField/cropUsage/
// ------------------------------------
app.get('/api/farm/:id_Farm/farmField/:id_FarmField/cropUsage', function(req,res,next){
	console.log('In route: delete farm crop usage and harvesting');
	var context = {};
	var sSql = "DELETE FieldCropUsagePlan WHERE id = (?)";
	mysql.pool.query(sSql, [req.params.id_fieldCropUsage], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// Managing Farm planning / usage - field husbandry usage
////////////////////////////////////////////////////////////////////////





// Managing domain data
////////////////////////////////////////////////////////////////////////

// ------------------------------------
// Route: produceTypes - get
// GET /api/produceTypes
// ------------------------------------
app.get('/api/produceTypes', function(req,res,next){
	console.log('In route: get produceTypes');
	var context = {};
	var sSql = "SELECT id, ProduceType"
	  + " FROM dmnProduceType";
	mysql.pool.query(sSql, function(err, result) {
		if(err) {
			next(err);
			return;
		}
	res.json(result);
	});
});

// ------------------------------------
// Route: equipmentTypes - get
// GET /api/equipmentTypes
// ------------------------------------
app.get('/api/equipmentTypes', function(req,res,next){
	console.log('In route: get equipmentTypes');
	var context = {};
	var sSql = "SELECT id, EquipmentType"
	  + " FROM dmnEquipmentType";
	mysql.pool.query(sSql, function(err, result) {
		if(err) {
			next(err);
			return;
		}
	res.json(result);
	});
});

// ------------------------------------
// Route: livestockTypes - get
// GET /api/livestockTypes
// ------------------------------------
app.get('/api/livestockTypes', function(req,res,next){
	console.log('In route: get livestockTypes');
	var context = {};
	var sSql = "SELECT id, LivestockType"
	  + " FROM dmnLivestockType";
	mysql.pool.query(sSql, function(err, result) {
		if(err) {
			next(err);
			return;
		}
	res.json(result);
	});
});



/*
// ------------------------------------
// Route: recommendations - post (for ?)
// POST /api/recommendations
// ------------------------------------
console.log('In route: post recommendations');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});
*/

/*
// ------------------------------------
// Route: recommendations - get (for ?)
// GET /api/recommendations
// ------------------------------------
console.log('In route: get recommendations');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});
*/

/*
// ------------------------------------
// Route: recommendations - put (for ?)
// PUT /api/recommendations
// ------------------------------------
console.log('In route: put recommendations');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});
*/

/*
// ------------------------------------
// Route: recommendations - delete (for ?)
// DELETE /api/recommendations
// ------------------------------------
console.log('In route: delete recommendations');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});
*/

/*
// ------------------------------------
// Route: cropPlan - post (for ?)
// POST /api/cropPlan
// ------------------------------------
console.log('In route: post cropPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: cropPlan - get (for ?)
// GET /api/cropPlan
// ------------------------------------
console.log('In route: get cropPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: cropPlan - put (for ?)
// PUT /api/cropPlan
// ------------------------------------
console.log('In route: put cropPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: cropPlan - delete (for ?)
// DELETE /api/cropPlan
// ------------------------------------
console.log('In route: delete cropPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: husbandryPlan - post (for ?)
// POST /api/husbandryPlan
// ------------------------------------
console.log('In route: post husbandryPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: husbandryPlan - get (for ?)
// GET /api/husbandryPlan
// ------------------------------------
console.log('In route: get husbandryPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: husbandryPlan - put (for ?)
// PUT /api/husbandryPlan
// ------------------------------------
console.log('In route: put husbandryPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: husbandryPlan - delete (for ?)
// DELETE /api/husbandryPlan
// ------------------------------------
console.log('In route: delete husbandryPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});
*/

/*
// ------------------------------------
// Route: recommendations - post (for ?)
// POST /api/recommendations
// ------------------------------------
console.log('In route: post recommendations');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: recommendations - get (for ?)
// GET /api/recommendations
// ------------------------------------
console.log('In route: get recommendations');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: recommendations - put (for ?)
// PUT /api/recommendations
// ------------------------------------
console.log('In route: put recommendations');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: recommendations - delete (for ?)
// DELETE /api/recommendations
// ------------------------------------
console.log('In route: delete recommendations');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});
*/

/*
// ------------------------------------
// Route: cropPlan - post (for ?)
// POST /api/cropPlan
// ------------------------------------
console.log('In route: post cropPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: cropPlan - get (for ?)
// GET /api/cropPlan
// ------------------------------------
console.log('In route: get cropPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: cropPlan - put (for ?)
// PUT /api/cropPlan
// ------------------------------------
console.log('In route: put cropPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: cropPlan - delete (for ?)
// DELETE /api/cropPlan
// ------------------------------------
console.log('In route: delete cropPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});
*/

/*
// ------------------------------------
// Route: husbandryPlan - post (for ?)
// POST /api/husbandryPlan
// ------------------------------------
console.log('In route: post husbandryPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: husbandryPlan - get (for ?)
// GET /api/husbandryPlan
// ------------------------------------
console.log('In route: get husbandryPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: husbandryPlan - put (for ?)
// PUT /api/husbandryPlan
// ------------------------------------
console.log('In route: put husbandryPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});

// ------------------------------------
// Route: husbandryPlan - delete (for ?)
// DELETE /api/husbandryPlan
// ------------------------------------
console.log('In route: delete husbandryPlan');
var context = {};
var sSql = "";
mysql.pool.query(sSql, [...], function(err, result) {
if(err) {
next(err);
return;
}
res.json(result);
});
});"
*/


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

// START LISTENER
// ============================================================================
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
