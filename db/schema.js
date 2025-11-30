// Database schema for file storage
const { pgTable, text, timestamp, integer } = require("drizzle-orm/pg-core");

// Files table - stores virtual file system files and directories
const files = pgTable("files", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  path: text("path").notNull().unique(),
  content: text("content").notNull().default(""),
  type: text("type").notNull().default("file"), // 'file' or 'directory'
  permissions: text("permissions").notNull().default("-rw-r--r--"),
  size: integer("size").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

module.exports = {
  files,
};
