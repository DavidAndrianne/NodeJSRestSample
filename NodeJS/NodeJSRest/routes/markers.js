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

/* REST: GET markers listing. */
router.get('/', function(req, res, next) {
  var predicate = extractMarkerFromRequest({}, req);
  Marker.find(predicate, function (err, markers) {
	  if (err) return console.error(err);
	  res.json(markers);
	  res.end();
	}); // end find
}); // end get

/* REST: GET marker by Id. */
router.get('/:marker_id', function(req, res, next) {
  Marker.findById(req.params.marker_id, function (err, marker) {
    if (err) return console.error(err);
    res.json(marker);
    res.end();
  }); // end find
}); // end get

/* REST: POST new marker. */
router.post('/', function(req, res) {
  var markerToAdd = extractMarkerFromRequest(new Marker(), req);
  if (validateMarker(markerToAdd, res)) {
	markerToAdd.save(function(err){
	  if(err)
		res.send(err);
	  res.json(markerToAdd);
	}); // end save
  }
});

/* REST: PUT updated marker. */
router.put('/:marker_id', function(req, res){
  Marker.findById(req.params.marker_id, function (err, marker) {
    var markerToUpdate = extractMarkerFromRequest(marker, req);
	if (validateMarker(markerToUpdate, res)) {
      markerToUpdate.save(function(err){
	    if(err)
	      res.send(err);
	    res.json(markerToUpdate);
      }); // end save
    } // end if marker isValid
  }); // end findById
});

/* REST: DELETE marker. */
router.delete('/:marker_id', function(req, res){
  Marker.remove({
		_id: req.params.marker_id
	}, function(err, marker) {
		if (err)
		  res.send(err);
		res.json({ message: 'Successfully deleted marker '+req.params.marker_id+'!' });
	});
});

/* GUI: GET Markers listing. */
router.post('/search', function(req, res, next){
    var predicate = extractMarkerFromRequest({}, req);
	console.log(predicate);
    Marker.find(predicate, function (err, foundMarkers) {
	  if (err) return console.error(err);
	  res.render('marker_search', {title:'Search markers', markers: foundMarkers});
	}); // end find
});

/* GUI: POST new marker. */
router.post('/create', function(req, res) {
  var markerToAdd = extractMarkerFromRequest(new Marker(), req);
  if (validateMarker(markerToAdd, res)) {
	markerToAdd.save(function(err){
	  if(err)
		res.send(err);
	  res.redirect('/markers/search');
	}); // end save
  }
});

/* GUI: UPDATE marker. */
router.post('/:marker_id/update', function(req, res){
  Marker.findById(req.params.marker_id, function (err, marker) {
	var markerToUpdate = extractMarkerFromRequest(marker, req);
    if (validateMarker(markerToUpdate, res)) {
	  markerToUpdate.save(function(err){
	    if(err)
	  	  res.send(err);
	    res.redirect('/markers/search');
	  }); // end save
	} // end if marker isValid
  }); // end findbyId
});

/* GUI: DELETE marker. */
router.get('/:marker_id/delete', function(req, res){
  Marker.remove({
		_id: req.params.marker_id
	}, function(err, marker) {
		if (err)
		  res.send(err);
		res.redirect('/markers/search');
	});
});

// *** Private methods ***
/* Extract a marker object from a request and insert it into an obj */
function extractMarkerFromRequest(obj, req) {
    var marker = obj;
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

/* Validates the marker and if not valid, returns the respective error to the user
 * returns true if marker is valid, otherwise returns false
 */
function validateMarker(marker, res) {
  var isValid = true;
  if (!marker.meta.layers) {
	isValid = false;
	res.send('Validation Error! Marker must at least be displayed on a single layer!');
  } else if(!marker.meta.type) {
	isValid = false;
	res.send('Validation Error! Marker must have a marker type in order to be displayed to the user!');
  }
  return isValid;
}
module.exports = router;