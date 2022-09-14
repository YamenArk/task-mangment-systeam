const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
  const authHeader = req.get('authorization');
  
  if (!authHeader) {
    const error = new Error('Not authenticated1.');
    error.statusCode = 401;
    throw error;
  }
  
  const token =authHeader;
  let decodedToken ;
  try {
    decodedToken = jwt.verify(token, 'somesupersecretsecret');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  
  User.findByPk(req.userId)
  .then(user =>{
    if(user.role!=0 || user.role!=5)
    {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    } 
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
  next();
};