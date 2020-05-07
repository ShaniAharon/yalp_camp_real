var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");

// INDEX - display a list of all campgrounds
router.get("/", function(req, res){
     if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(allCampgrounds.length < 1){
                req.flash("error", "No match was found, please try agian");
              return  res.redirect("back");
            }
            if(err){
                console.log(err);
            }else{
                res.render("campgrounds/index", {campgrounds: allCampgrounds});
            }
        });
     } else {

    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
   }
    });

    // CREATE - add a new campground to the db
    router.post("/", middleware.isLoggedIn, function(req, res){
        //get data from form and add to campgrounds arry
        var name = req.body.name;
        var price = req.body.price;
        var image = req.body.image;
        var desc = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        var newCampground = {name: name, price: price, image: image, description: desc, author: author};
        // CREATE A NEW CAMPGROUND IN THE DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else{
          // redirect back to campgrounds page
                res.redirect("/campgrounds");
            }
        });
       });
    // NEW - display a form to make a new campground
    router.get("/new", middleware.isLoggedIn, function(req, res){
        res.render("campgrounds/new");
    });
    // SHOW - show more info about one campground
    router.get("/:id", function(req, res){
        //find the campground with provided id
        Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
               // render show tamplate with that campground
                res.render("campgrounds/show", {campground: foundCampground});
    
            }
        });
    });

    //Edit campgound route
    router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req, res){       
        Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
        });
    });

    //Update campground route
  router.put("/:id",middleware.checkCampgroundOwnership, function(req, res){
      //find and update the correct campground
      Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
          if(err){
              res.redirect("/campgrounds");
          } else {
              res.redirect("/campgrounds/" + req.params.id);
          }
      });
  });

  //Destroy campground route
  router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved){
        if(err){
            res.redirect("/campgrounds");
        } else {
            Comment.deleteMany({_id: { $in: campgroundRemoved.comments}}, function(err){
                if(err){
                    console.log(err);
                }
            res.redirect("/campgrounds");
            });
        }
    });  
  });


  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
    
    module.exports = router;