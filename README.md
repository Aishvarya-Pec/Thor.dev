# Thor.dev - Multi-Agent Workspace

<div align="center">
  <img src="./public/img/thorlogo.png" alt="Thor.dev Logo" width="120" height="120" />
  
  **Build Epic Projects with Designer AI, Coder AI, Tester AI, and Deployer AI**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

## ⚡ Overview

Thor.dev is a revolutionary multi-agent workspace that combines the power of AI agents to create, test, and deploy full-stack applications. With four specialized AI agents working together, you can go from idea to deployed application in minutes.

### 🤖 Meet Your AI Team

- **🎨 Designer AI** - Creates beautiful, modern UI designs with best UX practices
- **💻 Coder AI** - Writes clean, efficient code with modern best practices  
- **🧪 Tester AI** - Ensures code quality through comprehensive testing and analysis
- **🚀 Deployer AI** - Handles deployment, CI/CD, and infrastructure management

## ✨ Features

### 🏗️ Multi-Agent Workspace
- Four specialized AI agents with distinct capabilities
- Real-time collaboration between agents and users
- Shared project context and chat history
- Agent suggestions with accept/reject workflow

### 🔧 App Generation Pipeline
- Plain-English to full-stack Next.js app generation
- TypeScript, Tailwind CSS, Prisma, and NextAuth integration
- Customizable project templates and configurations
- Real-time preview with iframe sandbox

### 🚀 One-Click Deploy
- GitHub repository creation and management
- Vercel and Netlify deployment integration
- Automated CI/CD with GitHub Actions
- Environment variable management

### 🔄 Continuous Improvement
- Static analysis with Lighthouse-style suggestions
- Performance, UI, SEO, and accessibility improvements
- One-click improvement application
- Version control and rollback capabilities

### 👥 Real-Time Collaboration
- WebSocket-powered multiplayer editing
- Live presence indicators and cursors
- Operational transformation for conflict resolution
- Cross-agent and user communication

### 🔌 Plugin System
- Extensible plugin architecture
- Demo plugin for README, LICENSE, and metadata generation
- JSON-based plugin configuration
- Custom plugin development support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/your-username/thor-dev.git
   cd thor-dev
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables (optional):**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   **Note:** Thor.dev works out of the box without any API keys! The `.env.local` file is optional and only needed if you want to use real integrations instead of the built-in mock services.

