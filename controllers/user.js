const User = require('../models/user');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { stat } = require('fs');


const io = require('../socket')
////////////////////////////////////////////////////user
exports.add_user = (req,res,next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }    
    if (!req.file) {
      const error = new Error('No image provided.');
      error.statusCode = 422;
      throw error;
    }
    const username = req.body.username;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const fathername = req.body.fathername;
    const role = req.body.role;
    if(role == 0 && req.userRole != 0)
    {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;  
    }
    destination= req.file.destination.split('./public');
    const image = destination[1]+'/'+req.file.filename;
    User.findOne({where : {username : username}})
    .then(user =>{
        if(user)
        {
            const error = new Error('you alreday have an account with this username');
            error.statusCode = 404;
            throw error;
        }
        User.create({
            username : username,
            password : password,
            firstname : firstname,
            lastname : lastname,
            active : true,
            fathername : fathername,
            image : image,
            role : role
        })
    })
    .then(() =>{
        res.status(201).json({
            message : 'user created successfully'
        });
    })
    .catch(err =>{
        if(!err.statusCode)
        {
        err.status = 500;
        }
        next(err);
    });
}

exports.update_user = (req,res,next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }    
    const userID = req.params.userID;
    const username = req.body.username;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const fathername = req.body.fathername;
    destination= req.file.destination.split('./public');
    const image = destination[1]+'/'+req.file.filename;
    const role = req.body.role;
    const active = req.body.active;
    if(role == 0 && req.userRole != 0)
    {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;  
    }
    User.findByPk(userID)
    .then(user =>{
        if(!user)
        {
            const error = new Error('Could not find this user.');
            error.statusCode = 404;
            throw error;
        }
        if(user.role == 0 && req.userRole != 0)
        {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;  
        }
        if(user.image != image)
        {
            clearImage(user.image);
        }
        user.image = image;
        user.username = username;
        user.password = password;
        user.firstname = firstname;
        user.lastname = lastname;
        user.role = role;
        user.fathername = fathername;       
        user.active = active;       
        return user.save();
   
    })
    .then(() =>{
        res.status(200).json({
            message: 'the user has been updated'
        });
    })
    .catch(err =>{
        if(!err.statusCode)
        {
        err.status = 500;
        }
        next(err);
    });
}




exports.get_users = async (req,res,next)=>{
    let  users;
    try
    {
        if(req.userRole == 0 ) //admin
        {
            users = await User.findAll() ;
        }
        else  if(req.userRole == 5 )
        {
            users = await User.findAll({where:{role: { [Op.ne] : 0}}}) ;
        }
        else  if(req.userRole == 1 )
        {
            users = await User.findAll({
                where :  {
                    [Op.and]:[
                        {role: { [Op.ne] : 0}},
                        {role: { [Op.ne] : 5}},
                        {active: true}
                    ]
                }
            }) ;
        }
        else
        {
            users = await User.findAll({
                where :  {
                    [Op.and]:[
                        {role: 4},
                        {active: true}
                    ]
                }
            }) ;
        }
        if(!users || users.length == 0)
        {
            const error = new Error('thier are no users');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).send(users);
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}

exports.get_user = (req,res,next) =>{
    const userID = req.params.userID;
    User.findByPk(userID)
    .then(user =>{
        if(!user)
        {
            const error = new Error('Could not find this user.');
            error.statusCode = 404;
            throw error;
        }
        if(req.userRole == 0)
        {
 
        }
        else if(req.userRole == 1)
        {
            if(user.role == 0 || user.role == 5)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error; 
            }
        }
        else if(req.userRole == 2 || req.userRole == 3)
        {
            if(user.role == 4)
            {
                
            }
            else
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }
        else if(req.userRole == 5)
        {
            if(user.role == 0)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error; 
            }
        }
        res.status(200).send(user);
    })
    .catch(err =>{
        if(!err.statusCode)
        {
        err.status = 500;
        }
        next(err);
    });
}


exports.delete_user = (req,res,next) =>{
    const userID = req.params.userID;
    User.findByPk(userID)
    .then(user =>{
        if(!user)
        {
            const error = new Error('Could not find this user.');
            error.statusCode = 404;
            throw error;
        }
        if(user.role == 0 && req.userRole != 0)
        {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;  
        }
        clearImage(user.image);
        user.destroy();
    })
    .then(() =>{
        res.status(200).json({
            message : 'the user has been deleted'
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


const clearImage = filePath => {
    filePath = path.join(__dirname, '../public', filePath);
    fs.unlink(filePath, err => console.log());
    // fs.rmdir(filePath, { recursive: true }, err => console.log(err));
  };