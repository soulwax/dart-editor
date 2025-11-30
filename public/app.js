// Dart Editor instances
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

require(["vs/editor/editor.main"], function () {
  monaco.languages.register({ id: "dart" });

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

  // Register IntelliSense/Completion Provider
  monaco.languages.registerCompletionItemProvider("dart", {
    provideCompletionItems: function (model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // Common Dart keywords and built-ins
      const suggestions = [
        // Keywords
        { label: "void", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "void ", documentation: "Void type - indicates no return value" },
        { label: "main", kind: monaco.languages.CompletionItemKind.Function, insertText: "main() {\n  $0\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Main entry point of a Dart application" },
        { label: "class", kind: monaco.languages.CompletionItemKind.Class, insertText: "class ${1:ClassName} {\n  $0\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Define a class" },
        { label: "import", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "import '$0';", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Import a library" },
        { label: "print", kind: monaco.languages.CompletionItemKind.Function, insertText: "print($0);", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Print to console" },
        { label: "if", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "if ($1) {\n  $0\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "If statement" },
        { label: "for", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "for (var ${1:i} = 0; $1 < ${2:length}; $1++) {\n  $0\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "For loop" },
        { label: "forEach", kind: monaco.languages.CompletionItemKind.Method, insertText: "forEach(($1) {\n  $0\n});", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Iterate over collection" },
        { label: "List", kind: monaco.languages.CompletionItemKind.Class, insertText: "List<${1:Type}>", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "List collection type" },
        { label: "Map", kind: monaco.languages.CompletionItemKind.Class, insertText: "Map<${1:Key}, ${2:Value}>", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Map collection type" },
        { label: "Set", kind: monaco.languages.CompletionItemKind.Class, insertText: "Set<${1:Type}>", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Set collection type" },
        { label: "Future", kind: monaco.languages.CompletionItemKind.Class, insertText: "Future<${1:Type}>", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Asynchronous operation" },
        { label: "async", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "async ", documentation: "Mark function as asynchronous" },
        { label: "await", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "await ", documentation: "Wait for async operation" },
        { label: "try", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "try {\n  $1\n} catch (${2:e}) {\n  $0\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: "Try-catch block" },
        { label: "final", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "final ", documentation: "Immutable variable" },
        { label: "const", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "const ", documentation: "Compile-time constant" },
        { label: "var", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "var ", documentation: "Type-inferred variable" },
        { label: "String", kind: monaco.languages.CompletionItemKind.Class, insertText: "String", documentation: "String type" },
        { label: "int", kind: monaco.languages.CompletionItemKind.Class, insertText: "int", documentation: "Integer type" },
        { label: "double", kind: monaco.languages.CompletionItemKind.Class, insertText: "double", documentation: "Double precision floating point" },
        { label: "bool", kind: monaco.languages.CompletionItemKind.Class, insertText: "bool", documentation: "Boolean type" },
      ];

      return { suggestions: suggestions };
    },
  });

  // Register Hover Provider
  monaco.languages.registerHoverProvider("dart", {
    provideHover: function (model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const wordText = word.word;
      const hoverInfo = {
        // Common Dart built-ins documentation
        "print": { value: "**print(value)**\n\nPrints the given value to the console.\n\nExample: `print('Hello, World!');`" },
        "main": { value: "**main()**\n\nThe entry point of a Dart application. Execution starts here." },
        "List": { value: "**List<T>**\n\nAn ordered collection of objects. Lists are zero-indexed.\n\nExample: `List<int> numbers = [1, 2, 3];`" },
        "Map": { value: "**Map<K, V>**\n\nA collection of key-value pairs.\n\nExample: `Map<String, int> ages = {'Alice': 30, 'Bob': 25};`" },
        "Set": { value: "**Set<T>**\n\nA collection of unique objects.\n\nExample: `Set<String> names = {'Alice', 'Bob'};`" },
        "Future": { value: "**Future<T>**\n\nRepresents a value that will be available at some time in the future.\n\nExample: `Future<String> fetchData() async { ... }`" },
        "String": { value: "**String**\n\nA sequence of UTF-16 code units. Strings are immutable." },
        "int": { value: "**int**\n\nInteger values. Range: -2^63 to 2^63 - 1." },
        "double": { value: "**double**\n\nDouble-precision floating point numbers (64-bit)." },
        "bool": { value: "**bool**\n\nBoolean values: `true` or `false`." },
      };

      if (hoverInfo[wordText]) {
        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          ),
          contents: [
            { value: hoverInfo[wordText].value },
          ],
        };
      }

      return null;
    },
  });

  // Register Signature Help Provider (Parameter Hints)
  monaco.languages.registerSignatureHelpProvider("dart", {
    signatureHelpTriggerCharacters: ["("],
    provideSignatureHelp: function (model, position) {
      const word = model.getWordUntilPosition(position);
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Simple signature help for common functions
      const signatures = {
        "print": {
          label: "print(Object? object)",
          documentation: "Prints the given value to the console",
          parameters: [
            {
              label: "object",
              documentation: "The object to print",
            },
          ],
        },
        "main": {
          label: "main()",
          documentation: "Entry point of the application",
          parameters: [],
        },
      };

      // Find function name before the opening parenthesis
      const match = textUntilPosition.match(/(\w+)\s*\([^)]*$/);
      if (match && signatures[match[1]]) {
        const sig = signatures[match[1]];
        return {
          value: {
            signatures: [
              {
                label: sig.label,
                documentation: sig.documentation,
                parameters: sig.parameters,
              },
            ],
            activeSignature: 0,
            activeParameter: 0,
          },
          dispose: function () {},
        };
      }

      return null;
    },
  });

  // Register Code Action Provider (Quick Fixes)
  monaco.languages.registerCodeActionProvider("dart", {
    provideCodeActions: function (model, range, context) {
      const actions = [];
      const selectedText = model.getValueInRange(range);

      // Quick fix: Add missing semicolon
      if (selectedText && !selectedText.trim().endsWith(";") && !selectedText.includes(";")) {
        actions.push({
          title: "Add semicolon",
          kind: "quickfix",
          edit: {
            edits: [
              {
                resource: model.uri,
                edit: {
                  range: range,
                  text: selectedText + ";",
                },
              },
            ],
          },
        });
      }

      // Quick fix: Wrap in try-catch
      if (selectedText && selectedText.trim().length > 0) {
        actions.push({
          title: "Wrap in try-catch",
          kind: "quickfix",
          edit: {
            edits: [
              {
                resource: model.uri,
                edit: {
                  range: range,
                  text: `try {\n${selectedText.split("\n").map((line) => "  " + line).join("\n")}\n} catch (e) {\n  print('Error: \$e');\n}`,
                },
              },
            ],
          },
        });
      }

      return {
        actions: actions,
        dispose: function () {},
      };
    },
  });

  // Register Document Formatting Provider
  monaco.languages.registerDocumentFormattingEditProvider("dart", {
    provideDocumentFormattingEdits: function (model, options) {
      const text = model.getValue();
      const lines = text.split("\n");
      const formatted = [];

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // Basic formatting: trim trailing whitespace
        line = line.replace(/\s+$/, "");
        // Add proper indentation (basic)
        if (line.trim()) {
          formatted.push(line);
        } else if (i > 0 && i < lines.length - 1) {
          // Keep single empty lines
          formatted.push("");
        }
      }

      return [
        {
          range: model.getFullModelRange(),
          text: formatted.join("\n"),
        },
      ];
    },
  });

  // Define Material Palenight theme
  monaco.editor.defineTheme("material-palenight", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "bfc7d5", background: "292d3e" },
      { token: "comment", foreground: "676e95", fontStyle: "italic" },
      { token: "keyword", foreground: "c792ea" },
      { token: "type", foreground: "ffcb6b" },
      { token: "type.identifier", foreground: "ffcb6b" },
      { token: "identifier", foreground: "bfc7d5" },
      { token: "string", foreground: "c3e88d" },
      { token: "string.escape", foreground: "89ddff" },
      { token: "string.invalid", foreground: "f07178" },
      { token: "number", foreground: "f78c6c" },
      { token: "number.float", foreground: "f78c6c" },
      { token: "number.hex", foreground: "f78c6c" },
      { token: "operator", foreground: "89ddff" },
      { token: "delimiter", foreground: "89ddff" },
      { token: "variable", foreground: "f07178" },
    ],
    colors: {
      "editor.background": "#292d3e",
      "editor.foreground": "#bfc7d5",
      "editorLineNumber.foreground": "#3b3f51",
      "editorLineNumber.activeForeground": "#676e95",
      "editorCursor.foreground": "#ffcc00",
      "editor.selectionBackground": "#717cb450",
      "editor.inactiveSelectionBackground": "#717cb430",
      "editor.lineHighlightBackground": "#00000050",
      "editorWhitespace.foreground": "#3b3f51",
      "editorIndentGuide.background": "#3b3f51",
      "editorIndentGuide.activeBackground": "#4e5579",
      "editorBracketMatch.background": "#3b3f51",
      "editorBracketMatch.border": "#ffcc00",
      "scrollbarSlider.background": "#3b3f5180",
      "scrollbarSlider.hoverBackground": "#3b3f51c0",
      "scrollbarSlider.activeBackground": "#3b3f51",
      "minimap.background": "#292d3e",
      "editorGutter.background": "#292d3e",
      "editorWidget.background": "#1b1e2b",
      "editorWidget.border": "#3b3f51",
      "editorSuggestWidget.background": "#1b1e2b",
      "editorSuggestWidget.border": "#3b3f51",
      "editorSuggestWidget.foreground": "#bfc7d5",
      "editorSuggestWidget.selectedBackground": "#3b3f51",
      "editorHoverWidget.background": "#1b1e2b",
      "editorHoverWidget.border": "#3b3f51",
    },
  });

  // Create Dart editor (left pane)
  dartEditor = monaco.editor.create(document.getElementById("dartEditor"), {
    value: DEFAULT_DART_CODE,
    language: "dart",
    theme: "material-palenight",
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
    // Enhanced features
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    acceptSuggestionOnCommitCharacter: true,
    snippetSuggestions: "top",
    tabCompletion: "on",
    wordBasedSuggestions: "matchingDocuments",
    parameterHints: {
      enabled: true,
      cycle: true,
    },
    hover: {
      enabled: true,
      delay: 300,
    },
    formatOnPaste: true,
    formatOnType: false,
    codeLens: false,
    colorDecorators: true,
    contextmenu: true,
    mouseWheelZoom: true,
    multiCursorModifier: "ctrlCmd",
    accessibilitySupport: "auto",
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true,
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: "never",
      seedSearchStringFromSelection: "always",
    },
    links: true,
    colorDecoratorsActivatedOn: "clickAndHover",
    // Code actions
    codeActionsOnSave: {
      "source.fixAll": false,
    },
    // Suggest options
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true,
      showFields: true,
      showMethods: true,
      showProperties: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showStructs: true,
      showOperators: true,
      showEvents: true,
      showUnits: true,
      showValues: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showIssues: true,
      showUsers: true,
      showText: true,
    },
  });

  // Create output editor (right pane)
  outputEditor = monaco.editor.create(document.getElementById("outputEditor"), {
    value: "// Compilation output will appear here...",
    language: "javascript",
    theme: "material-palenight",
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

  console.log("Dart Editor initialized successfully");

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
  if ((e.ctrlKey || e.metaKey) && e.key === "k" && !e.shiftKey) {
    e.preventDefault();
    clearOutput();
  }

  // Ctrl/Cmd + Shift + F: Format code
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "f") {
    e.preventDefault();
    if (dartEditor) {
      dartEditor.getAction("editor.action.formatDocument").run();
    }
  }
});

console.log("Soul's Dart Editor initialized");
console.log("Keyboard shortcuts:");
console.log("  Ctrl/Cmd + Enter: Compile to JS");
console.log("  Ctrl/Cmd + Shift + Enter: Compile to Native");
console.log("  Ctrl/Cmd + K: Clear output");
console.log("  Ctrl/Cmd + Shift + F: Format code");
console.log("  Ctrl/Cmd + F: Find");
console.log("  Ctrl/Cmd + H: Replace");
console.log("  Ctrl/Cmd + /: Toggle comment");
console.log("  Ctrl/Cmd + Space: Trigger IntelliSense");
console.log("  Ctrl/Cmd + Click: Multi-cursor");
console.log("  Alt + Click: Column selection");
