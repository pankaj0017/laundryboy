var mongoose = require("mongoose");

var LaundryBoySchema = new mongoose.Schema({
    username:     {type: String , default: ''},
    password:     {type: String , default: ''},
    name:         {type: String , default: ''},
    email: 	      {type: String , default: ''},
    address:      {type: String , default: ''},
    mobile:       {type: String , default: ''},
});

module.exports = mongoose.model("LaundryBoy", LaundryBoySchema);