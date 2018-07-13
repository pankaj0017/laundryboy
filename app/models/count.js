var mongoose = require("mongoose");

var CountSchema = new mongoose.Schema({
    customerCount : {type: Number, default:  0 }
});

module.exports = mongoose.model("Count", CountSchema);