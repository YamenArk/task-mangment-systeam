const Project = require('../models/project');
const User = require('../models/user');
const Taskgroup = require('../models/task-group');
const Sequelize = require('sequelize');
const Task = require('../models/task');
const Op = Sequelize.Op;
const { stat } = require('fs');
const { validationResult } = require('express-validator/check');




////////////////////////////////////////////////////user
exports.add_task_group = async(req,res,next) =>
{

    let project;
    try
    {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        const projectID = req.params.projectID;
        const title = req.body.title;
        if(req.userRole == 0 ) //admin
        {
            project = await Project.findByPk(projectID);
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
            const projects = await user.getProjects({where:{id : projectID}});
            project = projects[0];
         }
        if(!project)
        {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        if(!project.status)
            {
                const error = new Error('this projects has finished.');
                error.statusCode = 400;
                throw error;
            }
        const does_the_title_unique = await project.getTaskGroups({where : {title : title}})
        if(does_the_title_unique.length != 0)
        {
            const error = new Error('the title you enterd is already exist.');
            error.statusCode = 401;
            throw error;
        }
        project.createTaskGroup(
            {
                title: title,
                status : true
            }
        )
        res.status(201).send({
            message : 'Taskgroup created successfully'
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


exports.get_task_group = async(req,res,next)=>{
    const taskgroupID = req.params.taskgroupID;
    let taskgroup;
    try
    {
        if(req.userRole == 0 ) //admin
        {
            taskgroup = await Taskgroup.findByPk(taskgroupID);
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
            taskgroup = await Taskgroup.findByPk(taskgroupID);
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
        all_tasks =  await Task.count({where : {
            taskGroupId : taskgroup.id
        }});
        finished_tasks = await Task.count({where : {
            [Op.and]:[
                {  taskGroupId : taskgroup.id },
                {   status : false},
            ]
        }});
        percentage  = (finished_tasks*100) / all_tasks;
        const sending_taskgroups = {
            id : taskgroup.id,
            title : taskgroup.title,
            status : taskgroup.status,
            percentage : percentage,
            projectId : taskgroup.projectId,
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


exports.update_task_group = async(req,res,next) =>{
 
    let taskgroup,project;
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
        const status = req.body.status;
        if(req.userRole == 0 ) //admin
        {
            taskgroup = await Taskgroup.findByPk(taskgroupID);
            if(!taskgroup)
            {
                const error = new Error('Could not find this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            project =  await Project.findByPk(taskgroup.projectId);
            if(!project)
            {
                const error = new Error('Could not find the project of this taskgroup.');
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
            taskgroup = await Taskgroup.findByPk(taskgroupID);
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
            project = projects[0];
            if(!project)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }
        const does_the_title_unique = await project.getTaskGroups(
            {where :  {
                [Op.and]:[
                    {title : title },
                    {id: { [Op.ne] : taskgroupID}},
                ]
            }
        })
        if(does_the_title_unique.length != 0)
        {
            const error = new Error('the title you enterd is already exist.');
            error.statusCode = 401;
            throw error;
        }
        if(status == false && taskgroup.status == true)
        {
            const do_all_tasks_are_done =  taskgroup.getTasks({
                where :{status : true}
            })
            if(do_all_tasks_are_done.length != 0)
        {
            res.status(401).send({
                message : 'thier are some tasks are not done yet',
                tasks : do_all_tasks_are_done
            })
        }
        }
        taskgroup.title = title;
        taskgroup.status = status;
        taskgroup.save();
        res.status(200).send(taskgroup);
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}

exports.delete_task_group = async (req,res,next) =>{
    const taskgroupID = req.params.taskgroupID;
    let taskgroup;
    try
    {
        if(req.userRole == 0 ) //admin
        {
            taskgroup = await Taskgroup.findByPk(taskgroupID);
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
            taskgroup = await Taskgroup.findByPk(taskgroupID);
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
        await taskgroup.destroy();
        res.status(200).json({
            message : 'the taskgroup has been deleted'
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

exports.get_tasks = (req,res,next) =>{
    const taskgroupID = req.params.taskgroupID;
    Taskgroup.findByPk(taskgroupID)
    .then(taskgroup =>{
        if(!taskgroup)
        {
            const error = new Error('Could not find this taskgroup.');
            error.statusCode = 404;
            throw error;
        }
        return taskgroup.getTasks();
    })
    .then(task =>{
        if(!task || task.length === 0)
        {
            const error = new Error('this taskgroup has no task.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).send(task);
    })
    .catch(err =>{
        if(!err.statusCode)
        {
        err.status = 500;
        }
        next(err);
    });
}