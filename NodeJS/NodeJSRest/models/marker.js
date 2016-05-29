// Define our MongoDB driver extension
mongoose = require('mongoose');

var markerSchema = mongoose.Schema({
        lat: Number,
		lng: Number,
        title: String,
        meta: mongoose.Schema.Types.Mixed // anything can go here
	});
	  
markerSchema.methods.getDistFromAalst = function () {
    var latAalst = 50.9333;
    var lngAalst = 4.0333;
    return (this.lat && this.lng)
      ? "You're approxamitely: " + (Math.abs(this.lat) - latAalst + Math.abs(this.lng) - lngAalst) + " from aalst!"
      : "Unknown";
}

module.exports = mongoose.model('Marker', markerSchema);