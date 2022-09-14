const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const Task = sequelize.define('task', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
    title: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
    status: {
        type: Sequelize.BOOLEAN,
        required: true,
        allowNull: false,
      },      
    DeadLine: {
        type: Sequelize.DATEONLY,
        allowNull: false
        }
});



module.exports = Task;