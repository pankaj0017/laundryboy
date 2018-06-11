var mongoose = require("mongoose");

var mobileSchema = mongoose.Schema({
	
	owner     : {type: mongoose.Schema.Types.ObjectId, ref: "Customer"},
    number    : {type: String , default: ''}

});

module.exports = mongoose.model("Mobile", mobileSchema);