# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2024-01-20

### Added

#### Pager Commands
- **`less`** - View file contents with pager
  - Displays file with line numbers
  - Shows first 20 lines by default
  - Indicates total line count
  - Simplified pager interface
  
- **`more`** - View file contents page by page
  - Displays file content in pages
  - Shows first 24 lines (terminal height simulation)
  - Progress indicator
  - Page-by-page navigation interface

### Fixed
- Fixed `cat` command to be properly async
  - Now correctly awaits file reads
  - Proper error handling for async operations
  - Consistent with other file commands

### Changed
- Improved command consistency
  - All file-reading commands now properly async
  - Better error handling across commands
  - More realistic terminal behavior

---

## [0.4.0] - 2024-01-20

### Added - Database Persistence & Natural Terminal Features

#### Database Persistence
- **Drizzle ORM Integration** with PostgreSQL 17
  - Persistent file storage in PostgreSQL database
  - All file I/O operations now persist across sessions
  - Database schema for files and directories
  - Automatic database connection management
  - Graceful shutdown with database cleanup

#### Database API Endpoints
- `GET /api/files/*` - Read file from database
- `POST /api/files` - Create file in database
- `PUT /api/files/*` - Update file in database
- `DELETE /api/files/*` - Delete file from database
- `GET /api/files?path=...` - List files in directory
- `POST /api/directories` - Create directory in database

#### Database Configuration
- Drizzle configuration file (`drizzle.config.js`)
- Database schema definition (`db/schema.js`)
- Database connection module (`db/index.js`)
- Environment variable support for `DB_URL`
- Database setup documentation (`db/README.md`)

#### New Database Scripts
- `npm run db:generate` - Generate migration files
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio

#### Shell Enhancements - Natural Terminal Feel

##### Command Chaining & Pipes
- **Pipe support (`|`)** - Chain commands together
  - Output from one command becomes input to the next
  - Supports multiple pipes in sequence
  - Example: `cat file.txt | grep pattern | sort`
  
- **Command chaining operators**
  - `&&` - Execute next command only if previous succeeds
  - `||` - Execute next command only if previous fails
  - Proper exit code tracking

##### Environment Variable Expansion
- **Variable expansion** - `$VAR` and `${VAR}` syntax
  - Automatic expansion in command arguments
  - Supports all environment variables
  - Example: `echo $HOME`, `cd ${PWD}`

##### Wildcard Expansion
- **File globbing** - `*` and `?` wildcards
  - Automatic expansion of file patterns
  - Works with all file operations
  - Example: `ls *.txt`, `rm file?`

##### Realistic Command Execution
- **Command delays** - Random 30-80ms delays
  - Makes terminal feel more natural
  - Simulates real command execution time
  - Applied to all commands

##### Working Command Aliases
- **Functional aliases** - Actually execute aliased commands
  - `alias name='command'` syntax
  - Default aliases: `ll`, `la`, `l`
  - Aliases persist during session
  - `alias` command to list/create aliases

##### Exit Code Tracking
- **Exit codes** - Track command success/failure
  - `lastExitCode` variable tracks last command result
  - Used for command chaining logic
  - Proper error code propagation

#### New Shell Commands

##### File Operations
- **`cp`** - Copy files or directories
  - Supports multiple sources
  - Handles directory destinations
  - Proper error messages
  
- **`mv`** - Move or rename files
  - Move files between locations
  - Rename files
  - Updates database accordingly

- **`chmod`** - Change file permissions
  - Numeric mode support (e.g., `755`)
  - Symbolic mode support (e.g., `u+x`)
  - Updates permission metadata

##### Text Processing
- **`sort`** - Sort lines of text
  - `-r` flag for reverse sort
  - `-n` flag for numeric sort
  - Works with files and piped input
  
- **`uniq`** - Remove duplicate lines
  - `-c` flag to show counts
  - Preserves order of first occurrence
  - Works with files and piped input

- **`cut`** - Cut columns from text
  - `-d` flag for delimiter
  - `-f` flag for field selection
  - Supports multiple fields

##### System Information
- **`df`** - Show disk space usage
  - Filesystem information
  - Disk usage statistics
  - Mount point information

