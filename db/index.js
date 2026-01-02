// Database connection and setup
require("dotenv").config();
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { files } = require("./schema");

// Create connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL not found in environment variables");
  console.error("   Please create a .env file with DATABASE_URL=postgresql://...");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema: { files } });

module.exports = {
  db,
  client,
  files,
};

