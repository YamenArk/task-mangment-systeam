const express = require('express');
const { body } = require('express-validator');


const authController = require('../controllers/auth');

const router = express.Router();

router.post('/login', 
[
    body('username')
      .trim()
      .isLength({ min: 5 }),
    body('password')
      .trim()
      .isLength({ min: 5 })
],authController.login);

// router.post('/logout', authController.postLogout);

module.exports = router;