# Dart Editor

A professional web-based IDE for Dart development featuring the Dart Editor with dual-pane layout, syntax highlighting, and compilation capabilities.

Visit [https://editor.madtek.de/](https://editor.madtek.de/) to try it out.

## Features

- **Dual-Pane Dart Editor Interface**
  - Left pane: Dart code editor with syntax highlighting
  - Right pane: Read-only output viewer for compiled code
  - Synchronized scrolling between panes

- **Dart Compilation Support**
  - Compile to JavaScript (`dart compile js`)
  - Compile to Native executable (`dart compile exe`)
  - Real-time error reporting

- **Modern UI**
  - Dark theme matching Soulwax's vs-dark
  - Responsive layout (side-by-side on desktop, stacked on mobile)
  - Status indicators and notifications
  - Keyboard shortcuts for quick actions

- **Security Features**
  - Input validation and sanitization
  - File size limits (100KB max)
  - Automatic cleanup of temporary files
  - Dangerous code pattern detection

## Prerequisites

- **Node.js** (v14 or higher)
- **Dart SDK** (for compilation features)

### Installing Dart SDK

Visit [https://dart.dev/get-dart](https://dart.dev/get-dart) for installation instructions.

**Verify installation:**

```bash
dart --version
```

## Installation

1. **Clone or navigate to the project directory:**

    ```bash
    cd /home/soulwax/workspace/WEB/soulwax-dart-editor
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

## Usage

### Start the Server

```bash
npm start
```

Or using Node directly:

```bash
node server.js
```

The server will start on **port 5555**. Open your browser and navigate to:

```r
http://localhost:5555
```

### Using PM2 (Optional)

If you have PM2 installed, you can use the following scripts:

```bash
npm run pm2:start    # Start the server
npm run pm2:stop     # Stop the server
npm run pm2:restart  # Restart the server
npm run pm2:logs     # View logs
npm run pm2:delete   # Remove from PM2
```

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Compile to JavaScript
- **Ctrl/Cmd + Shift + Enter**: Compile to Native
- **Ctrl/Cmd + K**: Clear output pane

## Project Structure

```sh
.
├───server.js          # Express server with compilation endpoints
├───public/
│   ├───index.html     # Main HTML page
│   ├───style.css      # Styling for dual-pane layout
│   └───app.js         # Client-side Dart editor logic
└───temp/              # Temporary files (auto-created, auto-cleaned)
├───package.json       # Project dependencies
└───README.md          # This file
```

## API Endpoints

### POST /compile

Compiles Dart code to JavaScript or native executable.

**Request Body:**

```json
{
  "code": "void main() { print('Hello'); }",
  "target": "js"  // or "native"
}
```

**Response (Success):**

```json
{
  "success": true,
  "output": "// compiled JavaScript code...",
  "target": "js",
  "stdout": "...",
  "stderr": "..."
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Error message...",
  "stdout": "...",
  "stderr": "..."
}
```

### GET /health

Check server and Dart SDK status.

**Response:**

```json
{
  "status": "ok",
  "dartSDK": true,
  "message": "Dart SDK available"
}
```

## Default Code

The editor loads with the following sample code:

```dart
void main() {
  print('Hello from Dart!');
  final numbers = [1, 2, 3, 4, 5];
  final doubled = numbers.map((n) => n << 1).toList();
  print('Doubled: $doubled');
}
```

## Configuration

### Server Port

To change the port from 5555, edit [server.js:6](server.js#L6):

```javascript
const PORT = 5555; // Change to your desired port
```

### Dart Editor Theme

To change the editor theme, edit [public/app.js](public/app.js) and modify the `theme` property:

```javascript
theme: 'vs-dark',  // Options: 'vs', 'vs-dark', 'hc-black'
```

### Code Size Limit

To adjust the maximum code size (default 100KB), edit [server.js:44](server.js#L44):

```javascript
if (code.length > 100000) {  // Change limit here
```

## Security Notes

The application includes basic security measures:

- **Input validation**: Checks for valid code format and size limits
- **Sandboxed compilation**: Uses temporary files that are automatically cleaned up
- **Pattern detection**: Warns about potentially dangerous code patterns
- **Timeout protection**: Compilation process times out after 30 seconds

**⚠️ Warning**: This application executes user-provided code on the server. For production use, consider additional security measures such as:

- Running compilation in isolated containers (Docker)
- Implementing rate limiting
- Adding authentication and authorization
- Using a dedicated compilation service

## Troubleshooting

### Dart SDK Not Found

**Error:** "Dart SDK not detected"

**Solution:**

1. Install Dart SDK from [https://dart.dev/get-dart](https://dart.dev/get-dart)
2. Ensure `dart` is in your system PATH
3. Restart the server after installation

### Port Already in Use

**Error:** "EADDRINUSE: address already in use :::5555"

**Solution:**

```bash
# Find process using port 5555
lsof -i :5555

# Kill the process
kill -9 <PID>

# Or change the port in server.js
```

### Compilation Timeout

**Error:** "Compilation timed out"

**Solution:**

- Simplify your code
- Increase timeout in [server.js:93](server.js#L93):

```javascript
timeout: 30000,  // Increase this value (in milliseconds)
```

## Development

### Using Nodemon

For development with auto-restart:

```bash
npm install -g nodemon
npm run dev
```

### Debugging

The server logs compilation requests and errors to the console. Check the terminal output for debugging information.

## License

This project is licensed under the GPLv3 License. See the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Microsoft's code editor
- [Express.js](https://expressjs.com/) - Web framework
- [Dart](https://dart.dev/) - Programming language
