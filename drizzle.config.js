// Drizzle configuration
require("dotenv").config();

module.exports = {
  schema: "./db/schema.js",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL,
  },
};

