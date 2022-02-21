//console.log(process.env)
//configure dovenv dont forget to put .env in gitignore

require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
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
////////////////////////encryption////////////////////////////
//console.log(process.env.API_KEY);//access to environment variables
const secret = process.env.SECRET;
////////////////////////////////////////////////////
const User = new mongoose.model("User", userSchema);
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

app.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    const newUser = new User({
      email: req.body.username,
      password: hash
    });
    newUser.save((err) => {
      if (err) console.log(err);
      else {
        res.render("secrets");
      }
    });
  });

});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({
    email: username
  }, (err, result) => {
    if (err) console.log(err);
    else if (result) {
      bcrypt.compare(password, result.password, function(err, result) {
        if (result) {
          res.render("secrets");
          console.log(result.password);
        } else console.log("wrong password");
      });
    } else console.log("no user found");
  });
});



app.listen(33333, function() {
  console.log("Server started on port 33333");
});
