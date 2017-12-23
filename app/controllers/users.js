var mongoose          = require('mongoose');
var express           = require('express');
var cookieparser      = require('cookie-parser');       
var userRouter        = express.Router();
var userModel         = mongoose.model('User')
var responseGenerator = require('./../../libs/responseGenerator');
var auth              = require("./../../middlewares/auth");
var passport = require('passport');





module.exports.controllerFunction = function(app) {
    userRouter.get('/login/fbc',function(req, res){
        res.render('loginfb');
      });

    userRouter.get('/login/facebook',passport.authenticate('facebook'));

    userRouter.get('/login/facebook/return', passport.authenticate('facebook', { failureRedirect: '/login/fbc' }),function(req, res) {
      res.redirect('/start/screen');
    });

    userRouter.get('/profile',require('connect-ensure-login').ensureLoggedIn(),function(req, res){
      res.render('dashboard');
    });

    userRouter.get('/start/screen',function(req,res){
            
        res.render('start');

    });
    userRouter.get('/login/screen',function(req,res){
            
        res.render('login');

    });

    userRouter.get('/signup/screen',function(req,res){
            
        res.render('signup');
    });

    userRouter.get('/logout',function(req,res){
      
      req.session.destroy(function(err) {

        res.redirect('/users/login/screen');

      })  

    });//end logout
    

    userRouter.get('/all',function(req,res){
        userModel.find({},function(err,allUsers){
            if(err){                
                res.send(err);
            }
            else{

                res.send(allUsers);

            }

        });//end user model find 

    });//end get all users

    userRouter.get('/:userName/info',function(req,res){

        userModel.findOne({'userName':req.params.userName},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                  res.render('dashboard', { user:foundUser  });

            }

        });// end find
      

    });//end get all users

    userRouter.post('/signup',function(req,res){

        if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var newUser = new userModel({
                userName            : req.body.firstName+''+req.body.lastName,
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email,
                mobileNumber        : req.body.mobileNumber,
                password            : req.body.password


            });// end new user 

            newUser.save(function(err){
                if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{

                    //var myResponse = responseGenerator.generate(false,"successfully signup user",200,newUser);
                   // res.send(myResponse);
                   req.session.user = newUser;
                   delete req.session.user.password;
                   res.redirect('/users/dashboard')
                }

            });//end new user save


        }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

            //res.send(myResponse);

             res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
              });

        }
        

    });//end get all users


    userRouter.post('/login',function(req,res){

        userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found. Check your email and password",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                  req.session.user = newUser;
                   delete req.session.user.password;
                  res.redirect('/users/dashboard')

            }

        });// end find


    });//end get signup screen

    app.use('/users', userRouter);



 
} //end contoller code
