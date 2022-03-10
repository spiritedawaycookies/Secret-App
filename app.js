//console.log(process.env)
//configure dovenv dont forget to put .env in gitignore

require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
///////////////coockies///////////////////
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
////////////////////////OAUTH//////////////////////////

const GoogleStrategy = require('passport-google-oauth20').Strategy;

///////////////////////////////////////////////////
const findOrCreate=require('mongoose-findorcreate');

const app = express();
//express session- set up
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
//initialize passport
app.use(passport.initialize());
//use session
app.use(passport.session());

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));
///////////////////////////////////////////////////
const uri = "mongodb+srv://hongn:mznLLqQF5og4ZvU1@cluster0.nhfgr.mongodb.net/userDB?retryWrites=true&w=majority"
// const uri =
//   "mongodb+srv://hongn:mznLLqQF5og4ZvU1@cluster0.nhfgr.mongodb.net/blogDB?retryWrites=true&w=majority";
mongoose.connect(uri);


const secretsSchema = new mongoose.Schema({
  name: String
});
const Secret = mongoose.model("Secret", secretsSchema);
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId:String,
  secrets:[secretsSchema]
});
userSchema.plugin(passportLocalMongoose); //hash and salt passwords and save in database
userSchema.plugin(findOrCreate);
////////////////////////enviroenent encryption key////////////////////////////
//console.log(process.env.API_KEY);//access to environment variables
//const secret = process.env.SECRET;
////////////////////////////////////////////////////
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
   // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
const herokuURI="http://salty-mountain-54617.herokuapp.com"
passport.use(new GoogleStrategy({
  clientID:"705186284028-40l65npubgmcc30lkunn5nkv2vif7knj.apps.googleusercontent.com",
  clientSecret:"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",
  //clientID: process.env.CLIENT_ID,
  //clientSecret: process.env.CLIENT_SECRET,
  callbackURL: herokuURI+"/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    //console.log(clientID);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
//  console.log(process.env.CLIENT_ID);
  res.render("home");
});

app.get('/auth/google',
  passport.authenticate("google",{ scope: ["profile"]} )
);

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get('/login', (req, res) => {
  res.render("login");
});

app.get('/register', (req, res) => {
  res.render("register");
});

app.get('/secrets', (req, res) => {
  //see all secrets
  User.find({"secrets":{$ne:null}},(err,foundUsers)=>{
    if(err) console.log(err);
    else{
      if(foundUsers){
        res.render("secrets",{usersWithSecrets:foundUsers});
      }
    }
  });
  //see your own secrets
  // if (req.isAuthenticated()) res.render("secrets");
  // else res.redirect('/login');
});

app.get('/submit',(req,res)=>{

  if (req.isAuthenticated()) res.render("submit");
  else res.redirect('/login');
});

app.post('/submit',(req,res)=>{
  const submittedSecret=req.body.newsecret;
  console.log(req.body.newsecret);
  const secret = new Secret({
    name: submittedSecret
  });
  User.findById(req.user.id,(err,foundUser)=>{
    if(err) console.log(err);
    else{
      if(foundUser){
        foundUser.secrets.push(secret);
        foundUser.save().then(() => {
          res.redirect('/secrets');
        });;
      }
    }
  });
});

app.post('/register', (req, res) => {
  // const newUser = new User({
  //   email: req.body.username,
  //   password: req.body.password
  // });
  User.register({
    username: req.body.username
  }, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }

  });

});

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) console.log(err);
    else {
      //passport local strategy
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });

});

app.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
});


//////////////////////alt local port///////////////////////

app.listen(5000, function() {
  console.log(`server started on port 5000`);
});
