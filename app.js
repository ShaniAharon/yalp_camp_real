var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var seedDB = require("./seeds");
var flash = require("connect-flash");
var passport = require("passport");
var methodOverride = require("method-override");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
mongoose.connect(process.env.DATABASEURL,{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
  console.log("connected to db");
}).catch(err =>{
  console.log("ERROR:",err.message);
});
//mongodb+srv://shani:shanidatabase14798@cluster0-t7kj9.mongodb.net/yelp_camp?retryWrites=true&w=majority
//mongodb://localhost:27017/yelp_camp
// requring routes
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false);
app.use(flash());
//  seedDB(); //seed the database



//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Rusty is a suasage now!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/",indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);




app.listen(process.env.PORT||3000, function(){
    console.log("YelpCamp server as started");
});