const express = require("express");
require("dotenv").config();
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { db, files } = require("../db/index");
const { eq, and } = require("drizzle-orm");

const app = express();

// Middleware
app.use(express.json({ limit: "1mb" }));

// Note: Static files are served by Vercel directly from public/ and monaco/
// No need for express.static in serverless environment

// Use /tmp for temporary files in serverless environment
const TEMP_DIR = process.env.VERCEL ? "/tmp/dart-editor" : path.join(__dirname, "..", "temp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Check if Dart SDK is available
function checkDartSDK(callback) {
  exec("dart --version", (error, stdout, stderr) => {
    if (error) {
      console.error("Dart SDK not found in PATH");
      callback(false);
    } else {
      console.log("Dart SDK detected:", stderr.trim());
      callback(true);
    }
  });
}

// Cleanup temp files older than 1 hour
function cleanupTempFiles() {
  if (!fs.existsSync(TEMP_DIR)) return;

  const files = fs.readdirSync(TEMP_DIR);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  files.forEach((file) => {
    const filePath = path.join(TEMP_DIR, file);
    try {
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < oneHourAgo) {
        if (stats.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        console.log(`Cleaned up old temp file: ${file}`);
      }
    } catch (err) {
      console.error(`Error cleaning up ${file}:`, err.message);
    }
  });
}

// Validate Dart code (basic security check)
function validateDartCode(code) {
  if (!code || typeof code !== "string") {
    return { valid: false, error: "Invalid code format" };
  }

  if (code.length > 100000) {
    return { valid: false, error: "Code exceeds maximum size (100KB)" };
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /dart:ffi/i,
    /dart:io.*File.*delete/i,
    /Process\.run/i,
    /Process\.start/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      console.warn("Potentially dangerous code pattern detected");
    }
  }

  return { valid: true };
}

// POST endpoint for compilation
app.post("/compile", (req, res) => {
  const { code, target } = req.body;

  console.log(`Compilation request received - Target: ${target}`);

  // Validate input
  const validation = validateDartCode(code);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  if (!["js", "native"].includes(target)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid target. Must be "js" or "native"',
    });
  }

  // Generate unique filename
  const fileId = crypto.randomBytes(8).toString("hex");
  const dartFile = path.join(TEMP_DIR, `${fileId}.dart`);
  const outputDir = path.join(TEMP_DIR, fileId);

  try {
    // Create output directory
    fs.mkdirSync(outputDir, { recursive: true });

    // Write Dart code to temporary file
    fs.writeFileSync(dartFile, code, "utf8");

    let command;
    let outputFile;

    if (target === "js") {
      outputFile = path.join(outputDir, "output.js");
      command = `dart compile js -o "${outputFile}" "${dartFile}"`;
    } else {
      // Native compilation
      outputFile = path.join(outputDir, "output.exe");
      command = `dart compile exe -o "${outputFile}" "${dartFile}"`;
    }

    console.log(`Executing: ${command}`);

    // Execute compilation
    exec(
      command,
      {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      },
      (error, stdout, stderr) => {
        // Cleanup function
        const cleanup = () => {
          try {
            if (fs.existsSync(dartFile)) fs.unlinkSync(dartFile);
            if (fs.existsSync(outputDir)) {
              fs.rmSync(outputDir, { recursive: true, force: true });
            }
          } catch (err) {
            console.error("Cleanup error:", err.message);
          }
        };

        if (error) {
          console.error("Compilation error:", error.message);
          cleanup();

          return res.json({
            success: false,
            error: stderr || error.message,
            stdout: stdout,
          });
        }

        // Read compiled output
        if (fs.existsSync(outputFile)) {
          try {
            let output;

            if (target === "js") {
              output = fs.readFileSync(outputFile, "utf8");
            } else {
              // For native compilation, we can't display the binary
              output = `Native executable compiled successfully!\n\nOutput file size: ${
                fs.statSync(outputFile).size
              } bytes\n\nNote: Binary executables cannot be displayed in the editor.`;
            }

            cleanup();

            res.json({
              success: true,
              output: output,
              stdout: stdout,
              stderr: stderr,
              target: target,
            });
          } catch (readError) {
            cleanup();
            res.json({
              success: false,
              error: "Failed to read compiled output: " + readError.message,
            });
          }
        } else {
          cleanup();
          res.json({
            success: false,
            error: "Compilation completed but output file not found",
            stdout: stdout,
            stderr: stderr,
          });
        }
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      error: "Server error: " + err.message,
    });
  }
});

