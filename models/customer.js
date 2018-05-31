var mongoose = require("mongoose");

var CustomerSchema = new mongoose.Schema({
	user:         {type: mongoose.Schema.Types.ObjectId, ref: "User"},       //to extract details of customer who is currently logged in
    name:         {type: String , default: ''},
    email: 	      {type: String , default: ''},
    address:      {type: String , default: ''},
    mobile:       {type: String , default: ''},
    balance:      {type: mongoose.Schema.Types.Decimal128, default: 0.00 },  //for decimal values
    daysLeft:  	  {type: Number, default:  0 },                              //time untill next recharge
    longClothes:  {type: Number, default:  0 },
    shortClothes: {type: Number, default:  0 },
    history:  [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Order"
      }
   ]
});

module.exports = mongoose.model("Customer", CustomerSchema);