4. **Set up the database:**
   \`\`\`bash
   npm run db:generate
   npm run db:push
   \`\`\`

5. **Start the development servers:**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser:**
   - Dashboard: [http://localhost:3000](http://localhost:3000)
   - Landing Page: [http://localhost:5173](http://localhost:5173)
   - WebSocket Server: ws://localhost:8080

7. **Sign in with Guest Mode:**
   Click "Try Thor.dev Now (Guest Mode)" to start using the platform immediately - no registration required!

## 📁 Project Structure

\`\`\`
thor-dev/
├── apps/
│   ├── dashboard/          # Main Next.js dashboard application
│   │   ├── src/
│   │   │   ├── app/        # App Router pages and API routes
│   │   │   ├── components/ # React components
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   ├── lib/        # Utility libraries
│   │   │   └── types/      # TypeScript type definitions
│   │   └── public/         # Static assets
│   └── landing/            # 3D animated landing page
│       ├── src/
│       └── public/
├── packages/
│   ├── ws-server/          # WebSocket server for real-time collaboration
│   └── plugins/            # Plugin system
│       └── demo-plugin/    # Example plugin
├── prisma/                 # Database schema and migrations
├── data/                   # JSON-based project storage
│   ├── projects/           # Project metadata
│   └── users/              # User data
├── tmp/                    # Generated projects storage
└── docs/                   # Documentation
\`\`\`

## 🔧 Environment Variables (Optional)

**Thor.dev works completely without any API keys!** All services have built-in mock implementations that provide full functionality for development and testing.

If you want to use real integrations, create a \`.env.local\` file:

\`\`\`bash
# Database (SQLite - no setup required)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="thor-dev-local-secret-key-for-development-only"

# Optional: Real OAuth Providers (uses guest mode if empty)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Real GitHub Integration (uses local storage if empty)
GITHUB_TOKEN="your-github-personal-access-token"

# Optional: Real Deployment Services (generates static files if empty)
VERCEL_TOKEN="your-vercel-token"
NETLIFY_TOKEN="your-netlify-token"

# Optional: Real Email Service (logs to console if empty)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@thor.dev"

# Optional: Real LLM Integration (uses templates if empty)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
\`\`\`

### 🆓 Built-in Mock Services

When API keys are not provided, Thor.dev automatically uses:

- **Mock LLM Service:** Template-based intelligent code generation
- **Mock GitHub Service:** Local file storage with version control
- **Mock Deployment Service:** Static file generation with preview
- **Mock Email Service:** Console logging for magic links
- **Guest Authentication:** Immediate access without registration

## 🏗️ Architecture

### Dashboard Application
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS with custom Thor.dev theme
- **UI Components:** Radix UI with shadcn/ui
- **State Management:** React Context + Reducers
- **Real-time:** WebSocket integration
- **Authentication:** NextAuth.js with email + Google OAuth

### WebSocket Server
- **Runtime:** Node.js with TypeScript
- **WebSocket Library:** ws
- **Features:** Presence tracking, operational transformation, chat
- **Scalability:** Ready for Redis clustering

### Database & Storage
- **Database:** Prisma with SQLite (configurable)
- **File Storage:** Local JSON files (S3-ready)
- **Caching:** In-memory with Redis support

## 🚀 Deployment

### Development
\`\`\`bash
npm run dev          # Start all services
npm run dev:dashboard # Dashboard only
npm run ws:dev       # WebSocket server only
\`\`\`

### Production

1. **Build the application:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production servers:**
   \`\`\`bash
   npm start
   \`\`\`

### Docker Deployment
\`\`\`bash
# Build and run with Docker Compose
docker-compose up -d
\`\`\`

### Vercel Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/thor-dev)

## 🔌 Plugin Development

Create custom plugins to extend Thor.dev functionality:

### Plugin Structure
\`\`\`
packages/plugins/my-plugin/
├── plugin.json     # Plugin manifest
└── index.js        # Plugin entry point
\`\`\`

### Example Plugin
\`\`\`javascript
// packages/plugins/my-plugin/index.js
async function apply(projectPath, meta, options) {
  // Plugin logic here
  return { success: true, result: 'Plugin executed successfully' }
}

module.exports = { apply }
\`\`\`

### Plugin Manifest
\`\`\`json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "author": "Your Name",
  "entry": "index.js",
  "permissions": ["file:write", "file:read"],
  "hooks": ["post-generation"]
}
\`\`\`

## 🧪 Testing

\`\`\`bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
\`\`\`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Make your changes and add tests
4. Run the test suite: \`npm test\`
5. Commit your changes: \`git commit -m 'Add amazing feature'\`
6. Push to the branch: \`git push origin feature/amazing-feature\`
7. Open a Pull Request

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Plugin Development Guide](./docs/Plugins.md)
- [Deployment Guide](./docs/Deployment.md)
- [Architecture Overview](./docs/Architecture.md)

## 🐛 Troubleshooting

### Common Issues

**WebSocket connection failed:**
- Ensure the WebSocket server is running on port 8080
- Check firewall settings
- Verify WS_HOST and WS_PORT environment variables

**Database connection error:**
- Run \`npm run db:generate\` and \`npm run db:push\`
- Check DATABASE_URL in your .env file
- Ensure SQLite file permissions

**Authentication not working:**
- Verify NEXTAUTH_SECRET is set
- Check OAuth provider credentials
- Ensure NEXTAUTH_URL matches your domain

## 🔒 Security

- All user inputs are sanitized and validated
- OAuth tokens are encrypted in the database
- Rate limiting on API endpoints
- CORS properly configured
- Environment variables for sensitive data

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Prisma](https://prisma.io/) for type-safe database access
- [Radix UI](https://radix-ui.com/) for accessible UI primitives
- [Vercel](https://vercel.com/) for seamless deployment

## 🌟 Support

- ⭐ Star this repository if you find it helpful
- 🐛 [Report bugs](https://github.com/your-username/thor-dev/issues)
- 💡 [Request features](https://github.com/your-username/thor-dev/issues)
- 💬 [Join our Discord](https://discord.gg/thor-dev)

---

<div align="center">
  <strong>Built with ❤️ by the Thor.dev Team</strong>
  
  [Website](https://thor.dev) • [Documentation](./docs) • [Discord](https://discord.gg/thor-dev) • [Twitter](https://twitter.com/thordev)
</div>