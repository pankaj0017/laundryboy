var mongoose = require("mongoose");

var CustomerSchema = new mongoose.Schema({

	  user         : {type: mongoose.Schema.Types.ObjectId, ref: "User"},       //to extract details of customer who is currently logged in
    name         : {type: String , default: ''},
    referedBy    : {type: mongoose.Schema.Types.ObjectId, ref: "Customer"},
    tagNumber    : {type: String , default: ''},
    bagNumber    : {type: String , default: ''},
    pickUpKey    : {type: Number , default: 0 },                                //generated randomly when order is placed
    mainNumber   : {type: String , default: ''},
    address      : {type: String , default: ''},
    pinCode      : {type: Number, default:  0 },
    daysLeft     : {type: Number, default:  0 },                              //time untill next recharge
    longClothes  : {type: Number, default:  0 },
    shortClothes : {type: Number, default:  0 },
    numbers:  [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Mobile"
        }
      ],
    history:  [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Order"
        }
      ]

});

module.exports = mongoose.model("Customer", CustomerSchema);