var mongoose = require("mongoose");

var clotheSchema = mongoose.Schema({

    name    		  : {type: String , default: ''},
    category  		  : {type: String , default: ''},
    price     		  : {type: Number, default:  0 },
    priceWithoutIron  : {type: Number, default:  0 }

});

module.exports = mongoose.model("Clothe", clotheSchema);