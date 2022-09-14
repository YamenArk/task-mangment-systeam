const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const mysql = require("mysql2");

///uploading
//123123
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

connection.query(
  `CREATE DATABASE IF NOT EXISTS TaskMangmentSysteam`,
  function (err, results) {
  }
);

connection.end();



const sequelize = require('./util/database');
const ProjectUser = require('./models/project-user');
const Project = require('./models/project');
const TaskGroup = require('./models/task-group');
const Task = require('./models/task');
const User = require('./models/user');



const app = express();



const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const taskgroupRoutes = require('./routes/taskgroup');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // application/json

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


app.use('/admin',adminRoutes);
app.use('/hr',userRoutes);
app.use('/supervisor',projectRoutes);
app.use('/supervisor',taskgroupRoutes);
app.use('/supervisor',taskRoutes);
app.use('/employee',employeeRoutes);
app.use(authRoutes);

app.use(express.urlencoded({extended: true}));


app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});



User.belongsToMany(Project , {through : ProjectUser});

User.hasMany(Task);
Task.belongsTo(User);



Project.hasMany(TaskGroup, { onDelete: 'cascade' });
TaskGroup.belongsTo(Project, { onDelete: 'cascade' });


TaskGroup.hasMany(Task, { onDelete: 'cascade' });
Task.belongsTo(TaskGroup, { onDelete: 'cascade' });


sequelize
  .sync({   force: true })
  // .sync()
  .then(result => {
   app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
