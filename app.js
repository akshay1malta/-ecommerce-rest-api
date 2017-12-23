var express = require('express');
var app = express();
var mongoose = require('mongoose');
// module for maintaining sessions
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// path is used the get the path of our files on the computer
var path = require ('path');
var passport = require('passport');
var mongostore= require('connect-mongo')(session);
var Strategy = require('passport-facebook').Strategy;
passport.use(new Strategy({
    clientID: '1083634398434140',
    clientSecret: '725d28ae99cff7984595ccde80a2be72',
    callbackURL: 'http://localhost:3000/login/facebook/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(accessToken);
    console.log('accessToken');
    console.log(refreshToken);
    console.log('refreshToken');
    return cb(null, profile);
  }));


app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());

// initialization of session middleware 

app.use(session({
  name :'myCustomCookie',
  secret: 'myAppSecret', // encryption key 
  resave: true,
  httpOnly : true,
  store : new mongostore({mongooseConnection: mongoose.connection}),
  saveUninitialized: true,
  cookie: { maxAge: 180*60*1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
// set the templating engine 
app.set('view engine', 'jade');


//set the views folder
app.set('views',path.join(__dirname + '/app/views'));


var dbPath  = "mongodb://localhost/edStersDb";

// command to connect with database
db = mongoose.connect(dbPath);

mongoose.connection.once('open', function() {

	console.log("database connection open success");

});



// fs module, by default module for file management in nodejs
var fs = require('fs');

// include all our model files
fs.readdirSync('./app/models').forEach(function(file){
	// check if the file is js or not
	if(file.indexOf('.js'))
		// if it is js then include the file from that folder into our express app using require
		require('./app/models/'+file);

});// end for each

// include controllers
fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		// include a file as a route variable
		var route = require('./app/controllers/'+file);
		//call controller function of each file and pass your app instance to it
		route.controllerFunction(app)

	}

});//end for each


var mongoose = require('mongoose');
var userModel = mongoose.model('User')


// app level middleware to set request user 

var auth = require("./middlewares/auth");
app.use(function(req,res,next){

  if(req.session && req.session.user){
    userModel.findOne({'email':req.session.user.email},function(err,user){

      if(user){
        req.user = user;
        delete req.user.password; 
        req.session.user = user;
        delete req.session.user.password;
        next()
      }
      else{
        // do nothing , because this is just to set the values
      }
    });
  }
  else{
    next();
  };

});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });	
app.listen(3000, function () {

  console.log('Example app listening on port 3000!');
});