//jshint esversion:6
require('dotenv').config();

const express = require('express');
const app = express();

const ejs = require('ejs');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate')



app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: { maxAge: 60000 }
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/usersDB', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', e=> console.log('Database connected successfully'));

mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  facebookId: String
});

const secretSchema = new mongoose.Schema({
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);
const Secret = mongoose.model('Secret', secretSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/secrets'
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//////////////////////routing////////////////
app.get('/', (req,res)=>{
  res.render('home')
});

app.get('/secrets', (req,res)=>{
  if(req.isAuthenticated()){
    Secret.find((err, foundSecrets)=>{
      if(!foundSecrets){
        res.render('secrets')
      }
      else{
        res.render('secrets', {secrets:foundSecrets})
      }
    })

  }
  else{
    res.redirect('/login')
  }
});

app.get('/submit', (req,res)=>{
  if(req.isAuthenticated()){
    res.render('submit')
  }
  else{
    res.redirect('/login')
  }
});

app.post('/submit', (req,res)=>{
  const secret = new Secret({
    secret: req.body.secret
  });
  secret.save();
  res.redirect('/secrets');
});

//register, login, logout
app.route('/login')
.get((req,res)=>{
  res.render('login')
})
.post(passport.authenticate('local', { failureRedirect: '/login' }), (req,res)=>{
  res.redirect('/secrets');
})

app.route('/register')
.get((req,res)=>{
  res.render('register')
})
.post((req,res)=>{
  User.register({username:req.body.username}, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      res.redirect('/register')
    }
    else{
      passport.authenticate('local')(req, res, ()=> res.redirect('/secrets'))
    }

  });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//google authentication
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

//facebook authentication
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.listen(3000, e=>console.log('Server is listening on port 3000.'))
