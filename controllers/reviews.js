const Review=require("../models/review.js");
const Listing=require("../models/listing.js");

module.exports.createReview = async(req,res)=>{
    const listing=await Listing.findById(req.params.id);
    const newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    await newReview.save();
    req.flash("success","New Review Created!");
    listing.reviews.push(newReview);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview=async(req,res,)=>{
    let {id,reviewId }=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};