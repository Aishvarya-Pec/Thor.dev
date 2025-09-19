# Thor.dev Documentation

## Architecture Overview

Thor.dev is a comprehensive multi-agent workspace built with modern web technologies. The system consists of several interconnected components working together to provide a seamless development experience.

### System Components

#### 1. Dashboard Application (`apps/dashboard`)
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom Thor.dev theme
- **UI Components:** Radix UI with shadcn/ui
- **Authentication:** NextAuth.js (Email + Google OAuth)
- **Database:** Prisma with SQLite (production-ready for PostgreSQL/MySQL)

#### 2. Landing Page (`apps/landing`)
- **Framework:** Vite + React
- **Language:** TypeScript
- **Styling:** Tailwind CSS with 3D animations
- **Features:** GSAP animations, responsive design

#### 3. WebSocket Server (`packages/ws-server`)
- **Runtime:** Node.js with TypeScript
- **Library:** ws (WebSocket)
- **Features:** Real-time collaboration, presence tracking, operational transformation

#### 4. Plugin System (`packages/plugins`)
- **Architecture:** Modular plugin system
- **Configuration:** JSON-based manifests
- **Example:** Demo plugin for project enhancement

## Core Features

### Multi-Agent Workspace

The system includes four specialized AI agents:

1. **Designer AI** - UI/UX design and visual components
2. **Coder AI** - Code generation and backend logic
3. **Tester AI** - Quality assurance and testing
4. **Deployer AI** - Deployment and infrastructure

Each agent has:
- Individual chat panels
- Specialized capabilities and restrictions
- Shared project context
- Suggestion system with user approval workflow

### Real-Time Collaboration

WebSocket-powered features:
- **Presence Tracking:** See who's online and their cursor positions
- **Live Editing:** Collaborative code editing with conflict resolution
- **Chat System:** Cross-agent and user communication
- **Suggestions:** Real-time AI suggestions with accept/reject workflow

### Project Generation Pipeline

1. **Input Processing:** Plain-English project descriptions
2. **Template Selection:** Framework and feature selection
3. **File Generation:** AI-powered code generation
4. **Preview Creation:** Instant preview in iframe sandbox
5. **Version Control:** Project versioning and history

### Deployment System

#### GitHub Integration
- Automatic repository creation
- File synchronization
- Commit history management
- Branch protection rules

#### Platform Support
- **Vercel:** Next.js optimized deployment
- **Netlify:** Static site deployment
- **Railway:** Full-stack application hosting

## Landing Page Integration

### Theme Consistency

The dashboard maintains visual consistency with the 3D landing page through:

#### Color Palette
```css
/* Thor.dev Theme Colors */
--thor-primary: #5724ff;    /* Violet accent */
--thor-secondary: #4fb7dd;  /* Blue accent */
--thor-accent: #edff66;     /* Yellow accent */
--thor-background: #dfdff0; /* Light background */
--thor-cosmic-dark: #0f172a; /* Dark cosmic */
--thor-lightning: #f59e0b;  /* Lightning effects */
```

#### Typography
- **Heading Font:** Zentry (custom)
- **Body Font:** General Sans
- **Special Font:** Circular Web
- **Code Font:** Robert (mono variants)

#### Animation System
- **Float Effects:** Subtle hover animations
- **Glow Effects:** Lightning-style glows
- **Dock Animations:** macOS-style dock interactions
- **Loading Spinners:** Custom 3D spinner from landing page

### Integration Process

1. **Font Loading:** Preload custom fonts in document head
2. **CSS Variables:** Shared color tokens between applications
3. **Component Library:** Reusable animated components
4. **Theme Provider:** Consistent theming across applications

## Database Schema

### Core Models

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  githubToken   String?   // Encrypted
  preferences   String?   // JSON
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  projects      Project[]
  accounts      Account[]
  sessions      Session[]
}
```

#### Project
```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      String   @default("draft")
  type        String   @default("nextjs")
  projectPath String?
  previewUrl  String?
  deployUrl   String?
  repoUrl     String?
  prompt      String?
  config      String?  // JSON
  isPublic    Boolean  @default(false)
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  versions    ProjectVersion[]
}
```

### Data Flow

1. **User Authentication:** NextAuth handles OAuth and magic links
2. **Project Creation:** Metadata stored in Prisma, files in JSON
3. **Version Control:** Project snapshots in `data/projects/<id>/versions/`
4. **File Storage:** Generated projects in `tmp/generated-<id>/`

## API Reference

### Authentication Endpoints

#### `POST /api/auth/signin`
Initiate sign-in process

#### `POST /api/auth/signout`
Sign out current user

### Project Management

#### `GET /api/projects`
List user's projects
```typescript
Response: Project[]
```

#### `POST /api/projects`
Create new project
```typescript
Request: {
  name: string
  description?: string
  type?: string
}
Response: Project
```

#### `GET /api/projects/[id]`
Get project details
```typescript
Response: Project & { versions: ProjectVersion[] }
```

#### `PUT /api/projects/[id]`
Update project
```typescript
Request: Partial<Project>
Response: { success: boolean }
```

### Generation Pipeline

#### `POST /api/generate`
Generate new application
```typescript
Request: {
  prompt: string
  projectName: string
  config?: ProjectConfig
}
Response: {
  projectId: string
  status: 'success' | 'error'
  previewUrl?: string
  files?: FileTree
  error?: string
}
```

### Deployment

#### `POST /api/deploy`
Deploy project to platform
```typescript
Request: {
  projectId: string
  provider: 'vercel' | 'netlify'
  config?: DeploymentConfig
}
Response: {
  success: boolean
  repoUrl?: string
  deployUrl?: string
  error?: string
}
```

### Plugin System

#### `GET /api/plugins`
List available plugins
```typescript
Response: Plugin[]
```

#### `POST /api/plugins`
Execute plugin on project
```typescript
Request: {
  pluginId: string
  projectId: string
  options?: Record<string, any>
}
Response: {
  success: boolean
  result?: any
  error?: string
}
```

## WebSocket Protocol

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8080')
```

