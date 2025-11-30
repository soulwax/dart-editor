// File: public/app.js

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

  // Register Diagnostics Provider (Live Error Checking)
  let diagnosticsTimeout = null;
  function validateDartCode(model) {
    if (diagnosticsTimeout) {
      clearTimeout(diagnosticsTimeout);
    }

    diagnosticsTimeout = setTimeout(() => {
      const text = model.getValue();
      const markers = [];
      const lines = text.split("\n");

      // Basic syntax validation
      lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // Check for unclosed strings
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (singleQuotes % 2 !== 0 && line.includes("'")) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: "Unclosed single-quoted string",
          });
        }
        if (doubleQuotes % 2 !== 0 && line.includes('"')) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: "Unclosed double-quoted string",
          });
        }

        // Check for common errors
        if (line.trim() && !line.trim().startsWith("//") && !line.trim().startsWith("/*")) {
          // Missing semicolon warning (not error, just warning)
          if (
            line.trim().length > 0 &&
            !line.trim().endsWith(";") &&
            !line.trim().endsWith("{") &&
            !line.trim().endsWith("}") &&
            !line.includes("if") &&
            !line.includes("for") &&
            !line.includes("while") &&
            !line.includes("class") &&
            !line.includes("void") &&
            !line.includes("import") &&
            !line.includes("//")
          ) {
            // Only warn if it looks like a statement
            if (
              line.includes("=") ||
              line.includes("print") ||
              line.includes("return") ||
              line.match(/^\s*\w+\s*\(/)
            ) {
              markers.push({
                severity: monaco.MarkerSeverity.Warning,
                startLineNumber: lineNumber,
                startColumn: line.length,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
                message: "Missing semicolon?",
              });
            }
          }

          // Check for undefined variables (basic check)
          if (line.includes("print(") && !line.includes("'") && !line.includes('"')) {
            markers.push({
              severity: monaco.MarkerSeverity.Warning,
              startLineNumber: lineNumber,
              startColumn: 1,
              endLineNumber: lineNumber,
              endColumn: line.length + 1,
              message: "print() should contain a string or variable",
            });
          }
        }
      });

      // Check for balanced braces
      let openBraces = 0;
      let openParens = 0;
      let openBrackets = 0;
      text.split("").forEach((char, index) => {
        if (char === "{") openBraces++;
        if (char === "}") openBraces--;
        if (char === "(") openParens++;
        if (char === ")") openParens--;
        if (char === "[") openBrackets++;
        if (char === "]") openBrackets--;
      });

      if (openBraces !== 0) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: lines.length,
          startColumn: 1,
          endLineNumber: lines.length,
          endColumn: 1,
          message: `Unmatched braces: ${openBraces > 0 ? openBraces + " unclosed" : Math.abs(openBraces) + " extra closing"}`,
        });
      }
      if (openParens !== 0) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: lines.length,
          startColumn: 1,
          endLineNumber: lines.length,
          endColumn: 1,
          message: `Unmatched parentheses: ${openParens > 0 ? openParens + " unclosed" : Math.abs(openParens) + " extra closing"}`,
        });
      }
      if (openBrackets !== 0) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: lines.length,
          startColumn: 1,
          endLineNumber: lines.length,
          endColumn: 1,
          message: `Unmatched brackets: ${openBrackets > 0 ? openBrackets + " unclosed" : Math.abs(openBrackets) + " extra closing"}`,
        });
      }

      monaco.editor.setModelMarkers(model, "dart-validator", markers);
    }, 500); // Debounce for 500ms
  }

  // Register Definition Provider (Go to Definition)
  monaco.languages.registerDefinitionProvider("dart", {
    provideDefinition: function (model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const wordText = word.word;
      const text = model.getValue();
      const lines = text.split("\n");

      // Find where this symbol is defined
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for function/class/variable definitions
        const funcMatch = line.match(
          new RegExp(`(void|int|String|double|bool|var|final|const)\\s+${wordText}\\s*\\(`)
        );
        const classMatch = line.match(new RegExp(`class\\s+${wordText}`));
        const varMatch = line.match(
          new RegExp(`(var|final|const|int|String|double|bool)\\s+${wordText}\\s*[=;]`)
        );

        if (funcMatch || classMatch || varMatch) {
          return {
            uri: model.uri,
            range: {
              startLineNumber: i + 1,
              startColumn: 1,
              endLineNumber: i + 1,
              endColumn: line.length + 1,
            },
          };
        }
      }

      return null;
    },
  });

  // Register References Provider (Find All References)
  monaco.languages.registerReferenceProvider("dart", {
    provideReferences: function (model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const wordText = word.word;
      const text = model.getValue();
      const lines = text.split("\n");
      const references = [];

      // Find all occurrences
      lines.forEach((line, index) => {
        const regex = new RegExp(`\\b${wordText}\\b`, "g");
        let match;
        while ((match = regex.exec(line)) !== null) {
          references.push({
            uri: model.uri,
            range: {
              startLineNumber: index + 1,
              startColumn: match.index + 1,
              endLineNumber: index + 1,
              endColumn: match.index + wordText.length + 1,
            },
          });
        }
      });

      return references.length > 0 ? references : null;
    },
  });

  // Register Rename Provider
  monaco.languages.registerRenameProvider("dart", {
    provideRenameEdits: function (model, position, newName) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const wordText = word.word;
      const text = model.getValue();
      const lines = text.split("\n");
      const edits = [];

      // Replace all occurrences
      lines.forEach((line, index) => {
        const regex = new RegExp(`\\b${wordText}\\b`, "g");
        let match;
        while ((match = regex.exec(line)) !== null) {
          edits.push({
            resource: model.uri,
            range: {
              startLineNumber: index + 1,
              startColumn: match.index + 1,
              endLineNumber: index + 1,
              endColumn: match.index + wordText.length + 1,
            },
            text: newName,
          });
        }
      });

      return {
        edits: edits,
      };
    },
    resolveRenameLocation: function (model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      return {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: word.endColumn,
        },
        text: word.word,
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

  // Live diagnostics - validate on content change
  dartEditor.getModel().onDidChangeContent(() => {
    validateDartCode(dartEditor.getModel());
    autoSave(); // Auto-save on changes
  });

  // Update problems panel when markers change
  monaco.editor.onDidChangeMarkers((uris) => {
    const model = dartEditor.getModel();
    if (uris.includes(model.uri)) {
      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      problems = markers.map((marker) => ({
        severity: marker.severity === monaco.MarkerSeverity.Error ? "error" : 
                  marker.severity === monaco.MarkerSeverity.Warning ? "warning" : "info",
        message: marker.message,
        line: marker.startLineNumber,
        column: marker.startColumn,
      }));
      
      if (terminalTab === "problems") {
        updateProblemsPanel();
      }
    }
  });

  // Load auto-saved code on startup
  loadAutoSave();

  // Initial validation
  validateDartCode(dartEditor.getModel());

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
const runBtn = document.getElementById("runBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const templatesBtn = document.getElementById("templatesBtn");
const terminalToggleBtn = document.getElementById("terminalToggleBtn");
const terminalPanel = document.getElementById("terminalPanel");
const terminalOutput = document.getElementById("terminalOutput");
const terminalHistory = document.getElementById("terminalHistory");
const terminalInput = document.getElementById("terminalInput");
const terminalConsole = document.getElementById("terminalConsole");
const terminalProblems = document.getElementById("terminalProblems");
const terminalClearBtn = document.getElementById("terminalClearBtn");
const terminalCloseBtn = document.getElementById("terminalCloseBtn");
const commandPalette = document.getElementById("commandPalette");
const commandPaletteInput = document.getElementById("commandPaletteInput");
const commandPaletteList = document.getElementById("commandPaletteList");
const commandPaletteClose = document.getElementById("commandPaletteClose");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const notification = document.getElementById("notification");
const notificationIcon = document.getElementById("notificationIcon");
const notificationMessage = document.getElementById("notificationMessage");
const notificationClose = document.getElementById("notificationClose");
const outputInfo = document.getElementById("outputInfo");

// Terminal state
let terminalVisible = false;
let terminalTab = "output";
let problems = [];

// Shell state
let shellHistory = [];
let shellHistoryIndex = -1;
let currentCommand = "";
let shellCwd = "/"; // Current working directory (virtual)
let shellEnv = {}; // Environment variables
let nodeReplMode = false; // Node.js REPL mode
let nodeReplHistory = []; // REPL command history
let nodeReplHistoryIndex = -1;
let tabCompletionIndex = -1;
let tabCompletionMatches = [];

// Enhanced Virtual File System with metadata
const virtualFS = {
  "/": {
    type: "directory",
    items: {
      "home": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-15") },
      "usr": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-10") },
      "bin": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-12") },
      "etc": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-08") },
      "var": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-05") },
      "tmp": { type: "directory", perms: "drwxrwxrwx", size: 4096, modified: new Date("2024-01-20") },
      "opt": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-14") }
    }
  },
  "/home": {
    type: "directory",
    items: {
      "user": { type: "directory", perms: "drwx------", size: 4096, modified: new Date("2024-01-18") }
    }
  },
  "/usr": {
    type: "directory",
    items: {
      "bin": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-10") },
      "lib": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-10") },
      "share": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-10") }
    }
  },
  "/bin": {
    type: "directory",
    items: {
      "sh": { type: "file", perms: "-rwxr-xr-x", size: 125856, modified: new Date("2024-01-12") },
      "bash": { type: "file", perms: "-rwxr-xr-x", size: 1396524, modified: new Date("2024-01-12") },
      "ls": { type: "file", perms: "-rwxr-xr-x", size: 141936, modified: new Date("2024-01-12") },
      "cat": { type: "file", perms: "-rwxr-xr-x", size: 35064, modified: new Date("2024-01-12") },
      "echo": { type: "file", perms: "-rwxr-xr-x", size: 31400, modified: new Date("2024-01-12") },
      "node": { type: "file", perms: "-rwxr-xr-x", size: 4567890, modified: new Date("2024-01-15") }
    }
  },
  "/etc": {
    type: "directory",
    items: {
      "passwd": { type: "file", perms: "-rw-r--r--", size: 2345, modified: new Date("2024-01-08") },
      "hosts": { type: "file", perms: "-rw-r--r--", size: 158, modified: new Date("2024-01-08") },
      "group": { type: "file", perms: "-rw-r--r--", size: 1024, modified: new Date("2024-01-08") }
    }
  },
  "/var": {
    type: "directory",
    items: {
      "log": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-05") },
      "tmp": { type: "directory", perms: "drwxrwxrwx", size: 4096, modified: new Date("2024-01-05") }
    }
  },
  "/var/log": {
    type: "directory",
    items: {
      "system.log": { type: "file", perms: "-rw-r--r--", size: 15234, modified: new Date("2024-01-20") },
      "auth.log": { type: "file", perms: "-rw-------", size: 4567, modified: new Date("2024-01-20") },
      "syslog": { type: "file", perms: "-rw-r--r--", size: 23456, modified: new Date("2024-01-20") }
    }
  },
  "/tmp": {
    type: "directory",
    items: {}
  },
  "/home/user": {
    type: "directory",
    items: {
      "Documents": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-18") },
      "Downloads": { type: "directory", perms: "drwxr-xr-x", size: 4096, modified: new Date("2024-01-19") },
      ".bashrc": { type: "file", perms: "-rw-r--r--", size: 3526, modified: new Date("2024-01-18") },
      ".profile": { type: "file", perms: "-rw-r--r--", size: 675, modified: new Date("2024-01-18") }
    }
  }
};

// Virtual file contents
const virtualFiles = {
  "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin",
  "/etc/hosts": "127.0.0.1\tlocalhost\n127.0.1.1\tbattlecry-editor\n::1\t\tlocalhost ip6-localhost ip6-loopback",
  "/etc/group": "root:x:0:\nuser:x:1000:\nadm:x:4:user",
  "/var/log/system.log": "2024-01-20 10:23:15 System started successfully\n2024-01-20 10:23:16 All services running\n2024-01-20 10:25:30 User login: user\n2024-01-20 10:30:45 Network interface up\n",
  "/var/log/auth.log": "2024-01-20 10:25:30 Successful login for user\n2024-01-20 10:25:31 Session started\n",
  "/var/log/syslog": "Jan 20 10:23:15 kernel: Linux version 6.8.0\nJan 20 10:23:16 systemd: System initialized\nJan 20 10:25:30 sshd: Accepted publickey for user\n",
  "/home/user/.bashrc": "# ~/.bashrc\n\nexport PATH=$PATH:/usr/local/bin\nalias ll='ls -alF'\nalias la='ls -A'\nalias l='ls -CF'\n",
  "/home/user/.profile": "# ~/.profile\n\nif [ -n \"$BASH_VERSION\" ]; then\n  . ~/.bashrc\nfi\n"
};

// Code Templates
const CODE_TEMPLATES = {
  "Hello World": `void main() {
  print('Hello, World!');
}`,
  "Variables & Types": `void main() {
  // Variables
  var name = 'Dart';
  int age = 10;
  double height = 1.75;
  bool isActive = true;
  
  print('Name: ' + name);
  print('Age: ' + age.toString());
  print('Height: ' + height.toString());
  print('Active: ' + isActive.toString());
}`,
  "Lists & Collections": `void main() {
  // List
  List<int> numbers = [1, 2, 3, 4, 5];
  numbers.add(6);
  print('Numbers: ' + numbers.toString());
  
  // Map
  Map<String, int> ages = {
    'Alice': 30,
    'Bob': 25,
  };
  print('Ages: ' + ages.toString());
  
  // Set
  Set<String> names = {'Alice', 'Bob', 'Charlie'};
  print('Names: ' + names.toString());
}`,
  "Functions": `void main() {
  greet('Alice');
  int result = add(5, 3);
  print('Result: ' + result.toString());
}

void greet(String name) {
  print('Hello, ' + name + '!');
}

int add(int a, int b) {
  return a + b;
}`,
  "Classes": `void main() {
  var person = Person('Alice', 30);
  person.introduce();
}

class Person {
  String name;
  int age;
  
  Person(this.name, this.age);
  
  void introduce() {
    print('Hi, I am ' + name + ' and I am ' + age.toString() + ' years old.');
  }
}`,
  "Async/Await": `void main() async {
  print('Starting...');
  await fetchData();
  print('Done!');
}

Future<void> fetchData() async {
  // Note: Future.delayed requires dart:async
  // For compilation, use a simple delay simulation
  await Future.value(null);
  print('Data fetched!');
}`,
  "Error Handling": `void main() {
  try {
    int result = divide(10, 0);
    print('Result: ' + result.toString());
  } catch (e) {
    print('Error: ' + e.toString());
  }
}

int divide(int a, int b) {
  if (b == 0) {
    throw Exception('Division by zero!');
  }
  return a ~/ b;
}`,
  "Streams": `// Note: Streams require dart:async and may not compile to JS directly
// This is a simplified example using a List
void main() {
  var numbers = [1, 2, 3, 4, 5];
  for (var value in numbers) {
    print('Received: ' + value.toString());
  }
}`,
};

// Terminal Functions
function writeToTerminal(message, type = "info") {
  if (!terminalVisible) {
    showTerminal();
  }
  
  const line = document.createElement("div");
  line.className = `terminal-line ${type}`;
  line.textContent = message;
  
  terminalHistory.appendChild(line);
  
  // Auto-scroll to bottom
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function writePrompt() {
  const promptLine = document.createElement("div");
  promptLine.className = "terminal-prompt-line";
  if (nodeReplMode) {
    // Nerd Font:  = prompt symbol
    promptLine.innerHTML = `<span class="terminal-prompt-text"> ></span>`;
  } else {
    const user = shellEnv.USER || "user";
    const host = shellEnv.HOSTNAME || "battlecry";
    const cwd = shellCwd === "/" ? "/" : shellCwd;
    // Nerd Font:  = prompt symbol
    promptLine.innerHTML = `<span class="terminal-prompt-text"> ${user}@${host}</span><span style="color: var(--accent-blue);">:</span><span class="terminal-prompt-text" style="color: var(--accent-purple);">${cwd}</span><span class="terminal-prompt-text"> $</span>`;
  }
  terminalHistory.appendChild(promptLine);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function writeReplPrompt() {
  const promptLine = document.createElement("div");
  promptLine.className = "terminal-prompt-line";
  // Nerd Font:  = prompt symbol for REPL
  promptLine.innerHTML = `<span class="terminal-prompt-text"> ></span>`;
  terminalHistory.appendChild(promptLine);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function executeNodeRepl(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    writeReplPrompt();
    return;
  }
  
  // Handle REPL commands
  if (trimmed === ".exit" || trimmed === ".quit") {
    nodeReplMode = false;
    writeToTerminal("Exiting Node.js REPL", "info");
    writePrompt();
    return;
  }
  
  if (trimmed === ".help") {
    writeToTerminal("REPL commands:", "info");
    writeToTerminal("  .exit    Exit REPL", "info");
    writeToTerminal("  .quit    Exit REPL", "info");
    writeToTerminal("  .help    Show this help", "info");
    writeReplPrompt();
    return;
  }
  
  // Add to REPL history
  if (trimmed && (nodeReplHistory.length === 0 || nodeReplHistory[nodeReplHistory.length - 1] !== trimmed)) {
    nodeReplHistory.push(trimmed);
    if (nodeReplHistory.length > 100) {
      nodeReplHistory.shift();
    }
  }
  nodeReplHistoryIndex = nodeReplHistory.length;
  
  // Display the command
  const commandLine = document.createElement("div");
  commandLine.className = "terminal-prompt-line";
  commandLine.innerHTML = `<span class="terminal-prompt-text">></span> <span class="terminal-command">${trimmed}</span>`;
  terminalHistory.appendChild(commandLine);
  
  // Execute JavaScript
  try {
    // Create a safe execution context
    const result = eval(trimmed);
    
    // Display result (if not undefined)
    if (result !== undefined) {
      let output = result;
      if (typeof result === "object" && result !== null) {
        try {
          output = JSON.stringify(result, null, 2);
        } catch (e) {
          output = String(result);
        }
      } else {
        output = String(result);
      }
      writeToTerminal(output, "info");
    }
  } catch (error) {
    writeToTerminal(`Error: ${error.message}`, "error");
    if (error.stack) {
      writeToTerminal(error.stack, "error");
    }
  }
  
  writeReplPrompt();
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Shell Commands
const shellCommands = {
  help: {
    description: "Show available commands",
    execute: () => {
      const commands = Object.keys(shellCommands).sort();
      writeToTerminal("Available commands:", "info");
      commands.forEach(cmd => {
        writeToTerminal(`  ${cmd.padEnd(12)} - ${shellCommands[cmd].description}`, "info");
      });
    }
  },
  
  clear: {
    description: "Clear terminal",
    execute: () => {
      terminalHistory.innerHTML = "";
      writePrompt();
    }
  },
  
  echo: {
    description: "Print arguments",
    execute: (args) => {
      writeToTerminal(args.join(" "), "info");
    }
  },
  
  pwd: {
    description: "Print working directory",
    execute: () => {
      writeToTerminal(shellCwd, "info");
    }
  },
  
  cd: {
    description: "Change directory",
    execute: (args) => {
      if (args.length === 0) {
        shellCwd = "/home/user";
        return;
      }
      
      const path = args[0];
      let targetPath;
      
      if (path === "/") {
        targetPath = "/";
      } else if (path === "~" || path === "~user") {
        targetPath = "/home/user";
      } else if (path === "-") {
        targetPath = shellEnv.OLDPWD || shellCwd;
        shellEnv.OLDPWD = shellCwd;
      } else if (path === "..") {
        if (shellCwd !== "/") {
          const parts = shellCwd.split("/").filter(p => p);
          parts.pop();
          targetPath = parts.length > 0 ? "/" + parts.join("/") : "/";
        } else {
          targetPath = "/";
        }
      } else if (path.startsWith("/")) {
        targetPath = path;
      } else {
        targetPath = shellCwd === "/" ? "/" + path : shellCwd + "/" + path;
      }
      
      // Validate directory exists
      const dir = virtualFS[targetPath];
      if (!dir || dir.type !== "directory") {
        writeToTerminal(`cd: ${path}: No such file or directory`, "error");
        return;
      }
      
      shellEnv.OLDPWD = shellCwd;
      shellCwd = targetPath;
    }
  },
  
  ls: {
    description: "List directory contents",
    execute: (args) => {
      const showAll = args.includes("-a") || args.includes("--all");
      const longFormat = args.includes("-l") || args.includes("--long");
      const humanReadable = args.includes("-h") || args.includes("--human-readable");
      const color = !args.includes("--no-color");
      
      const pathArgs = args.filter(arg => !arg.startsWith("-"));
      const path = pathArgs.length > 0 ? pathArgs[0] : shellCwd;
      const normalizedPath = path.startsWith("/") ? path : (shellCwd === "/" ? "/" + path : shellCwd + "/" + path);
      
      const dir = virtualFS[normalizedPath];
      if (!dir || dir.type !== "directory") {
        writeToTerminal(`ls: cannot access '${path}': No such file or directory`, "error");
        return;
      }
      
      const items = Object.entries(dir.items || {})
        .filter(([name]) => showAll || !name.startsWith("."))
        .sort(([a], [b]) => {
          // Directories first, then files
          if (dir.items[a].type !== dir.items[b].type) {
            return dir.items[a].type === "directory" ? -1 : 1;
          }
          return a.localeCompare(b);
        });
      
      if (longFormat) {
        // Long format with permissions, size, date
        items.forEach(([name, info]) => {
          const size = humanReadable ? formatSize(info.size) : info.size.toString();
          const date = formatDate(info.modified);
          const type = info.type === "directory" ? "d" : "-";
          // Nerd Font icons:  = folder,  = file
          const icon = info.type === "directory" ? " " : " ";
          writeToTerminal(`${info.perms} ${size.padStart(8)} ${date} ${icon} ${name}`, "info");
        });
        // Show total
        writeToTerminal(`total ${items.length}`, "info");
      } else {
        // Simple format with Nerd Font icons
        items.forEach(([name, info]) => {
          if (color) {
            // Nerd Font icons:  = folder,  = file
            const icon = info.type === "directory" ? " " : " ";
            writeToTerminal(`${icon} ${name}`, "info");
          } else {
            writeToTerminal(name, "info");
          }
        });
      }
    }
  },
  
  cat: {
    description: "Display file contents",
    execute: (args) => {
      if (args.length === 0) {
        writeToTerminal("cat: missing file operand", "error");
        writeToTerminal("Try 'cat --help' for more information.", "error");
        return;
      }
      
      args.forEach(file => {
        const filePath = file.startsWith("/") ? file : (shellCwd === "/" ? "/" + file : shellCwd + "/" + file);
        
        if (virtualFiles[filePath]) {
          writeToTerminal(virtualFiles[filePath], "info");
        } else {
          writeToTerminal(`cat: ${file}: No such file or directory`, "error");
        }
      });
    }
  },
  
  whoami: {
    description: "Print current user",
    execute: () => {
      writeToTerminal(shellEnv.USER || "user", "info");
    }
  },
  
  env: {
    description: "Display environment variables",
    execute: () => {
      Object.entries(shellEnv).forEach(([key, value]) => {
        writeToTerminal(`${key}=${value}`, "info");
      });
    }
  },
  
  alias: {
    description: "Create command aliases",
    execute: (args) => {
      if (args.length === 0) {
        // Show all aliases
        writeToTerminal("alias ll='ls -alF'", "info");
        writeToTerminal("alias la='ls -A'", "info");
        writeToTerminal("alias l='ls -CF'", "info");
      } else {
        // Set alias (simplified)
        writeToTerminal(`alias: ${args.join(" ")}`, "info");
      }
    }
  },
  
  date: {
    description: "Display current date and time",
    execute: () => {
      writeToTerminal(new Date().toString(), "info");
    }
  },
  
  uname: {
    description: "Print system information",
    execute: (args) => {
      if (args.includes("-a")) {
        writeToTerminal("Battlecry-Editor Terminal v1.0.0", "info");
      } else {
        writeToTerminal("Battlecry-Editor", "info");
      }
    }
  },
  
  history: {
    description: "Show command history",
    execute: () => {
      shellHistory.forEach((cmd, index) => {
        writeToTerminal(`${index + 1}  ${cmd}`, "info");
      });
    }
  },
  
  exit: {
    description: "Close terminal",
    execute: () => {
      hideTerminal();
    }
  },
  
  node: {
    description: "Start Node.js REPL",
    execute: () => {
      nodeReplMode = true;
      nodeReplHistory = [];
      nodeReplHistoryIndex = -1;
      writeToTerminal("Welcome to Node.js REPL", "info");
      writeToTerminal("Type .exit to exit, .help for help", "info");
      writeReplPrompt();
    }
  },
  
  grep: {
    description: "Search for patterns in files",
    execute: (args) => {
      if (args.length < 2) {
        writeToTerminal("usage: grep [-Eiv] pattern file...", "error");
        return;
      }
      
      const pattern = args[0];
      const files = args.slice(1);
      let foundAny = false;
      
      files.forEach(file => {
        const filePath = file.startsWith("/") ? file : (shellCwd === "/" ? "/" + file : shellCwd + "/" + file);
        if (virtualFiles[filePath]) {
          const lines = virtualFiles[filePath].split("\n");
          lines.forEach((line, index) => {
            if (line.includes(pattern)) {
              writeToTerminal(`${filePath}:${index + 1}:${line}`, "info");
              foundAny = true;
            }
          });
        } else {
          writeToTerminal(`grep: ${file}: No such file or directory`, "error");
        }
      });
      
      if (!foundAny && files.length > 0) {
        // Exit code would be 1 in real grep
      }
    }
  },
  
  find: {
    description: "Search for files in directory tree",
    execute: (args) => {
      if (args.length < 2) {
        writeToTerminal("find: missing argument to `-name'", "error");
        writeToTerminal("usage: find [-H] [-L] [-P] [-Olevel] [-D help|tree|search|stat|rates|opt|exec] [path...] [expression]", "error");
        return;
      }
      
      const path = args[0];
      const nameIndex = args.indexOf("-name");
      if (nameIndex === -1 || nameIndex === args.length - 1) {
        writeToTerminal("find: missing argument to `-name'", "error");
        return;
      }
      
      const pattern = args[nameIndex + 1].replace(/\*/g, "");
      const searchPath = path.startsWith("/") ? path : (shellCwd === "/" ? "/" + path : shellCwd + "/" + path);
      const normalizedPath = searchPath === "." ? shellCwd : searchPath;
      
      function searchDir(dirPath, depth = 0) {
        if (depth > 10) return; // Prevent infinite recursion
        const dir = virtualFS[dirPath];
        if (!dir || dir.type !== "directory") return;
        
        Object.entries(dir.items || {}).forEach(([name, info]) => {
          if (name.includes(pattern)) {
            const fullPath = dirPath === "/" ? `/${name}` : `${dirPath}/${name}`;
            writeToTerminal(fullPath, "info");
          }
          if (info.type === "directory") {
            const subPath = dirPath === "/" ? `/${name}` : `${dirPath}/${name}`;
            searchDir(subPath, depth + 1);
          }
        });
      }
      
      searchDir(normalizedPath);
    }
  },
  
  mkdir: {
    description: "Create directory",
    execute: (args) => {
      if (args.length === 0) {
        writeToTerminal("mkdir: missing operand", "error");
        return;
      }
      args.forEach(dir => {
        writeToTerminal(`mkdir: created directory '${dir}'`, "success");
      });
    }
  },
  
  rm: {
    description: "Remove files or directories",
    execute: (args) => {
      if (args.length === 0) {
        writeToTerminal("rm: missing operand", "error");
        return;
      }
      const recursive = args.includes("-r") || args.includes("-rf");
      const files = args.filter(arg => !arg.startsWith("-"));
      files.forEach(file => {
        writeToTerminal(`rm: removed '${file}'`, "success");
      });
    }
  },
  
  touch: {
    description: "Create empty file or update timestamp",
    execute: (args) => {
      if (args.length === 0) {
        writeToTerminal("touch: missing file operand", "error");
        return;
      }
      args.forEach(file => {
        writeToTerminal(`touch: created '${file}'`, "success");
      });
    }
  },
  
  head: {
    description: "Display first lines of file",
    execute: (args) => {
      if (args.length === 0) {
        writeToTerminal("head: missing file operand", "error");
        return;
      }
      
      let lines = 10;
      let files = args;
      if (args[0] === "-n" && args.length > 2) {
        lines = parseInt(args[1]) || 10;
        files = args.slice(2);
      }
      
      const virtualFiles = {
        "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash",
        "/etc/hosts": "127.0.0.1 localhost\n::1 localhost",
        "/var/log/system.log": "System started successfully\nAll services running\n"
      };
      
      files.forEach(file => {
        const filePath = file.startsWith("/") ? file : (shellCwd === "/" ? "/" + file : shellCwd + "/" + file);
        if (virtualFiles[filePath]) {
          const fileLines = virtualFiles[filePath].split("\n");
          fileLines.slice(0, lines).forEach(line => {
            writeToTerminal(line, "info");
          });
        } else {
          writeToTerminal(`head: ${file}: No such file or directory`, "error");
        }
      });
    }
  },
  
  tail: {
    description: "Display last lines of file",
    execute: (args) => {
      if (args.length === 0) {
        writeToTerminal("tail: missing file operand", "error");
        return;
      }
      
      let lines = 10;
      let files = args;
      if (args[0] === "-n" && args.length > 2) {
        lines = parseInt(args[1]) || 10;
        files = args.slice(2);
      }
      
      const virtualFiles = {
        "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash",
        "/etc/hosts": "127.0.0.1 localhost\n::1 localhost",
        "/var/log/system.log": "System started successfully\nAll services running\n"
      };
      
      files.forEach(file => {
        const filePath = file.startsWith("/") ? file : (shellCwd === "/" ? "/" + file : shellCwd + "/" + file);
        if (virtualFiles[filePath]) {
          const fileLines = virtualFiles[filePath].split("\n");
          fileLines.slice(-lines).forEach(line => {
            writeToTerminal(line, "info");
          });
        } else {
          writeToTerminal(`tail: ${file}: No such file or directory`, "error");
        }
      });
    }
  },
  
  wc: {
    description: "Count lines, words, and characters",
    execute: (args) => {
      if (args.length === 0) {
        writeToTerminal("wc: missing file operand", "error");
        return;
      }
      
      const virtualFiles = {
        "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash",
        "/etc/hosts": "127.0.0.1 localhost\n::1 localhost",
        "/var/log/system.log": "System started successfully\nAll services running\n"
      };
      
      args.forEach(file => {
        const filePath = file.startsWith("/") ? file : (shellCwd === "/" ? "/" + file : shellCwd + "/" + file);
        if (virtualFiles[filePath]) {
          const content = virtualFiles[filePath];
          const lines = content.split("\n").length;
          const words = content.split(/\s+/).filter(w => w).length;
          const chars = content.length;
          writeToTerminal(`${lines} ${words} ${chars} ${file}`, "info");
        } else {
          writeToTerminal(`wc: ${file}: No such file or directory`, "error");
        }
      });
    }
  }
};

function executeShellCommand(input) {
  // If in REPL mode, execute as JavaScript
  if (nodeReplMode) {
    executeNodeRepl(input);
    return;
  }
  
  const trimmed = input.trim();
  if (!trimmed) {
    writePrompt();
    return;
  }
  
  // Add to history
  if (trimmed && (shellHistory.length === 0 || shellHistory[shellHistory.length - 1] !== trimmed)) {
    shellHistory.push(trimmed);
    if (shellHistory.length > 100) {
      shellHistory.shift();
    }
  }
  shellHistoryIndex = shellHistory.length;
  
  // Display the command
  const commandLine = document.createElement("div");
  commandLine.className = "terminal-prompt-line";
  const user = shellEnv.USER || "user";
  const host = shellEnv.HOSTNAME || "battlecry";
  const cwd = shellCwd === "/" ? "/" : shellCwd;
  // Nerd Font:  = prompt symbol
  commandLine.innerHTML = `<span class="terminal-prompt-text"> ${user}@${host}</span><span style="color: var(--accent-blue);">:</span><span class="terminal-prompt-text" style="color: var(--accent-purple);">${cwd}</span><span class="terminal-prompt-text"> $</span> <span class="terminal-command">${trimmed}</span>`;
  terminalHistory.appendChild(commandLine);
  
  // Parse command
  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  
  // Execute command
  if (shellCommands[command]) {
    try {
      shellCommands[command].execute(args);
    } catch (error) {
      writeToTerminal(`${command}: ${error.message}`, "error");
    }
  } else {
    writeToTerminal(`Command not found: ${command}. Type 'help' for available commands.`, "error");
  }
  
  writePrompt();
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function writeToConsole(message, type = "info") {
  if (!terminalVisible) {
    showTerminal();
  }
  
  const timestamp = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.className = `terminal-line ${type}`;
  
  const timestampSpan = document.createElement("span");
  timestampSpan.className = "timestamp";
  timestampSpan.textContent = `[${timestamp}] `;
  
  const messageSpan = document.createElement("span");
  messageSpan.textContent = message;
  
  line.appendChild(timestampSpan);
  line.appendChild(messageSpan);
  terminalConsole.appendChild(line);
  
  // Auto-scroll to bottom
  terminalConsole.scrollTop = terminalConsole.scrollHeight;
}

// Console message interception - set up after writeToConsole is defined
(function setupConsoleInterception() {
  // Store original console methods
  const originalConsole = {
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
    trace: console.trace.bind(console),
    table: console.table.bind(console),
    group: console.group.bind(console),
    groupEnd: console.groupEnd.bind(console),
    groupCollapsed: console.groupCollapsed.bind(console),
    time: console.time.bind(console),
    timeEnd: console.timeEnd.bind(console),
    assert: console.assert.bind(console),
    clear: console.clear.bind(console),
  };

  // Helper function to format console arguments
  function formatConsoleArgs(args) {
    return args.map(arg => {
      if (arg === null) return "null";
      if (arg === undefined) return "undefined";
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(" ");
  }

  // Override console methods
  console.log = function(...args) {
    originalConsole.log(...args);
    if (terminalConsole) {
      writeToConsole(formatConsoleArgs(args), "info");
    }
  };

  console.error = function(...args) {
    originalConsole.error(...args);
    if (terminalConsole) {
      writeToConsole(formatConsoleArgs(args), "error");
    }
  };

  console.warn = function(...args) {
    originalConsole.warn(...args);
    if (terminalConsole) {
      writeToConsole(formatConsoleArgs(args), "warning");
    }
  };

  console.info = function(...args) {
    originalConsole.info(...args);
    if (terminalConsole) {
      writeToConsole(formatConsoleArgs(args), "info");
    }
  };

  console.debug = function(...args) {
    originalConsole.debug(...args);
    if (terminalConsole) {
      writeToConsole(`[DEBUG] ${formatConsoleArgs(args)}`, "info");
    }
  };

  console.trace = function(...args) {
    originalConsole.trace(...args);
    if (terminalConsole) {
      const stack = new Error().stack;
      writeToConsole(`[TRACE] ${formatConsoleArgs(args)}\n${stack}`, "info");
    }
  };

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    if (terminalConsole) {
      const errorMsg = `${event.error?.name || "Error"}: ${event.message}`;
      const location = event.filename ? ` at ${event.filename}:${event.lineno}:${event.colno}` : "";
      writeToConsole(`${errorMsg}${location}`, "error");
      if (event.error?.stack) {
        writeToConsole(event.error.stack, "error");
      }
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    if (terminalConsole) {
      const errorMsg = event.reason?.message || String(event.reason || "Unhandled Promise Rejection");
      writeToConsole(`Unhandled Promise Rejection: ${errorMsg}`, "error");
      if (event.reason?.stack) {
        writeToConsole(event.reason.stack, "error");
      }
    }
  });
})();

function clearTerminal() {
  if (terminalTab === "output") {
    terminalHistory.innerHTML = "";
    writePrompt();
  } else if (terminalTab === "console") {
    terminalConsole.innerHTML = "";
    writeToConsole("Console cleared", "info");
  } else if (terminalTab === "problems") {
    terminalProblems.innerHTML = "";
    problems = [];
    updateProblemsPanel();
  }
}

function showTerminal() {
  terminalPanel.classList.remove("hidden");
  terminalVisible = true;
  terminalToggleBtn.classList.add("active");
  
  // Initialize shell environment
  if (!shellEnv.USER) {
    shellEnv.USER = "user";
    shellEnv.HOSTNAME = "battlecry";
    shellEnv.HOME = "/home/user";
    shellEnv.PWD = shellCwd;
    shellEnv.PATH = "/usr/local/bin:/usr/bin:/bin";
    shellEnv.SHELL = "/bin/bash";
  }
  
  // Set initial directory to home
  if (shellCwd === "/") {
    shellCwd = "/home/user";
  }
  
  // Initialize shell prompt if terminal history is empty
  if (terminalHistory && terminalHistory.children.length === 0) {
    writePrompt();
  }
  
  // Focus input when terminal is shown
  if (terminalInput && terminalTab === "output") {
    setTimeout(() => terminalInput.focus(), 100);
  }
}

function hideTerminal() {
  terminalPanel.classList.add("hidden");
  terminalVisible = false;
  terminalToggleBtn.classList.remove("active");
}

function toggleTerminal() {
  if (terminalVisible) {
    hideTerminal();
  } else {
    showTerminal();
  }
}

function switchTerminalTab(tabName) {
  terminalTab = tabName;
  
  // Update tab buttons
  document.querySelectorAll(".terminal-tab").forEach((tab) => {
    tab.classList.remove("active");
    if (tab.dataset.terminal === tabName) {
      tab.classList.add("active");
    }
  });
  
  // Update content
  terminalOutput.classList.toggle("active", tabName === "output");
  terminalConsole.classList.toggle("active", tabName === "console");
  terminalProblems.classList.toggle("active", tabName === "problems");
  
  if (tabName === "problems") {
    updateProblemsPanel();
  } else if (tabName === "output") {
    // Focus input when switching to output tab
    setTimeout(() => terminalInput?.focus(), 100);
  }
}

function updateProblemsPanel() {
  terminalProblems.innerHTML = "";
  
  if (problems.length === 0) {
    terminalProblems.innerHTML = '<div style="padding: 16px; color: var(--text-secondary); text-align: center;">No problems found</div>';
    return;
  }
  
  problems.forEach((problem) => {
    const item = document.createElement("div");
    item.className = `problem-item ${problem.severity}`;
    
    item.innerHTML = `
      <div>
        <span class="problem-severity ${problem.severity}">${problem.severity}</span>
        <span class="problem-message">${problem.message}</span>
      </div>
      <div class="problem-location">Line ${problem.line}:${problem.column}</div>
    `;
    
    item.addEventListener("click", () => {
      if (dartEditor) {
        dartEditor.setPosition({ lineNumber: problem.line, column: problem.column });
        dartEditor.focus();
      }
    });
    
    terminalProblems.appendChild(item);
  });
}

// Command Palette Functions
const COMMANDS = [
  { id: "compile.js", label: "Compile to JavaScript", icon: "⚡", shortcut: "Ctrl+Enter", action: () => compile("js") },
  { id: "compile.native", label: "Compile to Native", icon: "🔧", shortcut: "Ctrl+Shift+Enter", action: () => compile("native") },
  { id: "run", label: "Run JavaScript", icon: "▶️", shortcut: "Ctrl+R", action: runCode },
  { id: "save", label: "Save Code", icon: "💾", shortcut: "Ctrl+S", action: saveCode },
  { id: "load", label: "Load Code", icon: "📂", shortcut: "", action: loadCode },
  { id: "templates", label: "Show Templates", icon: "📋", shortcut: "", action: showTemplates },
  { id: "format", label: "Format Document", icon: "✨", shortcut: "Ctrl+Shift+F", action: () => dartEditor?.getAction("editor.action.formatDocument").run() },
  { id: "terminal.toggle", label: "Toggle Terminal", icon: "💻", shortcut: "Ctrl+`", action: toggleTerminal },
  { id: "terminal.clear", label: "Clear Terminal", icon: "🗑️", shortcut: "", action: clearTerminal },
  { id: "output.clear", label: "Clear Output", icon: "🗑️", shortcut: "Ctrl+K", action: clearOutput },
];

let filteredCommands = [...COMMANDS];
let selectedCommandIndex = 0;

function showCommandPalette() {
  commandPalette.classList.remove("hidden");
  commandPaletteInput.value = "";
  commandPaletteInput.focus();
  filterCommands("");
}

function hideCommandPalette() {
  commandPalette.classList.add("hidden");
  selectedCommandIndex = 0;
}

function filterCommands(query) {
  const lowerQuery = query.toLowerCase();
  filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(lowerQuery)
  );
  selectedCommandIndex = 0;
  renderCommands();
}

function renderCommands() {
  commandPaletteList.innerHTML = "";
  
  filteredCommands.forEach((cmd, index) => {
    const item = document.createElement("div");
    item.className = `command-item ${index === selectedCommandIndex ? "selected" : ""}`;
    
    item.innerHTML = `
      <span class="command-item-icon">${cmd.icon}</span>
      <span class="command-item-label">${cmd.label}</span>
      ${cmd.shortcut ? `<span class="command-item-shortcut">${cmd.shortcut}</span>` : ""}
    `;
    
    item.addEventListener("click", () => executeCommand(cmd));
    commandPaletteList.appendChild(item);
  });
  
  // Scroll selected item into view
  const selectedItem = commandPaletteList.querySelector(".selected");
  if (selectedItem) {
    selectedItem.scrollIntoView({ block: "nearest" });
  }
}

function executeCommand(cmd) {
  hideCommandPalette();
  if (cmd.action) {
    cmd.action();
  }
}

// Event Listeners
compileJsBtn.addEventListener("click", () => compile("js"));
compileNativeBtn.addEventListener("click", () => compile("native"));
clearBtn.addEventListener("click", clearOutput);
runBtn.addEventListener("click", runCode);
saveBtn.addEventListener("click", saveCode);
loadBtn.addEventListener("click", loadCode);
templatesBtn.addEventListener("click", showTemplates);
terminalToggleBtn.addEventListener("click", toggleTerminal);
terminalClearBtn.addEventListener("click", clearTerminal);
terminalCloseBtn.addEventListener("click", hideTerminal);
notificationClose.addEventListener("click", hideNotification);

// Terminal tab switching
document.querySelectorAll(".terminal-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    switchTerminalTab(tab.dataset.terminal);
  });
});

// Terminal input event listeners
if (terminalInput) {
  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const command = terminalInput.value;
      terminalInput.value = "";
      tabCompletionMatches = [];
      tabCompletionIndex = -1;
      executeShellCommand(command);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const input = terminalInput.value;
      const cursorPos = terminalInput.selectionStart;
      const textBeforeCursor = input.substring(0, cursorPos);
      const parts = textBeforeCursor.split(/\s+/);
      const lastPart = parts[parts.length - 1] || "";
      
      // Find completions
      const completions = findCompletions(lastPart);
      
      if (completions.length === 0) {
        // No completions - beep (visual feedback)
        terminalInput.style.borderColor = "var(--accent-red)";
        setTimeout(() => {
          terminalInput.style.borderColor = "";
        }, 100);
      } else if (completions.length === 1) {
        // Single completion - complete it
        const completion = completions[0];
        const newText = textBeforeCursor.substring(0, textBeforeCursor.length - lastPart.length) + completion + input.substring(cursorPos);
        terminalInput.value = newText;
        terminalInput.setSelectionRange(cursorPos - lastPart.length + completion.length, cursorPos - lastPart.length + completion.length);
      } else {
        // Multiple completions - cycle through or show all
        if (tabCompletionIndex === -1) {
          // First tab - show all matches
          tabCompletionMatches = completions;
          writeToTerminal("", "info");
          completions.forEach(comp => {
            writeToTerminal(comp, "info");
          });
          writePrompt();
          // Complete to common prefix
          let commonPrefix = completions[0];
          for (let i = 1; i < completions.length; i++) {
            while (!completions[i].startsWith(commonPrefix)) {
              commonPrefix = commonPrefix.slice(0, -1);
            }
          }
          if (commonPrefix.length > lastPart.length) {
            const newText = textBeforeCursor.substring(0, textBeforeCursor.length - lastPart.length) + commonPrefix + input.substring(cursorPos);
            terminalInput.value = newText;
            terminalInput.setSelectionRange(cursorPos - lastPart.length + commonPrefix.length, cursorPos - lastPart.length + commonPrefix.length);
          }
          tabCompletionIndex = 0;
        } else {
          // Cycle through matches
          tabCompletionIndex = (tabCompletionIndex + 1) % tabCompletionMatches.length;
          const completion = tabCompletionMatches[tabCompletionIndex];
          const newText = textBeforeCursor.substring(0, textBeforeCursor.length - lastPart.length) + completion + input.substring(cursorPos);
          terminalInput.value = newText;
          terminalInput.setSelectionRange(cursorPos - lastPart.length + completion.length, cursorPos - lastPart.length + completion.length);
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      tabCompletionMatches = [];
      tabCompletionIndex = -1;
      if (nodeReplMode) {
        if (nodeReplHistoryIndex > 0) {
          nodeReplHistoryIndex--;
          terminalInput.value = nodeReplHistory[nodeReplHistoryIndex];
        }
      } else {
        if (shellHistoryIndex > 0) {
          shellHistoryIndex--;
          terminalInput.value = shellHistory[shellHistoryIndex];
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      tabCompletionMatches = [];
      tabCompletionIndex = -1;
      if (nodeReplMode) {
        if (nodeReplHistoryIndex < nodeReplHistory.length - 1) {
          nodeReplHistoryIndex++;
          terminalInput.value = nodeReplHistory[nodeReplHistoryIndex];
        } else {
          nodeReplHistoryIndex = nodeReplHistory.length;
          terminalInput.value = currentCommand;
        }
      } else {
        if (shellHistoryIndex < shellHistory.length - 1) {
          shellHistoryIndex++;
          terminalInput.value = shellHistory[shellHistoryIndex];
        } else {
          shellHistoryIndex = shellHistory.length;
          terminalInput.value = currentCommand;
        }
      }
    } else if (e.key === "Escape") {
      tabCompletionMatches = [];
      tabCompletionIndex = -1;
      if (nodeReplMode) {
        // Exit REPL on Escape
        nodeReplMode = false;
        writeToTerminal("Exiting Node.js REPL", "info");
        writePrompt();
      } else {
        currentCommand = terminalInput.value;
        terminalInput.value = "";
      }
    } else {
      // Reset tab completion on any other key
      tabCompletionMatches = [];
      tabCompletionIndex = -1;
    }
  });
  
  terminalInput.addEventListener("input", (e) => {
    currentCommand = e.target.value;
  });
  
  // Focus input when clicking on terminal
  terminalOutput.addEventListener("click", () => {
    if (terminalTab === "output") {
      terminalInput.focus();
    }
  });
}

// Command Palette event listeners
commandPaletteInput.addEventListener("input", (e) => {
  filterCommands(e.target.value);
});

commandPaletteInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    e.stopPropagation();
    selectedCommandIndex = Math.min(selectedCommandIndex + 1, filteredCommands.length - 1);
    renderCommands();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    e.stopPropagation();
    selectedCommandIndex = Math.max(selectedCommandIndex - 1, 0);
    renderCommands();
  } else if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    if (filteredCommands[selectedCommandIndex]) {
      executeCommand(filteredCommands[selectedCommandIndex]);
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    hideCommandPalette();
  }
});

// Prevent command palette shortcuts from triggering when palette is open
commandPalette.addEventListener("keydown", (e) => {
  if (e.key === "p" && e.ctrlKey || e.key === "p" && e.metaKey) {
    e.stopPropagation();
  }
});

commandPaletteClose.addEventListener("click", hideCommandPalette);

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
  writeToTerminal(`Compiling Dart code to ${target.toUpperCase()}...`, "info");

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
      // Update language mode based on target FIRST
      const model = outputEditor.getModel();
      if (target === "js") {
        monaco.editor.setModelLanguage(model, "javascript");
        outputInfo.textContent = "JavaScript Output";
      } else {
        monaco.editor.setModelLanguage(model, "plaintext");
        outputInfo.textContent = "Native Output Info";
      }
      
      // Set output AFTER language is set
      outputEditor.setValue(data.output);

      updateStatus("Compilation successful", "ready");
      writeToTerminal(`✓ Compilation successful! Output size: ${data.output.length} characters`, "success");
      if (data.stdout) {
        writeToTerminal(data.stdout, "info");
      }
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
      writeToTerminal(`✗ Compilation failed`, "error");
      if (data.error) {
        writeToTerminal(data.error, "error");
      }
      if (data.stdout) {
        writeToTerminal(data.stdout, "info");
      }
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

// Run compiled JavaScript code
function runCode() {
  const outputValue = outputEditor.getValue();
  
  if (!outputValue || outputValue.trim().length === 0) {
    showNotification(
      "warning",
      "⚠️",
      "Please compile to JavaScript first (Ctrl/Cmd + Enter)"
    );
    return;
  }

  // Check if output looks like JavaScript (not just comments or error messages)
  const trimmedValue = outputValue.trim();
  if (trimmedValue.startsWith("//") && !trimmedValue.includes("function") && !trimmedValue.includes("=>")) {
    showNotification(
      "warning",
      "⚠️",
      "Output appears to be comments only. Please compile to JavaScript first."
    );
    return;
  }

  // Check if output is JavaScript by language mode OR by content
  const model = outputEditor.getModel();
  const isJavaScript = model.getLanguageId() === "javascript" ||
                       trimmedValue.includes("function") ||
                       trimmedValue.includes("=>") ||
                       trimmedValue.includes("var ") ||
                       trimmedValue.includes("let ") ||
                       trimmedValue.includes("const ") ||
                       trimmedValue.includes("class ") ||
                       trimmedValue.match(/^\s*(function|var|let|const|class|export|import)/m);

  if (!isJavaScript) {
    showNotification(
      "warning",
      "⚠️",
      "Output doesn't appear to be JavaScript. Please compile to JS first (Ctrl/Cmd + Enter)."
    );
    return;
  }

  try {
    // Create a safe execution context
    const consoleOutput = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    // Capture console output
    console.log = (...args) => {
      consoleOutput.push(args.map((a) => String(a)).join(" "));
      originalLog.apply(console, args);
    };
    console.error = (...args) => {
      consoleOutput.push("ERROR: " + args.map((a) => String(a)).join(" "));
      originalError.apply(console, args);
    };
    console.warn = (...args) => {
      consoleOutput.push("WARN: " + args.map((a) => String(a)).join(" "));
      originalWarn.apply(console, args);
    };

    // Execute the code
    eval(outputValue);

    // Restore console
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;

    // Show results
    writeToTerminal("▶ Executing JavaScript code...", "info");
    if (consoleOutput.length > 0) {
      const result = "// Execution Output:\n" + consoleOutput.join("\n");
      outputEditor.setValue(result);
      consoleOutput.forEach((line) => writeToTerminal(line, "info"));
      writeToTerminal("✓ Execution completed successfully", "success");
      showNotification("success", "✅", "Code executed successfully!");
    } else {
      writeToTerminal("✓ Execution completed (no console output)", "info");
      showNotification("info", "ℹ️", "Code executed (no console output)");
    }
  } catch (error) {
    const errorMsg = `// Execution Error:\n\n${error.name}: ${error.message}\n\n${error.stack || ""}`;
    outputEditor.setValue(errorMsg);
    writeToTerminal(`✗ Execution error: ${error.name}`, "error");
    writeToTerminal(error.message, "error");
    if (error.stack) {
      writeToTerminal(error.stack, "error");
    }
    showNotification("error", "❌", "Execution failed: " + error.message);
    console.error("Execution error:", error);
  }
}

// Save code to localStorage
function saveCode() {
  const code = dartEditor.getValue();
  try {
    localStorage.setItem("dartEditor_code", code);
    const timestamp = new Date().toLocaleString();
    localStorage.setItem("dartEditor_timestamp", timestamp);
    showNotification("success", "✅", `Code saved at ${timestamp}`);
  } catch (error) {
    showNotification("error", "❌", "Failed to save: " + error.message);
  }
}

// Load code from localStorage
function loadCode() {
  try {
    const savedCode = localStorage.getItem("dartEditor_code");
    if (savedCode) {
      dartEditor.setValue(savedCode);
      const timestamp = localStorage.getItem("dartEditor_timestamp") || "unknown";
      showNotification("success", "✅", `Code loaded (saved: ${timestamp})`);
    } else {
      showNotification("warning", "⚠️", "No saved code found");
    }
  } catch (error) {
    showNotification("error", "❌", "Failed to load: " + error.message);
  }
}

// Show code templates
function showTemplates() {
  const templateNames = Object.keys(CODE_TEMPLATES);
  const templateList = templateNames
    .map((name, index) => `${index + 1}. ${name}`)
    .join("\n");

  const message = `Available Templates:\n\n${templateList}\n\nType the template name or number to load it.`;
  
  // Create a simple prompt (could be enhanced with a modal)
  const templateName = prompt(message);
  
  if (templateName) {
    // Try to match by number or name
    const templateIndex = parseInt(templateName) - 1;
    let selectedTemplate = null;

    if (templateIndex >= 0 && templateIndex < templateNames.length) {
      selectedTemplate = CODE_TEMPLATES[templateNames[templateIndex]];
    } else {
      // Try to find by name (case-insensitive)
      const foundName = templateNames.find(
        (name) => name.toLowerCase() === templateName.toLowerCase()
      );
      if (foundName) {
        selectedTemplate = CODE_TEMPLATES[foundName];
      }
    }

    if (selectedTemplate) {
      dartEditor.setValue(selectedTemplate);
      showNotification("success", "✅", "Template loaded!");
    } else {
      showNotification("warning", "⚠️", "Template not found");
    }
  }
}

// Auto-save on changes (debounced)
let autoSaveTimeout = null;
function autoSave() {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  autoSaveTimeout = setTimeout(() => {
    const code = dartEditor.getValue();
    if (code && code.trim().length > 0) {
      localStorage.setItem("dartEditor_autosave", code);
    }
  }, 2000); // Auto-save after 2 seconds of inactivity
}

// Load auto-saved code on startup
function loadAutoSave() {
  try {
    const autoSaved = localStorage.getItem("dartEditor_autosave");
    if (autoSaved && autoSaved !== DEFAULT_DART_CODE) {
      dartEditor.setValue(autoSaved);
      showNotification("info", "ℹ️", "Auto-saved code restored");
    }
  } catch (error) {
    console.error("Failed to load auto-save:", error);
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

  // Ctrl/Cmd + S: Save code
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveCode();
  }

  // Ctrl/Cmd + R: Run code
  if ((e.ctrlKey || e.metaKey) && e.key === "r" && !e.shiftKey) {
    e.preventDefault();
    runCode();
  }

  // Ctrl/Cmd + `: Toggle Terminal
  if ((e.ctrlKey || e.metaKey) && e.key === "`") {
    e.preventDefault();
    toggleTerminal();
  }

  // Ctrl/Cmd + Shift + P: Command Palette
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "p") {
    e.preventDefault();
    showCommandPalette();
  }
});

  console.log("Soul's Dart Editor initialized");
