const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing.js");

mongo_url="mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
    console.log("Connected to DB");
}).catch(err=>{console.log(err)});

async function main(){
    await mongoose.connect(mongo_url);

}
const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"68061d3ddafd3cbb6bd8303d"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
initDB();