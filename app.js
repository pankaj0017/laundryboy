var express        = require("express"),
    app            = express(),
    port           = process.env.PORT || 8080;
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    session        = require('express-session'),
    User           = require('./app/models/user'),
    Customer       = require('./app/models/customer'),
    Mobile         = require('./app/models/mobile'),
    Order          = require("./app/models/order"),
    Vendor         = require("./app/models/vendor"),
    DeliveryBoy    = require("./app/models/deliveryboy"),
    Clothe         = require("./app/models/clothes"),
    PinCode        = require("./app/models/pincode"),
    Plan           = require("./app/models/plan"),
    Recharge       = require("./app/models/recharge"),
    methodOverride = require("method-override"),
    morgan         = require("morgan"),
    cookieParser   = require('cookie-parser'),
    flash          = require('connect-flash'),
    rn             = require('random-number');

mongoose.connect("mongodb://localhost/laundrybuoy");
//db.mycollection.remove( {name:"stack"} )


app.use(morgan('dev'));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");


app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session

require('./config/passport')(passport); // pass passport for configuration

require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


app.listen(port, function(){
   console.log("The LaundryBuoy Server Has Started!");
});