### Message Format
```typescript
interface WebSocketMessage {
  type: 'chat' | 'presence' | 'edit' | 'suggestion' | 'status'
  payload: any
  userId?: string
  projectId?: string
  timestamp: Date
}
```

### Message Types

#### Presence
```typescript
// Join project
{
  type: 'presence',
  payload: {
    type: 'join_project',
    projectId: string
  }
}

// Update cursor position
{
  type: 'presence',
  payload: {
    type: 'user_updated',
    user: {
      cursor: { file: string, line: number, column: number }
    }
  }
}
```

#### Chat
```typescript
{
  type: 'chat',
  payload: {
    id: string,
    content: string,
    role: 'user' | 'agent',
    agentId?: string
  }
}
```

#### Edit Operations
```typescript
{
  type: 'edit',
  payload: {
    type: 'insert' | 'delete' | 'replace',
    file: string,
    range: {
      start: { line: number, column: number },
      end: { line: number, column: number }
    },
    content?: string
  }
}
```

## Plugin Development

### Plugin Structure
```
packages/plugins/my-plugin/
├── plugin.json    # Manifest
└── index.js       # Entry point
```

### Plugin Manifest
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Author Name",
  "entry": "index.js",
  "dependencies": {},
  "permissions": ["file:write", "file:read"],
  "hooks": ["post-generation", "pre-deploy"],
  "config": {
    "option1": {
      "type": "boolean",
      "default": true,
      "description": "Option description"
    }
  }
}
```

### Plugin Implementation
```javascript
async function apply(projectPath, meta, options) {
  // Plugin logic here
  
  return {
    success: true,
    results: {
      filesCreated: ['README.md'],
      filesModified: ['package.json'],
      errors: []
    }
  }
}

module.exports = { apply }
```

### Available Hooks
- `post-generation`: After project generation
- `pre-deploy`: Before deployment
- `post-deploy`: After successful deployment

## Security Considerations

### Production Hardening

1. **Authentication Tokens**
   - Encrypt GitHub tokens in database
   - Use environment variables for API keys
   - Implement token rotation

2. **Rate Limiting**
   - API endpoint rate limits
   - WebSocket connection limits
   - Generation request throttling

3. **Input Validation**
   - Sanitize all user inputs
   - Validate file paths
   - Check project permissions

4. **WebSocket Security**
   - Origin validation
   - User authentication
   - Message size limits

### Scaling Considerations

1. **WebSocket Server**
   - Redis for session storage
   - Horizontal scaling with load balancer
   - Connection pooling

2. **File Storage**
   - S3 for generated projects
   - CDN for static assets
   - Database connection pooling

3. **LLM Integration**
   - Request queuing
   - Response caching
   - Model load balancing

## Development Workflow

### Local Development
```bash
# Start all services
npm run dev

# Individual services
npm run dev:dashboard  # Dashboard only
npm run dev:landing    # Landing page only
npm run ws:dev         # WebSocket server only
```

### Testing
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Database Management
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:migrate    # Create migration
npm run db:studio     # Open Prisma Studio
```

### Building for Production
```bash
npm run build         # Build all applications
npm run build:dashboard
npm run build:landing
```

## Troubleshooting

### Common Issues

#### WebSocket Connection Failed
- Check if WebSocket server is running on port 8080
- Verify firewall settings
- Check WS_HOST and WS_PORT environment variables

#### Database Connection Error
- Run `npm run db:generate` and `npm run db:push`
- Check DATABASE_URL in .env file
- Verify file permissions for SQLite

#### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check OAuth provider credentials
- Ensure NEXTAUTH_URL matches your domain

#### Build Failures
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all environment variables are set

### Performance Optimization

1. **Database Queries**
   - Use Prisma query optimization
   - Implement connection pooling
   - Add database indexes

2. **WebSocket Performance**
   - Implement message batching
   - Use compression for large messages
   - Add connection limits

3. **Frontend Optimization**
   - Code splitting
   - Image optimization
   - Bundle analysis

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write tests for new features

### Git Workflow
1. Create feature branch from `develop`
2. Make changes with descriptive commits
3. Run tests and linting
4. Create pull request
5. Code review and merge

### Release Process
1. Update version numbers
2. Update CHANGELOG.md
3. Create release branch
4. Deploy to staging
5. Run integration tests
6. Deploy to production
7. Create GitHub release

---

For more detailed information, see the individual component documentation in their respective directories.