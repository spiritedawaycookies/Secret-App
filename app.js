require('dotenv').config()
//console.log(process.env)

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt=require("mongoose-encryption");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));
///////////////////////////////////////////////////
const uri="mongodb://localhost:27017/userDB"
// const uri =
//   "mongodb+srv://hongn:mznLLqQF5og4ZvU1@cluster0.nhfgr.mongodb.net/blogDB?retryWrites=true&w=majority";
mongoose.connect(uri);
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});
////////////////////////database encryption////////////////////////////
//console.log(process.env.API_KEY);//access to environment variables
const secret=process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields:['password'] });
////////////////////////////////////////////////////
const User=new mongoose.model("User",userSchema);
////////////////////////////////////////////////////////////////////////

app.get('/',(req,res)=>{
  res.render("home");
});

app.get('/login',(req,res)=>{
  res.render("login");
});

app.get('/register',(req,res)=>{
  res.render("register");
});

app.post('/register',(req,res)=>{
  const newUser=new User({
    email:  req.body.username,
    password: req.body.password
  });
  newUser.save((err)=>{
    if(err) console.log(err);
    else{
      res.render("secrets");
    }
  })
});

app.post('/login',(req,res)=>{
  const username=req.body.username;
  const password=req.body.password;
  User.findOne({email:username},(err,result)=>{
    if(err) console.log(err);
    else if(result) {
      if(result.password===password){
          res.render("secrets");
          console.log(password);//this security is bad
      }else console.log("not password");
    }else console.log("no user found");
  });
});




app.listen(33333, function() {
  console.log("Server started on port 33333");
});
