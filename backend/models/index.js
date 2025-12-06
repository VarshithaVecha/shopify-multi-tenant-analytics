const Tenant = require("./Tenant");
const Customer = require("./Customer");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// Associations
Customer.hasMany(Order, { foreignKey: "customerId" });
Order.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });

module.exports = { Tenant, Customer, Product, Order, OrderItem };
