var Campground = require("../models/campground");
var Comment = require("../models/comment");
// all the middleware goes here
var middlewareObj = {
    checkCampgroundOwnership: function(req, res, next){
        if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err, foundCampground){
                if(err || !foundCampground){
                   req.flash("error", "Campground not found!");
                    res.redirect("back");
                } else {
            //does the user owen the campground
               if(foundCampground.author.id.equals(req.user._id)){
                 next();
               } else {
                   req.flash("error", "You dont have permission to do that!");
                   res.redirect("back");
               }
                 }
             });
        } else {
           res.redirect("back");
        }
       },
       checkCommentOwnership: function(req, res, next){
        if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err || !foundComment){
                   req.flash("error", "Comment not found");
                    res.redirect("back");
                } else {
            //does the user owen the campground
               if(foundComment.author.id.equals(req.user._id)){
                 next();
               } else {
                req.flash("error", "You dont have permission to do that!");
                   res.redirect("back");
               }
                 }
             });
        } else {
           req.flash("error", "You dont have permission to do that!");
           res.redirect("back");
        }
       },
       isLoggedIn: function (req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You Need to be logged in to do that!");
        res.redirect("/login");
    }
};



module.exports =  middlewareObj;