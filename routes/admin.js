const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/admin');
const { body } = require('express-validator');




const router = express.Router();


//////////////////////////////////////////////////////////user
router.get('/supervisor/:supervisorID/projects',isAuth,adminController.get_supervisor_projects);
router.get('/employee/:employeeID/tasks',isAuth,adminController.get_employee_tasks);




module.exports = router;