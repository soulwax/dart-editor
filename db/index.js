// Database connection and setup
require("dotenv").config();
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { files } = require("./schema");

// Create connection
const connectionString = process.env.DB_URL;
if (!connectionString) {
  console.error("❌ DB_URL not found in environment variables");
  console.error("   Please create a .env file with DB_URL=postgresql://...");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema: { files } });

module.exports = {
  db,
  client,
  files,
};

