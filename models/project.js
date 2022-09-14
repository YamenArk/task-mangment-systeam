const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const Project = sequelize.define('project', {
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
    description: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },      
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false
        }
});



module.exports = Project;