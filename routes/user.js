const express = require('express');
const userController = require('../controllers/user');
const User = require('../models/user');
const isAuth = require('../middleware/hr-is-auth');
const isAuthSee = require('../middleware/viewing-user-auth')
const router = express.Router();
const { body } = require('express-validator');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const path = require('path');

const multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
      if(req.params.userID)//////update
      {
        User.findOne({where : {
          [Op.and]:[
            {username : req.body.username },
            {id: { [Op.ne] : req.params.userID}},
        ]
         }})
        .then(user=>{
          if (user) {
            const error = new Error('the username is alredy exist');
            error.statusCode = 404;
            throw error;    
          }
          let path;
          path = './public/image';
          callBack(null, path)  //  directory name where save the file
        })
        .catch(err =>{
          if(!err.statusCode)
          {
          err.status = 500;
          }
          return callBack(err);
       });
      }
      else//////////////////////////add
      {
        User.findOne({where : {username : req.body.username}})
        .then(user=>{
          if (user) {
            const error = new Error('the username is alredy exist');
            error.statusCode = 404;
            throw error;    
          }
          let path;
          path = './public/image';
          callBack(null, path)  //  directory name where save the file
        })
        .catch(err =>{
          if(!err.statusCode)
          {
          err.status = 500;
          }
          return callBack(err);
       });
      }
   
    },
    filename: (req, file, callBack) => {
        const username = req.body.username;
        callBack(null,username + path.extname(file.originalname))
    }
  });
  const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  var upload = multer({
    storage: storage,
    fileFilter: fileFilter
  }); 



//////////////////////////////////////////////////////////user
router.post('/user',
isAuth,
upload.single('image'),
[
  body('username')
  .custom((value, { req }) => {
    return User.findOne({where : {username : value}})
    .then(user => {
        if (user) {

            return Promise.reject('Username already in use');
        }
    });
  })
  .trim()
  .isLength({ min: 5 }),
  body('password')
    .trim()
    .isLength({ min: 5 }),
    body('firstname')
    .trim()
    .isLength({ min: 3 }),
    body('lastname')
    .trim()
    .isLength({ min: 3 }),
    body('fathername')
    .trim()
    .isLength({ min: 3 }),
    body('role')
    .custom((value, { req }) => {
      if(value < 0 || value > 5)
      {
        return Promise.reject('the role should be between 0 and 5');
      }
      return value;
    })
]
,
  userController.add_user);




router.put('/user/:userID',
isAuth,
upload.single('image'),
[

  body('username')
  .custom((value, { req }) => {
    return User.findOne({where : {
      [Op.and]:[
        {username : req.body.username },
        {id: { [Op.ne] : req.params.userID}},
    ]
     }})
    .then(user => {

        if (user) {
            return Promise.reject('Username already in use');
        }
    });
  })
  .trim()
  .isLength({ min: 5 }),
  body('password')
    .trim()
    .isLength({ min: 5 }),
    body('firstname')
    .trim()
    .isLength({ min: 3 }),
    body('lastname')
    .trim()
    .isLength({ min: 3 }),
    body('fathername')
    .trim()
    .isLength({ min: 3 }),
    body('role')
    .custom((value, { req }) => {
      if(value < 0 || value > 5)
      {
        return Promise.reject('the role should be between 0 and 5');
      }
      return value;
    }),
    body('active')
    .isBoolean()
],
  userController.update_user);


router.delete('/user/:userID',isAuth,userController.delete_user);
router.get('/user/:userID',isAuthSee,userController.get_user);
router.get('/users',isAuthSee,userController.get_users);




module.exports = router;