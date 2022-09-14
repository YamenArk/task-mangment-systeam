const express = require('express');
const employeeController = require('../controllers/employee');
const isAuth = require('../middleware/employee-auth');
const { body } = require('express-validator');

const router = express.Router();


//////////////////////////////////////////////////////////user
router.get('/tasks',isAuth,employeeController.get_tasks);

router.get('/projects',isAuth,employeeController.get_projects);

router.get('/project/:projectID/taskgroup',isAuth,employeeController.get_taskgroups);


router.get('/taskgroup/:taskgroupID/tasks',isAuth,employeeController.get_task);

router.put('/task/:taskID',
[
      body('status')
      .isBoolean()
]
,isAuth,employeeController.update_task_employee);




module.exports = router;