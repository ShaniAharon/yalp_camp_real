var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");



// comments new
router.get("/new",middleware.isLoggedIn, function(req, res){
    // found campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            req.flash("error", "Somthing went wrong!");
           return res.redirect("back");
        } else{
            res.render("comments/new", {campground: campground});
        }
    });
});
//commnets create
router.post("/",middleware.isLoggedIn, function(req, res){
    //lookup campground using id
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            console.log(err);
            req.flash("error", "Somthing went wrong!");
            return res.redirect("back");
        } else {
          Comment.create(req.body.comment, function(err, comment){
              if(err){
                  console.log(err);
              } else {
                  //add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  // save comment
                  comment.save();
                  campground.comments.push(comment);
                  campground.save();
                  req.flash("success", "successfully added comment");
                  res.redirect("/campgrounds/" + campground._id);
              }
          })
        }
    });
    //create new comment
    //connect new comment to campground
    //redirect campground show page
});
//Comments edit route
router.get("/:comment_id/edit",middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id : req.params.id, comment: foundComment});
            }
        });
    });
   
});

//Comment update route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedCommnet){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//Comments destroy route
router.delete("/:comment_id",middleware.checkCommentOwnership, function(req, res){
    //find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});



module.exports = router;