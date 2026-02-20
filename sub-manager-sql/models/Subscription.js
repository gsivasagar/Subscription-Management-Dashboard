const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  billingCycle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nextRenewalDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Subscription;