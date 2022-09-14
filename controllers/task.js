const Project = require('../models/project');
const User = require('../models/user');
const Taskgroup = require('../models/task-group');
const Task = require('../models/task');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { stat } = require('fs');
const { validationResult } = require('express-validator/check');



////////////////////////////////////////////////////user
exports.add_task = async(req,res,next) =>
{
    let taskgroup;
    try
    {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors)
          const error = new Error('Validation failed, entered data is incorrect.');
          error.statusCode = 422;
          throw error;
        }  
        const taskgroupID = req.params.taskgroupID;
        const title = req.body.title;
        const DeadLine = req.body.DeadLine;
        if(req.userRole == 0 ) //admin
        {
            taskgroup = await Taskgroup.findByPk(taskgroupID);
        }
        else //supervisor 
        {
            const user = await User.findByPk(req.userId);
            if(!user)
                {
                    const error = new Error('Could not find this user.');
                    error.statusCode = 404;
                    throw error;
                }
            taskgroup = await Taskgroup.findByPk(taskgroupID);
            if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            if(!taskgroup.status)
            {
                const error = new Error('this taskgroup has finished.');
                error.statusCode = 400;
                throw error;
            }
            const project_tabel = await Project.findByPk(taskgroup.projectId);
            if(!project_tabel)
            {
                const error = new Error('Could not find the project of this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const projects = await user.getProjects({where:{id : project_tabel.id}});
            const project = projects[0];
            if(!project)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }
        if(!taskgroup)
        {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        const does_the_title_unique = await taskgroup.getTasks({where : {title : title}})
        if(does_the_title_unique.length != 0)
        {
            const error = new Error('the title you enterd is already exist.');
            error.statusCode = 401;
            throw error;
        }
        taskgroup.createTask(
            {
                title: title,
                DeadLine : DeadLine,
                status : true
            }
        )
        res.status(201).send({
            message : 'Task created successfully'
        })
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}



exports.get_task = async(req,res,next)=>{
    const taskID = req.params.taskID;
    let task;
    try
    {
        if(req.userRole == 0 ) //admin
        {
            task = await Task.findByPk(taskID);
            if(!task)
            {
                const error = new Error('Could not find this task.');
                error.statusCode = 404;
                throw error;
            }
        }
        else //supervisor 
        {
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
            const taskgroup = await Taskgroup.findByPk(task.taskGroupId);
            if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const project_tabel = await Project.findByPk(taskgroup.projectId);
            if(!project_tabel)
            {
                const error = new Error('Could not find the project of this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const projects = await user.getProjects({where:{id : project_tabel.id}});
            const project = projects[0];
            if(!project)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }
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


exports.update_task = async(req,res,next) =>{

    let task,taskgroup;
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
        const title = req.body.title;
        const DeadLine = req.body.DeadLine;
        const status = req.body.status;
        if(req.userRole == 0 ) //admin
        {
            task = await Task.findByPk(taskID);
            if(!task)
            {
                const error = new Error('Could not find this task.');
                error.statusCode = 404;
                throw error;
            }
            taskgroup = await Taskgroup.findByPk(task.taskGroupId);
            if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
        }
        else //supervisor 
        {
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
            taskgroup = await Taskgroup.findByPk(task.taskGroupId);
            if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const project_tabel = await Project.findByPk(taskgroup.projectId);
            if(!project_tabel)
            {
                const error = new Error('Could not find the project of this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const projects = await user.getProjects({where:{id : project_tabel.id}});
            const project = projects[0];
            if(!project)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }
        const does_the_title_unique = await taskgroup.getTasks(
            {where :  {
                    [Op.and]:[
                        {title : title },
                        {id: { [Op.ne] : taskID}},
                    ]
                }
            })
        if(does_the_title_unique.length != 0)
        {
            const error = new Error('the title you enterd is already exist.');
            error.statusCode = 401;
            throw error;
        }
        task.title = title;
        task.DeadLine = DeadLine;
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



exports.delete_task = async (req,res,next) =>{
    const taskID = req.params.taskID;
    let task;
    try
    {
        if(req.userRole == 0 ) //admin
        {
            task = await Task.findByPk(taskID);
            if(!task)
            {
                const error = new Error('Could not find this task.');
                error.statusCode = 404;
                throw error;
            }
        }
        else //supervisor 
        {
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
            const taskgroup = await Taskgroup.findByPk(task.taskGroupId);
            if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const project_tabel = await Project.findByPk(taskgroup.projectId);
            if(!project_tabel)
            {
                const error = new Error('Could not find the project of this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const projects = await user.getProjects({where:{id : project_tabel.id}});
            const project = projects[0];
            if(!project)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }
        task.destroy();
        res.status(200).json({
            message : 'the task has been deleted'
        })
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}


exports.add_task_to_employee = async (req,res,next) =>{
    try
    {
        const taskID = req.params.taskID;
        const employeeID = req.params.employeeID;
        const employee = await User.findByPk(employeeID)
        if(!employee || employee.active == false)
            {
                const error = new Error('Could not find this employee.');
                error.statusCode = 404;
                throw error;
            }
        if(employee.role != 4 || !employee.active)///////////////////////////////////////
        {
            const error = new Error('this is not an employee to add task to him.');
            error.statusCode = 404;
            throw error;
        }
        let task;
        if(req.userRole == 0 ) //admin
        {
            task = await Task.findByPk(taskID);
            if(!task)
            {
                const error = new Error('Could not find this task.');
                error.statusCode = 404;
                throw error;
            }
        }
        else //supervisor 
        {
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
            const taskgroup = await Taskgroup.findByPk(task.taskGroupId);
            if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const project_tabel = await Project.findByPk(taskgroup.projectId);
            if(!project_tabel)
            {
                const error = new Error('Could not find the project of this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const projects = await user.getProjects({where:{id : project_tabel.id}});
            const project = projects[0];
            if(!project)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }
        if(task.userId == employeeID)
        {
            const error = new Error('this user is alredy connected to this task.');
            error.statusCode = 404;
            throw error;
        }
        employee.addTask(task);
        res.status(201).send({
            'message' : 'it has been added'
        })
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }

















}

exports.remove_task_to_employee = async (req,res,next) =>{
    try
    {
        const taskID = req.params.taskID
        let task;
        if(req.userRole == 0 ) //admin
        {
            task = await Task.findByPk(taskID);
            if(!task)
            {
                const error = new Error('Could not find this task.');
                error.statusCode = 404;
                throw error;
            }
        }
        else //supervisor 
        {
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
            const taskgroup = await Taskgroup.findByPk(task.taskGroupId);
            if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const project_tabel = await Project.findByPk(taskgroup.projectId);
            if(!project_tabel)
            {
                const error = new Error('Could not find the project of this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            const projects = await user.getProjects({where:{id : project_tabel.id}});
            const project = projects[0];
            if(!project)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }
        task.userId = null;
        task.save();
        res.status(201).send({
            'message' : 'it has been deleted'
        })
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}





