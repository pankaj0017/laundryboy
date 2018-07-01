var mongoose = require("mongoose");

var OrderSchema = mongoose.Schema({

	customer:         {type: mongoose.Schema.Types.ObjectId, ref: "Customer"},	 		//when order is placed
    vendor:           {type: mongoose.Schema.Types.ObjectId, ref: "Vendor"},			//when order is placed
    deliveryBoy:      {type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy"},		//when delivered
    cost:             {type: Number , default: 0},        
    pickUpKey:        {type: Number , default: 0},                                      //generated randomly when order is placed
    description:      {type: String , default: ''},
    status:           {type: String , default: 'booked'},           //booked, picked, washed, out, delivered,paid, terminated
    orderDate:        {type: Date, default: Date.now },								//when order is placed
    deliveryDate:     {type: Date, default: Date.now }								//when delivered
    
});

module.exports = mongoose.model("Order", OrderSchema);