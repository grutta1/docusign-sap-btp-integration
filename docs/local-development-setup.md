# Local Development Setup (No Docker Required)

This guide will help you set up the DocuSign-SAP BTP integration project for local development without requiring Docker or admin access.

## Prerequisites

### Required Software
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **Code Editor** - VS Code, WebStorm, or your preferred editor

### Optional (but recommended)
- **Postman** - For API testing
- **PostgreSQL** - Can use cloud services like ElephantSQL (free tier)
- **Redis** - Can use cloud services like RedisLabs (free tier)

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/grutta1/docusign-sap-btp-integration.git
cd docusign-sap-btp-integration

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local
```

### 2. Configure Environment

Edit `.env.local` with your settings:

```bash
# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# DocuSign Configuration (Development)
DOCUSIGN_INTEGRATION_KEY=your-integration-key
DOCUSIGN_USER_ID=your-user-id
DOCUSIGN_ACCOUNT_ID=your-account-id
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_PRIVATE_KEY_PATH=./config/security/keys/private.pem

# Database Configuration (Local SQLite for development)
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/local.db
DATABASE_ENABLED=true

# Cache Configuration (Memory cache for local development)
CACHE_TYPE=memory
REDIS_ENABLED=false

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=simple
LOG_FILE_ENABLED=false

# Security Configuration (Relaxed for local development)
JWT_SECRET=your-local-jwt-secret
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_ENABLED=false
HELMET_ENABLED=false

# Feature Flags
ENABLE_WEBHOOKS=false
ENABLE_MONITORING=false
MOCK_EXTERNAL_SERVICES=true
```

### 3. Setup Local Database

#### Option A: SQLite (Simplest - No setup required)
```bash
# SQLite database will be created automatically
# No additional setup needed
```

#### Option B: Cloud PostgreSQL (Recommended for testing)
1. Go to [ElephantSQL](https://www.elephantsql.com/) (free tier available)
2. Create a free account and database
3. Update your `.env.local`:
```bash
DATABASE_TYPE=postgresql
DATABASE_URL=your-elephantsql-connection-string
```

#### Option C: Local PostgreSQL (If you have it installed)
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/docusign_integration
```

### 4. Setup DocuSign Developer Account

1. Go to [DocuSign Developer Center](https://developers.docusign.com/)
2. Create a free developer account
3. Create a new application
4. Generate RSA key pair:
   ```bash
   # Create keys directory
   mkdir -p config/security/keys
   
   # Generate private key
   openssl genrsa -out config/security/keys/private.pem 2048
   
   # Generate public key
   openssl rsa -in config/security/keys/private.pem -pubout -out config/security/keys/public.pem
   ```
5. Upload the public key to your DocuSign application
6. Update `.env.local` with your integration key and user ID

## Development Commands

### Start Development Server
```bash
# Start with hot reload
npm run dev

# Or start normally
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run security audit
npm run test:security
```

### Database Operations
```bash
# Initialize database (if using PostgreSQL)
npm run db:init

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

## Local Project Structure

```
docusign-sap-btp-integration/
├── data/                    # Local database files (SQLite)
├── logs/                    # Local log files
├── config/
│   ├── local/              # Local configuration overrides
│   └── security/
│       └── keys/           # Your RSA key pair
├── src/
│   ├── server.js           # Local development server
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   └── utils/              # Utilities
├── tests/
├── .env.local             # Your local environment variables
└── package.json
```

## Local Development Features

### Mock Services
When `MOCK_EXTERNAL_SERVICES=true`, the application will:
- Mock DocuSign API responses
- Mock SAP BTP responses
- Use in-memory cache instead of Redis
- Simulate webhook events

### Hot Reload
```bash
npm run dev
```
This starts the server with `nodemon` for automatic restarts on file changes.

### Local API Testing
```bash
# Health check
curl http://localhost:3000/health

# API endpoints
curl http://localhost:3000/api/docusign/templates
curl http://localhost:3000/api/integration/status
```

### Debug Mode
```bash
# Start with debug logging
DEBUG=app:* npm run dev

# Or set in .env.local
DEBUG=app:*
LOG_LEVEL=debug
```

## Cloud Alternatives (No Local Installation)

### Database Options
1. **ElephantSQL** - Free PostgreSQL hosting
2. **PlanetScale** - Serverless MySQL platform
3. **Supabase** - PostgreSQL with additional features
4. **SQLite** - File-based database (included in Node.js)

### Cache Options
1. **RedisLabs** - Free Redis hosting
2. **Upstash** - Serverless Redis
3. **Memory Cache** - Built-in Node.js cache (for development)

### File Storage Options
1. **Cloudinary** - Image and document management
2. **AWS S3** - Object storage (free tier)
3. **Local File System** - For development

## Testing Without External Services

### Unit Tests
```bash
# All external services are mocked by default
npm run test:unit
```

### Integration Tests with Mocks
```bash
# Uses mock services to simulate DocuSign and SAP BTP
npm run test:integration:mock
```

### Manual Testing
Use the included Postman collection:
```bash
# Import the collection
./tests/postman/DocuSign-SAP-BTP-Local.postman_collection.json
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ...

# Test your changes
npm test

# Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 2. Local Testing Workflow
```bash
# Start development server
npm run dev

# In another terminal, run tests
npm run test:watch

# Test specific endpoints
curl -X POST http://localhost:3000/api/docusign/envelopes \
  -H "Content-Type: application/json" \
  -d '{"templateId": "test-template", "recipients": []}'
```

### 3. Code Quality
```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### Permission Errors
```bash
# If you get permission errors with npm
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

#### SSL/HTTPS Issues
```bash
# Disable HTTPS for local development
ENABLE_HTTPS=false
```

### Getting Help

1. **Check logs**: `tail -f logs/app.log`
2. **Debug mode**: `DEBUG=app:* npm run dev`
3. **Health check**: `curl http://localhost:3000/health`
4. **Test database**: `npm run db:test`

## VS Code Setup

### Recommended Extensions
- ESLint
- Prettier
- GitLens
- REST Client
- Thunder Client (for API testing)

### VS Code Settings (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "node_modules": true,
    "dist": true,
    "coverage": true
  }
}
```

### Debug Configuration (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Local Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.js",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "app:*"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeArgs": ["--nolazy"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## Production Deployment

When you're ready to deploy, you can use:
- **Heroku** - Easy deployment with Git
- **Vercel** - Serverless deployment
- **Railway** - Simple cloud deployment
- **DigitalOcean App Platform** - Container deployment without Docker

All of these support deploying directly from your Git repository without requiring local Docker.

---

**Happy coding! 🚀**

For questions or issues, please check the main documentation or create an issue in the repository.
