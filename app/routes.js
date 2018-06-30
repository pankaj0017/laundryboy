// app/routes.js
module.exports = function(app, passport) {

    app.use(function(req, res, next){
        res.locals.user = req.user;
        next();
    });

    app.get('/', function(req, res) {
        if (isAdmin) {
            res.redirect("/admin");
        } else {
            res.render('index.ejs'); // load the index.ejs file
        }
    });

    app.get('/login', isLoggedOut, function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.post('/login', isLoggedOut, passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', isLoggedOut, function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', isLoggedOut, passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup/:id', isLoggedOut, function(req, res) {
        Customer.findById(req.params.id, function(err, foundCustomer){
            if(!foundCustomer) {
                res.redirect('/signup');
            } else {
                res.render("signuprefer", {customer: foundCustomer, message: req.flash('signupMessage')});
            }
        });
    });

    app.post('/signup/:id', isLoggedOut, passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // CUSTOMER ROUTES =====================
    // =====================================

    app.get('/profile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                // if there are any errors, return the error
                if (err)
                    throw err;

                res.render('customer/profile.ejs',{customer : customer});
            })
    });

    app.get('/update', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }).populate("history numbers").exec(function(err, customer) {
                // if there are any errors, return the error
                if (err)
                    throw err;

                res.render('customer/update.ejs',{customer : customer});
            })
    });
    app.post('/update', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                // if there are any errors, return the error
                if (err)
                    throw err;

                customer.name = req.body.customer.name;
                customer.pinCode = req.body.customer.pinCode;
                customer.mainNumber = req.body.customer.mainNumber;
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
                if (err)
                    throw err;
                res.render('customer/mobile.ejs',{customer : customer});
            })
    });
    app.post('/update/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
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
                       res.redirect('/update/mobile');
                   }
                });
            });
    });
    app.post('/update/mobile/:id', isLoggedIn, function(req, res){
       Mobile.findByIdAndRemove(req.params.id, function(err){
          if(err){
              throw err;
          } else {
              res.redirect("/update/mobile");
          }
       });
    });


    // =====================================
    // ADMIN ROUTES =====================
    // =====================================
    // route for changing database
    app.get('/admin', isAdmin, function(req, res) {
            res.render('admin/admin.ejs');
    });
    app.get('/admin/customer', isAdmin, function(req, res) {
            res.render('admin/customersection.ejs');
    });
    app.post('/admin/customer', isAdmin, function(req, res) {                    //send email to all customer
        res.redirect('admin/customer');
    });

    // =====================================
    // ADMIN CUSTOMER ROUTES =====================
    // =====================================
    // route for changing CUSTOMER database



    app.get('/admin/customerdetails/:id', isAdmin, function(req, res){
       Customer.findById(req.params.id, function(err, customer){
          if(err){
              throw err;
          } else {
              res.render('admin/customerdetail.ejs',{customer : customer});
          }
       });
    });
    app.post('/admin/customerdetails/:id', isAdmin, function(req, res){
       Customer.findById(req.params.id, function(err, foundCustomer){
          if(err){
              throw err;
          } else {
              foundCustomer.name = req.body.customer.name;
              foundCustomer.tagNumber = req.body.customer.tagNumber;
              foundCustomer.mainNumber = req.body.customer.mainNumber;
              foundCustomer.address = req.body.customer.address;
              foundCustomer.pinCode = req.body.customer.pinCode;
              foundCustomer.daysLeft = req.body.customer.daysLeft;
              foundCustomer.longClothes = req.body.customer.longClothes;
              foundCustomer.shortClothes = req.body.customer.shortClothes;
              foundCustomer.save();
              res.redirect('/admin/customerdetails/' + req.params.id
                );
          }
       });
    });

    app.post('/admin/customer/email', isAdmin, function(req, res) {

            User.findOne({ 'local.email' :  req.body.viaEmail }, function(err, foundUser) {
                if (err)
                    return done(err);

                if (foundUser) {

                    Customer.findOne({ 'user' :  foundUser._id }, function(err, customer) {
                        if (err)
                            throw err;
                        res.redirect('/admin/customerdetails/' + customer._id);
                    })
                } else {

                        User.findOne({ 'facebook.email' : req.body.viaEmail }, function(err, foundUser) {

                            if (err) throw err;

                            if (foundUser) {

                                Customer.findOne({ 'user' :  foundUser._id }, function(err, customer) {
                                    if (err)
                                        throw err;
                                    res.redirect('/admin/customerdetails/' + customer._id);
                                })

                            } else {

                                    User.findOne({ 'google.email' : req.body.viaEmail }, function(err, foundUser) {

                                        if (err) throw err;

                                        if (foundUser) {

                                            Customer.findOne({ 'user' :  foundUser._id }, function(err, customer) {
                                                if (err)
                                                    throw err;
                                                res.redirect('/admin/customerdetails/' + customer._id);
                                            })

                                        } else {  
     
                                            }
                                    });
                                }
                        });
                    }

            }); 
    });

    app.post('/admin/customer/tag', isAdmin, function(req, res) {
        Customer.findOne({ 'tagNumber' :  req.body.viaTag }, function(err, customer) {
            if (err)
                throw err;
            res.redirect('/admin/customerdetails/' + customer._id);
        })
    });
    app.post('/admin/customer/mobile', isAdmin, function(req, res) {
        Customer.findOne({ 'mainNumber' :  req.body.viaMobile }, function(err, customer) {
            if (err)
                throw err;
            res.redirect('/admin/customerdetails/' + customer._id);
        })
    });


    // =====================================
    // ADMIN PINCODE ROUTES =====================
    // =====================================
    // route for changing CUSTOMER database

    app.get('/admin/pincodes', isAdmin, function(req, res) {
        PinCode.find({}).populate("vendor deliveryBoy").exec(function(err, allPincodes) {
           if(err){
               console.log(err);
           } else {
              res.render("admin/pincode.ejs",{pincodes : allPincodes});
           }
        });
    });
    app.post('/admin/pincodes', isAdmin, function(req, res) {
        Vendor.findOne({ 'username' :  req.body.vendorTag }, function(err, foundVendor) {
            if (err)
                throw err;
            DeliveryBoy.findOne({ 'username' :  req.body.deliveryBoyTag }, function(err, foundDeliveryBoy) {
                if (err)
                    throw err;
                newPinCode = new PinCode();
                newPinCode.pinCode = req.body.pinCode;
                newPinCode.vendor = foundVendor._id;
                newPinCode.deliveryBoy = foundDeliveryBoy._id;
                newPinCode.save();
                res.redirect("/admin/pincodes");
            })
        })
    });
    app.post('/admin/pincodes/:id', isAdmin, function(req, res){
       PinCode.findByIdAndRemove(req.params.id, function(err){
          if(err){
              throw err;
          } else {
              res.redirect("/admin/pincodes");
          }
       });
    });



    // =====================================
    // ADMIN VENDOR ROUTES =================
    // =====================================
    // route for changing CUSTOMER database

    app.get('/admin/vendors', isAdmin, function(req, res) {
        Vendor.find({}, function(err, allVendors){
           if(err){
               console.log(err);
           } else {
                Vendor.count(function(error, vendorCount) {
                    res.render("admin/vendor.ejs",{vendors : allVendors, vendorCount : vendorCount + 1});
                });
           }
        });
    });
    app.post('/admin/vendors', isAdmin, function(req, res) {
        Vendor.create(req.body.newVendor, function(err, newVendor){
           if(err){
               console.log(err);
           } else {   
               res.redirect('/admin/vendors');
           }
        });
    });
    app.get('/admin/vendors/:id', isAdmin, function(req, res){
       Vendor.findById(req.params.id, function(err, vendor){
          if(err){
              throw err;
          } else {
              res.render('admin/vendordetail.ejs',{vendor : vendor});
          }
       });
    });
    app.post('/admin/vendors/:id', isAdmin, function(req, res){
       Vendor.findById(req.params.id, function(err, foundVendor){
          if(err){
              throw err;
          } else {
              foundVendor.name = req.body.vendor.name;
              foundVendor.username = req.body.vendor.username;
              foundVendor.password = req.body.vendor.password;
              foundVendor.address = req.body.vendor.address;
              foundVendor.email = req.body.vendor.email;
              foundVendor.mobile = req.body.vendor.mobile;
              foundVendor.save();
              res.redirect('/admin/vendors/' + req.params.id);
          }
       });
    });




    // =====================================
    // ADMIN DELIVERYBOY ROUTES =====================
    // =====================================
    // route for changing CUSTOMER database

    app.get('/admin/deliveryboys', isAdmin, function(req, res) {
        DeliveryBoy.find({}, function(err, allDeliveryBoys){
           if(err){
               console.log(err);
           } else {
                DeliveryBoy.count(function(error, deliveryBoyCount) {
                    res.render("admin/deliveryboy.ejs",{deliveryboys : allDeliveryBoys , deliveryBoyCount : deliveryBoyCount + 1});
                });
           }
        });
    });
    app.post('/admin/deliveryboys', isAdmin, function(req, res) {
        DeliveryBoy.create(req.body.newDeliveryBoy, function(err, newDeliveryBoy){
           if(err){
               console.log(err);
           } else {   
               res.redirect('/admin/deliveryboys');
           }
        });
    });
    app.get('/admin/deliveryboys/:id', isAdmin, function(req, res){
       DeliveryBoy.findById(req.params.id, function(err, deliveryboy){
          if(err){
              throw err;
          } else {
              res.render('admin/deliveryboydetail.ejs',{deliveryboy : deliveryboy});
          }
       });
    });
    app.post('/admin/deliveryboys/:id', isAdmin, function(req, res){
       DeliveryBoy.findById(req.params.id, function(err, foundDeliveryBoy){
          if(err){
              throw err;
          } else {
              foundDeliveryBoy.name = req.body.deliveryboy.name;
              foundDeliveryBoy.username = req.body.deliveryboy.username;
              foundDeliveryBoy.password = req.body.deliveryboy.password;
              foundDeliveryBoy.address = req.body.deliveryboy.address;
              foundDeliveryBoy.email = req.body.deliveryboy.email;
              foundDeliveryBoy.mobile = req.body.deliveryboy.mobile;
              foundDeliveryBoy.save();
              res.redirect('/admin/deliveryboys/' + req.params.id);
          }
       });
    });





    // =====================================
    // CLOTHES ROUTES =====================
    // =====================================
    // route for changing CLOTHE database
    app.get('/admin/clothes', isAdmin, function(req, res) {
        Clothe.find({}, function(err, allClothes){
           if(err){
               console.log(err);
           } else {
              res.render("admin/clothes.ejs",{clothes : allClothes});
           }
        });
    });
    app.post('/admin/clothes', isAdmin, function(req, res) {
        Clothe.create(req.body.newClothe, function(err, newClothe){
           if(err){
               console.log(err);
           } else {   
               res.redirect('/admin/clothes');
           }
        });
    });
    app.post('/admin/clothes/:id', isAdmin, function(req, res) {
        Clothe.findByIdAndRemove(req.params.id, function(err){
           if(err){
               console.log(err);
           } else {
              res.redirect("/admin/clothes");
           }
        });
    });


    // =====================================
    // ORDER ROUTES =====================
    // =====================================

    app.get('/pincode', isLoggedIn, function(req, res) {
        res.render('order/pincode.ejs', { message: req.flash('yoyo', 'pincode unavailibility.') }); 
    });
    app.post('/pincode', isLoggedIn, function(req, res) {
        PinCode.findOne({ 'pinCode' :  req.body.pincode }, function(err, foundPinCode) {
                if (err)
                    throw err;
                if (foundPinCode) {
                    Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                        if (err)
                            throw err;
                        customer.pinCode = req.body.pincode;
                        customer.save(function(err) {   
                            if (err)
                                throw err;
                            res.redirect('/contact');
                        });
                    })
                } else {
                    res.redirect("/pincode");
                }
            })
    });

    app.get('/contact', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }).populate("numbers").exec(function(err, customer) {
                if (err)
                    throw err;
                if (customer.mainNumber) {
                    res.render('order/contact.ejs',{customer : customer});
                } else {
                    res.redirect("/contact/mobile");
                }
            })
    });
    app.post('/contact', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    throw err;
                customer.mainNumber = req.body.mobile;
                customer.save(function(err) {   
                    if (err)
                        throw err;
                    res.redirect('/order');
                });
            })
    });

    app.get('/contact/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    throw err;
                res.render('order/mobile.ejs',{customer : customer});
            })
    });
    app.post('/contact/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    throw err;
                Mobile.create(req.body.newMobile, function(err, newMobile){
                   if(err){
                       console.log(err);
                   } else {   
                       newMobile.owner    = customer._id;
                       newMobile.save();
                       customer.mainNumber = newMobile.number;
                       customer.numbers.push(newMobile);
                       customer.save();
                       res.redirect('/order');
                   }
                });
            });
    });


    app.get('/order', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    throw err;
                res.render("order/order.ejs",{customer : customer});
            })
    });

    app.post('/order', isLoggedIn, function(req, res) {
        res.redirect("/order");
    });

    // app.get('/order', isLoggedIn, function(req, res) {
    //     Clothe.find({}, function(err, allClothes){
    //        if(err){
    //            console.log(err);
    //        } else {
    //           res.render("order/order.ejs",{clothes : allClothes});
    //        }
    //     });
    // });
    // app.post('/order',function(req, res) {
    //     Clothe.find({}, function(err, clothes){
    //        if(err){
    //            throw err;
    //        } else {
    //             var summary = "";
    //             clothes.forEach(function(clothe){ 
    //                 if(req.body[clothe.name] != 0) {
    //                     summary = summary + clothe.name + ' * ' + req.body[clothe.name] + ' ';
    //             }});
    //             var getOrder = new Order();
    //             getOrder.description = summary;
    //             getOrder.save(function(err) {
    //                 if (err)
    //                     throw err;
    //                 res.redirect('/order');
    //             });
    //        }
    //     });
    // });


    
    


















































    // =====================================
    // VENDOR ROUTES =====================
    // =====================================


    app.get('/vendorlogin', function(req, res) {
            res.render('vendor/vendorlogin.ejs');
    });

    app.post('/vendorlogin', function(req, res) {
        Vendor.findOne({ 'username' :  req.body.tag }, function(err, vendor) {
            if (err)
                throw err;
            if(vendor) {
                if(req.body.password == vendor.password) {
                    res.redirect('/vendor/' + vendor._id);
                } else {
                    res.redirect('/vendorlogin');
                }
            } else {
                res.redirect('/vendorlogin');
            }
        })
    });

    app.get('/vendor/:id', function(req, res){
       Vendor.findById(req.params.id, function(err, vendor){
          if(err){
              throw err;
          } else {
              res.render('vendorpage.ejs',{vendor : vendor});
          }
       });
    });
    app.post('/vendor/:id', function(req, res){
       Vendor.findById(req.params.id, function(err, foundVendor){
          if(err){
              throw err;
          } else {
              res.redirect('/vendor/' + req.params.id);
          }
       });
    });


    // =====================================
    // DELIVERYBOY ROUTES =====================
    // =====================================


    app.get('/deliveryboylogin', function(req, res) {
            res.render('deliveryboy/deliveryboylogin.ejs');
    });

    app.post('/deliveryboylogin', function(req, res) {
        DeliveryBoy.findOne({ 'username' :  req.body.tag }).populate("toDeliver").exec(function(err, deliveryboy) {
            if (err)
                throw err;
            if(vendor) {
                if(req.body.password == deliveryboy.password) {
                    res.redirect('/deliveryboy/' + deliveryboy._id);
                } else {
                    res.redirect('/deliveryboylogin');
                }
            } else {
                res.redirect('/deliveryboylogin');
            }
        })
    });

    app.get('/deliveryboy/:id', function(req, res){
       DeliveryBoy.findById(req.params.id, function(err, deliveryboy){
          if(err){
              throw err;
          } else {
              res.render('deliveryboypage.ejs',{deliveryboy : deliveryboy});
          }
       });
    });
    app.post('/deliveryboy/:id', function(req, res){
       DeliveryBoy.findById(req.params.id, function(err, foundDeliveryBoy){
          if(err){
              throw err;
          } else {
              res.redirect('/deliveryboy/' + req.params.id);
          }
       });
    });

    

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', isLoggedOut, passport.authenticate('facebook', { 
      scope : ['public_profile', 'email']
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', isLoggedOut,
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
    app.get('/auth/google', isLoggedOut, passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback', isLoggedOut,
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
function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated())
        return next();
    res.redirect('/profile');
}
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.local.email == "pkj0017@gmail.com")
        return next();
    res.redirect('/login');
}


//AIzaSyARATL5BzsQmYSh8oRM4ZfsFvgRiiSz6oA