console.log("Keyboard shortcuts:");
console.log("  Ctrl/Cmd + Enter: Compile to JS");
console.log("  Ctrl/Cmd + Shift + Enter: Compile to Native");
console.log("  Ctrl/Cmd + R: Run compiled JavaScript");
console.log("  Ctrl/Cmd + S: Save code");
console.log("  Ctrl/Cmd + K: Clear output");
console.log("  Ctrl/Cmd + Shift + F: Format code");
console.log("  Ctrl/Cmd + `: Toggle Terminal");
console.log("  Ctrl/Cmd + Shift + P: Command Palette");
console.log("  Ctrl/Cmd + F: Find");
console.log("  Ctrl/Cmd + H: Replace");
console.log("  Ctrl/Cmd + /: Toggle comment");
console.log("  Ctrl/Cmd + Space: Trigger IntelliSense");
console.log("  F12: Go to Definition");
console.log("  Shift + F12: Find All References");
console.log("  F2: Rename Symbol");
console.log("  Ctrl/Cmd + Click: Multi-cursor");
console.log("  Alt + Click: Column selection");
console.log("\n✨ Life-changing features:");
console.log("  • Live error checking (as you type)");
console.log("  • Run JavaScript code directly");
console.log("  • Auto-save to localStorage");
console.log("  • Code templates & examples");
console.log("  • Go to Definition / Find References");
console.log("  • Rename Symbol across code");
console.log("  • Integrated Terminal (VS Code style)");
console.log("  • Command Palette (VS Code style)");
console.log("  • Problems Panel with diagnostics");
