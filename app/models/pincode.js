var mongoose = require("mongoose");

var PinCodeSchema = new mongoose.Schema({
    pinCode   : {type: Number, default:  0 },
    vendor    : {type: mongoose.Schema.Types.ObjectId, ref: "Vendor"}
});

module.exports = mongoose.model("PinCode", PinCodeSchema);