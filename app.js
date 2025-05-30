if(process.env.NODE_ENV !="production"){
require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const e = require("express");
const { nextTick } = require("process");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const { listingSchema,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const { error } = require('console');

//database
// 
dbUrl=process.env.ATLASDB_URL;
main().then(()=>{
    console.log("Connected to DB");
}).catch(error=>{console.log(error)});

async function main(){
    await mongoose.connect(dbUrl);

}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


//mongo store
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("Error In MONGO Session Store",error);
});

//session
const sessionOptions= {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    },
};
//session
app.use(session(sessionOptions));
app.use(flash());

//aunthentication
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

// app.get("/",(req,res)=>{
//     res.send("Hi!I am root");
// });





app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);





// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"Villa",
//         description:"By the beach",
//         price:1200,
//         location:"calangut,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved!");
//     res.send("Successful testing!");
// });

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});
//middleware 
app.use((err,req,res,next)=>{
    let {statusCode=500, message="something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);

});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});