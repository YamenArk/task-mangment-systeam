const User = require('../models/user');


exports.get_supervisor_projects = async(req,res,next) =>{
    try
    {
        const supervisorID = req.params.supervisorID;

        const user = await User.findByPk(supervisorID);
        if(!user || !user.active)
        {
            const error = new Error('Could not find this supervisor.');
            error.statusCode = 404;
            throw error;
        }
        if(user.role > 3 || user.role <1)
        {
            const error = new Error('only a supervisor are connected to projects.');
            error.statusCode = 404;
            throw error;
        }
        const projects = await user.getProjects();
        if(!projects || projects.length === 0)
        {
            const error = new Error('this supervisor has no projects.');
            error.statusCode = 404;
            throw error;
        }
        // let send_project;
        // send_project.id = projects.id;
        // send_project.title = projects.title;
        // send_project.description = projects.description;
        // send_project.status = projects.status;

        res.status(200).json({
            projects : projects
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

exports.get_employee_tasks = async(req,res,next) =>{
    try
    {
        const employeeID = req.params.employeeID;
        const user = await User.findByPk(employeeID);
        if(!user || !user.active)
            {
                const error = new Error('Could not find this user.');
                error.statusCode = 404;
                throw error;
            }
        if(user.role !=4)
        {
            const error = new Error('only a employee are connected to tasks.');
            error.statusCode = 404;
            throw error;
        }
        const tasks =  await user.getTasks();
        if(!tasks || tasks.length == 0)
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