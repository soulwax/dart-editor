// File: public/app.js

// Monaco Editor instances
let dartEditor = null;
let outputEditor = null;

// Default Dart code
const DEFAULT_DART_CODE = `void main() {
  print('Hello from Dart!');
  final numbers = [1, 2, 3, 4, 5];
  final doubled = numbers.map((n) => n << 1).toList();
  print('Doubled: \$doubled');
}`;

// State
let isCompiling = false;
let scrollSyncEnabled = true;

// Initialize Monaco Editor
require(["vs/editor/editor.main"], function () {
  // Configure Monaco for Dart
  monaco.languages.register({ id: "dart" });

  // Basic Dart syntax highlighting
  monaco.languages.setMonarchTokensProvider("dart", {
    keywords: [
      "abstract",
      "as",
      "assert",
      "async",
      "await",
      "break",
      "case",
      "catch",
      "class",
      "const",
      "continue",
      "default",
      "do",
      "else",
      "enum",
      "extends",
      "false",
      "final",
      "finally",
      "for",
      "if",
      "in",
      "is",
      "new",
      "null",
      "return",
      "super",
      "switch",
      "this",
      "throw",
      "true",
      "try",
      "var",
      "void",
      "while",
      "with",
      "yield",
      "dynamic",
      "import",
      "export",
      "library",
      "part",
      "static",
      "get",
      "set",
      "factory",
      "operator",
      "typedef",
      "implements",
      "interface",
      "mixin",
      "extension",
      "late",
      "required",
      "covariant",
      "show",
      "hide",
      "on",
      "of",
      "deferred",
    ],
    typeKeywords: [
      "int",
      "double",
      "num",
      "bool",
      "String",
      "List",
      "Map",
      "Set",
      "Object",
      "Function",
      "Iterable",
      "Future",
      "Stream",
    ],
    operators: [
      "=",
      ">",
      "<",
      "!",
      "~",
      "?",
      ":",
      "==",
      "<=",
      ">=",
      "!=",
      "&&",
      "||",
      "++",
      "--",
      "+",
      "-",
      "*",
      "/",
      "&",
      "|",
      "^",
      "%",
      "<<",
      ">>",
      ">>>",
      "+=",
      "-=",
      "*=",
      "/=",
      "&=",
      "|=",
      "^=",
      "%=",
      "<<=",
      ">>=",
      ">>>=",
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        [
          /[a-z_$][\w$]*/,
          {
            cases: {
              "@typeKeywords": "type",
              "@keywords": "keyword",
              "@default": "identifier",
            },
          },
        ],
        [/[A-Z][\w\$]*/, "type.identifier"],
        { include: "@whitespace" },
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],
        [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],
        [/[;,.]/, "delimiter"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/'([^'\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string_double"],
        [/'/, "string", "@string_single"],
      ],

      string_double: [
        [/[^\\"$]+/, "string"],
        [/\$\{/, { token: "delimiter", next: "@interpolation" }],
        [/\$[\w]+/, "variable"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, "string", "@pop"],
      ],

      string_single: [
        [/[^\\']+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/'/, "string", "@pop"],
      ],

      interpolation: [
        [/[^}]+/, "variable"],
        [/\}/, { token: "delimiter", next: "@pop" }],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
      ],

      comment: [
        [/[^\/*]+/, "comment"],
        [/\/\*/, "comment", "@push"],
        [/\*\//, "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],
    },
  });

  // Create Dart editor (left pane)
  dartEditor = monaco.editor.create(document.getElementById("dartEditor"), {
    value: DEFAULT_DART_CODE,
    language: "dart",
    theme: "vs-dark",
    fontSize: 14,
    minimap: { enabled: true },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: "on",
    tabSize: 2,
    insertSpaces: true,
    lineNumbers: "on",
    renderWhitespace: "selection",
    folding: true,
    bracketPairColorization: { enabled: true },
  });

  // Create output editor (right pane)
  outputEditor = monaco.editor.create(document.getElementById("outputEditor"), {
    value: "// Compilation output will appear here...",
    language: "javascript",
    theme: "vs-dark",
    fontSize: 14,
    minimap: { enabled: true },
    automaticLayout: true,
    readOnly: true,
    scrollBeyondLastLine: false,
    wordWrap: "on",
    tabSize: 2,
    lineNumbers: "on",
    renderWhitespace: "selection",
    folding: true,
  });

  // Synchronized scrolling
  dartEditor.onDidScrollChange((e) => {
    if (scrollSyncEnabled && outputEditor) {
      outputEditor.setScrollPosition({
        scrollTop: e.scrollTop,
      });
    }
  });

  outputEditor.onDidScrollChange((e) => {
    if (scrollSyncEnabled && dartEditor) {
      dartEditor.setScrollPosition({
        scrollTop: e.scrollTop,
      });
    }
  });

  console.log("Monaco Editor initialized successfully");

  // Check server health
  checkServerHealth();
});

// DOM Elements
const compileJsBtn = document.getElementById("compileJsBtn");
const compileNativeBtn = document.getElementById("compileNativeBtn");
const clearBtn = document.getElementById("clearBtn");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const notification = document.getElementById("notification");
const notificationIcon = document.getElementById("notificationIcon");
const notificationMessage = document.getElementById("notificationMessage");
const notificationClose = document.getElementById("notificationClose");
const outputInfo = document.getElementById("outputInfo");

// Event Listeners
compileJsBtn.addEventListener("click", () => compile("js"));
compileNativeBtn.addEventListener("click", () => compile("native"));
clearBtn.addEventListener("click", clearOutput);
notificationClose.addEventListener("click", hideNotification);

// Auto-hide notification after 5 seconds
let notificationTimeout = null;

// Check server health
async function checkServerHealth() {
  try {
    const response = await fetch("/health");
    const data = await response.json();

    if (data.dartSDK) {
      updateStatus("Ready", "ready");
    } else {
      updateStatus("Dart SDK not found", "error");
      showNotification(
        "warning",
        "⚠️",
        "Dart SDK not detected. Please install Dart SDK to enable compilation. Visit: https://dart.dev/get-dart"
      );
    }
  } catch (error) {
    updateStatus("Server error", "error");
    showNotification(
      "error",
      "❌",
      "Failed to connect to server: " + error.message
    );
  }
}

// Compile function
async function compile(target) {
  if (isCompiling) {
    showNotification("warning", "⚠️", "Compilation already in progress...");
    return;
  }

  const code = dartEditor.getValue();

  if (!code.trim()) {
    showNotification(
      "warning",
      "⚠️",
      "Editor is empty. Please write some Dart code first."
    );
    return;
  }

  isCompiling = true;
  updateStatus(`Compiling to ${target.toUpperCase()}...`, "compiling");

  const targetBtn = target === "js" ? compileJsBtn : compileNativeBtn;
  targetBtn.classList.add("loading");
  targetBtn.disabled = true;
  compileJsBtn.disabled = true;
  compileNativeBtn.disabled = true;

  try {
    const response = await fetch("/compile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, target }),
    });

    const data = await response.json();

    if (data.success) {
      // Set output
      outputEditor.setValue(data.output);

      // Update language mode based on target
      const model = outputEditor.getModel();
      if (target === "js") {
        monaco.editor.setModelLanguage(model, "javascript");
        outputInfo.textContent = "JavaScript Output";
      } else {
        monaco.editor.setModelLanguage(model, "plaintext");
        outputInfo.textContent = "Native Output Info";
      }

      updateStatus("Compilation successful", "ready");
      showNotification(
        "success",
        "✅",
        `Successfully compiled to ${target.toUpperCase()}!`
      );

      console.log("Compilation successful:", data);
    } else {
      // Show error in output
      const errorOutput = `// Compilation Failed\n// Target: ${target}\n\n${
        data.error
      }\n\n${data.stdout || ""}`;
      outputEditor.setValue(errorOutput);

      const model = outputEditor.getModel();
      monaco.editor.setModelLanguage(model, "plaintext");
      outputInfo.textContent = "Error Output";

      updateStatus("Compilation failed", "error");
      showNotification(
        "error",
        "❌",
        "Compilation failed. Check the output pane for details."
      );

      console.error("Compilation error:", data);
    }
  } catch (error) {
    outputEditor.setValue(
      `// Network Error\n\n${error.message}\n\nFailed to communicate with the server.`
    );
    updateStatus("Network error", "error");
    showNotification("error", "❌", "Network error: " + error.message);
    console.error("Network error:", error);
  } finally {
    isCompiling = false;
    targetBtn.classList.remove("loading");
    targetBtn.disabled = false;
    compileJsBtn.disabled = false;
    compileNativeBtn.disabled = false;
  }
}

// Clear output
function clearOutput() {
  outputEditor.setValue("// Compilation output will appear here...");
  const model = outputEditor.getModel();
  monaco.editor.setModelLanguage(model, "javascript");
  outputInfo.textContent = "Read-only";
  updateStatus("Ready", "ready");
  showNotification("info", "ℹ️", "Output cleared");
}

// Update status indicator
function updateStatus(text, state) {
  statusText.textContent = text;
  statusIndicator.classList.remove("compiling", "error", "ready");

  if (state) {
    statusIndicator.classList.add(state);
  }
}

// Show notification
function showNotification(type, icon, message) {
  notificationIcon.textContent = icon;
  notificationMessage.textContent = message;

  notification.classList.remove(
    "hidden",
    "success",
    "error",
    "warning",
    "info"
  );
  notification.classList.add(type);

  // Clear existing timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  // Auto-hide after 5 seconds
  notificationTimeout = setTimeout(() => {
    hideNotification();
  }, 5000);
}

// Hide notification
function hideNotification() {
  notification.classList.add("hidden");
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter: Compile to JS
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    compile("js");
  }

  // Ctrl/Cmd + Shift + Enter: Compile to Native
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Enter") {
    e.preventDefault();
    compile("native");
  }

  // Ctrl/Cmd + K: Clear output
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    clearOutput();
  }
});

console.log("Battlecry Dart Editor initialized");
console.log("Keyboard shortcuts:");
console.log("  Ctrl/Cmd + Enter: Compile to JS");
console.log("  Ctrl/Cmd + Shift + Enter: Compile to Native");
console.log("  Ctrl/Cmd + K: Clear output");
