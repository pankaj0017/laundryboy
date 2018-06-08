var mongoose = require("mongoose");

var clotheSchema = mongoose.Schema({

    type      : {type: String , default: ''},
    price     : {type: Number, default:  0 }

});

module.exports = mongoose.model("Clothe", clotheSchema);