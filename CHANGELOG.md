# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-01-20

### Added - Terminal Features

#### Terminal Panel
- Added VS Code-style terminal panel with multiple tabs (OUTPUT, CONSOLE, PROBLEMS)
- Terminal can be toggled with `Ctrl/Cmd + `` or via Terminal button
- Terminal panel supports resizing and auto-scroll
- Clear terminal functionality with dedicated button

#### Unix-like Shell
- Implemented realistic Unix shell with command prompt
- Enhanced prompt showing `user@hostname:directory$` format with color coding
- Support for command history with Up/Down arrow navigation (stores last 100 commands)
- Tab completion for commands and file paths
  - Single match: auto-completes immediately
  - Multiple matches: shows all options and completes common prefix
  - Double Tab: cycles through matches
- Virtual file system with realistic directory structure
  - Hierarchical file system (`/`, `/home`, `/usr`, `/bin`, `/etc`, `/var`, `/tmp`)
  - File metadata (permissions, sizes, modification dates)
  - Hidden files support (`.bashrc`, `.profile`)
  - Realistic file permissions (e.g., `drwxr-xr-x`, `-rw-r--r--`)

#### Shell Commands
- `help` - Show available commands with descriptions
- `clear` - Clear terminal screen
- `echo` - Print arguments
- `pwd` - Print working directory
- `cd` - Change directory
  - Supports `~` for home directory
  - Supports `-` for previous directory
  - Supports `..` for parent directory
  - Supports absolute and relative paths
- `ls` - List directory contents
  - `ls -l` - Long format with permissions, sizes, dates
  - `ls -a` - Show hidden files
  - `ls -h` - Human-readable file sizes
  - Color-coded Nerd Font icons for directories and files
  - Directories sorted first, then files
- `cat` - Display file contents (supports multiple files)
- `whoami` - Print current user
- `date` - Display current date and time
- `uname` - Print system information
  - Supports `-a` (all), `-r` (release), `-m` (machine), `-s` (system) flags
- `history` - Show command history with line numbers
- `exit` - Close terminal
- `grep` - Search for patterns in files with line numbers
- `find` - Recursive directory search for files (supports `-name` pattern)
- `mkdir` - Create directories
- `rm` - Remove files/directories (supports `-r`, `-rf` flags)
- `touch` - Create empty files or update timestamps
- `head` - Display first lines of files (supports `-n` flag)
- `tail` - Display last lines of files (supports `-n` flag)
- `wc` - Count lines, words, and characters with formatted output
- `env` - Display environment variables
- `alias` - Show/create command aliases

#### Node.js REPL
- Enter REPL mode by typing `node` command
- Execute JavaScript code directly in the terminal
- REPL-specific prompt with `>` symbol
- REPL commands:
  - `.exit` or `.quit` - Exit REPL
  - `.help` - Show REPL help
  - `Escape` key - Exit REPL
- Separate command history for REPL mode
- Automatic result display (like Node.js REPL)
- Error handling with stack traces
- JSON formatting for object results

#### Console Tab
- Dedicated CONSOLE tab for browser console messages
- Automatic interception of all console methods:
  - `console.log()`
  - `console.error()`
  - `console.warn()`
  - `console.info()`
  - `console.debug()`
  - `console.trace()`
- Captures uncaught JavaScript errors with stack traces
- Captures unhandled promise rejections
- Color-coded messages (errors in red, warnings in yellow, info in blue)
- Timestamps for each console message
- Object serialization with JSON formatting

#### Terminal Enhancements
- Realistic file system with permissions (e.g., `drwxr-xr-x`, `-rw-r--r--`)
- File sizes displayed in human-readable format (B, K, M, G)
- Modification timestamps with relative date formatting
- Environment variables system (`USER`, `HOSTNAME`, `HOME`, `PWD`, `PATH`, `SHELL`, `OLDPWD`)
- Realistic error messages with helpful suggestions
- Command aliases support (e.g., `ll`, `la`, `l`)
- Enhanced `cd` command with `~` (home) and `-` (previous directory) support
- Proper command argument parsing and validation
- Virtual file contents for system files (`/etc/passwd`, `/etc/hosts`, `/var/log/*.log`)

#### Visual Enhancements
- Ubuntu Nerd Fonts integration for terminal typography
- Nerd Font icons for directories () and files ()
- Color-coded prompt with user (green), host (green), separator (blue), directory (purple)
- Monospace font for all terminal output
- Proper terminal styling matching VS Code aesthetics
- Terminal tabs with icons (📟 OUTPUT, 🖥️ CONSOLE, ⚠️ PROBLEMS)
- Enhanced prompt symbols using Nerd Font characters

#### Problems Tab
- Dedicated PROBLEMS tab for code issues
- Click on problems to navigate to code location in editor
- Color-coded severity indicators (error, warning, info)
- Problem location display (line:column)

### Fixed
- Fixed `monaco.editor.getModelLanguage` error by using `model.getLanguageId()` instead

### Changed
- Terminal output now uses realistic Unix-style formatting
- Command execution provides immediate feedback
- File system operations show realistic output
- Prompt format changed from simple `$` to `user@host:directory$` format

---

## [1.0.0] - 2024-01-15

### Added

#### Core Editor Features
- Monaco Editor integration for Dart code editing
- Custom Dart syntax highlighting with Monarch tokenizer
- Code completion and IntelliSense
- Code formatting support (`Ctrl/Cmd + Shift + F`)
- Find and replace functionality
- Multi-cursor editing support
- Bracket matching and code folding
- Parameter hints and hover information
- Word-based suggestions
- Snippet suggestions
- Tab completion
- Code lens support
- Color decorators
- Smooth scrolling and cursor animations

#### Compilation
- Compile Dart to JavaScript (`Ctrl/Cmd + Enter`)
- Compile Dart to Native executable (`Ctrl/Cmd + Shift + Enter`)
- Real-time compilation status indicators
- Compilation output display in separate pane
- Error handling and display for compilation failures
- Compilation progress feedback
- Output language mode switching (JavaScript/Plaintext)

#### Code Execution
- Run compiled JavaScript code (`Ctrl/Cmd + R`)
- Safe JavaScript execution context
- Console output capture and display
- Execution error handling with stack traces
- Validation to ensure output is JavaScript before execution

#### File Management
- Save code to localStorage (`Ctrl/Cmd + S`)
- Load saved code from localStorage
- Auto-save functionality (saves after 2 seconds of inactivity)
- Code templates and examples
- Clear output functionality (`Ctrl/Cmd + K`)
- Auto-restore of saved code on startup

#### UI Features
- VS Code-inspired dark theme (Material Palenight)
- Responsive layout with split panes
- Status indicator showing compilation state
- Notification system for user feedback
- Command palette (`Ctrl/Cmd + P`)
- Keyboard shortcuts for all major operations
- Synchronized scrolling between editor panes
- Pane headers with titles and info
- Toolbar with action buttons
- Status dot indicator (ready/compiling/error states)

#### Server Integration
- Express.js backend server
- Dart SDK detection and validation
- Health check endpoint (`/health`)
- Compilation API endpoints (`/compile`)
- Temporary file management and cleanup
- Automatic cleanup of temp files every hour
- File size limits (100KB max)
- Input validation and sanitization
- Dangerous code pattern detection

#### Code Templates
- Hello World example
- Variables & Types examples
- Lists & Collections examples
- Functions examples
- Classes examples
- Async/Await examples
- Error Handling examples
- Streams examples

#### Security Features
- Input validation and sanitization
- File size limits (100KB max)
- Automatic cleanup of temporary files
- Dangerous code pattern detection
- Safe code execution context

### Technical Details
- Frontend: Vanilla JavaScript with Monaco Editor
- Backend: Node.js with Express
- Dart compilation via system `dart` command
- Real-time code validation
- Server health monitoring
- PM2 support for process management
- Port configuration (default: 5555)
