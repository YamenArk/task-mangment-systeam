const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    role: {
      type: Sequelize.INTEGER
    },
    username: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
        unique : true
      },
    firstname: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    fathername: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    password :{
        type : Sequelize.STRING,
        allowNull: false
        },
    image:{
        type: Sequelize.STRING,
        allowNull: false
    }
});



module.exports = User;