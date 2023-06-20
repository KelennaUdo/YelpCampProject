const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true , useUnifiedTopology: true });
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', ()=>{
    console.log('database connected')
 })

const titleArr = (arr)=> arr[Math.floor(Math.random()*arr.length)]
const seedDB = async()=>{
   await Campground.deleteMany({});
   for(let i = 0; i<=300; i++){
  const random1000 = Math.floor(Math.random()*1000)
  const price = Math.floor(Math.random()*20+10)
  const camp = new Campground({   
   location: `${cities[random1000].city} ${cities[random1000].state}`,
   title: `${titleArr(descriptors)} ${titleArr(places)}`,
   description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum natus doloribus adipisci laboriosam aliquam aliquid eum ipsam tempora ab, architecto porro sed dolorem dignissimos! Assumenda odit impedit neque animi nemo?',
   author: "64725d21d58685f02c9f2740",
   price,
   geometry: {
    type: "Point",
    coordinates: [
      cities[random1000].longitude,
      cities[random1000].latitude
    ]
},
   images: [
      {
        url: 'https://res.cloudinary.com/drnw5hg70/image/upload/v1686040658/YelpCamp/ouw3ccircjqwwxp3op0r.jpg',
        filename: 'YelpCamp/ouw3ccircjqwwxp3op0r',
      
      },
      {
        url: 'https://res.cloudinary.com/drnw5hg70/image/upload/v1686040658/YelpCamp/gxp5vxxzd5ff47egmgp9.jpg',
        filename: 'YelpCamp/gxp5vxxzd5ff47egmgp9',
       
      },
      {
        url: 'https://res.cloudinary.com/drnw5hg70/image/upload/v1686040658/YelpCamp/psgoakgj5fgl5fad5q5z.jpg',
        filename: 'YelpCamp/psgoakgj5fgl5fad5q5z',
        
      }
    ]
})
await camp.save();
   }
 }

 seedDB().then(()=>{
   mongoose.connection.close()
 }
 )