var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var VendorSchema = new mongoose.Schema({
    username:     {type: String , default: ''},
    password:     {type: String , default: ''},
    name:         {type: String , default: ''},
    email: 	      {type: String , default: ''},
    address:      {type: String , default: ''},
    mobile:       {type: String , default: ''},
    rating:       {type: Number , default: 0 },
    ratingCount:  {type: Number , default: 0 },
    currentOrders: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Order"
      }
   ]
});

VendorSchema.plugin(deepPopulate, {
  whitelist: [
    'currentOrders.customer'
  ]
});

module.exports = mongoose.model("Vendor", VendorSchema);