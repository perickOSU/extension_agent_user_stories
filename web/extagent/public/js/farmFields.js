


/*
 * event handlers for adding cicles
 */
var onstart = function(x, y, event) {
	this.x_o = this.attr("cx");
	this.y_o = this.attr("cy");
}

var onmove = function(dx, dy, x, y, event) {
	this.attr({cx : this.x_o + dx, cy : this.y_o + dy});
	var arr = document.getElementById("list").childNodes;
	arr[this.id].innerHTML =  this.attr("cx") + ", " +  this.attr("cy");
}

/* TODO: remove this? */
var onend = function() { /* do nothing for now */ }

/*
 * Create SVG drawing area
 */
var paper_div = document.getElementById("paper");
var paper = Raphael(paper_div);
var bg = paper.rect(0,0,320,280).attr({"fill" : "grey"});

/*
 * make a circles array.
 */
var circles = [];

/*
 * add a circles.
 */
function add_circ(e) {
	/* 
	 * get mouse coords, then use them to create the new circle.
	 * set the drag behavior for the circle and add to array.  
	 * Assign the index as the id, Remove handler.
	 */

	var box = paper_div.getBoundingClientRect();
	var x = e.clientX - box.left;
	var y = e.clientY - box.top;

	var new_circle = paper.circle(x,y,40).attr({"fill" : "green"});

	new_circle.drag(onmove, onstart, onend);
	new_circle.id = circles.length;		/* used for indexing */
	/* use for database TODO: read from form. */
	new_circle.field = circles.length;	
	console.log(new_circle);

	circles.push(new_circle);

	/* update the display list with the new circle. */
	var li = document.createElement("li");
	li.style.color = "green";
	li.innerHTML = new_circle.attr("cx") + ", " +  new_circle.attr("cy");
	list.appendChild(li);

	/* removed event handler from div with paper and clear the message field. */
	bg.node.onclick = null;
	message.innerHTML = "Click and drag the circles to move the fields";
}

/*
 * add click event to add circle to paper
 */
var add_circle_button = document.getElementById("add_circle");
var message = document.getElementById("message");
var list = document.getElementById("list");
add_circle_button.onclick = function() {
	message.innerHTML = "Click on canvas to place circle";
	bg.node.onclick = add_circ;
}


/*
 * create field from form 
 */
function btnCreate_onClick(id) {
	//debugger;
	//alert("create record: " + sGameVersionName);
	
	sFieldNumber = document.getElementById("c-FieldNumber").value;
	if (sFieldNumber === "") {
		alert("Field Number is required.");
		event.preventDefault();
		return;
	}
	
	sFieldName = document.getElementById("c-FieldName").value;
	if (sFieldName === "") {
		alert("Field Name is required.");
		event.preventDefault();
		return;
	}
	
	sAcreage = document.getElementById("c-Acreage").value;
	if (sAcreage === "") {
		alert("Acreage is required.");
		event.preventDefault();
		return;
	}
	
	sFieldLocation = document.getElementById("c-FieldLocation").value;
	if (sFieldLocation === "") {
		alert("FieldLocation is required.");
		event.preventDefault();
		return;
	}
	
	sCrop = document.getElementById("c-Crop").value;
	
	sHusbandry = document.getElementById("c-Husbandry").value;

	sTechnique = document.getElementById("c-Technique").value;
	if (sTechnique === "") {
		alert("Technique is required.");
		event.preventDefault();
		return;
	}
	
	
	
	var nFieldNumber = Number(sFieldNumber);
	var nAcreage = Number(sAcreage);
	
	var payload = {
	additionalProperties: false,
	type: "object",
	properties: {
		Farm: {
			id_Farm: 1,
				Fields: {
					Field: {
						FieldNumber: sFieldNumber, 
						FieldName: sFieldName, 
						Acreage: nAcreage, 
						FieldLocation: sFieldLocation,
						Crop: sCrop, 
						Husbandry: sHusbandry, 
						Technique: sTechnique
					}
				}
		}
	}};
	
	var req = new XMLHttpRequest();
	req.open("POST", "http://" + host + port + "/api/farm/1/farmField/", true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load',function(){
		//debugger;
		if (req.status >= 200 && req.status < 400) {
			console.log("successfully posted id: " + JSON.parse(req.response).newId);
		} else {
			alert("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(payload));
	
	event.preventDefault();
	
	location.reload();
}



/* 
 * TODO: Add update / delete in week 2 stories.
 */
function btnDelete_onClick(id) {
/*
	var payload = {
	additionalProperties: false,
	type: "object",
	properties: {
		"id": id
	}};
*/
	var payload = {
	properties: {
		"id": id
	}};

//	alert(JSON.stringify(payload));
	var req = new XMLHttpRequest();
	req.open("DELETE", "http://" + host + port  + "/api/farm/1/farmField/" + id, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load',function(){
		//debugger;
		if (req.status >= 200 && req.status < 400) {
			console.log("successfully deleted id: " + id);
		} else {
			alert("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(payload));
	
	event.preventDefault();
	
	location.reload();

}

