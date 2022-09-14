const Sequelize = require('sequelize');

const sequelize = new Sequelize('TaskMangmentSysteam', 'root', '', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
