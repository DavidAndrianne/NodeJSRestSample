'use strict';
// Define server dependencies
let sys = require("util"),
my_http = require("http"),

// Define mongo DB dependencies
MongoClient = require('mongodb').MongoClient,
assert = require('assert'),
ObjectId = require('mongodb').ObjectID,

// Define our MongoDB driver extension
mongoose = require('mongoose');

// Config variables
var dbCnnStr = 'mongodb://127.0.0.1:27017/test';

my_http.createServer(function(request,response){
	console.log("received request!");
    
	/*response.write("<h1>RestApi/Markers/GET</h1>");
	response.write("Todo: pass DB result back to main thread so write in both console AND the response...");*/
	
	// init the connection
	mongoose.connect(dbCnnStr);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
	  // we're connected!
		var markerSchema = mongoose.Schema({
			lat: Number,
			lng: Number,
			type: String
		});
		
		markerSchema.methods.getDistFromAalst = function () {
			let latAalst = 50.9333;
			let lngAalst = 4.0333;
			return (this.lat && this.lng)
			  ? "You're approxamitely: " + (Math.abs(this.lat) - latAalst + Math.abs(this.lng) - lngAalst) + " from aalst!"
			  : "Unknown";
		}
		
		let Marker = mongoose.model('Marker', markerSchema);
		
		Marker.find(/*{ type: "stand" }, */function (err, markers) {
			if (err) return console.error(err);
			console.log("Found markers in localhost mongo DB test.Markers:");
			console.log(markers);
			markers.forEach( function(marker) {
                response.write(JSON.stringify(marker));
            });
			response.end();
			mongoose.disconnect();
		  })
	});
	
}).listen(8080);
console.log("Server Running on 8080");         