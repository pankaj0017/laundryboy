var mongoose = require("mongoose");

var SingleServiceSchema = mongoose.Schema({

    amount        : {type: Number, default:  0 }, 
    totalClothes  : {type: Number, default:  0 },

});

module.exports = mongoose.model("SingleService", SingleServiceSchema);