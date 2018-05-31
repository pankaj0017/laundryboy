var mongoose = require("mongoose");

var OrderSchema = mongoose.Schema({

	customer:         {type: mongoose.Schema.Types.ObjectId, ref: "Customer"},			//when order is placed
    vendor:           {type: mongoose.Schema.Types.ObjectId, ref: "Vendor"},			//when order is placed
    deliveredBy:      {type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy"},		//when delivered
    cost:             {type: mongoose.Schema.Types.Decimal128, default: 0.00},          //for decimal values
    pickUpKey:        {type: Number , default: 0},                                      //generated randomly when order is placed
    isPicked:         {type: Boolean , default: false},
    isWashed:         {type: Boolean , default: false},
    isOutForDelivery: {type: Boolean , default: false},									//true when out for delivery
    isDelivered:      {type: Boolean , default: false},
    isPaid:           {type: Boolean , default: false},
    orderDate:        { type: Date, default: Date.now },								//when order is placed
    deliveryDate:     { type: Date, default: Date.now },								//when delivered
    ratingToDelivery: {type: Number , default: 0, max: 5},						//rating given to delivery by customer
    ratingToVendor:   {type: Number , default: 0, max: 5}						//rating given to vendor by customer
    
});

module.exports = mongoose.model("Order", OrderSchema);