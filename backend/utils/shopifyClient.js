const axios = require("axios");

exports.fetchCustomers = async (store, token) => {
  return await axios.get(`https://${store}/admin/api/2024-01/customers.json`, {
    headers: { "X-Shopify-Access-Token": token },
  });
};

exports.fetchOrders = async (store, token) => {
  return await axios.get(`https://${store}/admin/api/2024-01/orders.json`, {
    headers: { "X-Shopify-Access-Token": token },
  });
};

exports.fetchProducts = async (store, token) => {
  return await axios.get(`https://${store}/admin/api/2024-01/products.json`, {
    headers: { "X-Shopify-Access-Token": token },
  });
};
