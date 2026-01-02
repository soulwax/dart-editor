// Database connection and setup
require("dotenv").config();
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { files } = require("./schema");

// Create connection - support both DATABASE_URL (Neon/Vercel) and DB_URL
const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL or DB_URL not found in environment variables");
  console.error("   Please create a .env file with DATABASE_URL=postgresql://...");
  console.error("   or DB_URL=postgresql://...");
  process.exit(1);
}

console.log("✅ Database connection string loaded:",
  connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

const client = postgres(connectionString);
const db = drizzle(client, { schema: { files } });

module.exports = {
  db,
  client,
  files,
};

