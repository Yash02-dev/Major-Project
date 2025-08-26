const Listing = require("../models/listing"); 
require("dotenv").config();

module.exports.index = async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm =(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
    if(!listing){
        req.flash("error","Listing  you requested for does not exist!");
        return res.redirect("/listings");
    };
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res,next)=>{
    async function geocode(location) {
    const apiKey = process.env.MAP_API_KEY;
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return {
            type: "Point",
            coordinates: [lng, lat] 
        };
    } else {
        return{
            type: "Point",
            coordinates: [] 
        };
    }};


    let url = req.file.path;
    let filename = req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = await geocode(req.body.listing.location);
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing  you requested for does not exist!");
        return res.redirect("/listings");
    };

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});

};

module.exports.updateListing = async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    };
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    };
    
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
     req.flash("success"," Listing Deleted!");
    res.redirect("/listings");
};