// File system API endpoints

// GET /api/files/:path - Read a file
app.get("/api/files/*", async (req, res) => {
  try {
    const filePath = "/" + req.params[0];
    const result = await db.select().from(files).where(eq(files.path, filePath)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({
      success: true,
      file: result[0],
    });
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/files - Create a file
app.post("/api/files", async (req, res) => {
  try {
    const { path: filePath, content = "", type = "file", permissions } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: "Path is required" });
    }

    // Check if file already exists
    const existing = await db.select().from(files).where(eq(files.path, filePath)).limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "File already exists" });
    }

    const defaultPerms = type === "directory" ? "drwxr-xr-x" : "-rw-r--r--";
    const filePermissions = permissions || defaultPerms;

    const result = await db.insert(files).values({
      path: filePath,
      content: content,
      type: type,
      permissions: filePermissions,
      size: content.length,
    }).returning();

    res.json({
      success: true,
      file: result[0],
    });
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/files/:path - Update a file
app.put("/api/files/*", async (req, res) => {
  try {
    const filePath = "/" + req.params[0];
    const { content, permissions } = req.body;

    const existing = await db.select().from(files).where(eq(files.path, filePath)).limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (content !== undefined) {
      updateData.content = content;
      updateData.size = content.length;
    }

    if (permissions !== undefined) {
      updateData.permissions = permissions;
    }

    const result = await db.update(files)
      .set(updateData)
      .where(eq(files.path, filePath))
      .returning();

    res.json({
      success: true,
      file: result[0],
    });
  } catch (error) {
    console.error("Error updating file:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/files/:path - Delete a file
app.delete("/api/files/*", async (req, res) => {
  try {
    const filePath = "/" + req.params[0];

    const result = await db.delete(files)
      .where(eq(files.path, filePath))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({
      success: true,
      message: "File deleted",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/files - List files in a directory
app.get("/api/files", async (req, res) => {
  try {
    const dirPath = req.query.path || "/";

    // Get all files that start with the directory path
    const allFiles = await db.select().from(files);
    const dirFiles = allFiles.filter(file => {
      if (file.path === dirPath) return false;
      if (dirPath === "/") {
        const parts = file.path.split("/").filter(p => p);
        return parts.length === 1;
      }
      if (!file.path.startsWith(dirPath + "/")) return false;
      const relativePath = file.path.substring(dirPath.length + 1);
      const parts = relativePath.split("/").filter(p => p);
      return parts.length === 1;
    });

    res.json({
      success: true,
      files: dirFiles,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/directories - Create a directory
app.post("/api/directories", async (req, res) => {
  try {
    const { path: dirPath } = req.body;

    if (!dirPath) {
      return res.status(400).json({ error: "Path is required" });
    }

    // Check if directory already exists
    const existing = await db.select().from(files)
      .where(and(eq(files.path, dirPath), eq(files.type, "directory")))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Directory already exists" });
    }

    const result = await db.insert(files).values({
      path: dirPath,
      content: "",
      type: "directory",
      permissions: "drwxr-xr-x",
      size: 4096,
    }).returning();

    res.json({
      success: true,
      directory: result[0],
    });
  } catch (error) {
    console.error("Error creating directory:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  checkDartSDK((available) => {
    res.json({
      status: "ok",
      dartSDK: available,
      isVercel: !!process.env.VERCEL,
      environment: process.env.NODE_ENV || 'development',
      message: available ? "Dart SDK available" : "Dart SDK not found in PATH",
    });
  });
});

// Cleanup on startup for serverless (only clean files older than 1 hour)
cleanupTempFiles();

// Export for Vercel serverless
// Vercel expects the handler to be the default export
module.exports = app;
