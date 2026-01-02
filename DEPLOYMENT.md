# Deployment Guide for Vercel

This guide provides detailed instructions for deploying the Dart Editor to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed (optional, but recommended)
3. PostgreSQL database (Aiven, Supabase, Neon, or any PostgreSQL provider)
4. Git repository connected to Vercel

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**
   - In the import screen, add these environment variables:
     - `DB_URL`: Your PostgreSQL connection string
     - `NODE_ENV`: `production`
   - Click "Deploy"

4. **Wait for deployment**
   - Vercel will build and deploy your application
   - You'll get a production URL (e.g., `https://your-app.vercel.app`)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DB_URL
   # Paste your database URL when prompted

   vercel env add NODE_ENV
   # Enter: production
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables Setup

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection string with SSL | `postgres://user:pass@host:port/db?sslmode=require` |
| `NODE_ENV` | Node environment | `production` |

### Setting Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable with the following settings:
   - **Key**: Variable name (e.g., `DB_URL`)
   - **Value**: Variable value
   - **Environment**: Select all (Production, Preview, Development)
4. Click "Save"

### Database Connection String Format

```
postgres://username:password@host:port/database?sslmode=require
```

Example with Aiven:
```
postgres://avnadmin:password@pg-project.aivencloud.com:23787/defaultdb?sslmode=require
```

**Important Notes:**
- Remove the `&sslrootcert=certs/ca.pem` part from your connection string for Vercel
- Most managed PostgreSQL providers (Aiven, Supabase, Neon) support SSL without requiring certificate files
- If SSL certificate is absolutely required, consider storing it as an environment variable and writing to `/tmp` at runtime

## Project Structure for Vercel

```
dart-editor/
├── api/
│   └── server.js          # Serverless function (handles all routes)
├── public/                # Static files
│   ├── index.html
│   ├── app.js
│   └── style.css
├── monaco/               # Monaco editor assets
├── db/                   # Database configuration
│   ├── index.js
│   └── schema.js
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore during deployment
├── package.json
└── .env.vercel          # Environment variable template
```

## How Vercel Deployment Works

1. **Serverless Functions**: The `api/server.js` file is deployed as a serverless function
2. **Static Assets**: Files in `public/` and `monaco/` are served as static assets
3. **Routing**: `vercel.json` routes all API calls to the serverless function
4. **Database**: Connects to your external PostgreSQL database via `DB_URL`
5. **Temporary Files**: Uses `/tmp` directory for compilation artifacts (automatically cleaned)

## Vercel Configuration Details

The `vercel.json` file configures:

- **Routes**: Maps URLs to serverless functions and static assets
- **Functions**: Sets timeout to 60 seconds for compilation tasks
- **Rewrites**: Handles SPA routing and API endpoints
- **Environment**: Sets NODE_ENV to production

## Important Limitations

### Dart SDK Availability

**⚠️ Critical Note**: Vercel's serverless environment **does not include the Dart SDK** by default.

**Implications**:
- The `/compile` endpoint will not work on Vercel without additional setup
- Users can still use the editor UI, but compilation features will fail

**Solutions**:

1. **Use a different platform** for Dart compilation (Railway, Render, DigitalOcean)
2. **Add custom Dart SDK** to your deployment:
   - Download Dart SDK in build process
   - Include in deployment bundle
   - Set PATH in serverless function
   - This requires custom build configuration and increases bundle size

3. **Separate compilation service**:
   - Deploy editor UI on Vercel
   - Host compilation API on a different platform with Dart SDK
   - Update frontend to call external compilation API

### Recommended Alternative Platforms for Full Functionality

If you need Dart compilation to work, consider these platforms:

- **Railway**: Supports Docker, easy Dart SDK installation
- **Render**: Supports native runtimes, Dart SDK available
- **Fly.io**: Full VM control, Docker support
- **DigitalOcean App Platform**: Supports buildpacks
- **Heroku**: Supports buildpacks (paid tier)

## Database Setup

### Using Aiven (Current Setup)

1. Your current database is already configured in `.env`
2. Copy the `DB_URL` to Vercel environment variables
3. Remove the certificate path from the connection string:
   ```
   # Before
   postgres://user:pass@host/db?sslmode=require&sslrootcert=certs/ca.pem

   # After (for Vercel)
   postgres://user:pass@host/db?sslmode=require
   ```

### Running Database Migrations

Migrations should be run before deployment:

```bash
# Run locally or in a separate process
npm run db:push
```

For production migrations:
- Run migrations from your local machine connected to production DB
- Use Vercel CLI to run one-off commands
- Set up a separate migration service

## Testing Your Deployment

1. **Health Check**
   ```bash
   curl https://your-app.vercel.app/health
   ```

2. **Database Connection**
   - Visit your app
   - Try file operations (if UI supports it)
   - Check Vercel logs for database connection errors

3. **Compilation** (will fail without Dart SDK)
   ```bash
   curl -X POST https://your-app.vercel.app/compile \
     -H "Content-Type: application/json" \
     -d '{"code":"void main() { print(\"Hello\"); }", "target":"js"}'
   ```

## Monitoring and Logs

### View Logs in Vercel Dashboard

1. Go to your project in Vercel
2. Click on "Deployments"
3. Click on a deployment
4. View "Runtime Logs"

### View Logs via CLI

```bash
vercel logs
```

## Custom Domain Setup

1. Go to **Settings** > **Domains** in Vercel Dashboard
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Deployment Fails

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify `vercel.json` syntax

### Database Connection Issues

- Verify `DB_URL` is correctly set in environment variables
- Check if database allows connections from Vercel's IP ranges
- Ensure SSL mode is configured correctly
- Test connection string locally first

### 404 Errors

- Check `vercel.json` routing configuration
- Verify file paths in routes
- Check if static files are in correct directories

### Compilation Doesn't Work

- This is expected - Vercel doesn't include Dart SDK
- See "Dart SDK Availability" section above for solutions
- Consider alternative deployment platforms

### Function Timeout

- Default timeout is 60 seconds
- For paid plans, you can increase in `vercel.json`:
  ```json
  "functions": {
    "api/server.js": {
      "maxDuration": 300
    }
  }
  ```

## Performance Optimization

1. **Enable Caching**: Static assets are automatically cached by Vercel CDN
2. **Image Optimization**: Use Vercel Image Optimization for images
3. **Database Connection Pooling**: Use connection pooling for PostgreSQL
4. **Reduce Cold Starts**: Keep functions warm (paid feature)

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use SSL for database connections
3. **API Rate Limiting**: Consider adding rate limiting middleware
4. **Input Validation**: Already implemented in the code
5. **CORS**: Configure if needed for API access

## Rollback

If deployment has issues:

```bash
vercel rollback
```

Or via Dashboard:
1. Go to "Deployments"
2. Find a previous working deployment
3. Click "Promote to Production"

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

- **Push to main branch**: Deploys to production
- **Push to other branches**: Creates preview deployments
- **Pull Requests**: Creates preview deployments with unique URLs

## Cost Considerations

- **Free Tier**: 100GB bandwidth, 100GB-hours compute
- **Serverless Function Execution**: First 100GB-hours free
- **Database**: Hosted externally (Aiven pricing applies)

## Next Steps

1. Set up custom domain
2. Configure error monitoring (Sentry, LogRocket)
3. Set up analytics
4. Implement CI/CD testing
5. Add health check monitoring

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [GitHub Issues](https://github.com/your-repo/issues)

---

**Last Updated**: 2026-01-02
