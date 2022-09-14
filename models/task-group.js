const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const TaskGroup = sequelize.define('taskGroup', {
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
});



module.exports = TaskGroup;