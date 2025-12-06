// backend/models/Order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Customer = require("./Customer");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenantId: { type: DataTypes.INTEGER, allowNull: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: "Pending" }
}, {
  timestamps: true
});

Order.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

module.exports = Order;
