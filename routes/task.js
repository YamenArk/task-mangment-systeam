const express = require('express');
const taskController = require('../controllers/task');
const isAuth_add = require('../middleware/task-auth');
const isAuth_gets = require('../middleware/gets-auth');
const { body } = require('express-validator');


const router = express.Router();


//////////////////////////////////////////////////////////user
router.post('/task/:taskgroupID',isAuth_add,
[
    body('title')
    .isLength({ min: 3}),
    body("DeadLine")
    .isLength({ min: 8})
]
,taskController.add_task);
router.put('/task/:taskID',
[
    body('title')
    .isLength({ min: 3}),
    body("DeadLine")
    .isLength({ min: 8}),
    body("status")
    .isBoolean
]
,isAuth_add,taskController.update_task);
router.delete('/task/:taskID',isAuth_add,taskController.delete_task);
router.get('/task/:taskID',isAuth_gets,taskController.get_task);


router.put('/task/:taskID/employee/:employeeID',isAuth_add,taskController.add_task_to_employee);
router.put('/task/:taskID/employee',isAuth_add,taskController.remove_task_to_employee);
// router.post('/task/:taskID/employee/:employeeID',isAuth_add,taskController.add_task_to_employee);




module.exports = router;