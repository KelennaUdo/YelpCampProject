const Campgrounds = require('../models/campgrounds');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder  = mbxGeocoding({accessToken: mbxToken});

const {cloudinary} = require('../cloudinary/index');
const user = require('../models/user');



module.exports.index = async(req, res)=>{
    const campgrounds = await Campgrounds.find({});
    res.render('campgrounds/index', {campgrounds});
  }
  

module.exports.newForm = (req, res)=>{
    res.render('campgrounds/new');
}

module.exports.editForm = async (req, res)=>{
    try {
      const {id} = req.params;
      const campground = await Campgrounds.findById(id);
      res.render('campgrounds/edit', { campground });
         }          
       catch (error) {        
        req.flash('error', 'No such campground');
        res.redirect('/campgrounds');
      }
    }

module.exports.edit = async (req, res)=>{
        try{
           const {id}  = req.params;
           const campground = await Campgrounds.findByIdAndUpdate(id, req.body.campground);
           const img = req.files.map(file => ({url: file.path, filename: file.filename}));
           campground.images.push(...img);
           await campground.save();  
           if(req.body.deleteImg && req.body.deleteImg.length > 0){
            for (let file of req.body.deleteImg) {
              // Delete image file from Cloudinary
              await cloudinary.uploader.destroy(file);
            }
           await  campground.updateOne({$pull : { images: { filename: {$in: req.body.deleteImg }}}})
           }
           req.flash('success', `successfully edited ${campground.title}`);
           res.redirect(`/campgrounds/${id}`);
        }
        catch{
           req.flash('error', 'An error occured while submitting your request');
           res.redirect(`/campgrounds/${id}`);
        }
       }

      module.exports.show =  async (req, res) => {
       
        try {
          const { id } = req.params;
          const campground = await Campgrounds.findById(id).populate('author').populate({
            path: 'review',
            populate: {
              path: 'author'
          }
               });       
          res.render('campgrounds/show', { id, campground });
        } catch (error) {
         
          req.flash('error', "That campground doesn't exist or Couldn't be found");
          return res.redirect('/campgrounds');
        }
      }

    module.exports.delete =  async (req, res)=>{
        try{
         await Campgrounds.findByIdAndDelete(req.params.id);
         req.flash('success', 'Successfully deleted Campground')
         res.redirect(`/campgrounds`)
        }
        catch{
         req.flash('error', 'An error occured while submitting your request')
         res.redirect(`/campgrounds/${req.params.id}`)
      }
     }

    module.exports.createNew = async (req,res)=>{
      
     const geodata =  await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
      }).send()
        const campground = new Campgrounds(req.body.campground);
        campground.geometry = geodata.body.features[0].geometry;
         campground.images = req.files.map(file => ({url: file.path, filename: file.filename}));
        campground.author = req.user._id;
        const currentUser =  await user.findById(req.user._id)
        currentUser.Campgrounds.push(campground)
        
        await campground.save(); 
        await currentUser.save();
        console.log(campground);
        req.flash('success', 'successfully created a campground');
        res.redirect(`/campgrounds/${campground._id}`);     
     }