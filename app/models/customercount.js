var mongoose = require("mongoose");

var CustomerCountSchema = new mongoose.Schema({
	countingOf	 : {type: String , default: ''},
    totalNumber  : {type: Number, default:  401 }
});

module.exports = mongoose.model("CustomerCount", CustomerCountSchema);