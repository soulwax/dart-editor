# Database Setup

This project uses Drizzle ORM with PostgreSQL 17 to persist file I/O operations.

## Setup

1. **Install PostgreSQL 17** (if not already installed)

2. **Create a database:**
   ```bash
   createdb battlecry_editor
   ```

3. **Create a `.env` file** in the project root:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/battlecry_editor?sslmode=disable
   PORT=5555
   ```
   Replace `user` and `password` with your PostgreSQL credentials.

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Generate and run migrations:**
   ```bash
   npm run db:generate
   npm run db:push
   ```
   
   Or use migrations:
   ```bash
   npm run db:migrate
   ```

6. **Start the server:**
   ```bash
   npm start
   ```

## Database Schema

The `files` table stores all virtual file system files and directories:

- `id` - Primary key (auto-generated)
- `path` - File path (unique)
- `content` - File content (text)
- `type` - 'file' or 'directory'
- `permissions` - File permissions (e.g., '-rw-r--r--', 'drwxr-xr-x')
- `size` - File size in bytes
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Drizzle Commands

- `npm run db:generate` - Generate migration files
- `npm run db:push` - Push schema changes directly to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

