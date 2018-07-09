var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

router.post('/login', function(req, res, next) {
  passport.authenticate('local',{session: false}, function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
      console.log(req.get('Authorization'));
      return res.json({
      success:false,
      message: 'Login Failed' });
     }
    req.logIn(user,{session: false}, function(err) {
      if (err) { return next(err); }

      const token = jwt.sign({user:user}, 'your_jwt_secret',{ expiresIn: '3m' });
      return res.json({
        success:true,
        message: 'Login Successful',
        token});
    });
  })(req, res, next);
});




router.get('/logout', function(req, res){
    if(req.isAuthenticated()){
      req.logout();
      res.json({
          success:true,
          message: 'Logout seuccessful'
      });
    }
  });

  

module.exports = router;
