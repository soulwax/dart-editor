// File: server.js

const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 5555;
const TEMP_DIR = path.join(__dirname, "temp");

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Clean up old temp files on startup
cleanupTempFiles();

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
    const stats = fs.statSync(filePath);

    if (stats.mtimeMs < oneHourAgo) {
      try {
        if (stats.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        console.log(`Cleaned up old temp file: ${file}`);
      } catch (err) {
        console.error(`Error cleaning up ${file}:`, err.message);
      }
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

// Health check endpoint
app.get("/health", (req, res) => {
  checkDartSDK((available) => {
    res.json({
      status: "ok",
      dartSDK: available,
      message: available ? "Dart SDK available" : "Dart SDK not found in PATH",
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Battlecry Dart Editor Server Running`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);

  checkDartSDK((available) => {
    if (!available) {
      console.warn(
        "⚠️  WARNING: Dart SDK not detected. Compilation will fail."
      );
      console.warn("   Install Dart SDK: https://dart.dev/get-dart\n");
    }
  });

  // Schedule periodic cleanup every hour
  setInterval(cleanupTempFiles, 60 * 60 * 1000);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  cleanupTempFiles();
  process.exit(0);
});
