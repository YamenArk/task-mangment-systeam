const express = require('express');
const taskgroupController = require('../controllers/taskgroup');
const isAuth_add = require('../middleware/task-group-auth');
const isAuth_gets = require('../middleware/gets-auth');
const { body } = require('express-validator');


const router = express.Router();


//////////////////////////////////////////////////////////user
router.post('/taskgroup/:projectID',isAuth_add,
[
    body('title')
      .isLength({ min: 3 })
]
,taskgroupController.add_task_group);
router.put('/taskgroup/:taskgroupID',isAuth_add,
[
    body('title')
    .isLength({ min: 3 }),
    body("status")
    .isBoolean()
]
,taskgroupController.update_task_group);
router.delete('/taskgroup/:taskgroupID',isAuth_add,taskgroupController.delete_task_group);
router.get('/taskgroup/:taskgroupID/task',isAuth_gets,taskgroupController.get_tasks);
router.get('/taskgroup/:taskgroupID',isAuth_gets,taskgroupController.get_task_group);




module.exports = router;