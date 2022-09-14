const User = require('../models/user');
const Taskgroup = require('../models/task-group');
const Project = require('../models/project');
const Task = require('../models/task');
const { validationResult } = require('express-validator/check');
const { read } = require('fs');



exports.update_task_employee = async(req,res,next) =>{

    let task;
    try
    {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors)
          const error = new Error('Validation failed, entered data is incorrect.');
          error.statusCode = 422;
          throw error;
        }  
        const taskID = req.params.taskID;
        const status = req.body.status;
        const user = await User.findByPk(req.userId);
        if(!user)
            {
                const error = new Error('Could not find this user.');
                error.statusCode = 404;
                throw error;
            }
        task = await Task.findByPk(taskID);
        if(!task)
        {
            const error = new Error('Could not find this task.');
            error.statusCode = 404;
            throw error;
        }
        if(task.userId != req.userId)
        {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        task.status = status;
        task.save();
        res.status(200).send(task);
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }   
}

exports.get_tasks = async (req,res,next) => {
    try
    {
        const user = await User.findByPk(req.userId);
        if(!user)
            {
                const error = new Error('Could not find this user.');
                error.statusCode = 404;
                throw error;
            }
        const tasks = await user.getTasks();
        if(!tasks || tasks.length ==0)
            {
                const error = new Error('you have no tasks.');
                error.statusCode = 404;
                throw error;
            }
        res.status(200).send(tasks);
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    } 
}

exports.get_projects = async (req,res,next) => {
    try
    {
        const user = await User.findByPk(req.userId);
        if(!user)
            {
                const error = new Error('Could not find this user.');
                error.statusCode = 404;
                throw error;
            }
        const tasks = await user.getTasks();
        if(!tasks || tasks.length ==0)
            {
                const error = new Error('you have no tasks.');
                error.statusCode = 404;
                throw error;
            }
        let i = 0;       
        let taskGroupId,taskgroup;
        let projectId,project;
        var array_of_taskgroups_id  = [];
        var array_of_projects_id  = []
        while(tasks[i])
        {   
            taskGroupId = tasks[i].taskGroupId;
            if(!array_of_taskgroups_id.includes(taskGroupId))
            {
                array_of_taskgroups_id.push(taskGroupId);
                taskgroup = await Taskgroup.findByPk(taskGroupId);
                if(!taskgroup)
                {
                    const error = new Error('the id of the taskgroup is not  exist.');
                    error.statusCode = 404;
                    throw error;
                }
                projectId = taskgroup.projectId;
                if(!array_of_projects_id.includes(projectId))
                {
                    await array_of_projects_id.push(projectId);
                }
            }
            i++;
        }
        if(!array_of_projects_id || array_of_projects_id.length ==0)
            {
                const error = new Error('you have no projects.');
                error.statusCode = 404;
                throw error;
            }
        i=0;
        let sending_projects = [] ;
        while(array_of_projects_id[i])
        {
            project = await Project.findByPk(array_of_projects_id[i]);
            if(!project)
            {
                const error = new Error('the id of the projects is not  exist.');
                error.statusCode = 404;
                throw error;
            }
            sending_projects.push(project);
            i++;
        }
        res.status(200).send(sending_projects);
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    } 
}

exports.get_taskgroups = async (req,res,next) => {

    try
    {
       const projectID = req.params.projectID;
       const project = await Project.findByPk(projectID)
       if(!project)
       {
           const error = new Error('Could not find this project.');
           error.statusCode = 404;
           throw error;
       } 
        const taskgroups = await project.getTaskGroups();
        if(!taskgroups || taskgroups.length === 0)
        {
            const error = new Error('this project has no taskgroups.');
            error.statusCode = 404;
            throw error;
        }
        let taskgroup,tasks;
        let i = 0,j;
        let sending_taskgroups = [];
        while(taskgroups[i])
        {
            taskgroup =  await Taskgroup.findByPk(taskgroups[i].id)
            if(taskgroup)
            {
                tasks =  await taskgroup.getTasks();
                if(tasks)
                {
                    j = 0;
                    while(tasks[j])
                    {

                        if(tasks[j].userId == req.userId)
                        {
                            sending_taskgroups.push(tasks[j])
                        } 
                        j++;
                    }
                }
            }
            i++;
        }
        if(!sending_taskgroups || sending_taskgroups.length ==0)
        {
            const error =  new Error('this user has no taskgroups.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).send(sending_taskgroups);   
           
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}

exports.get_task = (req,res,next) =>{
    let sending_tasks = [];
    const taskgroupID = req.params.taskgroupID;
    Taskgroup.findByPk(taskgroupID)
    .then(taskgroup =>{
        if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            return  taskgroup.getTasks();
    })
    .then(task =>{
        if(!task || task.length === 0)
        {
            const error = new Error('this taskgroup has no task.');
            error.statusCode = 404;
            throw error;
        }        

        let i =0;
        while(task[i])
        {
            if(task[i].userId == req.userId)
            {
                sending_tasks.push(task[i])
            } 
            i++;
        }  
    })
    .then(() =>{
        if(!sending_tasks || sending_tasks.length ==0)
        {
            const error =  new Error('this user has no tasks for this taskgroup.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).send(sending_tasks);   
    })
    .catch(err =>{
        if(!err.statusCode)
        {
        err.status = 500;
        }
        next(err);
    });
}

