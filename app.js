//jshint esversion:6
require('dotenv').config();
const express = require("express"); 
const app = express();
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const session = require("express-session");

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(session({ secret: "melody hensley is my spirit animal" }));
//Connection URL
mongoose.connect(process.env.MONGO_ID, {useNewUrlParser:true});
// mongoose.connect("mongodb://localhost:27017/efirDBs", {useNewUrlParser:true});


const userSchema = new mongoose.Schema({
    FirstName : String,
    LastName : String,
    Email : {type:String,unique:true},
    Password :String
});
const googleSchema = new mongoose.Schema({
    googleId : String
});
const secret = "It'sasecret.";
userSchema.plugin(encrypt, {secret: secret, encryptedField: ["Password"]});
userSchema.plugin(passportLocalMongoose);
googleSchema.plugin(findOrCreate);
googleSchema.plugin(passportLocalMongoose);

const user = new mongoose.model("user", userSchema);
const User = new mongoose.model("gUser", googleSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(User, done) {
    done(null, User.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, User) {
      done(err, User);
    });
  });

const mainSchema ={
    FirstName : String,
    LastName : String,
    Age:Number,
    Gender:String,
    MobileNo:Number,
    Email : String,
    Address:String,
    City:String,
    State:String,
    ComplaintTypef:String,
    OcurrenseDateAndTime:String,
    ComplaintDetails:String,
    SuspectDetails:String
};
// const Item = mongoose.model("user",userSchema);
const Item1 = mongoose.model("main",mainSchema);


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://e-fir.onrender.com/auth/google/Efir",
    // callbackURL: "http://localhost:3000/auth/google/Efir",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, User) {
      return cb(err, User);
    });
  }
));

//get requests
app.get("/",function(req, res){
    res.sendFile(__dirname+"/public/signup.html");

});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/Efir", 
passport.authenticate('google', { failureRedirect: "/" }),
  function(req, res) {
    // Successful authentication, redirect success.
    if (req.isAuthenticated()) {
        res.redirect("/success");
    } else {
        res.sendFile(__dirname+"/public/failure.html");
    }
});

app.get("/success", function(req, res){
   res.sendFile(__dirname+"/public/success.html") 
});



//post requests
app.post("/", function(req, res){
    firstName = req.body.fname;
    lastName = req.body.lname;
    email = req.body.email;
    password = req.body.password;

    const newUser =  new user({
        FirstName : firstName,
        LastName : lastName,
        Email : email,
        Password: password
    });
    // console.log(newUser.FirstName);
    // console.log(newUser.LastName);
    newUser.save(function(err){
        if (err) {
           console.log(err);
           res.sendFile(__dirname+"/public/duplicatemail.html");
        } else {
          res.render("success");
        }
    });

    // const userdetail = new user({
    //     FirstName:firstName,
    //     LastName:lastName,
    //     Email:email,
    //     Password:password,
    // })

    // userdetail.save();
    // res.sendFile(__dirname+"/success.html");
});

app.post("/login", function(req, res){
    const email1 = req.body.email;
    const password = req.body.password;
    user.findOne({ Email: email1 },function(err, foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(foundUser.Password === password){
                    res.sendFile(__dirname+"/public/success.html");
                }else{
                    res.sendFile(__dirname+"/public/failure.html");
                }
            }else{
                res.sendFile(__dirname+"/public/notfound.html");
            }
        }
    });
});

app.post("/success", function(req, res){
    const firstName = req.body.Fname;
    const lastName = req.body.Lname;
    const age = req.body.age;
    const gender = req.body.gender;
    const mobileNo = req.body.mobileNo;
    const address = req.body.address;
    const city = req.body.city;
    const state = req.body.state;
    const complaintType = req.body.complaintType;
    const ocurrenseDateAndTime = req.body.ocurrenseDateAndTime;
    const complaintDetails = req.body.complaintDetails;
    const suspectDetails = req.body.suspectDetails;
    const detail = new Item1({
        FirstName:firstName,
        LastName:lastName,
        Age:age,
        Gender:gender, 
        MobileNo:mobileNo,
        Address:address,
        City:city,
        State:state,
        ComplaintTypef:complaintType,
        OcurrenseDateAndTime:ocurrenseDateAndTime,
        ComplaintDetails:complaintDetails,
        SuspectDetails:suspectDetails
    });

    detail.save();
    res.sendFile(__dirname+"/public/done.html");
})

app.post("/done", function(req, res){
    res.redirect("/");
})

app.post("/failure", function(req, res){
    res.redirect("/login.html");
})


//listen on port 3000
app.listen(process.env.PORT || 3000,function(req, res){
    console.log("server is running...");
})
