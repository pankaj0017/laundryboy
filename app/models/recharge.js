var mongoose = require("mongoose");

var RechargeSchema = new mongoose.Schema({
	deliveryBoy  : {type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy"},
	customer     : {type: mongoose.Schema.Types.ObjectId, ref: "Customer"},
    amount       : {type: Number , default: 0},
    rechargeDate : {type: Date, default: Date.now }
});

module.exports = mongoose.model("Recharge", RechargeSchema);