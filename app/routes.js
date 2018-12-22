// app/routes.js
module.exports = function(app, passport) {

    app.use(function(req, res, next){
        res.locals.user = req.user;
        next();
    });

    app.get('/', function(req, res) {
        if (req.isAuthenticated() && req.user.local.email == "9911692428") {
            res.redirect("/admin");
        } else {
          Plan.find({}, function(err, plans) {
            SingleService.find({}, function(err, singleservices) {

              res.render('index.ejs', {plans : plans, singleservices : singleservices});
            })
          })
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
                req.flash('signupMessage', 'Wrong Refer ID');
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
        Customer.findOne({ 'user' :  req.user._id }).populate("history numbers currentRecharges").exec(function(err, customer) {
            // if there are any errors, return the error
            if (err)
                console.log(err),res.redirect('/logout');

            res.render('customer/profile.ejs',{customer : customer});
        })
    });

    app.get('/update', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }).populate("numbers").exec(function(err, customer) {
            // if there are any errors, return the error
            if (err)
                console.log(err),res.redirect('/logout');

            res.render('customer/update.ejs',{customer : customer});
        })
    });
    app.post('/update', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
            // if there are any errors, return the error
            if (err)
                console.log(err),res.redirect('/logout');

            customer.name = req.body.customer.name;
            customer.pinCode = req.body.customer.pinCode;
            customer.mainNumber = req.body.customer.mainNumber;
            customer.address = req.body.customer.address;
            customer.save(function(err) {   
                if (err)
                    console.log(err),res.redirect('/logout');
                res.redirect('/profile');
            });
        })
    });
    app.get('/update/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }).populate("numbers").exec(function(err, customer) {
                if (err)
                    console.log(err),res.redirect('/logout');
                res.render('customer/mobile.ejs',{customer : customer, message: req.flash('addMobileMessage')});
            })
    });
    app.post('/update/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
              if (err)
                  console.log(err),res.redirect('/logout');
              Mobile.findOne({ 'number' :  req.body.newMobile.number }, function(err, mobile) {
                  if (err)
                      console.log(err),res.redirect('/logout');
                  if (mobile) {
                    req.flash('addMobileMessage', 'Mobile Number already in use');
                    res.redirect('/update/mobile');
                  } else {
                    Mobile.create(req.body.newMobile, function(err, newMobile){
                       if(err){
                           console.log(err);
                       } else {   
                           newMobile.owner    = customer._id;
                           newMobile.save();
                           customer.mainNumber = req.body.newMobile.number;
                           customer.numbers.push(newMobile);
                           customer.save();
                           res.redirect('/profile');
                       }
                    });
                  }
              })
        });
    });
    app.get('/update/mobile/:id', isLoggedIn, function(req, res){
       Mobile.findByIdAndRemove(req.params.id, function(err){
          if(err){
              console.log(err),res.redirect('/logout');
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

    // =====================================
    // ADMIN ORDER ROUTES =====================
    // =====================================
    // route for changing CUSTOMER database

    app.get('/admin/order', isAdmin, function(req, res) {
            res.render('admin/ordersection.ejs');
    });

    app.post('/admin/order', isAdmin, function(req, res) {
      Order.findById(req.body.viaID, function(err, order) {
            if (err)
                console.log(err),res.redirect('/logout');
            if (order) {
              res.redirect('/admin/order/' + order._id);
            } else {
              res.redirect('/admin/order');
            }
        })
    });

    app.get('/admin/order/:id', isAdmin, function(req, res) {
      Order.findById(req.params.id).populate("customer deliveryBoy vendor").exec(function(err, order) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (order) {
              res.render('admin/orderdetail.ejs',{order : order});
          } else {
            res.redirect('/admin/order');
          }
       });
    });

    app.post('/admin/order/:id', isAdmin, function(req, res) {
      Order.findById(req.params.id).populate("customer deliveryBoy vendor").exec(function(err, order) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (order) { 
              order.cost = req.body.order.cost;
              order.description = req.body.order.description;
              order.rating = req.body.order.rating;
              if(req.body.radiopaid == "no") {
                order.isPaid = false;
              } else {
                order.isPaid = true;
              }
              if(req.body.radioiron == "no") {
                order.onlyIron = false;
              } else {
                order.onlyIron = true;
              }
              order.status = req.body.radiostatus;
              order.save();
              res.redirect('/admin/order/' + req.params.id);
          } else {
            res.redirect('/admin/order');
          }
       });
    });

    app.get('/admin/allorder', isAdmin, function(req, res) {
      Order.find({}).populate("customer deliveryBoy vendor").exec(function(err, allOrder) {
            if (err)
                console.log(err),res.redirect('/logout');
            if (allOrder) {
              res.render('admin/allorder.ejs',{allOrder : allOrder});
            } else {
              res.redirect('/admin/order');
            }
        })
    });
    app.get('/admin/currentorder', isAdmin, function(req, res) {
      Order.find({}).populate("customer deliveryBoy vendor").exec(function(err, allOrder) {
            if (err)
                console.log(err),res.redirect('/logout');
            if (allOrder) {
              res.render('admin/currentorder.ejs',{allOrder : allOrder});
            } else {
              res.redirect('/admin/order');
            }
        })
    });

    app.get('/admin/allorder/delete', isAdmin, function(req, res) {
      Order.find({}).populate("customer deliveryBoy vendor").exec(function(err, allOrder) {
            if (err)
                console.log(err),res.redirect('/logout');
            if (allOrder) {
              allOrder.forEach(function(order){ if(order.status == 'delivered' || order.status == 'terminated') {
                console.log("Deleting order = " + order.status);
                Order.findByIdAndRemove(order._id, function(err){
                    if(err){
                        console.log(err),res.redirect('/logout');
                    }
                 });
              }});
              res.redirect('/admin/allorder');
            } else {
              res.redirect('/admin/order');
            }
        })
    });


    // =====================================
    // ADMIN CUSTOMER ROUTES =====================
    // =====================================
    // route for changing CUSTOMER database

    app.get('/admin/customer', isAdmin, function(req, res) {
        res.render('admin/customersection.ejs');
    });

    app.get('/admin/customerdetails/:id', isAdmin, function(req, res){
       Customer.findById(req.params.id).populate("numbers").exec(function(err, customer) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (customer) {
              res.render('admin/customerdetail.ejs',{customer : customer});
          } else {
            res.redirect('/admin/customer');
          }
       });
    });
    app.post('/admin/customerdetails/:id', isAdmin, function(req, res){
       Customer.findById(req.params.id, function(err, foundCustomer){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (foundCustomer) {

              foundCustomer.name = req.body.customer.name;
              foundCustomer.address = req.body.customer.address;
              foundCustomer.pinCode = req.body.customer.pinCode;
              foundCustomer.daysLeft = req.body.customer.daysLeft;
              foundCustomer.longClothes = req.body.customer.longClothes;
              foundCustomer.shortClothes = req.body.customer.shortClothes;
              if(req.body.radiobusy == "no") {
                  foundCustomer.isBusy = false;
                } else {
                  foundCustomer.isBusy = true;
                }
              foundCustomer.save();
              res.redirect('/admin/customerdetails/' + req.params.id);
          } else {
            res.redirect('/admin/customer');
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
                            console.log(err),res.redirect('/logout');
                        res.redirect('/admin/customerdetails/' + customer._id);
                    })
                } else {

                        User.findOne({ 'facebook.email' : req.body.viaEmail }, function(err, foundUser) {

                            if (err) console.log(err),res.redirect('/logout');

                            if (foundUser) {

                                Customer.findOne({ 'user' :  foundUser._id }, function(err, customer) {
                                    if (err)
                                        console.log(err),res.redirect('/logout');
                                    res.redirect('/admin/customerdetails/' + customer._id);
                                })

                            } else {

                                    User.findOne({ 'google.email' : req.body.viaEmail }, function(err, foundUser) {

                                        if (err) console.log(err),res.redirect('/logout');

                                        if (foundUser) {

                                            Customer.findOne({ 'user' :  foundUser._id }, function(err, customer) {
                                                if (err)
                                                    console.log(err),res.redirect('/logout');
                                                res.redirect('/admin/customerdetails/' + customer._id);
                                            })

                                        } else {  
                                              res.redirect('/admin/customer');
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
                console.log(err),res.redirect('/logout');
            if (customer) {
              res.redirect('/admin/customerdetails/' + customer._id);
            } else {
              res.redirect('/admin/customer');
            }
        })
    });
    app.post('/admin/customer/cid', isAdmin, function(req, res) {

        res.redirect('/admin/customerdetails/' + req.body.viaID);

    });
    app.post('/admin/customer/mobile', isAdmin, function(req, res) {
        Mobile.findOne({ 'number' :  req.body.viaMobile }, function(err, mobile) {
            if (err)
                console.log(err),res.redirect('/logout');
            if (mobile) {
              res.redirect('/admin/customerdetails/' + mobile.owner);
            } else {
              res.redirect('/admin/customer');
            }
        })
    });
    app.post('/admin/customer/mobiledelete', isAdmin, function(req, res) {
        Mobile.findOne({ 'number' :  req.body.deleteMobile }, function(err, mobile) {
            if (err)
                console.log(err),res.redirect('/logout');
            if (mobile) {
              Mobile.findByIdAndRemove(mobile._id, function(err){
                  if(err){
                      console.log(err),res.redirect('/logout');
                  } else {
                      res.redirect('/admin/customer');
                  }
               });
            } else {
              res.redirect('/admin/customer');
            }
        })
    });


    // =====================================
    // ADMIN PINCODE ROUTES =====================
    // =====================================
    // route for changing CUSTOMER database

    app.get('/admin/pincodes', isAdmin, function(req, res) {
        PinCode.find({}).populate("vendor deliveryBoy").exec(function(err, allPincodes) {
           if(err){
               console.log(err),res.redirect('/logout');
           } else {
              res.render("admin/pincode.ejs",{pincodes : allPincodes});
           }
        });
    });
    app.post('/admin/pincodes', isAdmin, function(req, res) {
        Vendor.findOne({ 'username' :  req.body.vendorTag }, function(err, foundVendor) {
            if (err) {
              console.log(err),res.redirect('/logout');
            } else if (foundVendor) {

              DeliveryBoy.findOne({ 'username' :  req.body.deliveryBoyTag }, function(err, foundDeliveryBoy) {
                  if (err) {
                      console.log(err),res.redirect('/logout');
                  } else if (foundDeliveryBoy) {

                    newPinCode = new PinCode();
                    newPinCode.pinCode = req.body.pinCode;
                    newPinCode.vendor = foundVendor._id;
                    newPinCode.deliveryBoy = foundDeliveryBoy._id;
                    newPinCode.save();
                    res.redirect("/admin/pincodes");

                  } else {
                    res.redirect("/admin/pincodes");
                  }
              })

            } else {
              res.redirect("/admin/pincodes");
            }
        })
    });
    app.post('/admin/pincodes/:id', isAdmin, function(req, res){
       PinCode.findByIdAndRemove(req.params.id, function(err){
          if(err){
              console.log(err),res.redirect('/logout');
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
               console.log(err),res.redirect('/logout');
           } else {
              Vendor.count(function(error, vendorCount) {
                  res.render("admin/vendor.ejs",{vendors : allVendors, vendorCount : vendorCount + 1});
              });
           }
        });
    });
    app.post('/admin/vendors', isAdmin, function(req, res) {
        Vendor.create(req.body.newVendor, function(err, newVendor){
           if(err) {
               console.log(err),res.redirect('/logout');
           } else {
               res.redirect('/admin/vendors');
           }
        });
    });
    app.get('/admin/vendors/:id', isAdmin, function(req, res){
       Vendor.findById(req.params.id, function(err, vendor){
          if(err) {
              console.log(err),res.redirect('/logout');
          } else if (vendor) {
              res.render('admin/vendordetail.ejs',{vendor : vendor});
          } else {
            res.redirect('/admin/vendors');
          }
       });
    });
    app.post('/admin/vendors/:id', isAdmin, function(req, res){
       Vendor.findById(req.params.id, function(err, foundVendor){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (foundVendor) {
              foundVendor.name = req.body.vendor.name;
              foundVendor.username = req.body.vendor.username;
              foundVendor.password = req.body.vendor.password;
              foundVendor.address = req.body.vendor.address;
              foundVendor.email = req.body.vendor.email;
              foundVendor.mobile = req.body.vendor.mobile;
              foundVendor.save();
              res.redirect('/admin/vendors/' + req.params.id);
          } else {
              res.redirect('/admin/vendors');
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
               console.log(err),res.redirect('/logout');
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
               console.log(err),res.redirect('/logout');
           } else {   
               res.redirect('/admin/deliveryboys');
           }
        });
    });
    app.get('/admin/deliveryboys/:id', isAdmin, function(req, res){
       DeliveryBoy.findById(req.params.id, function(err, deliveryboy){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (deliveryboy) {
              res.render('admin/deliveryboydetail.ejs',{deliveryboy : deliveryboy});
          } else {
              res.redirect('/admin/deliveryboys');
          }
       });
    });
    app.post('/admin/deliveryboys/:id', isAdmin, function(req, res){
       DeliveryBoy.findById(req.params.id, function(err, foundDeliveryBoy){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (foundDeliveryBoy) {
              foundDeliveryBoy.name = req.body.deliveryboy.name;
              foundDeliveryBoy.username = req.body.deliveryboy.username;
              foundDeliveryBoy.password = req.body.deliveryboy.password;
              foundDeliveryBoy.address = req.body.deliveryboy.address;
              foundDeliveryBoy.email = req.body.deliveryboy.email;
              foundDeliveryBoy.mobile = req.body.deliveryboy.mobile;
              foundDeliveryBoy.save();
              res.redirect('/admin/deliveryboys/' + req.params.id);
          } else {
              res.redirect('/admin/deliveryboys');
          }
       });
    });





    // =====================================
    // ADMIN CLOTHES ROUTES =====================
    // =====================================
    // route for changing CLOTHE database
    app.get('/admin/clothes', isAdmin, function(req, res) {
        Clothe.find({}, function(err, allClothes){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {
              res.render("admin/clothes.ejs",{clothes : allClothes});
           }
        });
    });
    app.post('/admin/clothes', isAdmin, function(req, res) {
        Clothe.create(req.body.newClothe, function(err, newClothe){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {   
               res.redirect('/admin/clothes');
           }
        });
    });
    app.post('/admin/clothes/:id', isAdmin, function(req, res) {
        Clothe.findByIdAndRemove(req.params.id, function(err){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {
              res.redirect("/admin/clothes");
           }
        });
    });

    // =====================================
    // ADMIN PLAN ROUTES ===================
    // =====================================
    // route for changing PLAN database

    app.get('/admin/plans', isAdmin, function(req, res) {
        Plan.find({}, function(err, allPlans){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {
              res.render("admin/plan.ejs",{plans : allPlans});
           }
        });
    });
    app.post('/admin/plans', isAdmin, function(req, res) {
        Plan.create(req.body.newPlan, function(err, newPlan){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {   
               res.redirect('/admin/plans');
           }
        });
    });
    app.post('/admin/plans/:id', isAdmin, function(req, res) {
        Plan.findByIdAndRemove(req.params.id, function(err){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {
              res.redirect("/admin/plans");
           }
        });
    });


    // =====================================
    // ADMIN SINGLE SERVICE ROUTES =========
    // =====================================
    // route for changing SINGLE SERVICE database

    app.get('/admin/singleservices', isAdmin, function(req, res) {
        SingleService.find({}, function(err, allSingleServices){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {
              res.render("admin/singleservice.ejs",{singleServices : allSingleServices});
           }
        });
    });
    app.post('/admin/singleservices', isAdmin, function(req, res) {
        SingleService.create(req.body.newSingleService, function(err, newSingleService){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {   
               res.redirect('/admin/singleservices');
           }
        });
    });
    app.post('/admin/singleservices/:id', isAdmin, function(req, res) {
        SingleService.findByIdAndRemove(req.params.id, function(err){
           if(err){
               console.log(err),res.redirect('/logout');
           } else {
              res.redirect("/admin/singleservices");
           }
        });
    });


    // =====================================
    // ORDER ROUTES ========================
    // =====================================

    app.get('/pincode', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    console.log(err),res.redirect('/logout');
                res.render('order/pincode.ejs', { customer : customer, message: req.flash('pincodeAvailability') }); 
            })
    });
    app.post('/pincode', isLoggedIn, function(req, res) {
        PinCode.findOne({ 'pinCode' :  req.body.pincode }, function(err, foundPinCode) {
                if (err)
                    console.log(err),res.redirect('/logout');
                if (foundPinCode) {
                    Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                        if (err)
                            console.log(err),res.redirect('/logout');
                        customer.pinCode = req.body.pincode;
                        customer.save(function(err) { 
                            if (err)
                                console.log(err),res.redirect('/logout');
                        });
                        res.redirect('/contact');
                    })
                } else {
                    req.flash('pincodeAvailability', 'Our Services Are Not There Yet!');
                    res.redirect("/pincode");
                }
            })
    });

    app.get('/contact', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }).populate("numbers").exec(function(err, customer) {
                if (err)
                    console.log(err),res.redirect('/logout');
                res.render('order/contact.ejs',{customer : customer});
            })
    });
    app.post('/contact', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    console.log(err),res.redirect('/logout');
                customer.mainNumber = req.body.mobile;
                customer.save();
                res.redirect('/order');
            })
    });

    app.get('/contact/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    console.log(err),res.redirect('/logout');
                res.render('order/mobile.ejs',{customer : customer, message : req.flash('addMobileMessage')});
            })
    });
    app.post('/contact/mobile', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
              if (err)
                  console.log(err),res.redirect('/logout');
              Mobile.findOne({ 'number' :  req.body.newMobile.number }, function(err, mobile) {
                  if (err)
                      console.log(err),res.redirect('/logout');
                  if (mobile) {
                    req.flash('addMobileMessage', 'Mobile Number Already Taken');
                    res.redirect('/contact/mobile');
                  } else {
                    Mobile.create(req.body.newMobile, function(err, newMobile){
                       if(err){
                           console.log(err);
                       } else {   
                           newMobile.owner = customer._id;
                           newMobile.save();
                           customer.mainNumber = newMobile.number;
                           customer.numbers.push(newMobile);
                           customer.save();
                           res.redirect('/order');
                       }
                    });
                  }
              })
        });
    });


    app.get('/order', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
            if (err)
                console.log(err),res.redirect('/logout');
            res.render("order/order.ejs",{customer : customer, message : req.flash('customerOrderMessage')});
        })
    });

    app.post('/order', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    console.log(err),res.redirect('/logout');
                if (customer.isBusy) {
                    req.flash('customerOrderMessage', 'Please Wait Till Your Order Completed');
                    res.redirect("/order");
                } else {

                    customer.address = req.body.customer.address;
                    customer.isBusy = true;
                    var options = {
                      min:  1000,
                      max:  9999,
                      integer: true
                    }
                    customer.pickUpKey = rn(options);

                    customer.save(function(err) {   
                        if (err)
                            console.log(err),res.redirect('/logout');
                    });

                    var newOrder = new Order();
                    newOrder.customer = customer._id;
                    PinCode.findOne({ 'pinCode' :  customer.pinCode }, function(err, foundPinCode) {
                        if (err)
                            console.log(err),res.redirect('/logout');
                        DeliveryBoy.findById(foundPinCode.deliveryBoy, function(err, foundDeliveryBoy) {
                            if (err)
                                console.log(err),res.redirect('/logout');
                            Vendor.findById(foundPinCode.vendor, function(err, foundVendor) {
                                if (err)
                                    console.log(err),res.redirect('/logout');

                                newOrder.deliveryBoy = foundDeliveryBoy._id;
                                newOrder.vendor = foundVendor._id;
                                newOrder.status = "booked";
                                newOrder.save();
                                foundDeliveryBoy.currentOrders.push(newOrder);
                                foundVendor.currentOrders.push(newOrder);
                                customer.history.push(newOrder);
                                customer.save();
                                foundDeliveryBoy.save();
                                foundVendor.save();
                                req.flash('customerOrderMessage', 'Your pickup has been scheduled');
                                res.redirect("/order");
                            })
                        })                 
                    })
                }
            })
    });

    app.get('/order/:id/cancel', isLoggedIn, function(req, res) {
        Customer.findOne({ 'user' :  req.user._id }, function(err, customer) {
                if (err)
                    console.log(err),res.redirect('/logout');
            Order.findById(req.params.id, function(err, order){

              if (order && order.status == 'booked') {
                order.status = 'terminated';
                customer.isBusy = false;
                var options = {
                      min:  1000,
                      max:  9999,
                      integer: true
                    }
                customer.pickUpKey = rn(options);
                order.save();
                customer.save();
              }
            })
            res.redirect('/profile');
        })
    });



    // =====================================
    // VENDOR ROUTES =====================
    // =====================================


    app.get('/vendorlogin', function(req, res) {
            res.render('vendor/vendorlogin.ejs', { message: req.flash('vendormessage') });
    });

    app.post('/vendorlogin', function(req, res) {
        Vendor.findOne({ 'username' :  req.body.tag }, function(err, vendor) {
            if (err)
                console.log(err),res.redirect('/logout');
            if(vendor) {
                if(req.body.password == vendor.password) {
                    res.redirect('/vendor/' + vendor._id);
                } else {
                    req.flash('vendormessage', 'Wrong Password');
                    res.redirect('/vendorlogin');
                }
            } else {
                req.flash('vendormessage', 'Incorrect Username');
                res.redirect('/vendorlogin');
            }
        })
    });

    app.get('/vendor/:id', function(req, res){
       Vendor.findById(req.params.id).deepPopulate("currentOrders.customer").exec(function(err, vendor) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (vendor) {
              res.render('vendor/vendorpage.ejs',{vendor : vendor});
          } else {
              req.flash('vendormessage', 'Incorrect Username');
              res.redirect('/vendorlogin');
          }
       });
    });

    app.get('/vendor/:id/received/:oid', function(req, res){
       Order.findById(req.params.oid, function(err, getOrder){
          if(err) {
              console.log(err),res.redirect('/logout');
          } else if (getOrder && getOrder.vendor == req.params.id) {

            if (getOrder.onlyIron) {
              getOrder.status = "washed";
            } else {
              getOrder.status = "received";
            }
            getOrder.save(function(err) { 
                if (err)
                    console.log(err),res.redirect('/logout');
            });
            res.redirect('/vendor/' + req.params.id);
          } else {
            res.redirect('/vendorlogin');
          }
       });
    });

    app.get('/vendor/:id/washed/:oid', function(req, res){
       Order.findById(req.params.oid, function(err, getOrder){
          if(err) {
              console.log(err),res.redirect('/logout');
          } else if (getOrder && getOrder.vendor == req.params.id) {

            getOrder.status = "washed";
            getOrder.save(function(err) { 
                if (err)
                    console.log(err),res.redirect('/logout');

            });
            res.redirect('/vendor/' + req.params.id);
          } else {
            res.redirect('/vendorlogin');
          }
       });
    });

    app.get('/vendor/:id/ironed/:oid', function(req, res){
       Order.findById(req.params.oid, function(err, getOrder){
          if(err) {
              console.log(err),res.redirect('/logout');
          } else if (getOrder && getOrder.vendor == req.params.id) {

            getOrder.status = "ironed";
            getOrder.save(function(err) { 
                if (err)
                    console.log(err),res.redirect('/logout');

            });
            res.redirect('/vendor/' + req.params.id);
          } else {
            res.redirect('/vendorlogin');
          }
       });
    });


    // =====================================
    // DELIVERYBOY ROUTES ==================
    // =====================================


    app.get('/deliveryboylogin', function(req, res) {
            res.render('deliveryboy/deliveryboylogin.ejs', { message: req.flash('laundrymessage') });
    });

    app.post('/deliveryboylogin', function(req, res) {
        DeliveryBoy.findOne({ 'username' :  req.body.tag }, function(err, deliveryboy) {
            if (err)
                console.log(err),res.redirect('/logout');
            if(deliveryboy) {
                if(req.body.password == deliveryboy.password) {
                    res.redirect('/deliveryboy/' + deliveryboy._id);
                } else {
                    req.flash('laundrymessage', 'Wrong Password');
                    res.redirect('/deliveryboylogin');
                }
            } else {
                req.flash('laundrymessage', 'Incorrect Username');
                res.redirect('/deliveryboylogin');
            }
        })
    });

    app.get('/deliveryboy/:id', function(req, res){
       DeliveryBoy.findById(req.params.id).deepPopulate("currentOrders.customer").exec(function(err, deliveryboy) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (deliveryboy) {
              res.render('deliveryboy/deliveryboypage.ejs',{deliveryboy : deliveryboy});
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    app.get('/deliveryboy/:id/pickup/:oid', function(req, res){
       Order.findById(req.params.oid).populate("deliveryBoy customer").exec(function(err, order){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (order && order.deliveryBoy._id == req.params.id) {

            Clothe.find({}, function(err, allClothes){
               if(err){
                   console.log(err);
               } else {
                    res.render('deliveryboy/pickuppage.ejs',{order : order , clothes : allClothes, message: req.flash('info') });
               }
            });

          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    app.get('/deliveryboy/:id/pickup/:oid/onlyiron', function(req, res){
       Order.findById(req.params.oid).populate("deliveryBoy customer").exec(function(err, order){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (order && order.deliveryBoy._id == req.params.id) {

            Clothe.find({}, function(err, allClothes){
               if(err){
                   console.log(err);
               } else {
                    res.render('deliveryboy/pickuppageonlyiron.ejs',{order : order , clothes : allClothes, message: req.flash('info') });
               }
            });
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });


    app.post('/deliveryboy/:id/pickup/:oid', function(req, res){
       Order.findById(req.params.oid).populate("deliveryBoy customer").exec(function(err, getOrder){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (getOrder && getOrder.deliveryBoy._id == req.params.id) {

            if (req.body.password == getOrder.deliveryBoy.password) {

                if (req.body.customerKey == getOrder.customer.pickUpKey) {

                    Clothe.find({}, function(err, clothes){ 
                       if(err){
                           console.log(err),res.redirect('/logout');
                       } else {
                            var summary = "";
                            var calculateCost = 0, longgiven = 0, shortgiven = 0;
                            if (req.body.onlyIron) {

                                clothes.forEach(function(clothe){ 
                                    if(req.body[clothe.name] != 0) { 
                                        summary = summary + clothe.name + ' * ' + req.body[clothe.name] + ' ';
                                        calculateCost = calculateCost + (clothe.ironPrice)*(req.body[clothe.name]);
                                        shortgiven = shortgiven + Number(req.body[clothe.name]);
                                }});
                                getOrder.onlyIron = true;

                            } else {

                                clothes.forEach(function(clothe){ 
                                    if(req.body[clothe.name] != 0) { 
                                        summary = summary + clothe.name + ' * ' + req.body[clothe.name] + ' ';
                                        calculateCost = calculateCost + (clothe.price)*(req.body[clothe.name]);
                                        if(clothe.price <= 4) {
                                          shortgiven = shortgiven + Number(req.body[clothe.name]);
                                        } else if(clothe.price <= 10) {
                                          longgiven = longgiven + Number(req.body[clothe.name]);
                                        } else {
                                          longgiven = longgiven + (clothe.price)*Number(req.body[clothe.name])/10;
                                        }
                                }});

                            }
                            summary = summary + req.body.customMessage;

                            Customer.findById(getOrder.customer._id, function(err, foundCustomer) {

                                if(getOrder.customer.tagNumber == '') {

                                  CustomerCount.findOne({ countingOf : 'customer'}, function(err, customerCount) { 

                                      if (!customerCount) {
                                        var customerCount = new CustomerCount();
                                        customerCount.countingOf = 'customer';
                                        customerCount.save();
                                        foundCustomer.tagNumber = 'lbc401';
                                        console.log("here");
                                      } else {
                                          foundCustomer.tagNumber = 'lbc' + (customerCount.totalNumber + 1);
                                          customerCount.totalNumber = customerCount.totalNumber + 1;
                                          customerCount.save();
                                      }
                                      foundCustomer.bagNumber = req.body.bagNumber;
                                      foundCustomer.longGiven = longgiven;
                                      foundCustomer.shortGiven = shortgiven;
                                      foundCustomer.save(function(err) { 
                                          if (err)
                                              console.log(err),res.redirect('/logout');
                                      });
                                          
                                    });

                                } else {
                                    foundCustomer.bagNumber = req.body.bagNumber;
                                    foundCustomer.longGiven = longgiven;
                                    foundCustomer.shortGiven = shortgiven;
                                    foundCustomer.save(function(err) { 
                                        if (err)
                                            console.log(err),res.redirect('/logout');
                                    });
                                }

                            });

                            getOrder.description = summary;
                            getOrder.status = "picked";
                            getOrder.cost = calculateCost;
                            getOrder.save(function(err) { 
                                if (err)
                                    console.log(err),res.redirect('/logout');
                            });
                       }
                    });
                    res.redirect('/deliveryboy/' + req.params.id);

                } else {
                    req.flash('info', 'Wrong Order Key');
                    if (req.body.onlyIron) {
                        res.redirect('/deliveryboy/' + req.params.id + '/pickup/' + req.params.oid + '/no_iron');
                      } else {
                        res.redirect('/deliveryboy/' + req.params.id + '/pickup/' + req.params.oid);
                      }
                }

            } else {
                req.flash('info', 'Wrong LaundryBuoy Password');
                if (req.body.onlyIron) {
                    res.redirect('/deliveryboy/' + req.params.id + '/pickup/' + req.params.oid + '/no_iron');
                  } else {
                    res.redirect('/deliveryboy/' + req.params.id + '/pickup/' + req.params.oid);
                  }
            }
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    app.get('/deliveryboy/:id/out/:oid', function(req, res){
       Order.findById(req.params.oid, function(err, getOrder){
          if(err) {
              console.log(err),res.redirect('/logout');
          } else if (getOrder && getOrder.deliveryBoy._id == req.params.id) {

            getOrder.status = "out";
            getOrder.save(function(err) { 
                if (err)
                    console.log(err),res.redirect('/logout');
            });
            Customer.findById(getOrder.customer, function(err, customer){

              var options = {
                  min:  1000,
                  max:  9999,
                  integer: true
                }
                customer.pickUpKey = rn(options);

                customer.save(function(err) {   
                    if (err)
                        console.log(err),res.redirect('/logout');
                });
                if (customer.history.length == 1) {
                  Customer.findById(customer.referedBy, function(err, referedByCustomer){
                    if (referedByCustomer) {
                      referedByCustomer.discount = discount + 1;
                      referedByCustomer.save();
                    }
                  })
                }

            })
            res.redirect('/deliveryboy/' + req.params.id);
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    // =====================================
    // RECHARGE ROUTES =====================
    // =====================================

    app.get('/deliveryboy/:id/recharge', function(req, res){ 
       DeliveryBoy.findById(req.params.id, function(err, deliveryboy) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (deliveryboy) {
              res.render('deliveryboy/ctagforrecharge.ejs',{deliveryboy : deliveryboy, message: req.flash('tagforrecharge') });
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    app.post('/deliveryboy/:id/recharge', function(req, res){
        Customer.findOne({ 'tagNumber' :  req.body.customerTag }, function(err, customer) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else {
            if (!customer) {
              req.flash('tagforrecharge', 'No Customer Found');
              res.redirect('/deliveryboy/' + req.params.id + '/recharge');
            } else {
              res.redirect('/deliveryboy/' + req.params.id + '/recharge/' + customer._id);
            }
          }
        });
    });

    app.get('/deliveryboy/:id/recharge/:cid', function(req, res){
       DeliveryBoy.findById(req.params.id, function(err, deliveryboy) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (deliveryboy) {
              Customer.findById(req.params.cid, function(err, customer) {
                if(err){
                    console.log(err),res.redirect('/logout');
                } else if (customer) {
                    Plan.find({}, function(err, plans){
                       if(err){
                           console.log(err),res.redirect('/logout');
                       } else {
                            res.render('deliveryboy/recharge.ejs',{ plans : plans, deliveryboy : deliveryboy , customer : customer, message: req.flash('rechargestatus') });
                       }
                    });
                } else {
                  res.redirect('/deliveryboy/' + req.params.id + '/recharge');
                }
              })
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    app.post('/deliveryboy/:id/recharge/:cid', function(req, res){
       DeliveryBoy.findById(req.params.id, function(err, deliveryboy) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (deliveryboy) {
              Customer.findById(req.params.cid, function(err, customer) {
                if(err){
                    console.log(err),res.redirect('/logout');
                } else if (customer) {

                    Plan.findOne({ 'amount' :  req.body.getPlan }, function(err, plan){
                       if(err){
                           console.log(err),res.redirect('/logout');
                       } else if (plan) {
                            if (deliveryboy.password == req.body.dPass) {

                              var newRecharge = new Recharge();
                              newRecharge.amount = plan.amount;
                              newRecharge.customer = customer._id;
                              newRecharge.deliveryBoy = deliveryboy._id;
                              newRecharge.save();

                              customer.daysLeft = plan.validity;
                              customer.longClothes = customer.longClothes + plan.longClothes;
                              customer.shortClothes = customer.shortClothes + plan.shortClothes;
                              customer.currentRecharges.push(newRecharge);
                              customer.save();

                              req.flash('rechargestatus', 'Recharge Done');
                            } else {
                              req.flash('rechargestatus', 'Wrong Password');
                            }
                            res.redirect('/deliveryboy/' + req.params.id + '/recharge/' + req.params.cid);
                       } else {
                          res.redirect('/deliveryboy/' + req.params.id + '/recharge/' + customer._id);
                       }
                    });
                } else {
                  res.redirect('/deliveryboy/' + req.params.id + '/recharge');
                }
              })
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    // =====================================
    // PAYMENT ROUTES ======================
    // =====================================


    app.get('/deliveryboy/:id/payment/:oid', function(req, res){
       Order.findById(req.params.oid).populate("deliveryBoy customer").exec(function(err, order) {
          if(err) {
              console.log(err),res.redirect('/logout');
          } else if (order && order.deliveryBoy._id == req.params.id) {

              var costWithPlan = 0;
              if ((order.customer.longClothes < order.customer.longGiven) && (order.customer.shortClothes < order.customer.shortGiven)) {
                costWithPlan = ((order.customer.longGiven - order.customer.longClothes) + (order.customer.shortGiven - order.customer.shortClothes)) * 10 ;
              
              } else if (order.customer.longClothes < order.customer.longGiven) {
                if ((order.customer.longGiven - order.customer.longClothes)*2 > (order.customer.shortClothes - order.customer.shortGiven)) {
                  costWithPlan = ((order.customer.longGiven - order.customer.longClothes)*2 - (order.customer.shortClothes - order.customer.shortGiven)) * 5;
                }
              
              } else if (order.customer.shortClothes < order.customer.shortGiven) {
                if ((order.customer.shortGiven - order.customer.shortClothes)/2 > (order.customer.longClothes - order.customer.longGiven)) {
                  costWithPlan = ((order.customer.shortGiven - order.customer.shortClothes)/2 - (order.customer.longClothes - order.customer.longGiven)) * 10;
                }
              }

              var costWithoutPlan = order.cost;
              var noOfClothes = (order.customer.longGiven + order.customer.shortGiven);
              var flag = true;

              SingleService.find({}).sort('totalClothes').exec(function(err, services) {

                services.forEach(function(service){ 

                    if(noOfClothes <= service.totalClothes && flag) {
                      costWithoutPlan = costWithoutPlan + service.amount;
                      flag = false;
                    }
                });

                if (order.customer.discount) {
                  costWithoutPlan = costWithoutPlan - 25;
                }
                res.render('deliveryboy/paymentpage.ejs',{order : order, costWithoutPlan : costWithoutPlan, costWithPlan : costWithPlan, message: req.flash('paymentstatus') });
              });
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    app.post('/deliveryboy/:id/payment/:oid', function(req, res){
       Order.findById(req.params.oid, function(err, order) {
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (order) {

            Customer.findById(order.customer, function(err, customer) {

              DeliveryBoy.findById(req.params.id, function(err, deliveryboy) {

                if (deliveryboy) {

                  if(req.body.dPass == deliveryboy.password) {
                    if (req.body.payWithPlan && customer.daysLeft) {

                      var costWithPlan = 0;
                      if ((customer.longClothes < customer.longGiven) && (customer.shortClothes < customer.shortGiven)) {
                        costWithPlan = ((customer.longGiven - customer.longClothes) + (customer.shortGiven - customer.shortClothes)) * 10 ;
                        customer.longClothes = 0;
                        customer.shortClothes = 0;
                        customer.daysLeft = 0;
                      
                      } else if (customer.longClothes < customer.longGiven) {
                        if ((customer.longGiven - customer.longClothes)*2 >= (customer.shortClothes - customer.shortGiven)) {
                          costWithPlan = ((customer.longGiven - customer.longClothes)*2 - (customer.shortClothes - customer.shortGiven)) * 5;
                          customer.longClothes = 0;
                          customer.shortClothes = 0;
                          customer.daysLeft = 0;
                        } else {
                          customer.longClothes = 0;
                          customer.shortClothes = ((customer.shortClothes - customer.shortGiven) - (customer.longGiven - customer.longClothes)*2);
                        }
                      
                      } else if (customer.shortClothes < customer.shortGiven) {
                        if ((customer.shortGiven - customer.shortClothes)/2 >= (customer.longClothes - customer.longGiven)) {
                          costWithPlan = ((customer.shortGiven - customer.shortClothes)/2 - (customer.longClothes - customer.longGiven)) * 10;
                          customer.shortClothes = 0;
                          customer.longClothes = 0;
                          customer.daysLeft = 0;
                        } else {
                          customer.shortClothes = 0;
                          customer.longClothes = ((customer.longClothes - customer.longGiven) - (customer.shortGiven - customer.shortClothes)/2);
                        }
                      } else {
                          customer.longClothes = customer.longClothes - customer.longGiven;
                          customer.shortClothes = customer.shortClothes - customer.shortGiven;
                          if (customer.longClothes == customer.longGiven && customer.shortClothes == customer.shortGiven) {
                            customer.daysLeft = 0;
                          }
                      }

                      customer.save();

                      order.cost = costWithPlan;
                      order.isPaid = true;
                      deliveryboy.amount = deliveryboy.amount + costWithPlan;
                      deliveryboy.save();
                      order.save();
                      res.redirect('/deliveryboy/' + deliveryboy._id + '/deliver/' + order._id);

                    } else {

                      var costWithoutPlan = order.cost;
                      var noOfClothes = (customer.longGiven + customer.shortGiven);
                      var flag = true;

                      SingleService.find({}).sort('totalClothes').exec(function(err, services) {

                        services.forEach(function(service){ 

                            if(noOfClothes <= service.totalClothes && flag) {
                              costWithoutPlan = costWithoutPlan + service.amount;
                              flag = false;
                            }
                        });
                        if (customer.discount) {
                          costWithoutPlan = costWithoutPlan - 25;
                          customer.discount = customer.discount - 1;
                          customer.save();
                        }
                        order.cost = costWithoutPlan;
                        order.isPaid = true;
                        deliveryboy.amount = deliveryboy.amount + costWithoutPlan;
                        deliveryboy.save();
                        order.save();
                        res.redirect('/deliveryboy/' + deliveryboy._id);

                      });

                    }
                  } else {
                    req.flash('paymentstatus', 'Wrong Password');
                    res.redirect('/deliveryboy/' + deliveryboy._id + '/payment/' + order._id);
                  } 

                } else {
                  res.redirect('/deliveryboylogin');
                }

              })  
            })
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    // =====================================
    // DELIVERY ROUTES =====================
    // =====================================

    app.get('/deliveryboy/:id/deliver/:oid', function(req, res){
       Order.findById(req.params.oid).populate("deliveryBoy customer").exec(function(err, order){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (order && order.deliveryBoy._id == req.params.id) {
              if (order.isPaid) {

                res.render('deliveryboy/deliverpage.ejs',{order : order, message : req.flash('deliveryMessage')});

              } else {
                res.redirect('/deliveryboy/' + req.params.id + '/payment/' + req.params.oid);
              }
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    app.get('/deliveryboy/:id/deliver/:oid/resend', function(req, res){
       Order.findById(req.params.oid).populate("deliveryBoy customer").exec(function(err, order){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (order && order.deliveryBoy._id == req.params.id) {
              if (order.isPaid) {

                Customer.findById(order.customer._id, function(err, customer){

                  var options = {
                      min:  1000,
                      max:  9999,
                      integer: true
                    }
                    customer.pickUpKey = rn(options);

                    customer.save(function(err) {   
                        if (err)
                            console.log(err),res.redirect('/logout');
                    });
                })
                req.flash('deliveryMessage', 'OTP resend');
                res.redirect('/deliveryboy/' + req.params.id + '/deliver/' + req.params.oid);

              } else {
                res.redirect('/deliveryboy/' + req.params.id + '/payment/' + req.params.oid);
              }
          } else {
            res.redirect('/deliveryboylogin');
          }
       });
    });

    app.post('/deliveryboy/:id/deliver/:oid', function(req, res){
       Order.findById(req.params.oid).populate("deliveryBoy").exec(function(err, order){
          if(err){
              console.log(err),res.redirect('/logout');
          } else if (order && order.deliveryBoy._id == req.params.id) {
              if (order.isPaid) {

                if (req.body.dPass == order.deliveryBoy.password) {

                  Customer.findById(order.customer, function(err, customer){

                    if (req.body.otp == customer.pickUpKey) {

                      order.status = 'delivered';
                      order.deliveryDate = Date.now() ;
                      customer.isBusy = false;
                      var options = {
                        min:  1000,
                        max:  9999,
                        integer: true
                      }
                      customer.pickUpKey = rn(options);
                      order.save();
                      customer.save();

                      res.redirect('/deliveryboy/' + req.params.id);

                    } else {
                      req.flash('deliveryMessage', 'Incorrect OTP');
                      res.redirect('/deliveryboy/' + req.params.id + '/deliver/' + req.params.oid);
                    }

                  })

                } else {
                  req.flash('deliveryMessage', 'Wrong DeliveryBoy Password');
                  res.redirect('/deliveryboy/' + req.params.id + '/deliver/' + req.params.oid);
                }

              } else {
                res.redirect('/deliveryboy/' + req.params.id + '/payment/' + req.params.oid);
              }
          } else {
            res.redirect('/deliveryboylogin');
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
    if (req.isAuthenticated() && req.user.local.email == "9911692428")
        return next();
    res.redirect('/login');
}
var cleanUp = schedule.scheduleJob('0 0 * * *', function(){
  console.log('Auto Cleaning');

  // *    *    *    *    *    *
  // ┬    ┬    ┬    ┬    ┬    ┬
  // │    │    │    │    │    │
  // │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
  // │    │    │    │    └───── month (1 - 12)
  // │    │    │    └────────── day of month (1 - 31)
  // │    │    └─────────────── hour (0 - 23)
  // │    └──────────────────── minute (0 - 59)
  // └───────────────────────── second (0 - 59, OPTIONAL)

  DeliveryBoy.find({}).populate("currentOrders").exec(function(err, deliveryboys){
    deliveryboys.forEach(function(deliveryboy){ 
      deliveryboy.currentOrders.forEach(function(order){
        if (order.status == 'delivered' || order.status == 'terminated') {
          deliveryboy.currentOrders.remove(order);
        }
      })
      deliveryboy.save();
    })
  })
  Vendor.find({}).populate("currentOrders").exec(function(err, vendors){
    vendors.forEach(function(vendor){ 
      vendor.currentOrders.forEach(function(order){
        if (order.status == 'delivered' || order.status == 'terminated') {
          console.log(order);
          vendor.currentOrders.remove(order);
        }
      })
      vendor.save();
    })
  })
});