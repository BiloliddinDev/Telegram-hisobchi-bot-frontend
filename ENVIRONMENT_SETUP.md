# Environment Setup Guide

This project supports multiple environment profiles for development and production deployments.

## Environment Files

The project uses the following environment configuration files:

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings  
- `.env.local.example` - Template for local overrides
- `.env.local` - Local environment overrides (gitignored)

## Quick Start

### Development
```bash
# Start development server with development environment
npm run dev:local

# Or use regular dev command (uses Next.js default environment loading)
npm run dev
```

### Production Build
```bash
# Build for production environment
npm run build:prod

# Build for development environment  
npm run build:dev

# Start production server
npm run start:prod
```

## Environment Variables

### NEXT_PUBLIC_API_URL
The base URL for your backend API.

**Development:** `http://localhost:5000`
**Production:** `https://your-production-domain.com` or `/api` for same-domain deployment

### NODE_ENV
Automatically set by Next.js based on the command used.

### NEXT_PUBLIC_DEBUG
Enable/disable debug logging in the browser console.

**Development:** `true`
**Production:** `false`

## Configuration Examples

### Development Environment (.env.development)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### Production Environment (.env.production)
```env
NEXT_PUBLIC_API_URL=https://your-production-domain.com
NODE_ENV=production
NEXT_PUBLIC_DEBUG=false
```

### Same-Domain Production Deployment
If your frontend and backend are deployed on the same domain (e.g., Vercel):
```env
NEXT_PUBLIC_API_URL=/api
NODE_ENV=production
NEXT_PUBLIC_DEBUG=false
```

## Local Development Override

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your specific settings:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_DEBUG=true
   ```

The `.env.local` file takes precedence over other environment files and is gitignored for security.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (default Next.js behavior) |
| `npm run dev:local` | Start development server with explicit dev environment |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development environment |
| `npm run build:prod` | Build with production environment |
| `npm run start` | Start production server |
| `npm run start:dev` | Start server in development mode |
| `npm run start:prod` | Start server in production mode |
| `npm run deploy:dev` | Build and start development deployment |
| `npm run deploy:prod` | Build and start production deployment |

## API URL Resolution

The application uses intelligent API URL resolution:

1. **Environment Variable**: Uses `NEXT_PUBLIC_API_URL` if set
2. **Relative Path**: If URL starts with `/`, treats as relative (same domain)
3. **Full URL**: If URL contains protocol, appends `/api` if needed
4. **Fallback**: 
   - Production: `/api` (relative path)
   - Development: `http://localhost:5000/api`

## Debug Mode

When `NEXT_PUBLIC_DEBUG=true` or `NODE_ENV=development`:

- API requests are logged to console
- Enhanced error messages with debugging hints
- Network error details are displayed

## Deployment Notes

### Vercel Deployment
For Vercel deployments where frontend and backend share the same domain:

```env
NEXT_PUBLIC_API_URL=/api
```

### Separate Domain Deployment  
For deployments where backend is on a different domain:

```env
NEXT_PUBLIC_API_URL=https://api.your-backend-domain.com
```

### Docker Deployment
For containerized deployments, set environment variables in your docker-compose or Kubernetes configuration:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=https://your-api-domain.com
  - NODE_ENV=production
  - NEXT_PUBLIC_DEBUG=false
```

## Security Considerations

- Never commit `.env.local` to version control
- Use relative paths (`/api`) for same-domain deployments when possible
- Disable debug mode in production
- Ensure CORS is properly configured on your backend for cross-domain requests

## Troubleshooting

### API Connection Issues
1. Check if backend server is running
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check browser console for detailed error messages (debug mode)
4. Ensure CORS is configured if using cross-domain requests

### Environment Not Loading
1. Restart the development server after changing environment files
2. Check file names are exactly `.env.development` or `.env.production`
3. Verify environment variables start with `NEXT_PUBLIC_` for client-side access

### Build Issues
1. Ensure all required environment variables are set
2. Check that production URLs are accessible during build
3. Verify Next.js configuration is valid