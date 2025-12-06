require("dotenv").config();
const sequelize = require("./config/db");

const Tenant = require("./models/Tenant");
const Product = require("./models/Product");
const Customer = require("./models/Customer");

async function seed() {
  await sequelize.sync();

  const tenants = await Tenant.findAll();
  if (!tenants.length) {
    console.log("❌ No tenants found! Register at least 1 user first.");
    process.exit();
  }

  console.log(`🔍 Found ${tenants.length} tenants. Seeding data...\n`);

  for (const tenant of tenants) {
    const tenantId = tenant.id;
    console.log(`🌟 Seeding tenant ${tenantId} (${tenant.email})`);

    // -------------------------------
    // PRODUCTS
    // -------------------------------
    const existingProducts = await Product.count({ where: { tenantId } });

    if (existingProducts === 0) {
      await Product.bulkCreate([
        { tenantId, title: "T-Shirt", price: 499 },
        { tenantId, title: "Shoes", price: 1299 },
        { tenantId, title: "Jeans", price: 899 }
      ]);
      console.log("🛒 Products added");
    } else {
      console.log("✔ Products already exist — skipping");
    }

    // -------------------------------
    // CUSTOMERS
    // -------------------------------
    const existingCustomers = await Customer.count({ where: { tenantId } });

    if (existingCustomers === 0) {
      await Customer.bulkCreate([
        { firstName: "John", lastName: "Doe", email: "john@example.com", tenantId },
        { firstName: "Alice", lastName: "Smith", email: "alice@example.com", tenantId },
        { firstName: "Sam", lastName: "Lee", email: "sam@example.com", tenantId }
      ]);
      console.log("👥 Customers added");
    } else {
      console.log("✔ Customers already exist — skipping");
    }

    console.log("");
  }

  console.log("✅ Seeding completed for all tenants!");
  process.exit();
}

seed();