- **`du`** - Show directory disk usage
  - Recursive size calculation
  - `-h` flag for human-readable format
  - Shows directory sizes

- **`uptime`** - Show system uptime
  - Calculates uptime from session start
  - Shows days, hours, minutes, seconds
  - Displays load average

##### Documentation
- **`man`** - Display manual pages
  - Shows command descriptions
  - Displays usage information
  - Helpful for learning commands

### Changed

#### Client-Side File Operations
- All file I/O functions now use async API calls
  - `createFile()` - Uses `POST /api/files`
  - `deleteFile()` - Uses `DELETE /api/files/*`
  - `readFile()` - Uses `GET /api/files/*` with local caching
  - `writeFile()` - Uses `PUT /api/files/*`
- Commands updated to be fully async
  - `cat`, `grep`, `head`, `tail`, `wc`
  - `touch`, `rm`, `mkdir`
  - `sed`, `nano`
  - `echo` with redirection

#### Command Execution
- Enhanced command parser with:
  - Environment variable expansion
  - Wildcard expansion
  - Alias resolution
  - Pipe detection and handling
  - Command chaining detection
- Improved error handling with exit codes
- Better async command support

#### Server Enhancements
- Database connection on startup
- Database health checking
- Graceful shutdown with database cleanup
- Enhanced error messages for database operations

### Technical Details

#### Database Schema
- `files` table with columns:
  - `id` - Primary key (auto-generated)
  - `path` - File path (unique)
  - `content` - File content (text)
  - `type` - 'file' or 'directory'
  - `permissions` - File permissions string
  - `size` - File size in bytes
  - `createdAt` - Creation timestamp
  - `updatedAt` - Last update timestamp

#### Helper Functions
- `expandEnvironmentVariables()` - Expand $VAR syntax
- `expandWildcards()` - Expand * and ? patterns
- `addRealisticDelay()` - Add execution delays
- `executeCommandChain()` - Handle && and || operators
- Enhanced `normalizePath()` with environment variable support

#### Dependencies Added
- `drizzle-orm` ^0.44.7 - ORM for PostgreSQL
- `drizzle-kit` ^0.31.7 - Migration and schema management
- `postgres` ^3.4.7 - PostgreSQL client
- `dotenv` ^16.6.1 - Environment variable management

---

## [0.2.0] - 2024-01-20

### Added - File I/O Operations

#### Writable File System
- Implemented fully writable virtual file system
- File creation, reading, updating, and deletion operations
- Directory creation and management
- File metadata tracking (size, permissions, modification dates)
- Path normalization and validation
- Parent directory auto-creation

#### Enhanced File Commands
- `touch` - Now actually creates empty files in the file system
- `rm` - Now actually deletes files from the file system
- `mkdir` - Now actually creates directories in the file system
- `cat` - Enhanced to work with all files (existing and newly created)
- `grep` - Enhanced to search in all files including newly created ones
- `head` - Enhanced to read from all files
- `tail` - Enhanced to read from all files
- `wc` - Enhanced to count in all files

#### New File Editing Commands
- `nano` - Text editor interface
  - Displays file content with line numbers
  - Shows GNU nano-style interface
  - Help text and usage instructions
  - Simplified interface for file viewing
  
- `sed` - Stream editor for text transformation
  - Substitution command: `s/pattern/replacement/[flags]`
  - In-place editing with `-i` flag
  - Global replacement with `g` flag
  - Regex pattern support with fallback to simple string replacement
  - Multiple file editing support
  - Proper error handling

#### Enhanced `echo` Command
- Output redirection support:
  - `echo "text" > file` - Overwrite file with text
  - `echo "text" >> file` - Append text to file
- Automatic file creation if file doesn't exist
- File update capability

### Changed
- File system operations now persist during session
- All file-related commands now use unified file I/O functions
- Improved error messages for file operations
- Better path handling and normalization

### Technical Details
- Added helper functions: `createFile()`, `deleteFile()`, `readFile()`, `writeFile()`, `ensureDirectory()`, `normalizePath()`
- File system state management
- File metadata synchronization

---

## [0.1.0] - 2024-01-20

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
