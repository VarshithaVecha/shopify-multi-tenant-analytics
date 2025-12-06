const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Tenant = sequelize.define("Tenant", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  shopifyStore: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  accessToken: { type: DataTypes.STRING },
});

module.exports = Tenant;
