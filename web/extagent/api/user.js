router.route('/api/users')
	// fetch all users
	.get(function(req,res,next){
	console.log('In route: get users');
	var context = {};
	var sSql = "SELECT * FROM User";
	mysql.pool.query(sSql, function(err, result) {
		if(err) {
			next(err);
			return;
		}
		res.json(result);
	});
});