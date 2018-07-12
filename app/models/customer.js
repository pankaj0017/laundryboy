var mongoose = require("mongoose");

var CustomerSchema = new mongoose.Schema({

	  user         : {type: mongoose.Schema.Types.ObjectId, ref: "User"},       //to extract details of customer who is currently logged in
    name         : {type: String , default: ''},
    referedBy    : {type: mongoose.Schema.Types.ObjectId, ref: "Customer"},
    discount     : {type: Number, default:  0 },
    tagNumber    : {type: String , default: ''},
    bagNumber    : {type: String , default: ''},
    pickUpKey    : {type: Number , default: 0 },                                //generated randomly when order is placed
    mainNumber   : {type: String , default: ''},
    isBusy       : {type: Boolean , default: false},
    address      : {type: String , default: ''},
    pinCode      : {type: Number, default:  0 },
    daysLeft     : {type: Number, default:  0 },                              //time untill next recharge
    longClothes  : {type: Number, default:  0 },
    shortClothes : {type: Number, default:  0 },
    longGiven    : {type: Number, default:  0 },
    shortGiven   : {type: Number, default:  0 },
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
      ],
    currentRecharges: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Recharge"
        }
     ]

});

module.exports = mongoose.model("Customer", CustomerSchema);