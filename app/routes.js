// app/routes.js
module.exports = function(app, passport) {

    app.use(function(req, res, next){
        res.locals.user = req.user;
        next();
    });

    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/login', function(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        }
        else {
            res.render('login.ejs', { message: req.flash('loginMessage') }); 
        }
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

     app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                // if there are any errors, return the error
                if (err)
                    throw err;

                res.render('profile.ejs',{customer : customer});
            })
    });

    app.get('/update', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }).populate("history").exec(function(err, customer) {
                // if there are any errors, return the error
                if (err)
                    throw err;

                res.render('update.ejs',{customer : customer});
            })
    });
    app.post('/update', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                // if there are any errors, return the error
                if (err)
                    throw err;

                customer.name = req.body.customer.name;
                customer.pinCode = req.body.customer.pinCode;
                customer.address = req.body.customer.address;
                customer.save(function(err) {
                    if (err)
                        throw err;
                    res.redirect('/profile');
                });
            })
    });
    app.get('/update/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }).populate("numbers").exec(function(err, customer) {
                // if there are any errors, return the error
                if (err)
                    throw err;

                console.log("i am in get request /update/mobile  " + customer);
                res.render('mobile.ejs',{customer : customer});
            })
    });
    app.post('/update/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                // if there are any errors, return the error
                if (err)
                    throw err;

                Mobile.create(req.body.newMobile, function(err, newMobile){
                   if(err){
                       console.log(err);
                   } else {
                       
                       newMobile.owner    = customer._id;

                       newMobile.save();
                       customer.numbers.push(newMobile);
                       customer.save();

                       console.log(customer);

                       res.redirect('/update');
                   }
                });
            });
    });


    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { 
      scope : ['public_profile', 'email']
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/login'
        }));
    
    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/',
                    failureRedirect : '/login'
            }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}