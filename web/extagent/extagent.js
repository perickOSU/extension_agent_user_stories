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

// application routing
var router = express.Router();

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
	var sSql = 'SELECT id, FieldNumber, FieldName, Acreage, FieldLocation, Crop,'
									+ ' Husbandry, Technique FROM FarmField;';
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
// app.use('/api', router);

// ------------------------------------
// Route: post registerUser
// POST /api/registerUser
// ------------------------------------
app.post('/api/registerUser',function(req,res,next){
	console.log('In route: post registerUser');
	var context = {};
	var sSql = "CALL sp_registerUser(?, ?, ?, ?, ?, ?, ?, ?);"
	mysql.pool.query(sSql, [req.body.properties.FirstName, req.body.properties.LastName, req.body.properties.Handle, req.body.properties.FarmName, req.body.properties.TotalAcreage, req.body.properties.PostalCode, req.body.properties.Crop, req.body.properties.Livestock], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: get registerUsers
// GET /api/registerUsers
// ------------------------------------
app.get('/api/registeredUsers',function(req,res,next){
	console.log('In route: get registerUser');
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
app.get('/api/:id_User/farms',function(req,res,next){
	console.log('In route: get farms');
	var context = {};
	var sSql = "SELECT * FROM Farm where id_User = (?)";
	mysql.pool.query(sSql, [req.params.id_User], function(err, result) {
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
	var sSql = "INSERT INTO FarmField (id_Farm, FieldNumber, FieldName, Acreage, FieldLocation, Crop, Husbandry, Technique) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
	mysql.pool.query(sSql, [req.body.properties.Farm.id_Farm, req.body.properties.Farm.Fields.Field.FieldNumber, req.body.properties.Farm.Fields.Field.FieldName, req.body.properties.Farm.Fields.Field.Acreage, req.body.properties.Farm.Fields.Field.FieldLocation, req.body.properties.Farm.Fields.Field.Crop, req.body.properties.Farm.Fields.Field.Husbandry, req.body.properties.Farm.Fields.Field.Technique], function(err, result) {
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

/*
// ------------------------------------
// Route: user - post (for ?)
// POST /api/user
// ------------------------------------
console.log('In route: post user');
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

// ------------------------------------
// Route: user - get (for ?)
// GET /api/user
// ------------------------------------
app.get('/api/user/:id', function(req,res,next){
	console.log('In route: get users');
	var context = {};
	var sSql = "SELECT * FROM User WHERE id = ?";
	mysql.pool.query(sSql, [req.params.id], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});

// ------------------------------------
// Route: geoRecommendation - get (for ?)
// GET /api/geoRecommendation
// ------------------------------------
app.get('/api/geoRecommendation/:geoCode', function(req,res,next){
	console.log('In route: get geoRecommendation');
	var context = {};
	var sSql = "SELECT geoCode, recommendation FROM geoRecommendation WHERE geoCode = ?";
	mysql.pool.query(sSql, [req.params.geoCode], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});


// ------------------------------------
// Route: equipmentTypes - get
// PUT /api/equipmentTypes
// ------------------------------------
app.get('/api/equipmentTypes', function(req,res,next){
	console.log('In route: get equipmentTypes');
	var context = {};
	var sSql = "SELECT id, EquipmentType FROM dmnEquipmentType";
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
// PUT /api/livestockTypes
// ------------------------------------
app.get('/api/livestockTypes', function(req,res,next){
	console.log('In route: get livestockTypes');
	var context = {};
	var sSql = "SELECT id, LivestockType FROM dmnLivestockType";
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
// Route: user - put (for ?)
// PUT /api/user
// ------------------------------------
console.log('In route: put user');
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
// Route: user - delete (for ?)
// DELETE /api/user
// ------------------------------------
console.log('In route: delete user');
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
// Route: farmInvEquipment - post (for ?)
// POST /api/farmInvEquipment
// ------------------------------------
console.log('In route: post farmInvEquipment');
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
// Route: farmInvEquipment - get (for ?)
// GET /api/farmInvEquipment
// ------------------------------------
console.log('In route: get farmInvEquipment');
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
// Route: farmInvEquipment - put (for ?)
// PUT /api/farmInvEquipment
// ------------------------------------
console.log('In route: put farmInvEquipment');
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
// Route: farmInvEquipment - delete (for ?)
// DELETE /api/farmInvEquipment
// ------------------------------------
console.log('In route: delete farmInvEquipment');
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

// ------------------------------------
// Route: user - post (for ?)
// POST /api/user
// ------------------------------------
console.log('In route: post user');
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
// Route: user - get (for ?)
// GET /api/user
// ------------------------------------
console.log('In route: get user');
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
// Route: user - put (for ?)
// PUT /api/user
// ------------------------------------
console.log('In route: put user');
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
// Route: user - delete (for ?)
// DELETE /api/user
// ------------------------------------
console.log('In route: delete user');
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
// Route: farmInvEquipment - post (for ?)
// POST /api/farmInvEquipment
// ------------------------------------
console.log('In route: post farmInvEquipment');
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
// Route: farmInvEquipment - get (for ?)
// GET /api/farmInvEquipment
// ------------------------------------
console.log('In route: get farmInvEquipment');
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
// Route: farmInvEquipment - put (for ?)
// PUT /api/farmInvEquipment
// ------------------------------------
console.log('In route: put farmInvEquipment');
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
// Route: farmInvEquipment - delete (for ?)
// DELETE /api/farmInvEquipment
// ------------------------------------
console.log('In route: delete farmInvEquipment');
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

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
