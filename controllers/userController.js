const User  = require('../models/user');

module.exports.getUserProfile = async (req, res) => {
    
    const {userId} = req.params;
  
    // Retrieve the user profile from the database
    const userProfile = await User.findById(userId);
    
    if (!userProfile) {
      return res.status(404).send('User not found');
    }
  
    // Check if there is an authenticated user
    const loggedInUserId = req.user ? req.user.id : null;    
    const isOwnProfile = loggedInUserId === userId;
  
    // Render the appropriate template based on the condition
    if (isOwnProfile) {
      return res.render('User/profile', { userProfile, isOwnProfile: true });
    } else {
      return res.render('User/profile', { userProfile, isOwnProfile: false });
    }    
};
  
  
module.exports.getEditUserProfile = async (req, res) => {
      
    const {userId} = req.params;
  
    // Retrieve the user profile from the database
    const userProfile = await User.findById(userId);
    
    if (!userProfile) {
      return res.status(404).send('User not found');
    }
  
    // Check if there is an authenticated user
    const loggedInUserId = req.user ? req.user.id : null;

    const isOwnProfile = loggedInUserId === userId;
  
    // Render the appropriate template based on the condition
    if (isOwnProfile) {        
      return res.render('User/editUser', { userProfile, isOwnProfile: true });
    } else {
        req.flash('error', "You're not authrized to edit this");
        return res.redirect(`/profile/${userId}`)
    }    
  };

 module.exports.editUserProfile =  async (req, res)=>{
    // Accessing the authenticated user object using req.user
    const user = req.user;
    await User.findByIdAndUpdate(user._id, req.body);
    req.flash('success', 'successfully edited a campground');  
    res.redirect(`/profile/${user._id}`);    
  }

  module.exports.logout = async (req, res, next) => {
    await req.logOut(function (err) {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Goodbye!');
      res.redirect('/campgrounds');
    });
  }
  
 module.exports.login = async(req, res)=>{
    req.flash('success', 'welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl)
    }

    module.exports.register = async (req, res, next) => {
      try {
        const { username, email, password, reviewRes } = req.body;
        const user = new User({ username, email, reviewRes });
        const registeredUser = await User.register(user, password);
        await req.login(registeredUser, (err) => {
          if (err) {
            return next(err);
          }

          req.flash('success', "You're successfully logged in");
         return res.redirect(`/profile/${registeredUser._id}`);
        });
      } catch (error) {
        if (error.message.includes('E11000 duplicate key error')) {
          // Custom error message for duplicate email
          req.flash('error', 'That email is already being used.');
        } else {
          // Default error message for other errors
          req.flash('error', error.message);
        }
        res.redirect('/register');
      }
    };
    

    module.exports.loginForm = (req, res)=>{
      res.render('User/login')
    }

    module.exports.registerForm = (req, res)=>{
      res.render('User/register');
  }

  module.exports.deleteUserProfile =  async (req, res)=>{
    // Accessing the authenticated user object using req.user
    const user = req.user;
    console.log(user.username)
    await User.findByIdAndDelete(user._id);
    req.flash('success', 'successfully deleted user');  
    res.redirect(`/campgrounds`);    
  }
