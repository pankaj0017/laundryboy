var mongoose = require("mongoose");

var PinCodeSchema = new mongoose.Schema({
    pinCode    : {type: Number, default:  110042 },
    vendor     : {type: mongoose.Schema.Types.ObjectId, ref: "Vendor"},
    deliveryBoy: {type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy"}
});

module.exports = mongoose.model("PinCode", PinCodeSchema);