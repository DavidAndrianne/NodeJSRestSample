//express routing
var express = require('express');
var router = express.Router();
var viewsfolder = 'markers/';

// mongoose dependencies
var Marker = require('../models/marker');
var db = mongoose.connection;

// *** Admin pages section ***

// Render page to create a new marker
router.get('/create', function(req, res, next){
  res.render('marker_create', {title:'Add marker'});
});

// Render page to update a marker
router.get('/:marker_id/update', function(req, res, next){
  Marker.findById(req.params.marker_id, function (err, marker) {
	if (err) return console.error(err);
	console.log(marker);
	res.render('marker_update', {title:'Update marker', marker: marker});
  }); // end find
});

// Render page to search for markers
router.get('/search', function(req, res, next){
  Marker.find(function(err, allMarkers){
	res.render('marker_search', {title:'Search markers', markers: allMarkers});
  });
});

// *** API section ***

/* GET markers listing. */
router.get('/', function(req, res, next) {
  var predicate = extractMarkerFromRequest({}, req);
  Marker.find(predicate, function (err, markers) {
	  if (err) return console.error(err);
	  res.json(markers);
	  res.end();
	}); // end find
}); // end get

/* GET marker by Id. */
router.get('/:marker_id', function(req, res, next) {
  Marker.findById(req.params.marker_id, function (err, marker) {
	  if (err) return console.error(err);
	  res.json(marker);
	  res.end();
	}); // end find
}); // end get

/* POST new marker. */
router.post('/', function(req, res) {
  var markerToAdd = extractMarkerFromRequest(new Marker(), req);
  if (!markerToAdd.meta.layers) {
    res.send('Validation Error! Must at least display marker on a single layer!');
  } else {
	markerToAdd.save(function(err){
	  if(err)
		res.send(err);
	  res.json(markerToAdd);
	}); // end save
  }
});

/* PUT updated marker
 * NOTE : (Temporarily?) also listening to POST /:marker_id to sustain GUI version
 */
router.put('/:marker_id', function(req, res){
  Marker.findById(req.params.marker_id, function (err, marker) {
    var markerToUpdate = extractMarkerFromRequest(marker, req);
    markerToUpdate.save(function(err){
	  if(err)
	    res.send(err);
	  res.json(markerToUpdate);
    });// end save
  }); // end findById
});

/* Update marker for GUI */
router.post('/:marker_id', function(req, res){
  Marker.findById(req.params.marker_id, function (err, marker) {
	var markerToUpdate = extractMarkerFromRequest(marker, req);
	console.log("updating marker"+markerToUpdate._id);
	console.log(markerToUpdate);
	markerToUpdate.save(function(err){
	  if(err)
		res.send(err);
	  res.writeHead(302, {
	    'Location': '/markers/search'
	  });
	  res.end();
	});// end save
  }); // end findbyId
});

/* DELETE marker */
router.delete('/:marker_id', function(req, res){
  Marker.remove({
		_id: req.params.marker_id
	}, function(err, marker) {
		if (err)
			res.send(err);
		res.json({ message: 'Successfully deleted marker '+req.params.marker_id+'!' });
	});
});

/* DELETE marker for GUI */
router.get('/:marker_id/delete', function(req, res){
  Marker.remove({
		_id: req.params.marker_id
	}, function(err, marker) {
		if (err)
			res.send(err);
		//res.json({ message: 'Successfully deleted marker '+req.params.marker_id+'!' });
		res.writeHead(302, {
		  'Location': '/markers/search'
		});
		res.end();
	});
});

// *** Private methods ***
/* Extract a marker object from a request and insert it into an obj */
function extractMarkerFromRequest(obj, req) {
    var marker = obj;
	//if (req.params._id)
        //marker._id=req.params._id;
	if (req.body.lat)
	  marker.lat = req.body.lat;
	if (req.body.lng)
	  marker.lng = req.body.lng;
	if (req.body.title)
	  marker.title = req.body.title;
	if (extractMetadataFromRequest(req))
      marker.meta = extractMetadataFromRequest(req)
	return marker;
}

/* Extracts metadata from a request
 * If no metadata is present in the request, returns false
 * otherwise returns the metadata object.
 */
function extractMetadataFromRequest(req) {
    var meta = {};
	if (req.body.type)
	  meta.type = req.body.type;
	if (req.body.layers)
	  meta.layers = req.body.layers;
	  
	if (isEmpty(meta)) // if no metadata found
        return false; // let caller know with false
	return meta;
}

/* Helper function to loop through object
 * returns false if object has no properties
 */
function isEmpty(obj) {
   for(var key in obj) {
      if (obj.hasOwnProperty(key)) {
         return false;
      }
   }
   return true;
}
module.exports = router;