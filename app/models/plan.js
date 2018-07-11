var mongoose = require("mongoose");

var PlanSchema = new mongoose.Schema({
    amount       : {type: Number, default:  0 }, 
    validity     : {type: Number, default:  0 },
    longClothes  : {type: Number, default:  0 },
    shortClothes : {type: Number, default:  0 }
});

module.exports = mongoose.model("Plan", PlanSchema);