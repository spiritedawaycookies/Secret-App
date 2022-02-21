//console.log(process.env)
//configure dovenv dont forget to put .env in gitignore

require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
///////////////coockies///////////////////
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
///////////////////////////////////////////////////
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
const uri = "mongodb://localhost:27017/userDB"
// const uri =
//   "mongodb+srv://hongn:mznLLqQF5og4ZvU1@cluster0.nhfgr.mongodb.net/blogDB?retryWrites=true&w=majority";
mongoose.connect(uri);
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
userSchema.plugin(passportLocalMongoose); //hash and salt passwords and save in database
////////////////////////enviroenent encryption key////////////////////////////
//console.log(process.env.API_KEY);//access to environment variables
//const secret = process.env.SECRET;
////////////////////////////////////////////////////
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/login', (req, res) => {
  res.render("login");
});

app.get('/register', (req, res) => {
  res.render("register");
});

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) res.render("secrets");
  else res.redirect('/login');
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

app.listen(33333, function() {
  console.log("Server started on port 33333");
});
