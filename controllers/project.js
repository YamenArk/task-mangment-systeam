const Project = require('../models/project');
const User = require('../models/user');
const Projectuser = require('../models/project-user');
const Taskgroup = require('../models/task-group');
const { validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');
const Task = require('../models/task');
const FCM = require('../util/notification');
const fcm = FCM.fcm;

const Op = Sequelize.Op;




////////////////////////////////////////////////////user
exports.add_project = (req,res,next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }  
    const title = req.body.title;
    const description = req.body.description;
    User.findByPk(req.userId)
    .then(user =>{
        if(!user)
        {
            const error = new Error('Could not find this user.');
            error.statusCode = 404;
            throw error;
        }
        if(req.userRole == 0)
        {
            Project.create({
                title: title,
                description: description,
                status : true 
            })
        }
        else
        {
            user.createProject({
                title: title,
                description: description,
                status : true
            })
        }
    })
    .then(() =>{
        res.status(201).json({
            message : 'project created successfully'
        });
    })
    .catch(err =>{
        if(!err.statusCode)
        {
        err.status = 500;
        }
        next(err);
    });
}


exports.get_projects = async(req,res,next)=>{
    let projects;
    try
    {
        if(req.userRole == 0 ) //admin
        {
            projects = await Project.findAll();
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
                projects = await user.getProjects();
        }
        if(!projects || projects.length === 0)
        {
            const error = new Error('you have no projects.');
            error.statusCode = 404;
            throw error;
        }
        let i= 0;
        let sending_projects = [ ];
        while(projects[i])
        {
            all_taskgroups =  await Taskgroup.count({where : {
                projectId : projects[i].id
            }});
            finished_taskgroup = await Taskgroup.count({where : {
                [Op.and]:[
                    {  projectId : projects[i].id },
                    {   status : false},
                ]
            }});
            percentage  = (finished_taskgroup*100) / all_taskgroups;
            element = {
                id : projects[i].id,
                title : projects[i].title,
                description : projects[i].description,
                status : projects[i].status,
                percentage : percentage,
                createdAt : projects[i].createdAt
            }
            sending_projects.push(element);
            i++;
        }
        res.status(200).json({
            projects : sending_projects
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

exports.get_project = async(req,res,next) =>{
    const projectID = req.params.projectID;
    try
    {
        let project;
        if(req.userRole == 0 ) //admin
        {
            project = await Project.findByPk(projectID)
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
            project = projects[0]
        }
        if(!project)
        {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        all_taskgroups =  await Taskgroup.count({where : {
            projectId : project.id
        }});
        finished_taskgroup = await Taskgroup.count({where : {
            [Op.and]:[
                {  projectId : project.id },
                {   status : false},
            ]
        }});
        percentage  = (finished_taskgroup*100) / all_taskgroups;
        const send_project = {
            id : project.id,
            title : project.title,
            description : project.description,
            status : project.status,
            percentage : percentage,
        }
        res.status(200).send(send_project);

    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }



}

exports.update_project = async(req,res,next) =>{
    let project;
    try
    {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors)
          const error = new Error('Validation failed, entered data is incorrect.');
          error.statusCode = 422;
          throw error;
        }  
        const projectID = req.params.projectID;
        const title = req.body.title;
        const description = req.body.description;
        const status = req.body.status;
        if(req.userRole == 0 ) //admin
        {
            project = await Project.findByPk(projectID)
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
            project = projects[0]
        }
        if(!project)
        {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        if(status == false && project.status == true)
        {
            const do_all_task_groups_are_done =  project.getTaskGroups({
                where :{status : true}
            })
            if(do_all_task_groups_are_done.length != 0)
            {
            res.status(401).send({
                message : 'thier are some task group are not done yet',
                tasks : do_all_task_groups_are_done
            })
            }
        }
        project.title = title;
        project.description = description;
        project.status = status;
        await project.save();
        res.status(200).json({
            message: 'the project has been updated'
        });
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }

}

exports.delete_project = async (req,res,next) =>{
    const projectID = req.params.projectID;
    let project;
    try
    {
        if(req.userRole == 0 ) //admin
        {
            project = await Project.findByPk(projectID)
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
            project = projects[0]
        }
        if(!project)
        {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        await project.destroy();
        res.status(200).json({
            message : 'the project has been deleted'
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




exports.get_task_group = async (req,res,next) => {
     try
     {
        const projectID = req.params.projectID;
        let taskgroup
        const project = await Project.findByPk(projectID)
        if(!project)
        {
            const error = new Error('Could not find this project.');
            error.statusCode = 404;
            throw error;
        } 

        if(req.userRole == 0 ) //admin
        {
            taskgroup = await project.getTaskGroups();
            if(!taskgroup || taskgroup.length === 0)
            {
                const error = new Error('this project has no taskgroups.');
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
            taskgroup = await project.getTaskGroups();


            if(!taskgroup || taskgroup.length === 0)
            {
                const error = new Error('this project has no taskgroups.');
                error.statusCode = 404;
                throw error;
            }
            const project_tabel = await Project.findByPk(taskgroup[0].projectId);
            if(!project_tabel)
            {
                const error = new Error('Could not find the project of this taskgroup.');
                error.statusCode = 404;
                throw error;
            }
            console.log(project_tabel.id)
            const projects = await user.getProjects({where:{id : project_tabel.id}});
            const project1 = projects[0];
            if(!project1)
            {
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
        }  


        let i= 0;
        let sending_taskgroups = [ ];
        while(taskgroup[i])
        {
            all_tasks =  await Task.count({where : {
                taskGroupId : taskgroup[i].id
            }});
            finished_tasks = await Task.count({where : {
                [Op.and]:[
                    {  taskGroupId : taskgroup[i].id },
                    {   status : false},
                ]
            }});
            percentage  = (finished_tasks*100) / all_tasks;
            element = {
                id : taskgroup[i].id,
                title : taskgroup[i].title,
                status : taskgroup[i].status,
                percentage : percentage,
                projectId : taskgroup[i].projectId,
            }
            sending_taskgroups.push(element);
            i++;
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


exports.add_project_to_supervisor = async(req,res,next) =>{
    try
    {
        let project;
        const projectID = req.params.projectID;
        const supervisorID = req.params.supervisorID;
        const does_this_user_already_connected_to_this_projects = await Projectuser.findOne({
            where: {
                [Op.and]:[
                    {userId : supervisorID },
                    {projectId : projectID},
                ]
        }})
        if(does_this_user_already_connected_to_this_projects)
        {
            const error = new Error('this user is already connected to this project.');
            error.statusCode = 400;
            throw error; 
        }
        if(req.userRole == 0 ) //admin
        {
            project = await Project.findByPk(projectID)
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
        const user =await User.findByPk(supervisorID);
        if(!user || !user.active)
        {
            const error = new Error('Could not find this supervisor.');
            error.statusCode = 404;
            throw error;
        }
        if(user.role > 3 || user.role <1)
        {
            const error = new Error('you can add only a supervisor to projects.');
            error.statusCode = 404;
            throw error;
        }
         await user.addProject(project);

        res.status(200).send({
            message : 'it has been added successfully'
        })
        // toToken = Ins_Info.tokenMessage;
        // instructorId = Ins_Info.id;
        // var message2 = {
        //     to:toToken,
        //     notification:{
        //     title:'Project',
        //     body: 'you have been added to new project please check it'
        //     }
        // };


        // fcm.send(message2,function(err,response){
        //     if(err){
        //       console.log("response : " + err);
        //     }else{
        //       console.log("Successfully sent with response : " , response);
        //     }
        //    await user.addProject(project);
        //   });




        // var users = [];
        // const data = 'you have been added to this project';
        // io.on('connection', function (socket) {
        //     users.put(socket);

        //     socket.on('chat', function (data) {
        //         console.log(data);

        //         users[0].emit('chat', data);
        //     });
        // });
        // io.getIO().in(user.id).emit('posts', {
        //     action: 'create',
        //     post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
        //   });
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}


exports.delete_project_supervisors = async(req,res,next) =>{
    try
    {
        let project;
        const projectID = req.params.projectID;
        const supervisorID = req.params.supervisorID;
        if(req.userRole == 0 ) //admin
        {
            project = await Project.findByPk(projectID)
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
        const user =await User.findByPk(supervisorID);
        if(!user)
        {
            const error = new Error('Could not find this supervisor.');
            error.statusCode = 404;
            throw error;
        }

        await user.removeProject(project);
        res.status(200).send({
            message : 'it has been deleted successfully'
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


exports.get_project_supervisors = async(req,res,next) =>{

    try
    {
        let project;
        const projectID = req.params.projectID;
        if(req.userRole == 0 ) //admin
        {
            project = await Project.findByPk(projectID)
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
        // const users = await project.getUsers();
        let sending_users = [ ];
        const projectuser = await Projectuser.findAll({
            where :{
                projectId : projectID
            }
        });
        if(projectuser.length == 0)
        {
            const error = new Error('this project has no users.');
            error.statusCode = 404;
            throw error;
        }
        let i =0;
        while(projectuser[i])
        {
            let user = await User.findByPk(projectuser[i].userId)
            sending_users.push(user);
            i++;
        }
        res.status(200).send(sending_users)
    }
    catch(err)
    {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}

