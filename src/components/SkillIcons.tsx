'use client';

const S: React.CSSProperties = {
  width: '1em',
  height: '1em',
  display: 'inline-block',
  verticalAlign: '-0.1em',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function I({ children }: { children: React.ReactNode }) {
  return <svg viewBox="0 0 24 24" style={S} aria-hidden="true">{children}</svg>;
}

// ── LLMs & AI Assistants ──

function ClaudeApiChatbot() {
  return <I><path d="M21,15a2,2 0 0,1-2,2H7l-4,4V5a2,2 0 0,1 2-2h14a2,2 0 0,1 2,2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="12" y2="13"/></I>;
}
function OpenaiApiContent() {
  return <I><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></I>;
}
function PromptEngineeringAdvisor() {
  return <I><circle cx="12" cy="12" r="9"/><path d="M12,8 v0" strokeWidth="2.5"/><path d="M12,11 v5"/><circle cx="12" cy="19" r="0.5" fill="currentColor" stroke="none"/></I>;
}
function StreamingResponses() {
  return <I><polyline points="4,17 10,11 14,15 20,9"/><polyline points="14,9 20,9 20,15"/></I>;
}
function ClaudeInClaudeApp() {
  return <I><rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12,9 v-2"/><path d="M12,15 v2"/><path d="M9,12 h-2"/><path d="M15,12 h2"/></I>;
}
function MultiModelRouting() {
  return <I><circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><line x1="7" y1="11" x2="17" y2="7"/><line x1="7" y1="13" x2="17" y2="17"/></I>;
}

// ── Local AI ──

function OllamaLocal() {
  return <I><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M9,15 h6"/></I>;
}
function LlamaCppOptimization() {
  return <I><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></I>;
}
function LocalAiBackend() {
  return <I><rect x="3" y="8" width="18" height="10" rx="1"/><line x1="7" y1="12" x2="7" y2="14"/><line x1="11" y1="11" x2="11" y2="14"/><line x1="15" y1="10" x2="15" y2="14"/><line x1="3" y1="4" x2="21" y2="4"/></I>;
}

// ── Image & Video ──

function ReplicateImageGen() {
  return <I><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></I>;
}
function AiAvatars() {
  return <I><circle cx="12" cy="8" r="4"/><path d="M4,21 v-1 a6,6 0 0,1 16,0 v1"/></I>;
}
function VideoGeneration() {
  return <I><polygon points="5,3 19,12 5,21"/></I>;
}
function ComfyuiPipeline() {
  return <I><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></I>;
}

// ── Frontend & UI ──

function ReactNextjsPortfolio() {
  return <I><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="8" x2="22" y2="8"/><rect x="5" y="11" width="5" height="7" rx="0.5"/><line x1="13" y1="11" x2="19" y2="11"/><line x1="13" y1="14" x2="19" y2="14"/></I>;
}
function TailwindStyling() {
  return <I><path d="M12,4 c-4,0 -6,2 -6,4 c0,4 8,4 8,8 c0,2 -2,4 -6,4"/><line x1="6" y1="12" x2="18" y2="12"/></I>;
}
function ShadcnUiDashboard() {
  return <I><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></I>;
}
function V0DevAiUi() {
  return <I><path d="M4,4 l5,16"/><path d="M20,4 l-5,16"/><line x1="2" y1="12" x2="22" y2="12"/></I>;
}
function FramerMotionAnimations() {
  return <I><path d="M12,3 a9,9 0 1,0 0,18" strokeDasharray="3,3"/><path d="M12,3 a9,9 0 1,1 0,18"/><circle cx="12" cy="12" r="2"/></I>;
}
function InteractiveVisualizations() {
  return <I><polyline points="3,18 7,14 11,16 15,8 19,10 22,6"/><line x1="3" y1="21" x2="22" y2="21"/><line x1="3" y1="3" x2="3" y2="21"/></I>;
}

// ── Backend & Databases ──

function ApiRoutesFirst() {
  return <I><path d="M4,6 h16"/><path d="M4,12 h16"/><path d="M4,18 h16"/><circle cx="8" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="14" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="1.5" fill="currentColor" stroke="none"/></I>;
}
function SupabaseCrud() {
  return <I><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4,5 v14 c0,1.66 3.58,3 8,3 s8-1.34 8-3 V5"/><path d="M4,12 c0,1.66 3.58,3 8,3 s8-1.34 8-3"/></I>;
}
function RedisVercelKvCache() {
  return <I><rect x="3" y="3" width="18" height="8" rx="1"/><rect x="3" y="13" width="18" height="8" rx="1"/><circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="7" cy="17" r="1" fill="currentColor" stroke="none"/></I>;
}
function NeonServerlessPg() {
  return <I><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4,5 v14 c0,1.66 3.58,3 8,3 s8-1.34 8-3 V5"/><line x1="12" y1="8" x2="12" y2="19"/><line x1="8" y1="10" x2="8" y2="17"/><line x1="16" y1="10" x2="16" y2="17"/></I>;
}
function WebhooksEvents() {
  return <I><polyline points="4,12 8,8 12,12 16,8 20,12"/><line x1="4" y1="18" x2="20" y2="18"/></I>;
}

// ── Auth & Security ──

function NextauthGoogleLogin() {
  return <I><circle cx="12" cy="12" r="9"/><path d="M12,7 v5 l3,3"/></I>;
}
function MagicLinkAuth() {
  return <I><rect x="2" y="5" width="20" height="14" rx="2"/><polyline points="2,5 12,13 22,5"/></I>;
}
function ApiKeysRateLimits() {
  return <I><path d="M15,7 a3,3 0 1,0 0,6 h2 v-6 h-2"/><line x1="10" y1="10" x2="3" y2="10"/><line x1="6" y1="10" x2="6" y2="13"/><line x1="8" y1="10" x2="8" y2="13"/></I>;
}
function RowLevelSecurity() {
  return <I><path d="M12,2 L3,7 v5 c0,5.55 3.84,10.74 9,12 5.16-1.26 9-6.45 9-12 V7 Z"/><line x1="8" y1="12" x2="16" y2="12"/></I>;
}

// ── Deploy & Infrastructure ──

function VercelFirstDeploy() {
  return <I><polygon points="12,3 22,20 2,20"/></I>;
}
function NetlifyStatic() {
  return <I><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></I>;
}
function GithubActionsCicd() {
  return <I><circle cx="12" cy="12" r="3"/><path d="M12,3 v3"/><path d="M12,18 v3"/><path d="M3,12 h3"/><path d="M18,12 h3"/><path d="M5.6,5.6 l2.1,2.1"/><path d="M16.3,16.3 l2.1,2.1"/><path d="M5.6,18.4 l2.1-2.1"/><path d="M16.3,7.7 l2.1-2.1"/></I>;
}
function CloudflareDomainCdn() {
  return <I><path d="M18,10 a4,4 0 0,1 0,8 H6 A5,5 0 1,1 7.7,9.3 a7,7 0 0,1 13.3,1.7" fill="none"/></I>;
}

// ── Payments ──

function StripePayments() {
  return <I><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></I>;
}
function CoinbaseCrypto() {
  return <I><circle cx="12" cy="12" r="9"/><path d="M15,9.5 a3.5,3.5 0 1,0 0,5"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></I>;
}
function Subscriptions() {
  return <I><path d="M4,8 h16 v11 a1,1 0 0,1 -1,1 H5 a1,1 0 0,1 -1,-1 z"/><path d="M4,8 l4,-4 h8 l4,4"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></I>;
}
function PrepaidCredits() {
  return <I><circle cx="9" cy="9" r="7"/><circle cx="15" cy="15" r="7"/><path d="M12,6 v0" strokeWidth="2"/></I>;
}

// ── Integrations ──

function TelegramBot() {
  return <I><path d="M21,3 L1,11 l7,3 l2,7 l4-4 l5,3 z"/><line x1="8" y1="14" x2="14" y2="10"/></I>;
}
function EmailResend() {
  return <I><rect x="2" y="5" width="20" height="14" rx="2"/><polyline points="2,5 12,13 22,5"/></I>;
}
function GoogleSheetsApi() {
  return <I><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></I>;
}
function NotionApi() {
  return <I><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/></I>;
}

// ── AI Tools ──

function ClaudeCodeTool() {
  return <I><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></I>;
}
function CursorWindsurf() {
  return <I><path d="M5,3 l14,9 -6,2 -3,7 z"/></I>;
}
function ClaudeProjects() {
  return <I><path d="M4,20 h16 a1,1 0 0,0 1,-1 V7 l-5,-5 H5 a1,1 0 0,0 -1,1 v16 a1,1 0 0,0 1,1z"/><polyline points="16,2 16,7 21,7"/></I>;
}
function McpServers() {
  return <I><circle cx="12" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><line x1="12" y1="9" x2="6" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></I>;
}
function VibeCodingMethod() {
  return <I><path d="M8,3 l-4,18"/><path d="M16,3 l4,18"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="2" y1="15" x2="20" y2="15"/></I>;
}

const SKILL_ICONS: Record<string, React.ComponentType> = {
  'claude-api-chatbot': ClaudeApiChatbot,
  'openai-api-content': OpenaiApiContent,
  'prompt-engineering-advisor': PromptEngineeringAdvisor,
  'streaming-responses': StreamingResponses,
  'claude-in-claude-app': ClaudeInClaudeApp,
  'multi-model-routing': MultiModelRouting,
  'ollama-local': OllamaLocal,
  'llama-cpp-optimization': LlamaCppOptimization,
  'local-ai-backend': LocalAiBackend,
  'replicate-image-gen': ReplicateImageGen,
  'ai-avatars': AiAvatars,
  'video-generation': VideoGeneration,
  'comfyui-pipeline': ComfyuiPipeline,
  'react-nextjs-portfolio': ReactNextjsPortfolio,
  'tailwind-styling': TailwindStyling,
  'shadcn-ui-dashboard': ShadcnUiDashboard,
  'v0-dev-ai-ui': V0DevAiUi,
  'framer-motion-animations': FramerMotionAnimations,
  'interactive-visualizations': InteractiveVisualizations,
  'api-routes-first': ApiRoutesFirst,
  'supabase-crud': SupabaseCrud,
  'redis-vercel-kv-cache': RedisVercelKvCache,
  'neon-serverless-pg': NeonServerlessPg,
  'webhooks-events': WebhooksEvents,
  'nextauth-google-login': NextauthGoogleLogin,
  'magic-link-auth': MagicLinkAuth,
  'api-keys-rate-limits': ApiKeysRateLimits,
  'row-level-security': RowLevelSecurity,
  'vercel-first-deploy': VercelFirstDeploy,
  'netlify-static': NetlifyStatic,
  'github-actions-cicd': GithubActionsCicd,
  'cloudflare-domain-cdn': CloudflareDomainCdn,
  'stripe-payments': StripePayments,
  'coinbase-crypto': CoinbaseCrypto,
  'subscriptions': Subscriptions,
  'prepaid-credits': PrepaidCredits,
  'telegram-bot': TelegramBot,
  'email-resend': EmailResend,
  'google-sheets-api': GoogleSheetsApi,
  'notion-api': NotionApi,
  'claude-code-tool': ClaudeCodeTool,
  'cursor-windsurf': CursorWindsurf,
  'claude-projects': ClaudeProjects,
  'mcp-servers': McpServers,
  'vibe-coding-method': VibeCodingMethod,
};

export default function SkillIcon({ skillId }: { skillId: string }) {
  const IconComponent = SKILL_ICONS[skillId];
  if (!IconComponent) return null;
  return <IconComponent />;
}
