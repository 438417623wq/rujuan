# AIRP - AI Interactive Roleplay Novel

## Product Vision

AIRP is an AI-driven interactive roleplay novel platform. The core differentiator from other AIRP products is the **"define world + customize status bar + play" one-stop experience**: users collaborate with AI to design world-building, character sheets, and a real-time status dashboard before the story begins, then play through an immersive RP session with live state tracking.

## Architecture Overview

**Pure static frontend + lightweight Python backend. No build step, no bundler, no framework.**

```
airp/
  index.html        # Home page - conversation list, create/delete stories
  chat.html          # Chat page - main gameplay UI (streaming, MVU sidebar, edit mode)
  settings.html      # Settings page - API profiles, prompt config, import/export
  common.js          # Shared modules (Storage, API, MVU, PromptBuilder, Summary, Utils, UI)
  server.py          # Python HTTP server - static files + JSON persistence API (port 8080)
  assets/bg.jpg      # Background image
  data/              # Runtime data (gitignored)
    settings.json
    profiles.json
    conversations/   # One JSON file per conversation
  docs/              # Reference docs
```

## Core Modules (common.js)

| Module | Responsibility |
|--------|---------------|
| **Storage** | localStorage + server sync (dual-write). Keys: `airp_settings`, `airp_apiProfiles`, `airp_conversations` |
| **API** | OpenAI-compatible / Claude / Google AI Studio. Supports streaming (SSE). Auto-detects provider from URL. **Confirmed: supports concurrent requests** |
| **PromptBuilder** | Builds system prompt + message array for each API call. Phase-aware (init vs rp). Handles context windowing (last 2 AI turns full, older turns → abstracts only) |
| **MVU** | Model-View-Update pattern for status bar. Parses `mvu_init`, `mvu_update`, `mvu` (patch), `story_setting`, `branches` from AI output |
| **Summary** | Parses `<details>` abstracts (ab) from AI output. Two-layer compression: ab accumulates → merge into sm entries via independent API call (default interval: 100) |
| **Utils** | ID generation, HTML escaping, time formatting, markdown rendering, `<story>` tag extraction |
| **UI** | Toast notifications, confirm dialogs |
| **Exporter** | Export conversation to Markdown |

## Game Flow

### Phase 1: Init (Worldbuilding)
1. User describes desired story (genre, characters, world)
2. AI discusses and refines the concept over multiple turns
3. When user confirms, AI outputs:
   - `text:story_setting` - permanent world/character lore (500+ words)
   - `json:mvu_init` - status bar schema + HTML + CSS
4. User previews in sidebar, clicks "Confirm" to enter RP

### Phase 2: RP (Gameplay)
- AI outputs wrapped in `<story></story>` tags (only this is shown to player during streaming)
- Behind the scenes, AI also outputs:
  - `<branches>` - 4 action choices (parsed and shown as clickable buttons)
  - `<details>` - per-turn abstract (stored, not shown in chat)
  - `json:mvu` - state patches (applied to status bar in real-time)
- Context management: story_setting (permanent) + merged summaries (sm) + unmerged abstracts (ab) + last 2 full turns + current MVU state

### Edit Mode (Status Bar Editing during RP)
- Independent API call mode - overlays main chat with temporary conversation
- System prompt: persona + edit instructions + current MVU data (schema/state/html/css) + storySetting
- AI can output `json:mvu_update` and/or `text:story_setting` to modify structure
- Live preview in sidebar; Apply saves, Discard rolls back from backup
- MVU data in system prompt is rebuilt each round with latest state

## AI Output Format (RP Phase)

```
<story>
Narrative text shown to the player...
</story>

<branches>
1.(type): action description
2.(type): action description
3.(type): action description
4.(type): action description
</branches>

<details><summary>Abstract</summary>
Per-turn summary for context management...
</details>

```json:mvu
{"analysis": "what changed and why", "patches": [...]}
```
```

Output order: story → branches → details → mvu patch

## Prompt System

Prompts are built from **prompt entries** (array in settings). Default entries:
1. `persona` - AI character persona (`{{persona}}` template)
2. `abstract_req` - per-turn abstract format
3. `writing_style` - word count, `<story>` tag requirement, output order
4. `options_req` - 4 branching choices format
5. `mvu_req` - state patch format and instructions

**Important**: If user has saved custom `promptEntries` in settings, code changes to `DEFAULT_PROMPT_ENTRIES` won't take effect. User must "reset to defaults" to pick up changes.

**Important**: Do NOT modify prompts without notifying the user first. Prompt content is primarily the user's responsibility.

## MVU (Status Bar) System

- **Schema**: field definitions with type (bar/number/text/list/tag), label, max, value, color
- **State**: current values for all fields
- **HTML/CSS**: custom template rendered in 360px sidebar, uses `data-field`, `data-field-bar`, `data-field-list` attributes for binding
- **Patches**: JSON Patch-like operations (replace, delta, add, remove)
- **Init phase**: `mvu_init` creates full structure; `mvu_update` for incremental changes
- **RP phase**: only `mvu` patches (value updates); structural changes require Edit Mode

## Key Design Decisions

- **No emoji in UI** - user preference, only SVG icons
- **Stream filtering** - `<story>` tags control what the player sees during streaming; all other output is silently buffered and processed after completion
- **Backward compatibility** - messages without `<story>` tags fall back to old cleaning (MVU.cleanText + Summary.cleanAbstract)
- **Options stored in JS array** (`_optionActions`), not HTML attributes, to avoid truncation from unescaped characters
- **Options restored on page refresh** from last AI message
- **Sidebar mutual exclusion** - MVU sidebar, Summary panel, and Edit mode panels are mutually exclusive
- **Mobile support** - sidebars have dedicated close buttons visible only on mobile (overlay touch target too small otherwise)

## Data Model

### Conversation Object
```js
{
  id, name, createdAt, updatedAt,
  phase: 'init' | 'rp',
  persona: string,             // AI persona for this conversation
  apiProfileId, model,         // API config
  storySetting: string,        // Permanent world lore (set during init)
  mvu: { schema, state, html, css },  // Status bar
  summary: { mergedSummaries: [{code, content}], lastMergedIdx, interval },  // Two-layer summary (ab→sm)
  messages: [{ id, role, content, timestamp, hidden, abstract }]
}
```

### Storage Sync
- Dual-write: localStorage (fast) + server API (persistence)
- Server wins on page load (`syncFromServer()`)
- All mutations call `_syncToServer()` fire-and-forget

## TODO / Future Plans

### Multi-user Support (Planned)
- Hardcode API config for friends to play directly
- Simplify settings page (hide advanced options, keep admin access via URL param)
- User identity via invite codes (unique code per player = userId)
- Server-side data isolation: `data/{userId}/conversations/`
- Storage API requests include userId
- Estimated effort: ~half day

### Deployment (Planned)
- Target: **Fly.io** (persistent disk, no cold start, Docker)
- Current stack (Python server + static files) maps directly to a simple Dockerfile
- Alternative: Render (simpler but free tier sleeps)

### Other Potential Improvements
- `<thinking>` tag parsing (AI reasoning chain)
- Abstract variable system: `{ab01}` references in AI context
- Concurrent background tasks (summary generation during active streaming)
- Story branching / save points
