/**
 * Thor.dev Type Definitions
 * Comprehensive type system for the multi-agent workspace
 */

export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  githubToken?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'sm' | 'md' | 'lg';
  layout: 'dock' | 'tabs' | 'grid';
  notifications: boolean;
  autoSave: boolean;
  codeStyle: {
    tabSize: number;
    insertSpaces: boolean;
    wordWrap: boolean;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'generated' | 'deployed' | 'archived';
  type: 'nextjs' | 'react' | 'vue' | 'nuxt' | 'svelte';
  projectPath?: string;
  previewUrl?: string;
  deployUrl?: string;
  repoUrl?: string;
  prompt?: string;
  config?: ProjectConfig;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deployedAt?: Date;
  userId: string;
  versions: ProjectVersion[];
}

export interface ProjectConfig {
  framework: string;
  template: string;
  features: string[];
  styling: 'tailwind' | 'styled-components' | 'css-modules';
  database: 'sqlite' | 'postgresql' | 'mysql' | 'none';
  auth: 'nextauth' | 'clerk' | 'supabase' | 'none';
  deployment: 'vercel' | 'netlify' | 'railway' | 'none';
  plugins: string[];
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  description?: string;
  filesSnapshot: Record<string, string>;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  type: 'designer' | 'coder' | 'tester' | 'deployer';
  description?: string;
  config?: AgentConfig;
  isActive: boolean;
  status: 'idle' | 'thinking' | 'working' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  capabilities: string[];
  restrictions: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'agent' | 'system';
  agentId?: string;
  projectId?: string;
  timestamp: Date;
  metadata?: {
    suggestions?: Suggestion[];
    files?: string[];
    type?: 'code' | 'text' | 'suggestion' | 'error';
  };
}

export interface Suggestion {
  id: string;
  type: 'code' | 'file' | 'command' | 'deploy';
  title: string;
  description?: string;
  content: string;
  filePath?: string;
  command?: string;
  status: 'pending' | 'accepted' | 'rejected';
  agentId: string;
  projectId: string;
  createdAt: Date;
}

export interface FileTree {
  [path: string]: {
    type: 'file' | 'directory';
    content?: string;
    children?: FileTree;
    size?: number;
    modified?: Date;
  };
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  config: PluginConfig;
  isEnabled: boolean;
  manifest: PluginManifest;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
  dependencies?: Record<string, string>;
  permissions?: string[];
  hooks?: string[];
}

export interface PluginConfig {
  options: Record<string, any>;
  enabled: boolean;
  autoRun: boolean;
}

export interface Improvement {
  id: string;
  type: 'performance' | 'ui' | 'seo' | 'accessibility' | 'security';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  files: string[];
  status: 'pending' | 'applied' | 'ignored';
  projectId: string;
  createdAt: Date;
}

export interface DeploymentConfig {
  provider: 'vercel' | 'netlify' | 'railway';
  projectName: string;
  buildCommand?: string;
  outputDirectory?: string;
  environmentVariables?: Record<string, string>;
  customDomain?: string;
}

export interface WebSocketMessage {
  type: 'chat' | 'presence' | 'edit' | 'suggestion' | 'status';
  payload: any;
  userId?: string;
  projectId?: string;
  timestamp: Date;
}

export interface PresenceUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  cursor?: {
    file: string;
    line: number;
    column: number;
  };
  status: 'online' | 'away' | 'busy';
  lastSeen: Date;
}

export interface EditOperation {
  type: 'insert' | 'delete' | 'replace';
  file: string;
  range: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  content?: string;
  userId: string;
  timestamp: Date;
}

export interface GenerationRequest {
  prompt: string;
  projectName: string;
  config?: Partial<ProjectConfig>;
  userId: string;
}

export interface GenerationResponse {
  projectId: string;
  status: 'success' | 'error';
  message?: string;
  files?: FileTree;
  previewUrl?: string;
  error?: string;
}

export interface AnalysisResult {
  score: number;
  improvements: Improvement[];
  metrics: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  files: {
    [path: string]: {
      issues: Issue[];
      suggestions: string[];
    };
  };
}

export interface Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  rule?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DockPanel {
  id: string;
  title: string;
  type: 'agent' | 'editor' | 'preview' | 'files' | 'terminal' | 'deploy';
  isMinimized: boolean;
  isFloating: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zIndex: number;
  data?: any;
}

export interface WorkspaceLayout {
  panels: DockPanel[];
  activePanel?: string;
  sidebarWidth: number;
  bottomPanelHeight: number;
}