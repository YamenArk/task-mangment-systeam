const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { use } = require('../routes/user');
const { validationResult } = require('express-validator/check');


exports.login = (req,res,next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    } 
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({where :{username : username,password : password}})
    .then(user =>{
        if(!user)
        {
            const error = new Error('plz check the username or the password');
            error.statusCode = 401;
            throw error;
        }
        if(!user.active)
        {
            const error = new Error('you cant login because are not active');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
              userId : user.id,
              userRole : user.role
            },
            'somesupersecretsecret',
            { expiresIn: '1y' }
          );
        res.status(200).send({
            user : user,
            token : token
        })
    })
    .catch(err =>{
        if(!err.statusCode)
        {
        err.status = 500;
        }
        next(err);
    });
}