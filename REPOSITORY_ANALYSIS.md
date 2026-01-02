# Dart Editor - Repository Analysis

## Project Overview

**Dart Editor** is a professional web-based IDE for Dart development featuring a dual-pane layout, syntax highlighting, compilation capabilities, and a full-featured terminal emulator. The application combines Monaco Editor (VS Code's editor) with a Node.js/Express backend to provide a complete development environment in the browser.

**Live Demo**: [https://editor.madtek.de/](https://editor.madtek.de/)

**Version**: 0.6.0  
**License**: GPL-3.0-only

---

## Main Features

### 1. **Dual-Pane Dart Editor**
- Left pane: Dart code editor with Monaco Editor
- Right pane: Read-only output viewer for compiled code
- Synchronized scrolling between panes
- Custom Dart syntax highlighting with Monarch tokenizer
- IntelliSense/autocomplete support
- Code snippets and templates

### 2. **Dart Compilation**
- Compile to JavaScript (`dart compile js`)
- Compile to Native executable (`dart compile exe`)
- Real-time error reporting
- Compilation status indicators
- Run compiled JavaScript in browser

### 3. **Terminal Emulator (VS Code Style)**
- Full Unix-like shell with command prompt
- Multiple terminal tabs (OUTPUT, CONSOLE, PROBLEMS)
- Command history with arrow key navigation
- Tab completion for commands and file paths
- Virtual file system with realistic directory structure
- 30+ Unix commands implemented (ls, cd, cat, grep, find, sed, nano, etc.)
- Pipe support (`|`) and command chaining (`&&`, `||`)
- Environment variable expansion (`$VAR`)
- Wildcard expansion (`*`, `?`)
- Node.js REPL mode

### 4. **Database-Persisted File System**
- PostgreSQL database for file storage (via Drizzle ORM)
- All file I/O operations persist across sessions
- RESTful API for file operations (`/api/files/*`)
- Support for files and directories
- File metadata (permissions, size, timestamps)

### 5. **Modern UI/UX**
- Dark theme matching VS Code's Material Palenight
- Responsive layout (side-by-side on desktop, stacked on mobile)
- Status indicators and notifications
- Command palette (`Ctrl/Cmd + P`)
- Keyboard shortcuts for all major operations
- Auto-save to localStorage

### 6. **Security Features**
- Input validation and sanitization
- File size limits (100KB max)
- Automatic cleanup of temporary files
- Dangerous code pattern detection
- Safe JavaScript execution context

---

## Technology Stack

### Frontend
- **Monaco Editor** - Microsoft's code editor (VS Code's editor)
- **Vanilla JavaScript** - No framework dependencies
- **HTML5/CSS3** - Modern web standards
- **Ubuntu Nerd Fonts** - Terminal typography

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Drizzle ORM** - Database ORM (v0.44.7)
- **PostgreSQL** - Database (v17)
- **postgres** - PostgreSQL client (v3.4.7)

### Development Tools
- **Drizzle Kit** - Database migrations (v0.31.7)
- **PM2** - Process manager (v6.0.14)
- **dotenv** - Environment variable management (v16.6.1)
- **nodemon** - Development auto-reload

### Deployment
- **Vercel** - Serverless deployment (configured)
- **Neon/Aiven** - PostgreSQL hosting (serverless)

---

## File Structure

```
dart-editor/
├── api/
│   └── index.js              # Serverless function for Vercel
├── certs/                    # SSL certificates (if needed)
├── db/
│   ├── index.js              # Database connection & setup
│   ├── schema.js             # Drizzle schema definition
│   ├── migrations/           # Database migration files
│   └── README.md             # Database setup guide
├── monaco/                   # Monaco Editor distribution
│   ├── min/                  # Minified editor files
│   ├── esm/                  # ES module files
│   └── package.json
├── public/                   # Static frontend files
│   ├── index.html            # Main HTML page
│   ├── app.js                # Client-side application (3550+ lines)
│   ├── style.css             # Styling
│   └── assets/               # Fonts and other assets
├── temp/                     # Temporary compilation files (auto-cleaned)
├── server.js                 # Main Express server
├── package.json              # Dependencies and scripts
├── drizzle.config.js         # Drizzle ORM configuration
├── ecosystem.config.js       # PM2 configuration
├── vercel.json               # Vercel deployment config
├── DEPLOYMENT.md             # Deployment guide
├── CHANGELOG.md              # Version history
└── README.md                 # Project documentation
```

---

## Key Components

### 1. **Server (`server.js`)**
- Express.js server on port 5555 (configurable)
- Dart compilation endpoints (`POST /compile`)
- File system API endpoints (`/api/files/*`)
- Health check endpoint (`GET /health`)
- Temporary file management and cleanup
- Database connection and initialization
- Graceful shutdown handling

### 2. **Frontend Application (`public/app.js`)**
- Monaco Editor initialization and configuration
- Custom Dart language support (syntax highlighting, autocomplete)
- Compilation request handling
- Terminal emulator implementation
- File system operations (CRUD)
- Command parsing and execution
- UI state management
- Keyboard shortcuts and command palette

### 3. **Database Layer (`db/`)**
- **Schema** (`schema.js`): Defines `files` table structure
- **Connection** (`index.js`): PostgreSQL connection with Drizzle ORM
- **Migrations**: Database version control

### 4. **API Layer (`api/index.js`)**
- Serverless-compatible version for Vercel
- Same endpoints as `server.js` but optimized for serverless
- Uses `/tmp` directory for temporary files in serverless environment

---

## Database Schema

### `files` Table
```sql
- id: integer (primary key, auto-generated)
- path: text (unique, not null) - File/directory path
- content: text (not null, default '') - File content
- type: text (not null, default 'file') - 'file' or 'directory'
- permissions: text (not null, default '-rw-r--r--') - Unix permissions
- size: integer (not null, default 0) - File size in bytes
- createdAt: timestamp (not null, default now)
- updatedAt: timestamp (not null, default now)
```

---

## API Endpoints

### Compilation
- `POST /compile` - Compile Dart code to JS or native executable
  - Body: `{ code: string, target: "js" | "native" }`
  - Returns: `{ success: boolean, output?: string, error?: string, stdout, stderr }`

### File Operations
- `GET /api/files/*` - Read a file
- `POST /api/files` - Create a file
- `PUT /api/files/*` - Update a file
- `DELETE /api/files/*` - Delete a file
- `GET /api/files?path=...` - List files in directory
- `POST /api/directories` - Create a directory

### System
- `GET /health` - Health check and Dart SDK status

---

## Terminal Commands Implemented

### File Operations
- `cat`, `head`, `tail`, `wc`, `grep`, `find`
- `touch`, `rm`, `mkdir`, `cp`, `mv`, `chmod`
- `nano`, `sed`, `less`, `more`

### Text Processing
- `sort`, `uniq`, `cut`

### System Information
- `ls`, `cd`, `pwd`, `whoami`, `date`, `uname`
- `df`, `du`, `uptime`
- `env`, `alias`, `history`
- `help`, `clear`, `exit`

### Advanced Features
- Pipe support (`|`)
- Command chaining (`&&`, `||`)
- Environment variable expansion (`$VAR`)
- Wildcard expansion (`*`, `?`)
- Tab completion
- Command aliases
- Node.js REPL mode

---

## Configuration

### Environment Variables
- `DATABASE_URL` or `DB_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5555)
- `NODE_ENV` - Environment (development/production)

### Scripts (`package.json`)
- `npm start` - Start server
- `npm run dev` - Development with nodemon
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run pm2:*` - PM2 process management

---

## Deployment

### Vercel (Serverless)
- Configured via `vercel.json`
- API routes mapped to serverless functions
- Static files served from `public/` and `monaco/`
- **Note**: Dart SDK not available in Vercel by default (compilation won't work)

### Traditional Server
- Uses `server.js` with Express
- Requires Dart SDK installed on server
- PM2 configuration available for production
- Supports Docker deployment

---

## Notable Patterns & Architecture

### 1. **Dual Deployment Strategy**
- `server.js` - Traditional Express server
- `api/index.js` - Serverless-compatible version
- Both share same logic but optimized for their environments

### 2. **Virtual File System**
- Files stored in PostgreSQL database
- Unix-like permissions and metadata
- Hierarchical directory structure
- Client-side caching for performance

### 3. **Terminal Emulation**
- Realistic command execution with delays
- Proper exit code tracking
- Command history and completion
- Pipe and chaining support

### 4. **Security Measures**
- Input validation (code size, format)
- Dangerous pattern detection
- Temporary file cleanup
- Safe execution context for JavaScript

### 5. **Monaco Editor Integration**
- Custom Dart language definition
- Syntax highlighting via Monarch tokenizer
- IntelliSense/autocomplete provider
- Hover information and signature help

---

## Dependencies

### Production
- `express` ^4.21.2 - Web framework
- `drizzle-orm` ^0.44.7 - Database ORM
- `postgres` ^3.4.7 - PostgreSQL client
- `dotenv` ^16.6.1 - Environment variables

### Development
- `drizzle-kit` ^0.31.7 - Database migrations
- `pm2` ^6.0.14 - Process manager

---

## Development Workflow

1. **Local Development**
   ```bash
   npm install
   # Set up .env with DATABASE_URL
   npm run db:push
   npm run dev
   ```

2. **Database Changes**
   ```bash
   # Edit db/schema.js
   npm run db:generate
   npm run db:push
   ```

3. **Production Deployment**
   ```bash
   # Vercel
   vercel --prod
   
   # Or PM2
   npm run pm2:start
   ```

---

## Known Limitations

1. **Vercel Deployment**: Dart SDK not available, compilation features won't work
2. **File Size Limit**: 100KB maximum code size
3. **Compilation Timeout**: 30 seconds maximum
4. **Single Connection**: Database uses single connection for serverless compatibility

---

## Future Considerations

Based on the codebase structure, potential enhancements:
- Multi-file project support
- Git integration
- Package management (pub.dev)
- Real-time collaboration
- Docker-based compilation for better security
- Enhanced error diagnostics
- Code formatting integration

---

## Code Statistics

- **Frontend**: ~3,550 lines (`public/app.js`)
- **Backend**: ~470 lines (`server.js`)
- **API**: ~425 lines (`api/index.js`)
- **Database**: ~40 lines (`db/schema.js` + `db/index.js`)
- **Total**: ~4,500+ lines of code

---

## Summary

This is a sophisticated web-based IDE that combines:
- **Monaco Editor** for code editing
- **Dart compilation** capabilities
- **Full terminal emulator** with Unix commands
- **Database-persisted file system**
- **Modern UI/UX** matching VS Code aesthetics

The project demonstrates:
- Clean separation of concerns (frontend/backend/database)
- Dual deployment strategy (traditional/serverless)
- Comprehensive feature set (editor + terminal + file system)
- Production-ready security measures
- Well-documented codebase

The architecture is modular and extensible, making it easy to add new features or modify existing ones.

