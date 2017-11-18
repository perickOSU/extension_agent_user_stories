var base_url = "http://flip3.engr.oregonstate.edu:3001/"

var NUM_COL=3;

window.onload = function() {
	var table = document.getElementById("farm");
	var rows = table.rows;
}

function add_row() {
	var table = document.getElementById("farm");

	/* gather form data... */
	var body = {};
	body.f1 = document.getElementById("new_f1").value;
	body.f2 = document.getElementById("new_f2").value;
	body.f3 = document.getElementById("new_f3").value;

	/* send post request to server.js to add row to table... */
	var req = new XMLHttpRequest();			
	req.open("POST", base_url + "insert", true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			var res = JSON.parse(req.responseText);
			var new_row = table.insertRow(-1);
			for (var i=0; i<NUM_COL; i++) { new_row.insertCell(-1); }

			/* copy f1, f2, f3 values to respective cells... */
			new_row.cells[0].textContent = body.f1;
			new_row.cells[1].textContent = body.f2;
			new_row.cells[2].textContent = body.f3;
		} else {
			alert("failed to add table row: bad response from server")
		}
	});
	req.send(JSON.stringify(body));		/* needs to be a string per AJAX */

	event.preventDefault();
}
