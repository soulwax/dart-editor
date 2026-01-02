// Database connection and setup
require("dotenv").config();
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { files } = require("./schema");

// Create connection
const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL or DB_URL not found in environment variables");
  console.error("   Please create a .env file with DATABASE_URL=postgresql://...");

  // Don't exit in serverless environments - let it fail gracefully
  if (!process.env.VERCEL && !process.env.NETLIFY) {
    process.exit(1);
  }
}

if (connectionString) {
  console.log("✅ Database connection string loaded:",
    connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
}

// Configure for serverless - max 1 connection, reuse connections
const client = postgres(connectionString, {
  max: 1, // Single connection for serverless
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(client, { schema: { files } });

module.exports = {
  db,
  client,
  files,
};

