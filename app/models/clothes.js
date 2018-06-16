var mongoose = require("mongoose");

var clotheSchema = mongoose.Schema({

    name      : {type: String , default: ''},
    category  : {type: String , default: ''},
    image     : {type: String , default: ''},
    price     : {type: Number, default:  0 },
    ironCost  : {type: Number, default:  0 }

});

module.exports = mongoose.model("Clothe", clotheSchema);