var mongoose = require("mongoose");

var VendorSchema = new mongoose.Schema({
    username:     {type: String , default: ''},
    password:     {type: String , default: ''},
    name:         {type: String , default: ''},
    email: 	      {type: String , default: ''},
    address:      {type: String , default: ''},
    mobile:       {type: String , default: ''},
    rating:       {type: Number , default: 0 },
    ratingCount:  {type: Number , default: 0 }
});

module.exports = mongoose.model("Vendor", VendorSchema);