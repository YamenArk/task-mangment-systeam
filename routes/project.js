const express = require('express');
const projectController = require('../controllers/project');
const isAuth_add = require('../middleware/project-auth');
const isAuth_gets = require('../middleware/gets-auth');
const { body } = require('express-validator');


const router = express.Router();


//////////////////////////////////////////////////////////user
router.post('/project',isAuth_add,
[
    body('title')
      .isLength({ min: 3 }),
      body('description')
      .trim()
      .isLength({ min: 5 })
]
,projectController.add_project);
router.put('/project/:projectID',isAuth_add,
[
    body('title')
      .isLength({ min: 3 }),
      body('description')
      .trim()
      .isLength({ min: 5 }),
      body('status')
      .isBoolean()
]
,projectController.update_project);
router.delete('/project/:projectID',isAuth_add,projectController.delete_project);
router.get('/project/:projectID',isAuth_gets,projectController.get_project);
router.get('/projects',isAuth_gets,projectController.get_projects);
router.get('/project/:projectID/taskgroups',isAuth_gets,projectController.get_task_group);


router.post('/project/:projectID/supervisor/:supervisorID',isAuth_add,projectController.add_project_to_supervisor);
router.delete('/project/:projectID/supervisor/:supervisorID',isAuth_add,projectController.delete_project_supervisors);
router.get('/project/:projectID/supervisor',isAuth_gets,projectController.get_project_supervisors);

module.exports = router;