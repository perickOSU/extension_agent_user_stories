=======================
Deployment Instructions
=======================

----------------------------
General order of operations:
----------------------------
1. deploy database
1a. run db test scripts
2. deploy Node.js, Express, Handlebars
2a. run test scripts
3. start application

------------------------------------
Detailed instructions on deployment:
------------------------------------
1. MySQL / MariaDB

	Run the following scripts in the given order:
	1. DB_schema.sql
	2. DB_views.sql
	3. DB_sprocs.sql
	4. DB_dataInitialization.sql  ???

2. Web components
	1. cd to app root directory
	2. Copy web app structure to this location. 
	3. Update application configuration for your environment
		- Update port number in ./private/js/config.js
		- Update db parameters in ./private/js/dbcon.js
	4. Deploy required NPM packages
		Option 1: Use package.json. To install all dependencies for the app, run the following command from the app root directory
			npm install
		Option 2: Explicit install. To install the dependencies individually and manually, the following commands from the app root directory
			a. npm install express
			b. npm install express-handlebars
			c. npm install mysql
			d. npm install body-parser
			e. npm install request

3. Start application
	Option 1: test mode
		node extagent.js
	Option 2: Forever
		./node_modules/forever/bin/forever start extagent.js

4. Stop application
	Option 1: 
		ctrl-c to stop application
	Option 2: Forever

5. Navigate to application main page
	update the below server and port, according to your configuration (step 2.3, above)
	http://flip3.engr.oregonstate.edu:17001/
	
	
======================================
Current Functional Support in Database
======================================
User Story 1: Overview Tool: User enters farm summary data entry
User Story Description:
1. A unregistered user navigates to the app
2. Enters details about their farm in a form of some sort

User Story 2: Overview Tool: User requests / receives recommendations
1. User can submit the form
2. Receives high level recommendations

User Story 3: Registration: User-entered data persisted to new account
1. Once a user registers, information previously is transferred into their account

User Story 17: Planner: Farmer defines characteristics of farm
1. After first registering as a user, the farmer will be required to define 
	a. Different areas of farm
	b. Crops grown
	c. Livestock raised
	d. Make final selections on different low impact techniques, based on the model's recommendations (in planner tool)


3.1.a register the user
	DB: sp_registerUser
		(
			IN `p_FirstName` VARCHAR(50), 
			IN `p_LastName` VARCHAR(50), 
			IN `p_Handle` VARCHAR(50), 
			IN `p_DateRegistered` DATETIME
		)
		CALL sp_registerUser('Brian', 'Bruckner', 'newfarmer', '18-NOV-2017');
	WS:
	
3.1.b initialize the farm record
	DB: sp_addFarm
		(
			IN `p_Name` VARCHAR(50), 
			IN `p_FarmInfo` VARCHAR(2000), 
			IN `p_TotalAcreage` FLOAT
		)
	WS:
	
17.1.a. define an area of the farm


17.1.b. define crops for an area


17.1.c. define livestock for an area


17.1.d. select techniques

