const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Customer = sequelize.define("Customer", {
  tenantId: DataTypes.INTEGER,
  shopifyId: DataTypes.STRING,
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  totalSpent: DataTypes.FLOAT,
});

module.exports = Customer;
