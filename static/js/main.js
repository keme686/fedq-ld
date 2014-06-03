//web service on a different domain using jQuery's ajax method
$.support.cors = true;

//everything in this block will be executed on pageload
$(document).ready(function() {

	var sparqlEndpoints = [];

	//code block below to load endpoints on pageload
	{
		$("#sparqlTextArea").text(sampleSparqlQueries[0]);
		var editor = CodeMirror.fromTextArea(document.getElementById("sparqlTextArea"), {
	        mode: "application/x-sparql-query",
	        lineNumbers: true,
	        indentUnit: 4,
	        autofocus: true,
	        matchBrackets: true
	      });
		
		
		
		//console.log(sampleSparqlQueries[0]);
		//console.log("loadEndpoints");
		$.ajax({
			type: 'GET',
			headers: { 
				Accept : "application/json"
			},
			url: '/dqp/getEndpoints',
			//data: {'query':sparqlQuery},
			dataType: "json",
			crossDomain: true,
			success: function(data, textStatus, jqXHR){

				//console.log(textStatus);
				if(jqXHR.status == 200) {
					//console.log(data);
					addEndpointsTableHeader();
					var tbody = $("#tblEndpoint").find('tbody');

					$.each(data, function(index, item) {
						tbody.append($('<tr>').append($('<td>')
								.text(item)
						)
						.append($('<td>').append($('<button>').addClass('btn')
								.addClass('btn-xs')
								.addClass('btn-danger')
								.attr('type','button')
								.text('Remove')
								.attr('id','btnRemoveEndpoint')
						)

						)												
						);
						sparqlEndpoints.push(item);
					});
				}

			},
			error: function(jqXHR, textStatus, errorThrown){
				//console.log(jqXHR);
			}
		});
	}



	//handler for endpoint select change envent
	$('#endpointSelect').on('change', function (e) {
		var endpoint = $('#endpointSelect option:selected').html();
		if(endpoint == "Select") {
			$('#inputEndpointURL').val("");
		} else {
			$('#inputEndpointURL').val(endpoint);
		}
	});



	//handler for add endpoint button click envent
	$('#btnEndpoint').click( function (e) {

	    var btn = $(this);
	    btn.button('loading');		
		
		var endpoint = $('#inputEndpointURL').val();
		$('#inputEndpointURL').val(endpoint);



		$.ajax({

			type: 'POST',
			url: '/dqp/addEndpoint',
			data: {'endpoint':endpoint},
			//dataType: 'json',

			success: function(data, textStatus, jqXHR){
				//console.log(data);
				addEndpointsTableHeader();

				$("#tblEndpoint").find('tbody')
				.append($('<tr>')
						.append($('<td>')
								.text(endpoint)
						)
						.append($('<td>').append($('<button>').addClass('btn')
								.addClass('btn-xs')
								.addClass('btn-danger')
								.attr('type','button')
								.attr('data-loading-text','Removing...') 
								.text('Remove')
								.attr('id','btnRemoveEndpoint'))

						)
				);
				sparqlEndpoints.push(endpoint);

				//$("#addEndpointResponse").text("Endpoint successfully added");
				infoSuccess("Endpoint successfully added");


			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log(jqXHR.status);
				console.log(jqXHR.responseText);
				if(jqXHR.status == 409) {
					//$("#addEndpointResponse").text("Endpoint already added");
					infoWarning("Endpoint already added");
				} else if(jqXHR.status == 404) {
					infoError("Endpoint not available");
				} else {
					infoError("Could not add endpoint");
				}

			}
		}).always(function () {
		      btn.button('reset');
	    });



	});

	//removes an endpoint
	$('#tblEndpoint').on("click", "#btnRemoveEndpoint", function(e) {
		var endpoint = $(this).closest("tr").children(":first").html(); 
		var btn = this;
		//console.log(endpoint);
	    var btn = $(this);
	    btn.button('loading');


		var res = false;
		$.ajax({

			type: 'POST',
			url: '/dqp/removeEndpoint',
			data: {'endpoint':endpoint},
			//dataType: 'json',

			success: function(data, textStatus, jqXHR){
				//console.log(data);
				//console.log(jqXHR.status);
				sparqlEndpoints.remove(endpoint);
				//console.log(sparqlEndpoints);
				$(btn).parent().parent().remove();
				//$("#addEndpointResponse").text("Endpoint successfully removed");
				infoSuccess("Endpoint successfully removed");
				
				//console.log(sparqlEndpoints);
				if(sparqlEndpoints.length==0) {
					//console.log('endpoints table header removed');
					$('#tblEndpoint thead tr').remove();
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log(jqXHR.status);
				console.log(jqXHR.responseText);
				//$("#addEndpointResponse").text("Endpoint remove failed");
				infoError("Endpoint successfully removed");
			}
		}).always(function () {
		      btn.button('reset');
	    });

		console.log("ajax 2:"+res);
		return res;		
	});

	$('#btnQuery').click(function() {
	
	    var btn = $(this);
	    btn.button('loading');
	    
		var sparqlQuery = $('#sparqlTextArea').val();
		$.ajax({
			type: 'GET',
			headers: { 
				Accept : "application/sparql-results+json"
			},

			url: '/dqp/sparql',
			data: {'query':sparqlQuery},
			//dataType: "application/sparql-results+json",
			dataType: "json",
			crossDomain: true,
			success: function(data, textStatus, jqXHR){
				//console.log(data);
				renderResults(data);

			},
			error: function(jqXHR, textStatus, errorThrown){

				console.log(jqXHR.status);
				console.log(jqXHR.responseText);

				$('#tblRes thead tr').remove();
				$('#tblRes tbody tr').remove();

				infoError("Querying fialed: "+textStatus);

			}
		}).always(function () {
		      btn.button('reset');
	    });

	});	
	
	
	//explain a result
	$('#tblRes').on("click", "#btnExplainRes", function(e) {
	    var btn = $(this);
	    btn.button('Genering..');		
		var row = $(this).closest("tr");
		//var jsonObj = [];
		var item = {};
		//console.log(row);
		var i = 0;
		$.each(row[0].cells, function(){
			if(i==variableNames.length) return false;
	        //alert('hi');
			//console.log(variableNames[i]+"='"+$(this).html()+"'");
			
			item[variableNames[i]] = $(this).html();
			
			i = i+1;
	    });
		
		
		//console.log(item);
		var jsonString = JSON.stringify(item);
		console.log(jsonString);
		
		
		$.ajax({
			type: 'POST',
			url: '/dqp/explainResult',
			data: {'result': jsonString},
			//data:{'test':"test param"},
		    //contentType: "application/json; charset=utf-8",
		    dataType: "json",	
			crossDomain: true,
			success: function(data, textStatus, jqXHR){
				console.log(jqXHR.status);
				console.log(data);
				renderExplanation(data);
				//renderExp(data);
			},
			error: function(jqXHR, textStatus, errorThrown){

				console.log(jqXHR.status);
				console.log(jqXHR.responseText);
				

			}
		}).always(function () {
		      btn.button('reset');
	    });		
	});
});

function renderExp(data){
	var cardsize = { width : 390, height : 100 };
	$("#expBody").html("");
	var svg = d3.select("#expBody").append("svg:svg")
		.attr("width", 500)
	    .attr("height", 590);

	var card =  svg.selectAll("rect")
		.data(data)
		.enter().append("svg:g")
		.attr("class", "card")
		.attr("transform", function(d,i) { 
			x = 40;
			y = 10+i*(10+cardsize.height);
			return "translate(" + x + "," + y + ")";
		});
		
	card.append("svg:circle").attr("cx", function(d,i){
			return 20;
		}).attr("cy", function(d, i){
			return cardsize.height/2;// + (cardsize.height)*i;
		}).attr("r", 50).attr("fill", "blue");

card.append("svg:foreignObject")
	.attr('width', 60)
	.attr('height', 60)
	.attr('y', 25)
	.attr('x',-10)
    .append('xhtml:span')
	.attr("class","statement")
	.style('word-wrap','break-word')
	.style('color', 'white')
	.text(function(d) {
		return d.source; 
		});

card//.append("defs")
		.append("svg:path")
		.attr('id',"source")
		.attr('stroke', 'red')
		.attr('d', "M 70 "+cardsize.height/2 + ", H 100");
	
var thing = card.append("g")
    .attr("id", "thing")
    .style("fill", "black");

thing.append("text")
    .style("font-size", "10px")
  .append("textPath")
    .attr("xlink:href", "#source")
    .text(function(d, i){
    	return d.source;
    });

	thing.append("use")
    	.attr("xlink:href", "#source")
    	.style("stroke", "black")
    	.style("fill", "red");

		
	card.append("svg:rect")
		.attr('width', cardsize.width)
		.attr('height', cardsize.height)
		.attr('x', 100);

	card.append("svg:foreignObject")
		.attr('width', cardsize.width)
		.attr('height', cardsize.height)
		.attr('x', 100)
	    .append('xhtml:div')
		.attr("class","statement")
		.style("margin-left",'5px')
		.style("overflow", "auto")
		.html(function(d) {
			var turtles = "";
			console.log(d.triples);
			var i=0;
			$.each(d.triples, function(id, obj){
				console.log(obj);
				turtles +='<p><b>'+ obj.subject + "</b> <i>" + obj.predicate + "</i> <b>" + obj.object + "</b></p>";
				i++;
				if(i>1){
					turtles +="\n <a href='' id='more'>more..</a>";
					return false;
				}
			});
			/*
			for(var i=0; i<d.triples.length; i++){
				turtles +='<p><b>'+ d.triples[i].subject + "</b> <i>" + d.triples[i].predicate + "</i> <b>" + d.triples[i].object + "</b></p>";
			}*/
			return turtles; 
			});
}
function renderExplanation(data){
	 
	//list of subjects and objects for the DAG
	var nodes = [];	
	//connection link between subject and object ->predicates
	var links = [];
	 var j=0;
	 for(var i in data){
		 if(data[i].predicate === 'undefined' || data[i].predicate == null || data[i].predicate == ''){
			 break;
		 }
		 if(data[i].subject === 'undefined' || data[i].subject == null || data[i].subject == ''){
			 break;
		 }
		 if(data[i].object == 'undefined' || data[i].object == null || data[i].object == ''){
			 break;
		 }
		//subject node
		var node = {};
		node.id=j;
		node.label=data[i].subject;
		node.reflexive = true;
		//check if subject already in nodes list	
		var snode = searchNode(nodes, data[i].subject);
		if(snode == null){
			nodes.push(node);
			snode = node;
		}		
		
		j++;
		var node2={};
		node2.id=j;
		node2.label=data[i].object;
		node2.reflexive = true;
			
		//check if object already in nodes list
		var onode = searchNode(nodes, data[i].object);
		if(onode == null){
		   nodes.push(node2);
		   onode = node2;
		}
			
		//connects subject - predicate - object -> a single triple
		var link = {};
		link.source = snode;			
		link.pred = data[i].predicate;
		link.target =onode;
		link.left = false;
		link.right = true;
		link.id="s"+i;		
		//add to connection list array
		links.push(link);
			
		j++;
	}
	 //drawDag(data);
	drawWhyDAG(nodes, links);
}

//search the term(label) from list of nodes (subjects and objects)
//return the node object if exist, null otherwise
function searchNode(nodes, term){
	for(var i in nodes){		
			console.log(nodes[i].label  + " ====== " + term);
			
			if(nodes[i].label === term){
				
				return nodes[i];
			}
		}
	return null;
  }

//draw the DAG graph using d3.js
function drawWhyDAG(nodes, links){
	
	var width  = 560,
    height = 500,
    colors = d3.scale.category10();
	//clear explanation body element
	$('#expBody').html("");
	
	var svg = d3.select('#expBody')
		.append('svg')
		.attr('width', width)
		.attr('height', height);
	
	
	// init D3 force layout
	  var force = d3.layout.force()
	      .nodes(nodes)
	      .links(links)
	      .size([width, height])
	      .linkDistance(150)
	      .charge(-500)
	      .on('tick', tick);

	  // define arrow markers for graph links
	  svg.append('svg:defs').append('svg:marker')
	      .attr('id', 'end-arrow')
	      .attr('viewBox', '0 -5 10 10')
	      .attr('refX', 16)
	      .attr('markerWidth', 3)
	      .attr('markerHeight', 3)
	      .attr('orient', 'auto')
	    .append('svg:path')
	      .attr('d', 'M0,-5L10,0L0,5')
	      .attr('fill', '#000');

	  svg.append('svg:defs').append('svg:marker')
	      .attr('id', 'start-arrow')
	      .attr('viewBox', '0 -5 10 10')
	      .attr('refX', 4)
	      .attr('markerWidth', 3)
	      .attr('markerHeight', 3)
	      .attr('orient', 'auto')
	    .append('svg:path')
	      .attr('d', 'M10,-5L0,0L10,5')
	      .attr('fill', '#000');

	  
	  // line displayed when dragging new nodes
	  var drag_line = svg.append('svg:path')
	    .attr('class', 'link dragline hidden')
	    .attr('d', 'M0,0L0,0');

	  // handles to link and node element groups
	  var path = svg.append('svg:g').selectAll('path'),
	      circle = svg.append('svg:g').selectAll('g');
	  
	  
	//mouse event vars
	  var selected_node = null,
	     selected_link = null;
	//update force layout (called automatically each iteration)
	  function tick() {
	    // draw directed edges with proper padding from node centers
	    path.attr('d', function(d) {
	      var deltaX = d.target.x - d.source.x,
	          deltaY = d.target.y - d.source.y,
	          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
	          normX = deltaX / dist,
	          normY = deltaY / dist,
	          sourcePadding = d.left ? 17 : 12,
	          targetPadding = d.right ? 17 : 12,
	          sourceX = d.source.x + (sourcePadding * normX),
	          sourceY = d.source.y + (sourcePadding * normY),
	          targetX = d.target.x - (targetPadding * normX),
	          targetY = d.target.y - (targetPadding * normY);
	      return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
	    });
		path.attr('id', function(d){
			  return d.id;
		});
	    circle.attr('transform', function(d) {
	      return 'translate(' + d.x + ',' + d.y + ')';
	    });
	  }
	  

	//update graph (called when needed)
	//function restart() {
	 // path (link) group
	 path = path.data(links);

	 // update existing links
	 path.classed('selected', function(d) { return d === selected_link; })
	   .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
	   .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


	 // add new links
	 path.enter().append('svg:path')
	   .attr('class', 'link')
	   .classed('selected', function(d) { return d === selected_link; })
	   .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
	   .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });
	 
	 
	 var thing = svg.append("svg:g").selectAll("text").data(links)
	 			.attr("id", "thing")
	 			.style("fill", "navy");

		thing.enter().append("text")
	 		     .style("font-size", "16px")
	 		     .attr("dx", 30)
	             .attr("dy", 18)
			.append("textPath")
	 		   .attr("xlink:href", function(d){return "#" + d.id;})
	 		    .text(function(d){
	 		    	if(d.pred.lastIndexOf("/") == -1) 		    	
	 		    		return d.pred;
	 		    	return d.pred.substring(d.pred.lastIndexOf('/'), d.pred.length);
	 		    });
	 		    
	 
	 
	 // remove old links
	 path.exit().remove();


	 // circle (node) group
	 // NB: the function arg is crucial here! nodes are known by id, not by index!
	 circle = circle.data(nodes, function(d) { return d.id; });

	 // update existing nodes (reflexive & selected visual states)
	 circle.selectAll('circle')
	   .style('fill', function(d) { return  (d === selected_node) ?d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
	   .classed('reflexive', function(d) { return d.reflexive; });

	 // add new nodes
	 var g = circle.enter().append('svg:g');

	 g.append('svg:circle')
	   .attr('class', 'node')
	   .attr('r', 29)
	   .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
	   .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
	   .classed('reflexive', function(d) { return d.reflexive; });

	 /*
	 
	  .append("svg:foreignObject")
			.attr('width', 60)
			.attr('height', 60)
			.attr('y', 5)
		    .append('xhtml:span')
			.attr("class","statement")
			.style('word-wrap','break-word')
			.style('color', 'white')
			.text(function(d) {
				return d.source; 
				});
	 
	 g.append("svg:foreignObject")
	 	.attr('width', 50)
	 	.attr('height', 50)
	 	.attr('x', 0)
	 	.attr('y', 2)
		.append('xhtml:span')
		.attr('class', 'id')
		//.style('word-wrap', 'break-word')
		.text(function(d){return d.lable;});
	 */
	 // show node IDs
	 g.append('svg:text')
	     .attr('x', 0)
	     .attr('y', 0)
	     .attr('class', 'id')
	     .text(function(d) { 
	    	 if(d.label.lastIndexOf('/') == -1)
	    	 	return d.label;
	    	 return d.label.substring(d.label.lastIndexOf('/'), d.label.length);
	    	 });
	     

	 // remove old nodes
	 circle.exit().remove();

	 // set the graph in motion
	 force.start();

	

}
//Useful functions for array handling
Array.prototype.contains = function(a) { return this.indexOf(a) != -1 };
Array.prototype.remove = function(a) {if (this.contains(a)){ return this.splice(this.indexOf(a),1)}};


var sampleSparqlQueries = ["PREFIX  : <http://example/>\n" +
                           "PREFIX  dc: <http://purl.org/dc/elements/1.1/>\n" +
                           "PREFIX  foaf: <http://xmlns.com/foaf/0.1/>\n" +
                           "SELECT  ?name ?friend_name\n"+
                           "WHERE\n"+
                           "{\n" +
                           "    ?book dc:title ?title .\n"+
                           "    ?book dc:creator ?author .\n"+
                           "    ?author foaf:name ?name .\n"+
                           "    ?author foaf:knows ?friend .\n" +
                           "    ?friend foaf:name ?friend_name .\n" +
                           "    FILTER(?title = \"Distributed Query Processing for Linked Data\")\n"+
                           "}\n"]

var variableNames = [];

//add header to the sparql endpoints table
function addEndpointsTableHeader () {
	var header = $("#tblEndpoint").find('th').text();
	//console.log("header ["+header+"]");
	if(!header.trim()) {
		var thead = $("#tblEndpoint").find('thead');
		var headRow = $('<tr>')
		
		headRow.append($('<th>')
						.text('SPARQL Endpoint(s)')

				);
		headRow.append($('<th>').text(''))
	
		//console.log("header empty");
		thead.append(headRow);
	}

}

function renderResults(data) {
	// JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
	var listVal = data.results.bindings == null ? [] : (data.results.bindings instanceof Array ? data.results.bindings : [data.results.bindings]);
	var listVar = data.head.vars == null ? [] : (data.head.vars instanceof Array ? data.head.vars : [data.head.vars]);

	$('#tblRes thead tr').remove();
	$('#tblRes tbody tr').remove();

	//Rendering the headers
	variableNames = [];
	var thead = $("#tblRes").find('thead');
	var headRow = $('<tr>')
	$.each(listVar, function(index, item) {

		headRow.append($('<th>').text(item.trim()));
		variableNames.push(item.trim());
	});
	thead.append(headRow);

	//Rendering the values
	var tbody = $("#tblRes").find('tbody');
	$.each(listVal, function(index, item) {

		var row = $('<tr>');
		$.each(item, function(name, v) {

			row.append($('<td>').text(v.value.trim()));
		});
		row.append($('<td>').append($('<button>').addClass('btn')
				.addClass('btn-xs')
				.addClass('btn-success')
				.attr('type','button')
				.attr('data-loading-text','Generating...') 
				.attr('data-toggle', 'modal')
				.attr('data-target','#expModal')
				.text('Explain')
				//.attr('disabled','disabled')  class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal"
				.attr('id','btnExplainRes')));	
		tbody.append(row);
	});
}

function infoWarning(message){
	var html = "<div class=\"alert alert-warning\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><strong>Warning!</strong> "+message+"</div>";
	$('#footer').prepend(html);
	alertTimeout(5000);
}
function infoSuccess(message){
	var html = "<div class=\"alert alert-success\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><strong>Success!</strong> "+message+"</div>";
	$('#footer').prepend(html);
	alertTimeout(5000);
}
function infoError(message){
	var html = "<div class=\"alert alert-danger\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><strong>Error!</strong> "+message+"</div>";
	$('#footer').prepend(html);
	alertTimeout(5000);
}

function alertTimeout(wait){
	setTimeout(function(){
		$('#footer').children('.alert:last-child').remove();
	}, wait);
}
