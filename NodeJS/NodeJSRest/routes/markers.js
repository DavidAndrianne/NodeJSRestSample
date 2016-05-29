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
  res.render('marker_create');
});

// Render page to update a marker
router.get('/update', function(req, res, next){
  res.send("WIP!");
  //res.render('marker_update');
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
  markerToAdd.save(function(err){
	if(err)
	  res.send(err);
	res.json(markerToAdd);
  }); // end save
});

/* PUT updated marker */
router.put('/:marker_id', function(req, res){
  var markerToAdd = extractMarkerFromRequest(new Marker(), req);
  markerToAdd.save(function(err){
	if(err)
	  res.send(err);
	res.json(markerToAdd);
  });// end save
});

/* DELETE marker */
router.delete('/:marker_id', function(req, res){
  Marker.remove({
		_id: req.params.marker_id
	}, function(err, bear) {
		if (err)
			res.send(err);
		res.json({ message: 'Successfully deleted marker '+marker_id+'!' });
	});
});

// *** Private methods ***
/* Extract a marker object from a request and insert it into an obj */
function extractMarkerFromRequest(obj, req) {
    var marker = obj;
	if (req.params._id)
        marker._id=req.params._id;
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