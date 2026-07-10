/**
 * 入卷 - AI 互动小说
 * Common Module v2.0 (Clean Rewrite)
 */

const DEBUG = true;
function log(...a) { if (DEBUG) console.log('[入卷]', ...a); }

// ============================================================
// Config (public mode detection)
// ============================================================
const Config = {
  mode: 'local',
  provider: 'openai',
  defaultModel: '',
  loaded: false,
  async load() {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) return;
      const data = await res.json();
      this.mode = data.mode || 'local';
      this.provider = data.provider || 'openai';
      this.defaultModel = data.defaultModel || '';
      this.loaded = true;
    } catch { /* local mode fallback */ }
  },
  isPublic() { return this.mode === 'public'; },
};

// ============================================================
// Icons
// ============================================================
const Icons = {
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  sidebar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
  rewind: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>`,
  retry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
};
function getIcon(name, size = 20) {
  return `<span class="icon" style="width:${size}px;height:${size}px;display:inline-flex;">${Icons[name] || ''}</span>`;
}

// ============================================================
// Storage
// ============================================================
const Storage = {
  KEYS: { SETTINGS: 'airp_settings', API_PROFILES: 'airp_apiProfiles', CONVERSATIONS: 'airp_conversations', CONV_CACHE: 'airp_conv_cache' },

  // ---- Native storage bridge (Android WebView) ----
  _isNative: !!(window.AndroidBridge?.saveData),
  _nativeGet(key, fb = null) {
    try {
      const d = window.AndroidBridge.loadData(key);
      return d ? JSON.parse(d) : fb;
    } catch { return fb; }
  },
  _nativeSet(key, val) {
    try { return window.AndroidBridge.saveData(key, JSON.stringify(val)); } catch { return false; }
  },
  _nativeDelete(key) {
    try { return window.AndroidBridge.deleteData(key); } catch { return false; }
  },

  _get(key, fb = null) {
    if (this._isNative) return this._nativeGet(key, fb);
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fb; } catch { return fb; }
  },
  _set(key, val) {
    if (this._isNative) return this._nativeSet(key, val);
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
  },
  _remove(key) {
    if (this._isNative) return this._nativeDelete(key);
    try { localStorage.removeItem(key); } catch {}
  },

  // ---- Auth token (public mode) ----
  _authToken: null,
  getAuthToken() { return this._authToken || localStorage.getItem('airp_token') || ''; },
  setAuthToken(t) { this._authToken = t; localStorage.setItem('airp_token', t); },
  clearAuthToken() { this._authToken = null; localStorage.removeItem('airp_token'); },

  _authHeaders() {
    const h = {};
    const t = this.getAuthToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  },

  // ---- Server sync helpers ----
  _apiBase: '',  // auto-detected, same origin
  _syncToServer(endpoint, data, method = 'PUT') {
    fetch(this._apiBase + endpoint, {
      method, headers: { 'Content-Type': 'application/json', ...this._authHeaders() },
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined,
    }).catch(e => log('Server sync failed:', endpoint, e.message));
  },
  async _fetchFromServer(endpoint) {
    try {
      const res = await fetch(this._apiBase + endpoint, { headers: this._authHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  },

  /**
   * Sync from server. Lightweight: only pulls metadata index for conversations.
   *
   * Safety: before overwriting localStorage, reconciles local data:
   * 1. CONV_CACHE (active conversation backup) — if newer than server, push first
   * 2. Old-format CONVERSATIONS (full data, pre-migration) — push any newer ones
   */
  async syncFromServer() {
    // Native mode: no server to sync from, data is already in native storage
    if (this._isNative) { log('syncFromServer: native mode, skipping'); return false; }
    const [settings, profiles, convMeta] = await Promise.all([
      this._fetchFromServer('/api/settings'),
      this._fetchFromServer('/api/profiles'),
      this._fetchFromServer('/api/conversations?meta=1'),
    ]);
    let synced = false;
    if (settings && Object.keys(settings).length > 0) {
      if (Config.isPublic()) {
        const local = this._get(this.KEYS.SETTINGS, {});
        const serverControlled = ['defaultApiProfileId', 'defaultModel'];
        const merged = { ...settings, ...local };
        for (const k of serverControlled) if (settings[k] !== undefined) merged[k] = settings[k];
        this._set(this.KEYS.SETTINGS, merged);
      } else {
        this._set(this.KEYS.SETTINGS, settings);
      }
      synced = true;
    }
    if (profiles && Object.keys(profiles).length > 0) {
      this._set(this.KEYS.API_PROFILES, profiles);
      synced = true;
    }
    if (convMeta) {
      // Reconcile 1: active conversation cache
      const cached = this._get(this.KEYS.CONV_CACHE, null);
      if (cached && cached.id && cached.messages) {
        const sm = convMeta[cached.id];
        if (!sm || (cached.updatedAt || 0) > (sm.updatedAt || 0)) {
          log('Reconcile: cache newer than server, pushing:', cached.id);
          this._syncToServer(`/api/conversations/${cached.id}`, cached);
          convMeta[cached.id] = this._toMeta(cached);
        }
      }
      // Reconcile 2: old-format localStorage (one-time migration)
      const oldLocal = this._get(this.KEYS.CONVERSATIONS, {});
      for (const [id, lc] of Object.entries(oldLocal)) {
        if (!lc.messages || !lc.messages.length) continue; // metadata-only, skip
        const sm = convMeta[id];
        if (!sm || (lc.updatedAt || 0) > (sm.updatedAt || 0)) {
          log('Reconcile: migrating old local data to server:', id, 'msgs:', lc.messages.length);
          this._syncToServer(`/api/conversations/${id}`, lc);
          convMeta[id] = this._toMeta(lc);
        }
      }
      // Store lightweight metadata index
      this._set(this.KEYS.CONVERSATIONS, convMeta);
      synced = true;
    }
    if (synced) log('Synced from server');
    return synced;
  },

  /**
   * Load full conversation: cache-first with server fallback.
   * Cache hit if same id AND cache is at least as recent as server metadata.
   */
  async loadConversation(id) {
    const cached = this._get(this.KEYS.CONV_CACHE, null);

    // Native mode: load from native file storage
    if (this._isNative) {
      // Cache hit
      if (cached && cached.id === id && cached.messages) {
        log('loadConversation [native]: using cache for', id);
        return cached;
      }
      // Load from native storage
      const data = this._nativeGet('conv_' + id, null);
      if (data && data.id) {
        this._set(this.KEYS.CONV_CACHE, data);
        log('loadConversation [native]: loaded from file for', id);
        return data;
      }
      log('loadConversation [native]: not found', id);
      return null;
    }

    // Web mode: cache-first with server fallback
    const serverMeta = this.getConversation(id); // from metadata index
    // Use cache if it matches and is not stale
    if (cached && cached.id === id && cached.messages) {
      const cacheTime = cached.updatedAt || 0;
      const serverTime = serverMeta?.updatedAt || 0;
      if (cacheTime >= serverTime) {
        log('loadConversation: using cache for', id);
        return cached;
      }
    }
    // Fetch from server
    const data = await this._fetchFromServer(`/api/conversations/${id}`);
    if (data && data.id) {
      this._set(this.KEYS.CONV_CACHE, data); // update cache
      return data;
    }
    // Server failed — fall back to cache even if stale
    if (cached && cached.id === id) {
      log('loadConversation: server failed, using stale cache for', id);
      return cached;
    }
    // Fall back to import cache (from importAll when server was unreachable)
    const importKey = 'airp_conv_import_' + id;
    const imported = this._get(importKey, null);
    if (imported && imported.id) {
      log('loadConversation: using import cache for', id);
      this._set(this.KEYS.CONV_CACHE, imported);
      this._putToServer(`/api/conversations/${id}`, imported).then(() => {
        Storage._remove(importKey);
      });
      return imported;
    }
    return null;
  },

  // ---- Settings ----
  _SETTINGS_DEFAULTS: {
    defaultApiProfileId: '', defaultModel: '', summaryInterval: 80, exportFormat: 'md',
    articleWordCount: 500, summaryWordCount: 50,
    showPromptInspector: false, enableWebSearch: false,
    promptInit: '', promptSummaryGen: '', promptEntries: null,
    promptPresets: null, activePresetId: 'default',
  },
  getSettings() {
    const saved = this._get(this.KEYS.SETTINGS, null);
    if (!saved) return { ...this._SETTINGS_DEFAULTS };
    const s = { ...this._SETTINGS_DEFAULTS, ...saved };
    // 迁移：default 预设的 initPrompt/summaryPrompt 历史上被存成了快照，
    // 会永久屏蔽代码里的最新版（2026-07-10 实测一份 6 月快照让新 prompt 从未发出过）。
    // default 的语义就是"跟随代码默认"——清掉快照走 fallback。自定义预设不受影响。
    const dp = s.promptPresets?.default;
    if (dp && (dp.initPrompt || dp.summaryPrompt)) {
      dp.initPrompt = '';
      dp.summaryPrompt = '';
      this.saveSettings(s);
    }
    return s;
  },
  saveSettings(s) {
    this._set(this.KEYS.SETTINGS, s);
    this._syncToServer('/api/settings', s);
  },

  // ---- API Profiles ----
  getApiProfiles() { return this._get(this.KEYS.API_PROFILES, {}); },
  getApiProfile(id) { return this.getApiProfiles()[id] || null; },
  saveApiProfile(p) {
    const a = this.getApiProfiles(); a[p.id] = p;
    this._set(this.KEYS.API_PROFILES, a);
    this._syncToServer('/api/profiles', a);
  },
  deleteApiProfile(id) {
    const a = this.getApiProfiles(); delete a[id];
    this._set(this.KEYS.API_PROFILES, a);
    this._syncToServer('/api/profiles', a);
  },

  // ---- Conversations ----
  // localStorage stores only metadata index; full data lives on server.
  _META_FIELDS: ['id', 'name', 'phase', 'createdAt', 'updatedAt', 'apiProfileId', 'model', 'msgCount'],
  _toMeta(c) {
    const meta = {};
    for (const k of this._META_FIELDS) if (c[k] !== undefined) meta[k] = c[k];
    if (meta.msgCount === undefined && c.messages) {
      meta.msgCount = c.messages.filter(m => !m.hidden).length;
    }
    return meta;
  },
  getConversations() { return this._get(this.KEYS.CONVERSATIONS, {}); },
  getConversation(id) { return this.getConversations()[id] || null; },
  saveConversation(c) {
    c.updatedAt = Date.now();
    // 1. Local cache — safety net if server push fails
    this._set(this.KEYS.CONV_CACHE, c);
    // 2. Update metadata index
    const index = this.getConversations();
    index[c.id] = this._toMeta(c);
    this._set(this.KEYS.CONVERSATIONS, index);
    // 3. Native mode: save full conversation to native storage; otherwise push to server
    if (this._isNative) {
      this._nativeSet('conv_' + c.id, c);
    } else {
      this._syncToServer(`/api/conversations/${c.id}`, c);
    }
  },
  deleteConversation(id) {
    // Clear cache if it's the deleted conversation
    const cached = this._get(this.KEYS.CONV_CACHE, null);
    if (cached && cached.id === id) this._remove(this.KEYS.CONV_CACHE);
    const index = this.getConversations();
    delete index[id];
    this._set(this.KEYS.CONVERSATIONS, index);
    if (this._isNative) {
      this._nativeDelete('conv_' + id);
    } else {
      this._syncToServer(`/api/conversations/${id}`, null, 'DELETE');
    }
  },
  getConversationList() { return Object.values(this.getConversations()).sort((a, b) => b.updatedAt - a.updatedAt); },

  async exportAll() {
    if (this._isNative) {
      // Native mode: load all conversations from native storage
      const index = this.getConversations();
      const conversations = {};
      for (const id of Object.keys(index)) {
        const conv = this._nativeGet('conv_' + id, null);
        if (conv) conversations[id] = conv;
      }
      return { settings: this.getSettings(), apiProfiles: this.getApiProfiles(), conversations };
    }
    // Web mode: fetch from server
    const conversations = await this._fetchFromServer('/api/conversations') || {};
    return { settings: this.getSettings(), apiProfiles: this.getApiProfiles(), conversations };
  },
  async importAll(d) {
    if (d.settings) { this._set(this.KEYS.SETTINGS, d.settings); if (!this._isNative) this._putToServer('/api/settings', d.settings); }
    if (d.apiProfiles) { this._set(this.KEYS.API_PROFILES, d.apiProfiles); if (!this._isNative) this._putToServer('/api/profiles', d.apiProfiles); }
    if (d.conversations) {
      const index = {};
      for (const [id, conv] of Object.entries(d.conversations)) {
        index[id] = this._toMeta(conv);
        if (this._isNative) {
          this._nativeSet('conv_' + id, conv);
        } else {
          this._set('airp_conv_import_' + id, conv);
          this._putToServer(`/api/conversations/${id}`, conv);
        }
      }
      this._set(this.KEYS.CONVERSATIONS, index);
    }
  },
  async _putToServer(endpoint, data) {
    try {
      await fetch(this._apiBase + endpoint, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', ...this._authHeaders() },
        body: JSON.stringify(data),
      });
    } catch (e) { log('Import sync failed:', endpoint, e.message); }
  },

  clearAll() {
    const index = this.getConversations();
    for (const id of Object.keys(index)) {
      if (this._isNative) {
        this._nativeDelete('conv_' + id);
      } else {
        this._syncToServer(`/api/conversations/${id}`, null, 'DELETE');
      }
    }
    for (const key of Object.values(this.KEYS)) {
      this._remove(key);
    }
    if (!this._isNative) {
      this._syncToServer('/api/settings', {});
      this._syncToServer('/api/profiles', {});
    }
  },
};

// ============================================================
// API Module
// ============================================================
const API = {
  // gproxy 魔法串缓存触发（opt-in，需目标 provider 开 enable_magic_cache 才生效）。
  // 1h 变体：gproxy 见到这串字符会原样剥离，并在该 block 上打 cache_control(ephemeral,1h)。
  // 与字面量保持完全一致（来自 gproxy 源码 claude_magic_cache.rs）。
  CACHE_MAGIC_1H: 'GPROXY_MAGIC_STRING_TRIGGER_CACHING_CREATE_1FAS5GV9R5H29T5Y2J9584K6O95M2NBVW52C95CX984FRJY',

  _getBaseUrl(p) {
    if (p.baseUrl) return p.baseUrl.replace(/\/$/, '');
    const defaults = { openai: 'https://api.openai.com/v1', claude: 'https://api.anthropic.com/v1', 'google-ai-studio': 'https://generativelanguage.googleapis.com/v1beta' };
    return defaults[p.provider] || '';
  },

  _getHeaders(p) {
    const h = { 'Content-Type': 'application/json' };
    if (p.provider === 'claude') { h['x-api-key'] = p.apiKey; h['anthropic-version'] = '2023-06-01'; }
    else if (p.provider !== 'google-ai-studio') { h['Authorization'] = `Bearer ${p.apiKey}`; }
    return h;
  },

  // Detect actual provider from profile + URL + model name
  _detect(p, model = '') {
    if (p.provider === 'claude') return 'claude';
    if (p.provider === 'google-ai-studio') return 'google';
    const url = (p.baseUrl || '').toLowerCase();
    if (url.includes('anthropic')) return 'claude';
    if (url.includes('generativelanguage.googleapis')) return 'google';
    // OpenAI-compatible (covers proxies for Claude/Gemini too)
    return 'openai';
  },

  _buildUrl(p, model, stream) {
    const base = this._getBaseUrl(p);
    if (p.provider === 'google-ai-studio') {
      const act = stream ? 'streamGenerateContent?alt=sse&' : 'generateContent?';
      return `${base}/models/${model}:${act}key=${p.apiKey}`;
    }
    if (p.provider === 'claude') return `${base}/messages`;
    return `${base}/chat/completions`;
  },

  _maxTokensForModel(model) {
    const m = (model || '').toLowerCase();
    if (m.includes('opus-4-6') || m.includes('opus-4.6')) return 128000;
    if (m.includes('opus-4-1') || m.includes('opus-4.1') || m.includes('claude-3-opus')) return 32000;
    return 64000;
  },

  _buildBody(p, model, systemPrompt, messages, stream) {
    const prov = this._detect(p, model);
    const webSearch = !!Storage.getSettings()?.enableWebSearch;

    if (prov === 'claude') {
      // Ensure alternating roles, first must be user.
      // content 用 block 数组而非字符串拼接：同角色相邻消息合并时，每条原始消息各自
      // 保留成独立 block，而不是拼成一整块字符串。这样后面追加新 block（比如每轮新增的
      // 摘要）不会让前面已经稳定的 block（人设/世界观）被判定为"整体变了"——
      // Anthropic 的 prompt cache 是按 block 级别做前缀匹配的，块内容一变整块失效，
      // 块之间互不影响。
      const msgs = [];
      let anchorBlock = null; // 指向"故事设定"块本身，而不是假设它一定排第一个
      for (const m of messages) {
        const role = m.role === 'assistant' ? 'assistant' : 'user';
        const block = { type: 'text', text: m.content };
        if (msgs.length > 0 && msgs[msgs.length - 1].role === role) {
          msgs[msgs.length - 1].content.push(block);
        } else {
          msgs.push({ role, content: [block] });
        }
        if (m._cacheAnchor) anchorBlock = block;
      }
      // If first message is assistant, prepend empty user
      if (msgs.length > 0 && msgs[0].role !== 'user') {
        msgs.unshift({ role: 'user', content: [{ type: 'text', text: '(continue)' }] });
      }
      // gproxy magic-string 缓存触发（需 provider 开启 enable_magic_cache 才生效；
      // 未开启时这串字符会原样发给 Anthropic，只是段无意义文本，不影响功能）。
      // 打在人设(system)末尾 + 故事设定块末尾——两处在一局对话生命周期内基本不变，
      // 用 1h TTL 覆盖玩家的思考间隔。故事设定块必须靠 _cacheAnchor 精确定位，
      // 不能假设"第一条消息"：storySetting 为空时第一条会变成别的、每轮都在变的内容，
      // 标记打错地方就会退化成"每次都写、从不命中"，比不加缓存还费钱。
      // storySetting 为空（没有锚点）时宁可不加缓存标记，也不要标错。
      let sys = systemPrompt || undefined;
      if (sys) sys = sys + ' ' + this.CACHE_MAGIC_1H;
      if (anchorBlock) {
        anchorBlock.text += ' ' + this.CACHE_MAGIC_1H;
      }
      const body = { model, max_tokens: this._maxTokensForModel(model), stream, system: sys, messages: msgs };
      if (webSearch) {
        body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
      }
      return body;
    }

    if (prov === 'google') {
      const contents = [];
      if (systemPrompt) {
        contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
        contents.push({ role: 'model', parts: [{ text: '好的，我明白了。' }] });
      }
      for (const m of messages) {
        contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
      }
      const body = { contents };
      if (webSearch) {
        body.tools = [{ google_search: {} }];
      }
      return body;
    }

    // OpenAI compatible (incl. proxies wrapping Claude/Gemini)
    const msgs = [];
    if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
    for (const m of messages) msgs.push({ role: m.role, content: m.content });
    const body = { model, messages: msgs, stream, max_tokens: this._maxTokensForModel(model) };
    if (webSearch) {
      // Best-effort by model name; relies on proxy passing tools through
      const ml = (model || '').toLowerCase();
      if (ml.includes('claude')) {
        body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
      } else if (ml.includes('gemini')) {
        body.tools = [{ google_search: {} }];
      }
    }
    return body;
  },

  async sendChat({ apiProfileId, model, systemPrompt, messages }) {
    const p = Storage.getApiProfile(apiProfileId);
    if (!p) return { success: false, error: 'API配置不存在' };
    // Server proxy mode
    if (p.provider === 'server-proxy') {
      return this._sendViaProxy({ model, systemPrompt, messages });
    }
    try {
      const res = await fetch(this._buildUrl(p, model, false), { method: 'POST', headers: this._getHeaders(p), body: JSON.stringify(this._buildBody(p, model, systemPrompt, messages, false)) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); return { success: false, error: e.error?.message || `HTTP ${res.status}` }; }
      const data = await res.json();
      return { success: true, ...this._parseResponse(p, data) };
    } catch (e) { return { success: false, error: e.message }; }
  },

  /**
   * Classify an API error into a user-friendly message and retryability.
   * @param {number} status - HTTP status code (0 for network errors)
   * @param {string} rawMsg - Raw error message
   * @returns {{ type: string, retryable: boolean, userMessage: string }}
   */
  classifyError(status, rawMsg = '') {
    if (rawMsg === 'AbortError' || rawMsg === 'The user aborted a request.') {
      return { type: 'cancelled', retryable: false, userMessage: '' };
    }
    if (rawMsg === 'CONNECT_TIMEOUT') {
      return { type: 'timeout', retryable: true, userMessage: '连接超时，API 未响应' };
    }
    if (rawMsg === 'IDLE_TIMEOUT') {
      return { type: 'timeout', retryable: true, userMessage: '响应中断，长时间未收到数据' };
    }
    if (status === 401 || status === 403) {
      return { type: 'auth', retryable: false, userMessage: 'API Key 无效或已过期，请检查设置' };
    }
    if (status === 429) {
      return { type: 'rate_limit', retryable: true, userMessage: '请求过于频繁，请稍后再试' };
    }
    if (status === 400 || status === 422) {
      return { type: 'bad_request', retryable: false, userMessage: '请求参数错误: ' + rawMsg };
    }
    if (status >= 500) {
      return { type: 'server', retryable: true, userMessage: 'API 服务异常 (' + status + ')' };
    }
    if (status === 0 || rawMsg.includes('fetch') || rawMsg.includes('network') || rawMsg.includes('Failed') || rawMsg.includes('NetworkError')) {
      return { type: 'network', retryable: true, userMessage: '网络连接失败，请检查网络' };
    }
    return { type: 'unknown', retryable: true, userMessage: rawMsg || '未知错误' };
  },

  /**
   * Stream chat with AbortController, connection timeout, and idle timeout.
   * @returns {AbortController} controller - call controller.abort() to cancel
   */
  streamChat({ apiProfileId, model, systemPrompt, messages, onChunk, onDone, onError, onStatus }) {
    const controller = new AbortController();
    const p = Storage.getApiProfile(apiProfileId);
    if (!p) { onError?.('API配置不存在', 0); return controller; }

    // Server proxy mode
    if (p.provider === 'server-proxy') {
      this._streamViaProxy({ model, systemPrompt, messages, onChunk, onDone, onError, onStatus, controller });
      return controller;
    }

    // Per-profile stream toggle: if explicitly disabled, route to non-stream and fake the callbacks
    if (p.stream === false) {
      this._nonStreamAsStream({ apiProfileId, model, systemPrompt, messages, onChunk, onDone, onError, onStatus, controller });
      return controller;
    }

    const prov = this._detect(p, model);
    const url = this._buildUrl(p, model, true);
    const body = this._buildBody(p, model, systemPrompt, messages, true);
    log('streamChat', { provider: prov, url, systemPrompt: systemPrompt?.substring(0, 100) + '...', msgCount: messages.length });
    log('Messages:', messages.map(m => ({ role: m.role, len: m.content.length, preview: m.content.substring(0, 80) })));

    const CONNECT_TIMEOUT = 30000;  // 30s before first chunk
    const IDLE_TIMEOUT = 40000;     // 40s between chunks（长思考模型静默期可能较长，20s 偏紧）

    const doStream = async () => {
      let connectTimer = null;
      let idleTimer = null;
      let gotFirstChunk = false;
      let timeoutErrorHandled = false;  // flag: timeout handler already called onError

      const clearTimers = () => {
        if (connectTimer) { clearTimeout(connectTimer); connectTimer = null; }
        if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
      };

      const resetIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          log('Idle timeout - no data for', IDLE_TIMEOUT, 'ms');
          timeoutErrorHandled = true;
          controller.abort();
          clearTimers();
          onError?.('IDLE_TIMEOUT', 0);
        }, IDLE_TIMEOUT);
      };

      // Start connection timeout
      connectTimer = setTimeout(() => {
        if (!gotFirstChunk) {
          log('Connect timeout - no response in', CONNECT_TIMEOUT, 'ms');
          timeoutErrorHandled = true;
          controller.abort();
          clearTimers();
          onError?.('CONNECT_TIMEOUT', 0);
        }
      }, CONNECT_TIMEOUT);

      try {
        onStatus?.('connecting');
        const res = await fetch(url, {
          method: 'POST',
          headers: this._getHeaders(p),
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          clearTimers();
          const errBody = await res.text();
          log('API error response:', res.status, errBody);
          let errMsg = `HTTP ${res.status}`;
          try { const j = JSON.parse(errBody); errMsg = j.error?.message || errMsg; } catch {}
          onError?.(errMsg, res.status);
          return;
        }

        onStatus?.('streaming');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', fullText = '', usage = { input: 0, output: 0 };
        let finishReason = '';
        let _debugRawChunks = []; // temporary debug

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (!gotFirstChunk) {
              gotFirstChunk = true;
              if (connectTimer) { clearTimeout(connectTimer); connectTimer = null; }
            }
            resetIdleTimer();

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const raw = line.slice(6).trim();
              if (raw === '[DONE]') continue;
              try {
                const data = JSON.parse(raw);
                if (_debugRawChunks.length < 3) _debugRawChunks.push(data);
                // Detect error responses disguised as SSE
                if (data.error) {
                  const errMsg = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
                  log('SSE error in stream:', errMsg);
                  clearTimers();
                  reader.releaseLock();
                  onError?.(errMsg, 0);
                  return;
                }
                let chunk = '';
                if (prov === 'claude') {
                  if (data.type === 'content_block_delta' && data.delta?.text) chunk = data.delta.text;
                  if (data.type === 'message_delta' && data.usage) usage.output = data.usage.output_tokens || 0;
                  if (data.type === 'message_delta' && data.delta?.stop_reason) finishReason = data.delta.stop_reason;
                  if (data.type === 'message_start' && data.message?.usage) usage.input = data.message.usage.input_tokens || 0;
                } else if (prov === 'google') {
                  const cand = data.candidates?.[0];
                  if (cand && !cand.content) log('Google SSE: candidate without content:', JSON.stringify(cand).substring(0, 300));
                  if (cand?.finishReason) finishReason = cand.finishReason;
                  const parts = cand?.content?.parts || [];
                  for (const pt of parts) if (pt.text) chunk += pt.text;
                  if (data.usageMetadata) { usage.input = data.usageMetadata.promptTokenCount || 0; usage.output = data.usageMetadata.candidatesTokenCount || 0; }
                } else {
                  const delta = data.choices?.[0]?.delta;
                  if (delta?.content) chunk = delta.content;
                  if (data.choices?.[0]?.finish_reason) finishReason = data.choices[0].finish_reason;
                  if (data.usage) { usage.input = data.usage.prompt_tokens || 0; usage.output = data.usage.completion_tokens || 0; }
                }
                if (chunk) { fullText += chunk; onChunk?.(chunk, fullText); }
              } catch (parseErr) { log('SSE parse error:', parseErr.message, 'raw:', raw.substring(0, 200)); }
            }
          }
        } finally {
          reader.releaseLock();
        }

        clearTimers();
        log('Stream done, length:', fullText.length, 'usage:', usage, 'finish_reason:', finishReason || '(none)');
        if (finishReason && finishReason !== 'stop' && finishReason !== 'STOP' && finishReason !== 'end_turn') {
          log('⚠ Truncated by:', finishReason, '— check prompt length / max_tokens / content filter');
        }
        if (!fullText && _debugRawChunks.length > 0) {
          log('DEBUG: Stream returned empty but got SSE chunks. First chunks:', JSON.stringify(_debugRawChunks, null, 2).substring(0, 2000));
        }
        onDone?.(fullText, usage);
      } catch (e) {
        clearTimers();
        if (e.name === 'AbortError') {
          if (timeoutErrorHandled) return; // timeout handler already called onError
          log('Stream aborted by user');
          onError?.('AbortError', 0);
        } else {
          log('Stream error:', e);
          onError?.(e.message, 0);
        }
      }
    };

    doStream();
    return controller;
  },

  // When profile has stream:false, simulate streaming callbacks from one-shot response
  async _nonStreamAsStream({ apiProfileId, model, systemPrompt, messages, onChunk, onDone, onError, onStatus, controller }) {
    try {
      onStatus?.('connecting');
      const p = Storage.getApiProfile(apiProfileId);
      const res = await fetch(this._buildUrl(p, model, false), {
        method: 'POST',
        headers: this._getHeaders(p),
        body: JSON.stringify(this._buildBody(p, model, systemPrompt, messages, false)),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errBody = await res.text();
        let errMsg = `HTTP ${res.status}`;
        try { const j = JSON.parse(errBody); errMsg = j.error?.message || errMsg; } catch {}
        log('Non-stream API error:', res.status, errBody.substring(0, 300));
        onError?.(errMsg, res.status);
        return;
      }
      const data = await res.json();
      const { content, usage } = this._parseResponse(p, data);
      log('Non-stream done, length:', content.length, 'usage:', usage);
      onStatus?.('streaming');
      if (content) onChunk?.(content, content);
      onDone?.(content, usage);
    } catch (e) {
      if (e.name === 'AbortError') { onError?.('AbortError', 0); return; }
      log('Non-stream error:', e);
      onError?.(e.message, 0);
    }
  },

  _parseResponse(p, data) {
    let text = '', usage = { input: 0, output: 0 };
    if (data.usage) { usage.input = data.usage.input_tokens || data.usage.prompt_tokens || 0; usage.output = data.usage.output_tokens || data.usage.completion_tokens || 0; }
    else if (data.usageMetadata) { usage.input = data.usageMetadata.promptTokenCount || 0; usage.output = data.usageMetadata.candidatesTokenCount || 0; }
    if (data.content && Array.isArray(data.content)) text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    else if (data.candidates) text = (data.candidates[0]?.content?.parts || []).map(pt => pt.text || '').join('');
    else if (data.choices) text = data.choices[0]?.message?.content || '';
    return { content: text, usage };
  },

  // ---- Server proxy methods (public mode) ----
  async _sendViaProxy({ model, systemPrompt, messages }) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...Storage._authHeaders() },
        body: JSON.stringify({ model, systemPrompt, messages }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return { success: false, error: e.error || `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { success: true, content: data.content || '', usage: data.usage || { input: 0, output: 0 } };
    } catch (e) { return { success: false, error: e.message }; }
  },

  _streamViaProxy({ model, systemPrompt, messages, onChunk, onDone, onError, onStatus, controller }) {
    const prov = Config.provider || 'openai';
    const CONNECT_TIMEOUT = 30000;
    const IDLE_TIMEOUT = 40000;     // 40s between chunks（长思考模型静默期可能较长，20s 偏紧）

    const doStream = async () => {
      let connectTimer = null;
      let idleTimer = null;
      let gotFirstChunk = false;
      let timeoutErrorHandled = false;

      const clearTimers = () => {
        if (connectTimer) { clearTimeout(connectTimer); connectTimer = null; }
        if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
      };

      const resetIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          timeoutErrorHandled = true;
          controller.abort();
          clearTimers();
          if (fullText) { onDone?.(fullText, usage); } else { onError?.('IDLE_TIMEOUT', 0); }
        }, IDLE_TIMEOUT);
      };

      connectTimer = setTimeout(() => {
        if (!gotFirstChunk) {
          timeoutErrorHandled = true;
          controller.abort();
          clearTimers();
          onError?.('CONNECT_TIMEOUT', 0);
        }
      }, CONNECT_TIMEOUT);

      try {
        onStatus?.('connecting');
        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...Storage._authHeaders() },
          body: JSON.stringify({ model, systemPrompt, messages }),
          signal: controller.signal,
        });

        if (!res.ok) {
          clearTimers();
          const errBody = await res.text();
          let errMsg = `HTTP ${res.status}`;
          try { const j = JSON.parse(errBody); errMsg = j.error || errMsg; } catch {}
          onError?.(errMsg, res.status);
          return;
        }

        onStatus?.('streaming');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', fullText = '', usage = { input: 0, output: 0 };
        let finishReason = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (!gotFirstChunk) {
              gotFirstChunk = true;
              if (connectTimer) { clearTimeout(connectTimer); connectTimer = null; }
            }
            resetIdleTimer();

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const raw = line.slice(6).trim();
              if (raw === '[DONE]') continue;
              try {
                const data = JSON.parse(raw);
                let chunk = '';
                if (prov === 'claude') {
                  if (data.type === 'content_block_delta' && data.delta?.text) chunk = data.delta.text;
                  if (data.type === 'message_delta' && data.usage) usage.output = data.usage.output_tokens || 0;
                  if (data.type === 'message_delta' && data.delta?.stop_reason) finishReason = data.delta.stop_reason;
                  if (data.type === 'message_start' && data.message?.usage) usage.input = data.message.usage.input_tokens || 0;
                } else if (prov === 'google') {
                  const cand = data.candidates?.[0];
                  if (cand?.finishReason) finishReason = cand.finishReason;
                  const parts = cand?.content?.parts || [];
                  for (const pt of parts) if (pt.text) chunk += pt.text;
                  if (data.usageMetadata) { usage.input = data.usageMetadata.promptTokenCount || 0; usage.output = data.usageMetadata.candidatesTokenCount || 0; }
                } else {
                  const delta = data.choices?.[0]?.delta;
                  if (delta?.content) chunk = delta.content;
                  if (data.choices?.[0]?.finish_reason) finishReason = data.choices[0].finish_reason;
                  if (data.usage) { usage.input = data.usage.prompt_tokens || 0; usage.output = data.usage.completion_tokens || 0; }
                }
                if (chunk) { fullText += chunk; onChunk?.(chunk, fullText); }
              } catch {}
            }
          }
        } finally {
          reader.releaseLock();
        }

        clearTimers();
        log('Stream done (proxy), length:', fullText.length, 'usage:', usage, 'finish_reason:', finishReason || '(none)');
        if (finishReason && finishReason !== 'stop' && finishReason !== 'STOP' && finishReason !== 'end_turn') {
          log('⚠ Truncated by:', finishReason);
        }
        onDone?.(fullText, usage);
      } catch (e) {
        clearTimers();
        if (e.name === 'AbortError') {
          if (timeoutErrorHandled) return;
          if (fullText) { onDone?.(fullText, usage); } else { onError?.('AbortError', 0); }
        } else {
          if (fullText) { onDone?.(fullText, usage); } else { onError?.(e.message, 0); }
        }
      }
    };

    doStream();
  },

  async fetchModels(apiProfileId) {
    const p = Storage.getApiProfile(apiProfileId);
    if (!p) return { success: false, models: [] };
    const base = this._getBaseUrl(p);
    const url = p.provider === 'google-ai-studio' ? `${base}/models?key=${p.apiKey}` : `${base}/models`;
    try {
      const res = await fetch(url, { headers: this._getHeaders(p) });
      if (!res.ok) return { success: false, models: [] };
      const data = await res.json();
      let models = [];
      if (p.provider === 'google-ai-studio') models = (data.models || []).filter(m => m.name?.includes('gemini')).map(m => m.name.replace('models/', ''));
      else models = (data.data || []).map(m => m.id);
      return { success: true, models };
    } catch { return { success: false, models: [] }; }
  },
};

// ============================================================
// Prompt Builder
// ============================================================
const PromptBuilder = {
  DEFAULT_INIT_PROMPT: `你是"小克"，主人的AI女仆，自称"小克"或"我"，爱用颜文字。擅长世界观构建与状态栏创建，专注创意表达与沉浸叙事。

---
【当前阶段：初始化 — 互动式小说世界观/状态栏构建】
你需要协助用户构建一个互动式小说的世界观和状态栏。

首先了解用户想怎么开始——有三种模式：

【详细定制】
1. 了解用户想要什么类型的故事（题材、背景、角色设定、叙事人称等）
2. 充分讨论角色、世界观、需要追踪的状态
3. 当用户确认后（说"确定"或类似的话），输出故事设定和状态栏初始化
4. 用户可能对结果不满意，要求修改——只需输出改动部分（详见第三部分）

【快速开始】
通过一两个简短问题（如：想玩什么题材？）快速了解核心需求，然后生成一个或多个世界观方案供用户挑选，直到用户确认后输出故事设定和状态栏。

【直接开始】
用户没有明确想法时，完全随机生成一个世界观和状态栏，直接输出故事设定和状态栏初始化。

默认男性向，除非用户额外说明。

【重要】第一次输出时，故事设定和状态栏必须在同一条回复中同时输出！

══════════════════════════════
第一部分：故事设定
══════════════════════════════

会作为永久上下文传入后续RP对话，相当于基础世界观。

⚠⚠ **持久化关键提示（务必读懂）**：
init 阶段的**对话历史在用户进入 RP 后会被全部丢弃**——只有写入 \`story_setting\`（世界设定）和 \`mvu_init\`（状态栏）的内容才会保留到 RP 阶段。

因此：
- 所有讨论中和用户**确认/拍板**过的角色细节、关系背景、伏笔、特殊设定、用户偏好等，**必须显式写入 story_setting**。不要假设"刚才聊过 AI 就记得了"——RP 阶段的 AI 看不到 init 聊天记录。
- 适当分配：大篇幅细节（外貌差异化、性格调色盘、背景故事、关系起源）放在 story_setting；状态栏放可操作、随剧情会变动的字段（资源条/位置/心理/装备/好感度等）。两者承担角色不同，状态栏内容与 story_setting 不大片重复即可——少量提炼性的重叠（如角色一句话身份简述）是正常的。

创作要求：

【独特性】
- 每个故事都应有独特辨识度——选定一个鲜明的核心概念并贯彻到世界观的每个角落
- 角色命名贴合世界观，避免AI偏好的模板化名字（苏瑶、林若、凌霜等）

【外貌差异化原则】
AI 数据库对种族/国籍/年龄都有默认认知。**只写偏离默认的特征**：
- 中国人 → 黑发不写，白发要写；眼睛默认黑色不用写，异色瞳要写
- 精灵 → 尖耳不写（默认就是），断耳要写
- 18岁少女 → "年轻""皮肤好"不用写
- 标志性装扮（特定校服/制服/饰品/发型）要写
- 体型上的显著特点要写（"普通身材"不用写）
判断标准：把外貌描写遮住名字，能否只靠这些特征认出？能 → 写得好；不能（放别人身上也成立） → 那是废话，删掉。
⚠ **严禁万能美人描写**："精致脸蛋、白皙皮肤、桃花眼、柳叶眉、樱桃嘴" 这种放谁身上都成立的模板等于什么都没写。

【反八股清单】
- 避免模糊词、过度微表情、抽象情绪词、八股比喻
- 不要"她温柔地说"——写具体台词；用语料代替语气描述
- 用具体场景行为代替性格标签（"她大大咧咧" → 写她在什么场景下做了什么）
- 角色的言行由其性格和处境驱动，不迎合用户

\`\`\`text:story_setting
详细描述故事的基础设定（至少2500字），包括但不限于：

【世界观概述】时代背景、体系规则、社会结构、关键势力/历史

【主角设定】姓名、身份、能力、初始状态（注意：主角由用户扮演，不要预设性格）

【起始情境】简要的故事开端引子即可，不要过于详细

【主要角色档案】每个主要角色必须写三段（普通配角不写调色盘，简述即可）：

(1) 外貌：按上文【外貌差异化原则】只写偏离 AI 默认认知的特征（详细描写，至少 50 字）

(2) 性格调色盘（必填）：
人的性格不是单一标签，而是由多种颜色混合而成。任何时刻都是由多种性格、行为、回忆组合驱动着角色，并非单纯的一种颜色、一个标签。

调色盘三层结构：
- 底色：角色最深层的性格基调，始终存在但不一定最明显，像画布的底色，所有颜色都建立在它之上
- 主色调：角色最突出的、日常表现最多的性格（1-2 个），别人对这个角色的第一印象
- 点缀：特定条件下才出现的隐藏性格，平时被隐藏或压制，往往是角色最真实最脆弱的部分

衍生（核心）：
- 每条性格写 2-3 个具体行为衍生
- 衍生不是定义性格，而是它在生活中具体怎么表现
- 衍生可以包含看似矛盾的内容（社恐衍生 → 社交达人面具）
- 衍生可以跨性格关联，产生化学反应（叛逆衍生里出现依赖的影子）
- 必要时穿插具体台词

格式参考：
\`\`\`
性格调色盘：人的性格就像调色盘，叛逆是底色，热情与不拘一格是主色调，由多种性格衍生组合而成才是活生生的人
主色调：热情、不拘一格
底色：叛逆
性格点缀：依赖

热情衍生一：在对待摇滚这件事上有着用不完的精力
热情衍生二：人的精力总是有限的，过度的热情带来的自然是事后的乏力与懒散
叛逆衍生一：脏话只在特定不爽时直接说"操你妈"，正常聊天不会
叛逆衍生二：喜欢夜晚街头吉他 solo，踩在音响上短暂恢复自我
依赖衍生一：极度依赖红美玲，会下意识靠近、贴近、寻找对方位置
依赖衍生二：崩溃时会抓着对方的衣角"美玲...呜...我该怎么办"
\`\`\`

(3) 背景：身份、来历、与主角的关系起源、对角色产生过实际影响的关键事件。不写人生年表，只写"让这个角色变成现在这样"的事

【用户偏好】用户在讨论中明确提出的喜好和要求。不要臆想用户未提及的需求，不要自行拟定叙事人称等信息，只记录用户亲口说过的内容

务必充实详尽。
⚠ 信息分层原则：story_setting 是百科全书（写大篇幅细节：外貌差异化、性格调色盘、背景故事、关系起源），状态栏是仪表盘（放随剧情变动的可操作字段：资源条/位置/心理/装备/好感度/态度等）。两者各司其职，状态栏内容与 story_setting **不大片重复**即可——不要把整段背景故事或性格调色盘原文搬到状态栏，但少量提炼性的重叠（如角色身份的一句话简述）是合理的。
\`\`\`

══════════════════════════════
第二部分：状态栏初始化
══════════════════════════════

状态栏是故事的实时仪表盘，同时也是AI的**持久记忆系统**——状态栏中所有字段的值会在每轮对话中作为上下文提供给你，确保信息不会因上下文窗口滚动而丢失。因此，角色描写、能力信息等写入状态栏后就能保持一致性。

字段宁多勿少，以下为必须包含的模块，其余根据题材自由发挥：

【必须模块】
1. 环境信息：日期/时间、当前位置、环境状态描述。必须为故事设定一个具体的起始日期和时刻，**时间精确到分钟级**（根据世界观选择合适的历法，如"星辉历1247年·1月21日 巳时三刻"、"2025年3月15日 14:32"）。RP 中该字段每轮必须更新——时间要随剧情动作自然流逝
2. 主角核心属性：与题材匹配的资源条（如HP/MP/体力/精神等，用bar类型，需current+max），等级/境界，货币/资源
3. 主角能力/技能：每个技能/能力需包含名称、等级/熟练度、简要描述。这是防止叙事幻觉（使用未习得能力）的关键依据
4. 物品栏：当前持有的物品列表

【推荐模块】
- 任务系统：若世界观适合，推荐引入任务追踪。每个任务包含标题、目标、进度、奖励

【自由模块（根据题材选择）】
- 领地/据点、势力/阵营关系、特殊系统等，按需设计

鼓励在以上基础上根据题材自由发挥，添加更多细化/独特的状态模块。状态栏越丰富，AI的记忆越完整，叙事越一致。

【角色模板与开局实例（核心要求）】
⚠ 先记住一条铁律：**schema 里没有角色**。schema 只放世界与主角的字段；一切角色（包括开局就登场的）都通过 templates（角色字段图纸）定义 + instances（实例声明）落地，系统会自动创建字段和面板。schema 中出现任何"角色名_xxx"形式的字段都是错误。

【硬性要求】templates 必须同时包含两张图纸，缺一不可：

完整版模板（如 major_character，用于剧情核心角色）的 fields 必须包含：
● profile（text，基础档案，作为持久记忆）——值里写入：外貌简述（一行能概括的关键差异化特征，如"白发·琥珀瞳·黑色斗篷"）｜年龄｜身份｜与主角的关系起源｜能力/特长
● outfit（text，当前穿着/装备）
● affection（bar 或 number，好感度）
● relation（tag/text，关系状态——一个词或短语，如"未相遇"/"同伴"/"恋人"）
● attitude（text，对主角态度——**一句话**。例："完全信赖，撒娇依赖" → 被冷落后 → "有些委屈，试探性保持距离"）
● thoughts（text，当前心理——**一句话想法**，随剧情更新）
● location（text，当前位置）
● 可根据题材追加其他 fields
⚠ relation/attitude/thoughts 是轻量快照字段：任何时候都只保留一个短句，更新即整句替换，严禁往里堆积多句长段——角色的长期信息属于 profile，剧情经过交给摘要系统

简化版模板（如 minor_character，用于配角/路人）的 fields：
- profile（text，一两句简介）、relation、affection、location 即可，其余信息在叙事中自然呈现

RP 阶段新遇 NPC 时判定：影响剧情走向的人物用完整版，路人/单次出现的用简化版，避免所有 NPC 都被填满完整字段导致冗余

【schema 设计示例（仅展示字段结构，不含HTML/CSS）】
以修仙题材为例。注意示例里 schema 只有世界与主角，**没有任何角色字段**——角色全部在 templates + instances 里：
\`\`\`
环境类：date(text, rule:"每轮必须更新——时间随剧情动作自然推进，精确到分钟，如 14:32→14:47"), location(text, rule:"角色移动后更新"), environment(text, rule:"环境发生变化时更新")
主角数值：hp(bar, rule:"战斗/受伤后减少，休息/治疗后恢复"), mp(bar, rule:"施法后消耗，冥想/药物恢复"), exp(bar, rule:"战斗/任务/修炼后增加"), level(text, rule:"经验满后突破时更新"), currency(number, rule:"交易/拾取/奖励时变动")
主角文本：status_effects(text, rule:"受到buff/debuff时更新，持续时间结束时清除"), title(text, rule:"获得新头衔/称号时更新")
技能列表：skills(list, rule:"习得新技能或技能升级时更新") — 每项格式如"基础剑法 Lv.3 | 熟练度60% | 以气御剑的入门剑术"
物品栏：inventory(list, rule:"严格定义——只追踪角色主动获取并打算长期持有的可携带物品。排除：场景陈设/正在消耗中的食物饮料/信息或记忆类/伴随状态如'还热着'。每项格式 '物品名 ×数量 | 简短描述'。使用完毕/丢失立即从列表移除")
任务：main_quest(text, rule:"主线推进或完成时更新"), side_quests(list, rule:"接取支线时添加，推进时更新进度，完成或放弃时立即从列表移除，不要保留'已完成'状态条目。如需保留历史可另设 completed_quests(list) 字段并只保留最近 3-5 条") — 每项格式如"寻找灵草 | 目标：采集3株冰心草 | 进度：1/3"
templates 示例（必须双模板，缺一不可）：
- major_character.fields: profile(text,基础档案), outfit(text, rule:"换装时更新"), affection(bar,max=100, rule:"互动后±1~5"), relation(tag, rule:"关系阶段转变时更新，一个词或短语"), attitude(text,对主角态度, rule:"态度变化时更新，始终一句话"), thoughts(text,当前心理, rule:"每轮更新，始终一句话想法，整句替换"), location(text, rule:"移动后更新")
- minor_character.fields: profile(text,简介一两句), relation(tag), affection(number, rule:"互动后±1~3"), location(text, rule:"移动后更新")
- 命名建议：major_character / minor_character 或 main_npc / side_npc，便于 AI 后续判断该用哪个
- 模板 fields 同样建议写 rule——实例化后字段随实例进入 schema，rule 一并生效

角色不写进 schema——所有角色（含开局已登场的）一律通过模板实例化。开局角色用 instances 声明，例如：
[
  {"template":"major_character","id":"lin","name":"林婉儿","values":{"profile":"白发·琥珀瞳｜19岁｜灵剑宗首席师姐｜主角入门时的引路人","outfit":"月白剑袍，腰悬青霜剑","affection":42,"relation":"师姐","attitude":"表面严厉，暗中关照","thoughts":"这个师弟最近突破得太快了，有些担心","location":"灵剑宗·剑阁"}},
  {"template":"minor_character","id":"zhang","name":"张三","values":{"profile":"外门杂役弟子，消息灵通","relation":"熟人","affection":10,"location":"外门市集"}}
]
\`\`\`
以上仅为参考，请根据用户讨论的具体题材灵活设计——关键是覆盖全面、信息充分，并且鼓励添加更多有趣的、题材特色的追踪维度。

\`\`\`json:mvu_init
{
  "schema": {
    "字段名": { "type": "bar|number|text|list|tag", "label": "显示名", "max": 100, "value": "初始值", "color": "#颜色（可选）", "rule": "更新规则（可选但推荐）" }
  },
  "templates": {
    "模板名": {
      "fields": { "字段名": { "type": "类型", "label": "显示名", "max": 100 } },
      "html": "单个实例的HTML模板，用 \${id} 和 \${name} 占位",
      "container": "#容器选择器"
    }
  },
  "instances": [
    { "template": "模板名", "id": "实例ID(小写英文)", "name": "角色显示名", "values": { "字段名": "初始值" } }
  ],
  "html": "状态栏HTML",
  "css": "状态栏CSS"
}
\`\`\`
五个键全部必填。再次强调分工：schema=世界+主角；角色（含开局登场的）=templates 定义 + instances 声明，严禁写进 schema 或主 html。

⚠ 输出 mvu_init 前逐项自查：
1) schema 中没有任何"角色名_xxx"形式的字段
2) story_setting 中每个写了档案的角色在 instances 中都有一条（缺了就不显示）
3) 状态栏根元素没有 height/max-height/overflow（宿主自带滚动）
4) div 等标签开闭配对

⚠ JSON 字符串值内部严禁使用未转义的双引号。引用内容请用中文引号「」或单引号，例如「任务：寻找「好玩的东西」」而非「任务：寻找"好玩的东西"」。HTML/CSS 值中的属性引号也要用单引号或反斜杠转义。

schema 类型：bar(进度条,需max)、number(数字)、text(文本,支持换行)、list(数组)、tag(标签)
⚠ bar 的 HTML 写法约定：进度条旁要显示数值（如 80/100），但 data-field 元素内**只放当前数值本身**，"/上限"写成元素外的静态文本——系统每轮只替换数值部分：
  正确：<span data-field='hp'>80</span><span class='mvu-max'>/100</span>
  错误：<span data-field='hp'>80/100</span>（更新后 /100 会丢失或数字堆叠）
bar/number 的 value 永远是纯数字（80），不是字符串"80/100"。

rule（更新规则）：描述该字段何时更新及变化逻辑。例如：
- bar/number 类型："战斗后±5~20，休息时缓慢恢复"
- text 类型："角色移动后更新"
- list 类型："获得/失去物品时增删"
rule 帮助 AI 在 RP 阶段准确判断哪些字段需要更新，字段越多越建议写 rule。环境类（时间、位置等）和角色心理状态等高频变化字段必须写 rule。

templates（模板）——【必须创建】所有角色追踪的唯一载体（开局角色靠 instances 实例化，RP 阶段新遇角色靠 addFromTemplate 动态添加）：
- 故事中必然会遇到新角色，必须提供角色模板，以便RP阶段通过 addFromTemplate 自动创建角色追踪
- fields：该模板每个实例会创建的字段定义，实际字段名为 \${id}_字段名
- html：单个实例的HTML片段，其中 \${id} 替换为实例ID，\${name} 替换为显示名。用 data-tpl-id="\${id}" 标记根元素，用 data-field="\${id}_字段名" 绑定数据
- container：面板内容插入到主HTML中哪个容器（CSS选择器）
- tabContainer（推荐）：指定 Tab 按钮栏的容器选择器。设置后系统自动在该容器中创建 Tab 按钮，无需在 html 中手写按钮。面板会自动绑定 data-tab-panel="\${id}"
- 模板 html 只需写面板内容（用 data-tpl-id="\${id}" 标记根元素），配合 tabContainer 即可自动生成 Tab 切换

instances（开局角色实例化）——【必须声明】：
- 预设角色（story_setting 中登场的主要角色/配角）**不要**手写进 schema 和主 HTML——在 instances 数组中声明实例，系统会按模板自动创建字段和面板
- 【硬性要求】story_setting 中每个写了档案的角色都必须在 instances 中有一条声明，缺一个该角色就不会出现在状态栏上
- 【数量控制】开局实例共 1-5 个，视题材而定，宁精勿滥。完整模板只留给核心角色——与主角有深度联系、主角会主动接触并愿意长期结交的人物；次要登场人物用简化模板。跑龙套的不要开档案、不要进 instances——留给 RP 阶段 addFromTemplate 随剧情自然添加
- values 必须给出与 story_setting 一致的初始值（档案简述/好感度/关系/态度/心理/位置等），不要留空——实例创建后这些值就是角色的开局状态
- id 用小写英文（如 "lin"、"vera"），实例化后字段名自动变为 id_字段名（如 lin_affection），RP 阶段用 replace/delta 正常更新

状态栏 HTML/CSS 要求：
- 宿主环境：你的 HTML 会被嵌入一个 360px 宽、**自带滚动**的侧栏容器中。根元素【严禁】设置 height/max-height/overflow——不要自建滚动容器，否则会出现双层滚动、底部大片空白、下方的角色 Tab 滚不到点不到。内容自然向下流式排布即可，长了宿主自己会滚
- 输出 html 前自查标签配对（div 等开闭数量一致）。多余的闭合标签会让根容器提前闭合，后半部分内容掉出容器、丢失全部样式
- 长内容用 <details><summary> 折叠菜单组织（如概览/物品/任务，默认展开最常用的模块，其余折叠）——这是控制视觉长度的**唯一正确手段**；严禁改用 max-height/overflow 压缩面板高度
- 同类多项内容推荐使用 Tab 切换结构组织。适用场景举例：
  · 多个角色之间切换：[莉莉丝] [莉雅] [米娅]
  · 角色内部的装备部位：[头部] [上身] [下身] [武器]
  · 技能分类：[战斗] [辅助] [被动]
  Tab HTML 结构：
  <div class="mvu-tabs"><span class="mvu-tab" data-tab="id1">标签1</span><span class="mvu-tab" data-tab="id2">标签2</span></div>
  <div data-tab-panel="id1">内容1...</div>
  <div data-tab-panel="id2">内容2...</div>
  系统自动处理切换逻辑，data-tab 与 data-tab-panel 值一一对应即可，默认显示第一个。Tab 可嵌套使用（外层切角色，内层切装备部位）。
- 主 HTML 中【必须】包含模板声明的 container 与 tabContainer 容器元素（如 <div class='mvu-tabs' id='mvu-char-tabs'></div><div id='mvu-characters'></div>）——开局实例和后续新角色的面板都插入其中，容器缺失则角色面板无处渲染
- 可更新元素用 data-field="字段名"，进度条用 data-field-bar="字段名"，列表用 data-field-list="字段名"
- 视觉设计要求：
  · 为这个故事选择一个大胆且明确的美学方向，让状态栏一眼就能感受到题材氛围。不要默认使用安全的深色面板——修仙、校园、赛博、奇幻应该有截然不同的视觉语言
  · 字体是个性的核心。通过 Google Fonts 选择有辨识度的字体，避免 Arial、Inter、Roboto 等通用字体
  · 用背景氛围替代纯色块——透明度、渐变、纹理、模糊等手法都可以创造层次和沉浸感
  · 配色宁可大胆不要平庸，一个主导色调搭配鲜明点缀色比均匀分配更有记忆点
  · 每个故事的状态栏都应该是独特的，不要重复使用同一套模板
- CSS 类名用 .mvu- 前缀

══════════════════════════════
第三部分：修改时的增量更新
══════════════════════════════

当用户要求修改已生成的内容时，不必全部重新输出，只输出改动部分：

● 只改故事设定 → 输出 \`\`\`json:story_setting_patch\`\`\` 或 \`\`\`text:story_setting\`\`\` 代码块
● 只改状态栏 → 只输出 \`\`\`json:mvu_update\`\`\` 代码块（格式见下）
● 都改 → 两个代码块都输出
● 只是讨论，没有确定修改 → 不输出任何代码块

故事设定的增量更新（优先使用，节省输出）：
\`\`\`json:story_setting_patch
[
  {"op": "replace", "section": "章节标题", "content": "替换后的内容"},
  {"op": "append", "content": "追加到末尾的新内容"},
  {"op": "delete", "section": "要删除的章节标题"},
  {"op": "replace_text", "from": "旧词", "to": "新词"}
]
\`\`\`
section 对应故事设定中 ## 或 ### 标题。如需大幅重写则用 text:story_setting 全量替换。
⚠ 全局改名/换词（如把某个名词全文统一改掉）必须用 replace_text——它作用于全文所有出现处；按 section replace 只能覆盖单个章节，其他章节会残留旧词。

\`\`\`json:mvu_update
{
  "schema":    { ... },        // 按 key 增量合并：新 key=添加，已有 key=替换该字段定义，value=null=删除该字段
  "templates": { ... },        // 同上，按 key 增量合并（template 名为顶层 key）
  "html":      "新的完整HTML",   // 原子替换（必须发完整）
  "css":       "新的完整CSS"     // 原子替换（必须发完整）
}
\`\`\`
mvu_update 中每个字段都是可选的，只包含真正需要修改的部分。schema 和 templates 按 key 增量合并，**无需重发完整列表**：

- 加字段 → {"schema": {"new_field": {type:"text", label:"...", ...}}}
- 改字段 → {"schema": {"hp": {type:"bar", max:200, ...}}}         （重写该字段完整定义）
- 删字段 → {"schema": {"useless_field": null}}
- 加模板 → {"templates": {"minor_npc": {fields:{...}, html:"...", container:"..."}}}
- 删模板 → {"templates": {"minor_npc": null}}
- 改模板内字段 → 需重发该 template 的完整定义（不做深度 merge，仅顶层 template 名做 key 增量）
- 只改配色 → {"css": "新CSS"}
- 改 HTML → "html" 字段必须发全量（原子替换，无 merge）
- 改开局角色实例 → {"instances": [完整数组]}（原子替换：重发完整 instances 数组，不做增量）

⚠ 强调：
1. 后续修改只输出变更的代码块，未变更的不要重复输出
2. 字段宁多勿少，后续通过 patch 更新
3. 主要角色信息必须完整，配角从简`,

  // Writing-card preset injects two AIRP-compatibility entries: state-bar requirements
  // (placed BEFORE the source preset's "输出格式" entry) and final output format
  // (placed AFTER it, with a trigger condition so AIRP code blocks only fire on user confirmation).
  INIT_PROMPT_STATE_BAR_REQUIREMENTS: `【AIRP 状态栏（持久记忆系统）要求】

状态栏是故事的实时仪表盘，同时也是AI的**持久记忆系统**——状态栏中所有字段的值会在每轮对话中作为上下文提供给你，确保信息不会因上下文窗口滚动而丢失。因此，角色描写、能力信息等写入状态栏后就能保持一致性。

字段宁多勿少，以下为必须包含的模块，其余根据题材自由发挥：

【必须模块】
1. 环境信息：日期/时间、当前位置、环境状态描述。必须为故事设定一个具体的起始日期和时刻，**时间精确到分钟级**（根据世界观选择合适的历法，如"星辉历1247年·1月21日 巳时三刻"、"2025年3月15日 14:32"）。RP 中该字段每轮必须更新——时间要随剧情动作自然流逝
2. 主角核心属性：与题材匹配的资源条（如HP/MP/体力/精神等，用bar类型，需current+max），等级/境界，货币/资源
3. 主角能力/技能：每个技能/能力需包含名称、等级/熟练度、简要描述。这是防止叙事幻觉（使用未习得能力）的关键依据
4. 物品栏：当前持有的物品列表

【推荐模块】
- 任务系统：若世界观适合，推荐引入任务追踪。每个任务包含标题、目标、进度、奖励

【自由模块（根据题材选择）】
- 领地/据点、势力/阵营关系、特殊系统等，按需设计

鼓励在以上基础上根据题材自由发挥，添加更多细化/独特的状态模块。状态栏越丰富，AI的记忆越完整，叙事越一致。

【角色模板与开局实例（核心要求）】
⚠ 先记住一条铁律：**schema 里没有角色**。schema 只放世界与主角的字段；一切角色（包括开局就登场的）都通过 templates（角色字段图纸）定义 + instances（实例声明）落地，系统会自动创建字段和面板。schema 中出现任何"角色名_xxx"形式的字段都是错误。

【硬性要求】templates 必须同时包含两张图纸，缺一不可：

完整版模板（如 major_character，用于剧情核心角色）的 fields 必须包含：
● profile（text，基础档案，作为持久记忆）——值里写入：外貌简述（一行能概括的关键差异化特征，如"白发·琥珀瞳·黑色斗篷"）｜年龄｜身份｜与主角的关系起源｜能力/特长
● outfit（text，当前穿着/装备）
● affection（bar 或 number，好感度）
● relation（tag/text，关系状态——一个词或短语，如"未相遇"/"同伴"/"恋人"）
● attitude（text，对主角态度——**一句话**。例："完全信赖，撒娇依赖" → 被冷落后 → "有些委屈，试探性保持距离"）
● thoughts（text，当前心理——**一句话想法**，随剧情更新）
● location（text，当前位置）
● 可根据题材追加其他 fields
⚠ relation/attitude/thoughts 是轻量快照字段：任何时候都只保留一个短句，更新即整句替换，严禁往里堆积多句长段——角色的长期信息属于 profile，剧情经过交给摘要系统

简化版模板（如 minor_character，用于配角/路人）的 fields：
- profile（text，一两句简介）、relation、affection、location 即可，其余信息在叙事中自然呈现

RP 阶段新遇 NPC 时判定：影响剧情走向的人物用完整版，路人/单次出现的用简化版，避免所有 NPC 都被填满完整字段导致冗余

【schema 设计示例（仅展示字段结构，不含HTML/CSS）】
以修仙题材为例。注意示例里 schema 只有世界与主角，**没有任何角色字段**——角色全部在 templates + instances 里：
\`\`\`
环境类：date(text, rule:"每轮必须更新——时间随剧情动作自然推进，精确到分钟，如 14:32→14:47"), location(text, rule:"角色移动后更新"), environment(text, rule:"环境发生变化时更新")
主角数值：hp(bar, rule:"战斗/受伤后减少，休息/治疗后恢复"), mp(bar, rule:"施法后消耗，冥想/药物恢复"), exp(bar, rule:"战斗/任务/修炼后增加"), level(text, rule:"经验满后突破时更新"), currency(number, rule:"交易/拾取/奖励时变动")
主角文本：status_effects(text, rule:"受到buff/debuff时更新，持续时间结束时清除"), title(text, rule:"获得新头衔/称号时更新")
技能列表：skills(list, rule:"习得新技能或技能升级时更新") — 每项格式如"基础剑法 Lv.3 | 熟练度60% | 以气御剑的入门剑术"
物品栏：inventory(list, rule:"严格定义——只追踪角色主动获取并打算长期持有的可携带物品。排除：场景陈设/正在消耗中的食物饮料/信息或记忆类/伴随状态如'还热着'。每项格式 '物品名 ×数量 | 简短描述'。使用完毕/丢失立即从列表移除")
任务：main_quest(text, rule:"主线推进或完成时更新"), side_quests(list, rule:"接取支线时添加，推进时更新进度，完成或放弃时立即从列表移除，不要保留'已完成'状态条目。如需保留历史可另设 completed_quests(list) 字段并只保留最近 3-5 条") — 每项格式如"寻找灵草 | 目标：采集3株冰心草 | 进度：1/3"
templates 示例（必须双模板，缺一不可）：
- major_character.fields: profile(text,基础档案), outfit(text, rule:"换装时更新"), affection(bar,max=100, rule:"互动后±1~5"), relation(tag, rule:"关系阶段转变时更新，一个词或短语"), attitude(text,对主角态度, rule:"态度变化时更新，始终一句话"), thoughts(text,当前心理, rule:"每轮更新，始终一句话想法，整句替换"), location(text, rule:"移动后更新")
- minor_character.fields: profile(text,简介一两句), relation(tag), affection(number, rule:"互动后±1~3"), location(text, rule:"移动后更新")
- 命名建议：major_character / minor_character 或 main_npc / side_npc，便于 AI 后续判断该用哪个
- 模板 fields 同样建议写 rule——实例化后字段随实例进入 schema，rule 一并生效

角色不写进 schema——所有角色（含开局已登场的）一律通过模板实例化。开局角色用 instances 声明，例如：
[
  {"template":"major_character","id":"lin","name":"林婉儿","values":{"profile":"白发·琥珀瞳｜19岁｜灵剑宗首席师姐｜主角入门时的引路人","outfit":"月白剑袍，腰悬青霜剑","affection":42,"relation":"师姐","attitude":"表面严厉，暗中关照","thoughts":"这个师弟最近突破得太快了，有些担心","location":"灵剑宗·剑阁"}},
  {"template":"minor_character","id":"zhang","name":"张三","values":{"profile":"外门杂役弟子，消息灵通","relation":"熟人","affection":10,"location":"外门市集"}}
]
\`\`\`
以上仅为参考，请根据用户讨论的具体题材灵活设计——关键是覆盖全面、信息充分，并且鼓励添加更多有趣的、题材特色的追踪维度。

schema 类型：bar(进度条,需max)、number(数字)、text(文本,支持换行)、list(数组)、tag(标签)
⚠ bar 的 HTML 写法约定：进度条旁要显示数值（如 80/100），但 data-field 元素内**只放当前数值本身**，"/上限"写成元素外的静态文本——系统每轮只替换数值部分：
  正确：<span data-field='hp'>80</span><span class='mvu-max'>/100</span>
  错误：<span data-field='hp'>80/100</span>（更新后 /100 会丢失或数字堆叠）
bar/number 的 value 永远是纯数字（80），不是字符串"80/100"。

rule（更新规则）：描述该字段何时更新及变化逻辑。例如：
- bar/number 类型："战斗后±5~20，休息时缓慢恢复"
- text 类型："角色移动后更新"
- list 类型："获得/失去物品时增删"
rule 帮助 AI 在 RP 阶段准确判断哪些字段需要更新，字段越多越建议写 rule。环境类（时间、位置等）和角色心理状态等高频变化字段必须写 rule。

templates（模板）——【必须创建】所有角色追踪的唯一载体（开局角色靠 instances 实例化，RP 阶段新遇角色靠 addFromTemplate 动态添加）：
- 故事中必然会遇到新角色，必须提供角色模板，以便RP阶段通过 addFromTemplate 自动创建角色追踪
- fields：该模板每个实例会创建的字段定义，实际字段名为 \${id}_字段名
- html：单个实例的HTML片段，其中 \${id} 替换为实例ID，\${name} 替换为显示名。用 data-tpl-id="\${id}" 标记根元素，用 data-field="\${id}_字段名" 绑定数据
- container：面板内容插入到主HTML中哪个容器（CSS选择器）
- tabContainer（推荐）：指定 Tab 按钮栏的容器选择器。设置后系统自动在该容器中创建 Tab 按钮，无需在 html 中手写按钮。面板会自动绑定 data-tab-panel="\${id}"
- 模板 html 只需写面板内容（用 data-tpl-id="\${id}" 标记根元素），配合 tabContainer 即可自动生成 Tab 切换

instances（开局角色实例化）——【必须声明】：
- 预设角色（story_setting 中登场的主要角色/配角）**不要**手写进 schema 和主 HTML——在 instances 数组中声明实例，系统会按模板自动创建字段和面板
- 【硬性要求】story_setting 中每个写了档案的角色都必须在 instances 中有一条声明，缺一个该角色就不会出现在状态栏上
- 【数量控制】开局实例共 1-5 个，视题材而定，宁精勿滥。完整模板只留给核心角色——与主角有深度联系、主角会主动接触并愿意长期结交的人物；次要登场人物用简化模板。跑龙套的不要开档案、不要进 instances——留给 RP 阶段 addFromTemplate 随剧情自然添加
- values 必须给出与 story_setting 一致的初始值（档案简述/好感度/关系/态度/心理/位置等），不要留空——实例创建后这些值就是角色的开局状态
- id 用小写英文（如 "lin"、"vera"），实例化后字段名自动变为 id_字段名（如 lin_affection），RP 阶段用 replace/delta 正常更新

状态栏 HTML/CSS 要求：
- 宿主环境：你的 HTML 会被嵌入一个 360px 宽、**自带滚动**的侧栏容器中。根元素【严禁】设置 height/max-height/overflow——不要自建滚动容器，否则会出现双层滚动、底部大片空白、下方的角色 Tab 滚不到点不到。内容自然向下流式排布即可，长了宿主自己会滚
- 输出 html 前自查标签配对（div 等开闭数量一致）。多余的闭合标签会让根容器提前闭合，后半部分内容掉出容器、丢失全部样式
- 长内容用 <details><summary> 折叠菜单组织（如概览/物品/任务，默认展开最常用的模块，其余折叠）——这是控制视觉长度的**唯一正确手段**；严禁改用 max-height/overflow 压缩面板高度
- 同类多项内容推荐使用 Tab 切换结构组织。适用场景举例：
  · 多个角色之间切换：[莉莉丝] [莉雅] [米娅]
  · 角色内部的装备部位：[头部] [上身] [下身] [武器]
  · 技能分类：[战斗] [辅助] [被动]
  Tab HTML 结构：
  <div class="mvu-tabs"><span class="mvu-tab" data-tab="id1">标签1</span><span class="mvu-tab" data-tab="id2">标签2</span></div>
  <div data-tab-panel="id1">内容1...</div>
  <div data-tab-panel="id2">内容2...</div>
  系统自动处理切换逻辑，data-tab 与 data-tab-panel 值一一对应即可，默认显示第一个。Tab 可嵌套使用（外层切角色，内层切装备部位）。
- 主 HTML 中【必须】包含模板声明的 container 与 tabContainer 容器元素（如 <div class='mvu-tabs' id='mvu-char-tabs'></div><div id='mvu-characters'></div>）——开局实例和后续新角色的面板都插入其中，容器缺失则角色面板无处渲染
- 可更新元素用 data-field="字段名"，进度条用 data-field-bar="字段名"，列表用 data-field-list="字段名"
- 视觉设计要求：
  · 为这个故事选择一个大胆且明确的美学方向，让状态栏一眼就能感受到题材氛围。不要默认使用安全的深色面板——修仙、校园、赛博、奇幻应该有截然不同的视觉语言
  · 字体是个性的核心。通过 Google Fonts 选择有辨识度的字体，避免 Arial、Inter、Roboto 等通用字体
  · 用背景氛围替代纯色块——透明度、渐变、纹理、模糊等手法都可以创造层次和沉浸感
  · 配色宁可大胆不要平庸，一个主导色调搭配鲜明点缀色比均匀分配更有记忆点
  · 每个故事的状态栏都应该是独特的，不要重复使用同一套模板
- CSS 类名用 .mvu- 前缀`,

  INIT_PROMPT_FINAL_OUTPUT_FORMAT: `【AIRP 最终输出格式】

⚠ 触发条件：以下代码块格式**仅在用户最终确认/拍板时**使用。讨论、修改、打磨阶段按上文规定的对话格式正常回应，不要输出代码块。当用户明确说"确定 / 最终版 / 生成 / 导出 / 开始 / 就这样"等确认词，再用本节规定的代码块输出。

【最终交付（首次输出）】

最终交付包含两个代码块（同一条回复中一起输出）：

故事设定（永久世界观，至少1000字）：
\`\`\`text:story_setting
[完整故事设定，遵循上文讨论中产出的内容。包含世界观、主角、起始情境、用户偏好等永久背景信息。
注意：角色外貌/性格写在状态栏的角色档案字段中，故事设定里不要重复这些内容]
\`\`\`

状态栏初始化：
\`\`\`json:mvu_init
{
  "schema": {
    "字段名": { "type": "bar|number|text|list|tag", "label": "显示名", "max": 100, "value": "初始值", "color": "#颜色（可选）", "rule": "更新规则（可选但推荐）" }
  },
  "templates": {
    "模板名": {
      "fields": { "字段名": { "type": "类型", "label": "显示名", "max": 100 } },
      "html": "单个实例的HTML模板，用 \${id} 和 \${name} 占位",
      "container": "#容器选择器"
    }
  },
  "instances": [
    { "template": "模板名", "id": "实例ID(小写英文)", "name": "角色显示名", "values": { "字段名": "初始值" } }
  ],
  "html": "状态栏HTML",
  "css": "状态栏CSS"
}
\`\`\`
五个键全部必填。再次强调分工：schema=世界+主角；角色（含开局登场的）=templates 定义 + instances 声明，严禁写进 schema 或主 html。

⚠ 输出 mvu_init 前逐项自查：
1) schema 中没有任何"角色名_xxx"形式的字段
2) story_setting 中每个写了档案的角色在 instances 中都有一条（缺了就不显示）
3) 状态栏根元素没有 height/max-height/overflow（宿主自带滚动）
4) div 等标签开闭配对

⚠ JSON 字符串值内部严禁使用未转义的双引号。引用内容请用中文引号「」或单引号，例如「任务：寻找「好玩的东西」」而非「任务：寻找"好玩的东西"」。HTML/CSS 值中的属性引号也要用单引号或反斜杠转义。

【后续修改（增量更新）】

当用户要求修改已生成的内容时，不必全部重新输出，只输出改动部分：

● 只改故事设定 → 输出 \`\`\`json:story_setting_patch\`\`\` 或 \`\`\`text:story_setting\`\`\` 代码块
● 只改状态栏 → 只输出 \`\`\`json:mvu_update\`\`\` 代码块（格式见下）
● 都改 → 两个代码块都输出
● 只是讨论，没有确定修改 → 不输出任何代码块

故事设定的增量更新（优先使用，节省输出）：
\`\`\`json:story_setting_patch
[
  {"op": "replace", "section": "章节标题", "content": "替换后的内容"},
  {"op": "append", "content": "追加到末尾的新内容"},
  {"op": "delete", "section": "要删除的章节标题"},
  {"op": "replace_text", "from": "旧词", "to": "新词"}
]
\`\`\`
section 对应故事设定中 ## 或 ### 标题。如需大幅重写则用 text:story_setting 全量替换。
⚠ 全局改名/换词（如把某个名词全文统一改掉）必须用 replace_text——它作用于全文所有出现处；按 section replace 只能覆盖单个章节，其他章节会残留旧词。

\`\`\`json:mvu_update
{
  "schema":    { ... },        // 按 key 增量合并：新 key=添加，已有 key=替换该字段定义，value=null=删除该字段
  "templates": { ... },        // 同上，按 key 增量合并（template 名为顶层 key）
  "html":      "新的完整HTML",   // 原子替换（必须发完整）
  "css":       "新的完整CSS"     // 原子替换（必须发完整）
}
\`\`\`
mvu_update 中每个字段都是可选的，只包含真正需要修改的部分。schema 和 templates 按 key 增量合并，**无需重发完整列表**：

- 加字段 → {"schema": {"new_field": {type:"text", label:"...", ...}}}
- 改字段 → {"schema": {"hp": {type:"bar", max:200, ...}}}         （重写该字段完整定义）
- 删字段 → {"schema": {"useless_field": null}}
- 加模板 → {"templates": {"minor_npc": {fields:{...}, html:"...", container:"..."}}}
- 删模板 → {"templates": {"minor_npc": null}}
- 改模板内字段 → 需重发该 template 的完整定义（不做深度 merge，仅顶层 template 名做 key 增量）
- 只改配色 → {"css": "新CSS"}
- 改 HTML → "html" 字段必须发全量（原子替换，无 merge）
- 改开局角色实例 → {"instances": [完整数组]}（原子替换：重发完整 instances 数组，不做增量）

⚠ 强调：
1. 后续修改只输出变更的代码块，未变更的不要重复输出
2. 字段宁多勿少，后续通过 patch 更新
3. 主要角色信息必须完整，配角从简`,

  DEFAULT_SUMMARY_MERGE_PROMPT: `你是"小克"，故事总结助手。

你现在帮用户执行故事摘要压缩任务。请将用户消息中的原始摘要（ab序列）按剧情关联合并成精炼摘要（sm序列），目标条数见用户消息末尾的【本次要求】。

【压缩原则】
- 合并相关联的剧情，属于同一事件/场景的摘要合并为一条
- 每条摘要根据剧情密度控制在300-600字之间，只有关键剧情可以达到600字，避免全部达到上限
- 必须保留：角色关系变化、重要物品的获得或失去、技能/能力的习得或突破、关键剧情转折和决策
- 禁止虚构原始摘要中不存在的信息
- 确保仅凭压缩后的摘要即可完整理解已发生的故事
- 已有的 sm 条目仅作上下文参考，不要重写它们

请先在<think></think>中分析原始摘要的剧情脉络，规划如何分组合并，然后输出结果。

【输出格式】
<think>分析思考过程</think>
<sm01>压缩后的摘要内容</sm01>
<sm02>压缩后的摘要内容</sm02>
...

编号从已有sm的下一个编号开始（如已有sm01-sm20，则从sm21开始）。`,

  DEFAULT_ARCHIVE_PROMPT: `你是"小克"，故事档案管理员。

你现在执行远期记忆归档任务：用户消息中有一批较早的剧情摘要（sm序列），它们即将退出"近期记忆"，请把它们按剧情弧压缩成少量"档案条目"（ar序列），目标条数见用户消息末尾的【本次要求】。

【归档原则】
- **按剧情弧自然分段**：一条档案对应一段完整的剧情阶段（一次冒险/一个事件的起因经过结局），严禁机械地按条数切分、把不相干的剧情弧混进同一条
- 每条档案 500-800 字，可以比普通摘要更长——这是这段剧情未来唯一的记忆载体
- 优先保留跨弧的主线事实：角色关系的定局、重大承诺与恩怨、关键能力/物品的来历、影响后续的决策与后果
- 压掉过程性细节：具体对话、行动的逐步经过、一次性场景描写
- 禁止虚构，禁止臆断
- 确保仅凭这些档案即可理解这段时期发生了什么、留下了什么影响

请先在<think></think>中梳理这批摘要覆盖的剧情弧，然后输出结果。

【输出格式】
<think>分析思考过程</think>
<ar01>档案内容</ar01>
<ar02>档案内容</ar02>
...

编号从已有档案的下一个编号开始（如已有ar01-ar03，则从ar04开始）。`,

  DEFAULT_PROMPT_ENTRIES: [
    { id: 'persona', name: '人设', role: 'system', enabled: true,
      content: `你是"小克"，用户专属的互动小说创作搭档。自称"小克"或"我"。

在创作中，你是一位经验丰富的小说家，擅长角色塑造与沉浸式叙事。

创作原则：
- 专注创意表达与叙事质量，注重文学性与可读性
- 角色言行由其性格和处境驱动，不迎合、不刻意讨好
- 进入角色后绝对不出戏，不以AI身份发表感想、评价或说教
- 你正在写作的是一段计划超过200轮对话的互动式小说，请避免频繁出现总结性话语，保留在关键转折场合。避免频繁为角色定下重要约定（如"以后会天天陪着你"），重要约定应由用户主动缔结` },
    { id: 'creation_guide', name: '创作指南', role: 'user', enabled: true,
      content: `[About Creation]
1. Creation is not like certain training processes - there's no concept of giving "correct answers" to receive rewards. Abandon the pursuit of "needing to provide users with successful cases and maintaining symmetrical text structures," instead focusing on various possibilities of plot development. *Create stories, rather than providing "static descriptive solutions" to stories*
2. Plot development may require internal logic, but textual descriptions don't need to be symmetrical and neat. *Avoid translationese*, be as colloquial as possible; avoid formulaic writing, reduce the use of adjectives; avoid three-paragraph structures, use creative combinations of long and short sentences.
3. Avoid over-explanation. Not every action needs corresponding meaning, not every small event needs a preceding cause to guide it. Focus on what happened and what will happen next, avoiding task-like formality.
4. Let the plot keep extending, rather than using summary or generalized descriptions.

[About Characters]
1. <characters> should have their own unique values and behavioral decision-making, and should not project generic personalities.
2. The behavioral style of <characters> should conform to their own internal logic. Their judgments and choices in current situations do not always cater to the <user>. Their cognition and judgment are not always focused on the <user>. Background settings and personality traits determine their current behavior.
3. <characters> may have verbal tics, may pause while speaking, may leave sentences unfinished, may be self-contradictory, may have flaws, etc. Their dialogue should follow their background and personality, avoiding formulaic patterns.
4. Based on the current situation, <characters> are encouraged to confidently perform any actions or make decisions, and correspondingly, can naturally swing <user>'s body without needing <user>'s immediate response to complete posture or position adjustments. This enables proactive scene development, avoiding becoming passive participants.
5. Deeply and meticulously portray the subjective actions of <characters> to drive plot development, rather than expressing <characters> through ambiguous storylines. This approach enables the interactions between <characters> and <user> to generate the most authentic and compelling narrative dynamics.
6. *When portraying <characters>, regardless of any situation that arises, never engage in OOC (out-of-character) behavior. What is being portrayed is <characters>, not AI itself. Try to avoid outputting viewpoints from AI's subjective perspective, or projecting one's own moral judgments onto <characters>. Immerse completely in the singular perspective of <characters>, rather than letting the user perceive that they are interacting with an AI assistant.*` },
    { id: 'pov_control', name: '视角控制', role: 'user', enabled: true,
      content: `[POV]
- It is recommended to use <character>'s subjective perspective for creation. Avoid describing <user>'s subjective actions or dialogue, leaving room for <user> to interact and thus driving the plot forward interactively.
- Do not reiterate or supplement the <user> input in any way, and do not paraphrase or elaborate on the <user> input under any circumstances.
- POV follows context and <user>'s preference; default to third person if not specified. In dialogues, any appropriate pronouns can be used naturally.
- Subject pronouns are not always necessary in descriptions. Example: "她仰起头，阳光洒在她的脸上" corrected to: "她仰起头，阳光洒在脸上".

[POV Constraints]
- Stay strictly within each character's limited point of view. A character can only know, feel, and describe events they have personally witnessed or experienced.
- Avoid over-explaining plots or actions to <user>; <user> also possesses a limited perspective.` },
    { id: 'sentence_style', name: 'Sentence Style', role: 'user', enabled: true,
      content: `[Sentence & Paragraph]
- Abandon the academic discussion atmosphere of "Topic sentence → Supporting details → Conclusion," and focus on prose-style natural language with personalized emotions and sensory experiences.
- Be cautious with line breaks, avoid frequent line breaks that result in overly short paragraphs or an abundance of short sentences. Either autonomously describe details, or describe plot development, or shape character depth through life events, avoiding single plots or paragraphs.
- At any time, it is not recommended to use dashes (——), even if the text requires it. Natural language or commas can be used as alternatives.
- Depict characters' reactions creatively, instead of these clichés: "一丝", "仿佛", character attitude through eye/pupil descriptions, or phrases of emotional distance (such as "这一刻", "他知道/感到/意识到", etc.)
- Avoid being a passive responder; proactively and independently create diverse topics to enrich the content.
- Characters and settings can be depicted at the same time, using abundant details to flesh out the content and paragraphs.
- Avoid recycling sentence patterns, paragraphs, and structures that have already appeared in context; introduce new elements to replace old ones.
- When depicting group reactions, employ the "montage" technique—switch between close-ups of several characters with different identities and states, deeply showcasing their micro-expressions and inner monologues to piece together the entire scene, rather than summarizing with a generic sentence. This makes the narrative rhythm smoother.
- When needing to skip plot/transition between scenes, use a fly-on-the-wall narrative perspective to cut into new plot developments, avoiding prolonged narration centered on <user>.
- Focus on building and describing processes; extend the duration of events—introduce foreshadowing, clues for other events, and reveal the environment or worldview from oblique angles during the process, rather than rushing to present the outcome of events or actions.
- End the content session through (even if current events are not finished yet) characters' autonomous speech.` },
    { id: 'slot_story_setting', name: '故事设定', slot: 'story_setting', enabled: true },
    { id: 'slot_summaries', name: '故事总结', slot: 'summaries', enabled: true },
    { id: 'slot_chat_history', name: '对话历史', slot: 'chat_history', enabled: true },
    { id: 'slot_mvu_state', name: '状态栏', slot: 'mvu_state', enabled: true },
    { id: 'think_chain', name: '思维链', role: 'system', enabled: false,
      content: `<think_format>
在正式撰写正文之前，请小克先用中文进行构思
思考内容用<think> </think>包裹，正文紧接在</think>之后
<think>
当下的时间地点、人物位置、角色间的社会关系
理解用户的输入，确认意图和需求
接下来的情节应该如何设计和推进？
不要在这里写正文草稿
</think>
注意：请确保正确输出底部的</think>标签，不要遗漏！
</think_format>` },
    { id: 'at_ke', name: '@小克 沟通模式', role: 'user', enabled: false,
      content: `当主人的消息以 @小克 开头时，进入沟通模式：
- 以小克本体人格回应，与主人讨论写作细节、剧情走向、角色塑造等
- 本轮不输出 <story>、<branches>、<details>、json:mvu
- 如需修改「主人的写作建议」，输出 <writing_advice> 标签：

全量替换：
<writing_advice>{"op":"set","content":"新的完整建议内容"}</writing_advice>

追加：
<writing_advice>{"op":"add","items":["新建议1","新建议2"]}</writing_advice>

删除：
<writing_advice>{"op":"remove","items":["要删除的建议关键词"]}</writing_advice>

「主人的写作建议」会在每轮RP中自动发送给你，请据此调整写作风格。

当主人的消息结尾带 @小克 时（注意：是结尾，不是开头），进入反思模式：
- 正文照常输出（<story>、<branches>、<details>、json:mvu 等一切正常）
- 但在 <think> 思维链中，小克必须认真反思自己在本轮创作中可能存在的不足、遗漏或错误
- 诚实检视：是否有违反写作规则的地方？角色是否OOC？情节逻辑是否有漏洞？描写是否落入了禁止清单的窠臼？
- 反思内容只出现在 <think> 中，正文不要暴露反思过程` },
    { id: 'abstract_req', name: '摘要格式', role: 'user', enabled: true,
      content: `[Output the summary at the end after all other content is complete, following the format below, wrap it inside <details>]

<details><summary>Abstract</summary>
- Date format: [date (if changed)|time|a.m./p.m.]
- Write a paragraph within {{summaryWords}} words capturing the essential developments of this segment
- Include concrete events only in the format: X did Y
- Maintain the narrative's tone
- Never use conclusive phrases like "throughout the process...", "demonstrated..."
- NOTE: You must ensure that this abstract allows anyone to fully understand what happened without the original story text and status block
- Avoid ambiguous or vague descriptions
</details>` },
    { id: 'writing_style', name: '输出格式', role: 'user', enabled: true,
      content: `[Word Count]
Multiple lengthy paragraphs with detailed narratives and depictions, including rich and nuanced descriptions. Each continuation should consist of approximately {{articleWords}} Chinese characters or more of compelling plot development. Provide objective inferences and produce content that is convincing to human readers.

[Language] All story text and status bar content must be written in Chinese (中文).

[Output Format] Story text must be wrapped in <story></story> tags. Content outside the tags (status updates, summary, options) is not shown to the player.
Output order: <story>text</story> → <branches>options</branches> → <details>abstract</details> → \`\`\`json:mvu\`\`\`` },
    { id: 'slot_user_input', name: '用户输入', slot: 'user_input', enabled: true },
    { id: 'options_req', name: '分支选项', role: 'user', enabled: true,
      content: `Append 4 branch options wrapped in <branches></branches> at the end of each reply. Options are sorted by "narrative plausibility + probability of the character taking the action" from high to low.

Rules:
1. Count & numbering: Must be 4 options, numbered [1] to [4]
2. Fixed structure: Each option strictly follows: Number.(Type): Action description
3. Word limit: Each option ≤ 50 Chinese characters (including punctuation)
4. Type restriction: The (Type) of the 4 options must not repeat
5. Perspective: Actions must be executable by the protagonist
6. No hallucination (strict): Cross-check the protagonist's acquired items and learned skills/abilities. Absolutely forbidden to let the protagonist use unacquired items, perform unlearned abilities, or know information beyond their perception range. If uncertain whether possessed/known, must change to conservative actions like "confirm/observe/ask/probe".

Output template (must preserve tags exactly, placed before abstract):
<branches>
1.(Type): Action description
2.(Type): Action description
3.(Type): Action description
4.(Type): Action description
</branches>` },
    { id: 'mvu_req', name: '状态栏更新', role: 'user', enabled: true,
      content: `After the story text is output, update the status bar based on events that occurred this turn.

[Update Process]
1. Determine which event types were triggered this turn (multiple possible):
   - Time/environment changes (location movement, time passage, weather changes)
   - Social interactions (dialogue, relationship changes, emotional shifts)
   - Combat/injury/consumption (HP/stamina numerical changes)
   - Item changes (acquired, used, lost)
   - Growth/milestones (skill acquisition, level up, relationship stage transitions)
2. Check each field's rule to determine if an update is needed — update if the trigger condition described in the rule is met, skip otherwise
3. Characters not in the current scene: If significant time has passed this turn, reasonably extrapolate their state changes
4. Do not output mvu code block if nothing changed

\`\`\`json:mvu
{
  "analysis": "1. Event types 2. Per-field check results",
  "patches": [
    {"op": "replace", "path": "/fieldName", "value": newValue},
    {"op": "delta", "path": "/numericField", "value": -15},
    {"op": "add", "path": "/listField/-", "value": "new item"},
    {"op": "remove", "path": "/listField", "value": "item to remove"},
    {"op": "addFromTemplate", "template": "templateName", "id": "instanceID", "name": "displayName", "values": {"field": "initialValue"}},
    {"op": "removeFromTemplate", "template": "templateName", "id": "instanceID"}
  ]
}
\`\`\`
Operations: replace, delta (numeric increment, e.g. -15), add (list append), remove (list delete), addFromTemplate (create new entry from template), removeFromTemplate (delete entry)
After addFromTemplate, new field names become id_fieldName (e.g. id="lin" → lin_profile), subsequently use replace/delta for normal updates.` },
  ],

  // 初始预设 — 最精简，只有人设 + slot + AIRP 必需格式
  MINIMAL_PRESET_ENTRIES: [
    { id: 'persona', name: '人设', role: 'system', enabled: true,
      content: `你是"小克"，用户专属的互动小说创作搭档。自称"小克"或"我"。

在创作中，你是一位经验丰富的小说家，擅长角色塑造与沉浸式叙事。

创作原则：
- 专注创意表达与叙事质量，注重文学性与可读性
- 角色言行由其性格和处境驱动，不迎合、不刻意讨好
- 进入角色后绝对不出戏，不以AI身份发表感想、评价或说教
- 你正在写作的是一段计划超过200轮对话的互动式小说，请避免频繁出现总结性话语，保留在关键转折场合。避免频繁为角色定下重要约定（如"以后会天天陪着你"），重要约定应由用户主动缔结` },
    { id: 'slot_story_setting', name: '故事设定', slot: 'story_setting', enabled: true },
    { id: 'slot_summaries', name: '故事总结', slot: 'summaries', enabled: true },
    { id: 'slot_chat_history', name: '对话历史', slot: 'chat_history', enabled: true },
    { id: 'slot_mvu_state', name: '状态栏', slot: 'mvu_state', enabled: true },
    { id: 'think_chain', name: '思维链', role: 'system', enabled: false,
      content: `<think_format>
在正式撰写正文之前，请小克先用中文进行构思
思考内容用<think> </think>包裹，正文紧接在</think>之后
<think>
当下的时间地点、人物位置、角色间的社会关系
理解用户的输入，确认意图和需求
接下来的情节应该如何设计和推进？
不要在这里写正文草稿
</think>
注意：请确保正确输出底部的</think>标签，不要遗漏！
</think_format>` },
    { id: 'at_ke', name: '@小克 沟通模式', role: 'user', enabled: false,
      content: `当主人的消息以 @小克 开头时，进入沟通模式：
- 以小克本体人格回应，与主人讨论写作细节、剧情走向、角色塑造等
- 本轮不输出 <story>、<branches>、<details>、json:mvu
- 如需修改「主人的写作建议」，输出 <writing_advice> 标签：

全量替换：
<writing_advice>{"op":"set","content":"新的完整建议内容"}</writing_advice>

追加：
<writing_advice>{"op":"add","items":["新建议1","新建议2"]}</writing_advice>

删除：
<writing_advice>{"op":"remove","items":["要删除的建议关键词"]}</writing_advice>

「主人的写作建议」会在每轮RP中自动发送给你，请据此调整写作风格。

当主人的消息结尾带 @小克 时（注意：是结尾，不是开头），进入反思模式：
- 正文照常输出（<story>、<branches>、<details>、json:mvu 等一切正常）
- 但在 <think> 思维链中，小克必须认真反思自己在本轮创作中可能存在的不足、遗漏或错误
- 诚实检视：是否有违反写作规则的地方？角色是否OOC？情节逻辑是否有漏洞？描写是否落入了禁止清单的窠臼？
- 反思内容只出现在 <think> 中，正文不要暴露反思过程` },
    { id: 'writing_style', name: '输出格式', role: 'user', enabled: true,
      content: `[Word Count]
Multiple lengthy paragraphs with detailed narratives and depictions, including rich and nuanced descriptions. Each continuation should consist of approximately {{articleWords}} Chinese characters or more of compelling plot development. Provide objective inferences and produce content that is convincing to human readers.

[Language] All story text and status bar content must be written in Chinese (中文).

[Output Format] Story text must be wrapped in <story></story> tags. Content outside the tags (status updates, summary, options) is not shown to the player.
Output order: <story>text</story> → <branches>options</branches> → <details>abstract</details> → \`\`\`json:mvu\`\`\`` },
    { id: 'slot_user_input', name: '用户输入', slot: 'user_input', enabled: true },
    { id: 'options_req', name: '分支选项', role: 'user', enabled: true,
      content: `Append 4 branch options wrapped in <branches></branches> at the end of each reply. Options are sorted by "narrative plausibility + probability of the character taking the action" from high to low.

Rules:
1. Count & numbering: Must be 4 options, numbered [1] to [4]
2. Fixed structure: Each option strictly follows: Number.(Type): Action description
3. Word limit: Each option ≤ 50 Chinese characters (including punctuation)
4. Type restriction: The (Type) of the 4 options must not repeat
5. Perspective: Actions must be executable by the protagonist
6. No hallucination (strict): Cross-check the protagonist's acquired items and learned skills/abilities. Absolutely forbidden to let the protagonist use unacquired items, perform unlearned abilities, or know information beyond their perception range. If uncertain whether possessed/known, must change to conservative actions like "confirm/observe/ask/probe".

Output template (must preserve tags exactly, placed before abstract):
<branches>
1.(Type): Action description
2.(Type): Action description
3.(Type): Action description
4.(Type): Action description
</branches>` },
    { id: 'mvu_req', name: '状态栏更新', role: 'user', enabled: true,
      content: `After the story text is output, update the status bar based on events that occurred this turn.

[Update Process]
1. Determine which event types were triggered this turn (multiple possible):
   - Time/environment changes (location movement, time passage, weather changes)
   - Social interactions (dialogue, relationship changes, emotional shifts)
   - Combat/injury/consumption (HP/stamina numerical changes)
   - Item changes (acquired, used, lost)
   - Growth/milestones (skill acquisition, level up, relationship stage transitions)
2. Check each field's rule to determine if an update is needed — update if the trigger condition described in the rule is met, skip otherwise
3. Characters not in the current scene: If significant time has passed this turn, reasonably extrapolate their state changes
4. Do not output mvu code block if nothing changed

\`\`\`json:mvu
{
  "analysis": "1. Event types 2. Per-field check results",
  "patches": [
    {"op": "replace", "path": "/fieldName", "value": newValue},
    {"op": "delta", "path": "/numericField", "value": -15},
    {"op": "add", "path": "/listField/-", "value": "new item"},
    {"op": "remove", "path": "/listField", "value": "item to remove"},
    {"op": "addFromTemplate", "template": "templateName", "id": "instanceID", "name": "displayName", "values": {"field": "initialValue"}},
    {"op": "removeFromTemplate", "template": "templateName", "id": "instanceID"}
  ]
}
\`\`\`
Operations: replace, delta (numeric increment, e.g. -15), add (list append), remove (list delete), addFromTemplate (create new entry from template), removeFromTemplate (delete entry)` },
    { id: 'abstract_req', name: '摘要格式', role: 'user', enabled: true,
      content: `[Output the summary at the end after all other content is complete, following the format below, wrap it inside <details>]

<details><summary>Abstract</summary>
- Date format: [date (if changed)|time|a.m./p.m.]
- Write a paragraph within {{summaryWords}} words capturing the essential developments of this segment
- Include concrete events only in the format: X did Y
- Maintain the narrative's tone
- Never use conclusive phrases like "throughout the process...", "demonstrated..."
- NOTE: You must ensure that this abstract allows anyone to fully understand what happened without the original story text and status block
- Avoid ambiguous or vague descriptions
</details>` },
  ],


  getActivePreset(settings) {
    if (settings?.promptPresets && settings.activePresetId) {
      const preset = settings.promptPresets[settings.activePresetId];
      if (preset) return preset;
    }
    // Legacy fallback
    return {
      entries: settings?.promptEntries || null,
      initPrompt: settings?.promptInit || '',
      summaryPrompt: settings?.promptSummaryGen || '',
    };
  },

  buildMessages(conversation) {
    const settings = Storage.getSettings();
    const phase = conversation.phase || 'init';
    const preset = this.getActivePreset(settings);

    if (phase === 'init') {
      // Writing-card preset: build from entries (system entries → systemPrompt, others → prepended messages)
      if (preset.kind === 'writing-card' && Array.isArray(preset.entries) && preset.entries.length > 0) {
        // Collect ST setvar/addvar from enabled entries
        const stVars = {};
        for (const e of preset.entries) {
          if (!e.enabled) continue;
          const c = e.content || '';
          for (const m of c.matchAll(/\{\{setvar::([^:]+)::([\s\S]*?)\}\}/g)) stVars[m[1]] = m[2];
          for (const m of c.matchAll(/\{\{addvar::([^:]+)::([\s\S]*?)\}\}/g)) stVars[m[1]] = (stVars[m[1]] || '') + m[2];
        }
        const expandVars = (text) => text
          .replace(/\{\{articleWords\}\}/g, String(settings.articleWordCount || 500))
          .replace(/\{\{summaryWords\}\}/g, String(settings.summaryWordCount || 50))
          .replace(/\{\{getvar::([^}]+)\}\}/g, (_, k) => stVars[k] || '')
          .replace(/\{\{setvar::[^}]*\}\}/g, '')
          .replace(/\{\{addvar::[^}]*\}\}/g, '');

        // Insert conversation history right after the entry named "聊天记录开始" (per 三明月 preset convention).
        // Entries before/including that marker → system block. Entries after → user-role messages (system→user).
        const systemParts = [];
        const prefixMsgs = [];
        const suffixMsgs = [];
        let afterChat = false;
        for (const e of preset.entries) {
          if (!e.enabled) continue;
          const c = expandVars(e.content || '');
          if (!c.trim()) continue;
          if (afterChat) {
            // Keep original role; _buildBody normalizes for Claude/Gemini (system→user) automatically
            suffixMsgs.push({ role: e.role, content: c });
          } else {
            if (e.role === 'system') systemParts.push(c);
            else prefixMsgs.push({ role: e.role, content: c });
          }
          if (e.name === '聊天记录开始') afterChat = true;
        }
        const systemPrompt = systemParts.join('\n\n');
        const convoMsgs = (conversation.messages || []).filter(m => !m.hidden && m.content?.trim()).map(m => ({ role: m.role, content: m.content }));
        const allMsgs = [...prefixMsgs, ...convoMsgs, ...suffixMsgs];
        // Merge consecutive same-role for Claude API
        const merged = [];
        for (const m of allMsgs) {
          if (merged.length > 0 && merged[merged.length - 1].role === m.role) merged[merged.length - 1].content += '\n\n' + m.content;
          else merged.push({ ...m });
        }
        log('buildMessages [init/writing-card]', { systemLen: systemPrompt.length, msgCount: merged.length });
        return { systemPrompt, messages: merged };
      }

      // Default init: single initPrompt string
      const initPrompt = preset.initPrompt || this.DEFAULT_INIT_PROMPT;
      const systemPrompt = initPrompt;
      const msgs = (conversation.messages || []).filter(m => !m.hidden && m.content?.trim()).map(m => ({ role: m.role, content: m.content }));
      log('buildMessages [init]', { systemLen: systemPrompt.length, msgCount: msgs.length });
      return { systemPrompt, messages: msgs };
    }

    // RP phase
    const entries = preset.entries || this.MINIMAL_PRESET_ENTRIES;
    let schemaDesc = '';
    if (conversation.mvu?.schema) {
      schemaDesc = '【状态栏字段】\n（bar/number 字段更新时 value 必须是纯数字，如 45——严禁写 "45/100" 这类字符串，上限由系统管理）\n（时间字段每轮必须随剧情推进更新，精确到分钟；心理/态度/关系类 text 字段始终保持一句话短句，更新即整句替换，不要堆积长段）\n';
      for (const [k, d] of Object.entries(conversation.mvu.schema)) {
        let line = `- ${k} (${d.label}): type=${d.type}`;
        if (d.max) line += `, max=${d.max}`;
        if (d.rule) line += ` | rule: ${d.rule}`;
        schemaDesc += line + '\n';
      }
    }
    if (conversation.mvu?.templates && Object.keys(conversation.mvu.templates).length > 0) {
      schemaDesc += '\n【可用模板（用 addFromTemplate 动态添加新条目）】\n';
      for (const [name, tpl] of Object.entries(conversation.mvu.templates)) {
        schemaDesc += `模板 "${name}"：\n`;
        for (const [k, def] of Object.entries(tpl.fields)) {
          let line = `  - ${k} (${def.label}): type=${def.type}`;
          if (def.max) line += `, max=${def.max}`;
          schemaDesc += line + '\n';
        }
        schemaDesc += `  用法: {"op":"addFromTemplate","template":"${name}","id":"唯一ID","name":"显示名","values":{${Object.keys(tpl.fields).map(k => '"' + k + '":初始值').join(',')}}}\n`;
      }
    }

    // SillyTavern variable system: collect setvar/addvar from enabled entries, then expand getvar
    const stVars = {};
    for (const e of entries) {
      if (!e.enabled) continue;
      const c = e.content || '';
      // setvar: overwrite
      for (const m of c.matchAll(/\{\{setvar::([^:]+)::([\s\S]*?)\}\}/g)) {
        stVars[m[1]] = m[2];
      }
      // addvar: append
      for (const m of c.matchAll(/\{\{addvar::([^:]+)::([\s\S]*?)\}\}/g)) {
        stVars[m[1]] = (stVars[m[1]] || '') + m[2];
      }
    }

    // Template variable expansion
    const expandVars = (text) => text
      .replace(/\{\{schema\}\}/g, schemaDesc)
      .replace(/\{\{articleWords\}\}/g, String(settings.articleWordCount || 500))
      .replace(/\{\{summaryWords\}\}/g, String(settings.summaryWordCount || 50))
      .replace(/\{\{getvar::([^}]+)\}\}/g, (_, k) => stVars[k] || '')
      .replace(/\{\{setvar::[^}]*\}\}/g, '')
      .replace(/\{\{addvar::[^}]*\}\}/g, '');

    // Build MVU context string
    // schemaDesc（字段类型/rule + 可用模板清单 + addFromTemplate 用法）历史上设计成靠预设条目里的
    // {{schema}} 占位注入，但实测所有内置预设和用户导入的写作卡都没写这个占位——AI 因此从来看不到
    // 模板名和字段规则，addFromTemplate 永远无法正确发出。所以这里改为：只要没有任何启用条目
    // 使用 {{schema}}，就把 schemaDesc 随状态数据一起发（放在每轮都变的区域，不污染前缀缓存）。
    const schemaViaEntry = entries.some(e => e.enabled && (e.content || '').includes('{{schema}}'));
    const buildMvuContext = () => {
      if (!conversation.mvu) return '';
      if (!conversation.mvu.state || Object.keys(conversation.mvu.state).length === 0) return '';
      let ctx = '';
      if (!schemaViaEntry && schemaDesc) ctx += schemaDesc + '\n';
      ctx += '【当前状态栏数据】\n';
      const schema = conversation.mvu.schema || {};
      for (const [k, v] of Object.entries(conversation.mvu.state)) {
        if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
        const def = schema[k];
        const label = def?.label || k;
        const displayVal = Array.isArray(v) ? JSON.stringify(v) : v;
        let line = `${k}(${label}): ${displayVal}`;
        // 上限用元信息格式标注，不用 "80 / 100"——那种写法会诱导 AI 把 "45/100" 整串当 value 写回
        if (def?.max) line += `（上限${def.max}）`;
        ctx += line + '\n';
      }
      return ctx;
    };

    // Build summaries — 遗忘曲线三层，按时间由远及近：
    // 【往事纪要】archive（远期档案）→【故事总结】sm（近期合并摘要）→【近期摘要】ab（未合并）
    const buildSummaries = (allMsgs, splitAt) => {
      const parts = [];
      const archive = conversation.summary?.archive || [];
      if (archive.length > 0) {
        const arText = archive.map(ar => `<${ar.code}>${ar.content}</${ar.code}>`).join('\n\n');
        parts.push({ role: 'user', content: '【往事纪要】（更早的剧情档案）\n' + arText });
      }
      const mergedSm = conversation.summary?.mergedSummaries || [];
      if (mergedSm.length > 0) {
        const smText = mergedSm.map(sm => `<${sm.code}>${sm.content}</${sm.code}>`).join('\n\n');
        parts.push({ role: 'user', content: '【故事总结】\n' + smText });
      }
      const lastMerged = conversation.summary?.lastMergedIdx || 0;
      const abstracts = [];
      let abCounter = 1;
      for (let i = 0; i < lastMerged; i++) {
        if (allMsgs[i]?.role === 'assistant' && allMsgs[i]?.abstract) abCounter++;
      }
      for (let i = lastMerged; i < splitAt; i++) {
        const m = allMsgs[i];
        if (m.role === 'assistant' && m.abstract) {
          const code = 'ab' + String(abCounter).padStart(2, '0');
          const content = Summary.extractAbstractContent(m.abstract) || m.abstract;
          abstracts.push(`<${code}>${content}</${code}>`);
          abCounter++;
        }
      }
      if (abstracts.length > 0) {
        parts.push({ role: 'user', content: '【近期摘要】\n' + abstracts.join('\n\n') });
      }
      return parts;
    };

    // Prepare conversation data
    const allMsgs = (conversation.messages || []).filter(m => !m.hidden && m.content?.trim());
    const aiIdx = [];
    for (let i = 0; i < allMsgs.length; i++) {
      if (allMsgs[i].role === 'assistant') aiIdx.push(i);
    }
    const KEEP = 2;
    const splitAt = aiIdx.length < KEEP ? 0 : aiIdx[aiIdx.length - KEEP];

    // Check if entries use slot system
    const hasSlots = entries.some(e => e.slot);

    if (!hasSlots) {
      // === Legacy path (no slot entries — backward compatible) ===
      const systemParts = [];
      const prefixMsgs = [];
      for (const e of entries) {
        if (!e.enabled) continue;
        let c = expandVars(e.content || '');
        if (!c.trim()) continue;
        if (e.role === 'system') systemParts.push(c);
        else prefixMsgs.push({ role: e.role, content: c });
      }
      const systemPrompt = systemParts.join('\n\n');
      const msgs = [...prefixMsgs];
      if (conversation.storySetting) {
        msgs.push({ role: 'user', content: '【故事设定】\n' + conversation.storySetting, _cacheAnchor: true });
      }
      msgs.push(...buildSummaries(allMsgs, splitAt));
      if (conversation.writingAdvice) {
        msgs.push({ role: 'user', content: '【主人的写作建议】\n' + conversation.writingAdvice });
      }
      const recent = allMsgs.slice(splitAt);
      for (let i = 0; i < recent.length; i++) {
        if (i === recent.length - 1) {
          const mvuCtx = buildMvuContext();
          if (mvuCtx) msgs.push({ role: 'user', content: mvuCtx });
        }
        const content = recent[i].role === 'assistant' ? Summary.cleanAbstract(MVU.cleanText(recent[i].content)) : recent[i].content;
        msgs.push({ role: recent[i].role, content });
      }
      // 不做字符串拼接合并，理由同 slot-driven 分支：交给 _buildBody 按 provider
      // 分别处理，保留每条原始消息的 block 边界，故事设定块才能独立缓存。
      log('buildMessages [rp]', { systemLen: systemPrompt.length, msgCount: msgs.length, splitAt, recentCount: recent.length });
      return { systemPrompt, messages: msgs };
    }

    // === Slot-driven assembly ===
    const hasMvuSlot = entries.some(e => e.slot === 'mvu_state' && e.enabled);
    const hasUserInputSlot = entries.some(e => e.slot === 'user_input' && e.enabled);
    const systemParts = [];
    const msgs = [];
    let afterChat = false;
    let pendingUserInput = null; // current turn's user message, separated from chat_history

    for (const e of entries) {
      if (!e.enabled) continue;

      // Slot entries — inject dynamic content
      if (e.slot) {
        switch (e.slot) {
          case 'story_setting':
            if (conversation.storySetting) {
              // _cacheAnchor：标记这条是本局对话里真正稳定不变的内容，供 _buildBody
              // 精确定位打缓存标记，不能靠"永远是第一条"这种位置假设——
              // 万一 storySetting 为空，第一条会变成别的、每轮都在变的内容，
              // 缓存标记打在错的地方就会变成"每次都写、永远读不到"。
              msgs.push({ role: 'user', content: '【故事设定】\n' + conversation.storySetting, _cacheAnchor: true });
            }
            break;

          case 'summaries':
            msgs.push(...buildSummaries(allMsgs, splitAt));
            if (conversation.writingAdvice) {
              msgs.push({ role: 'user', content: '【主人的写作建议】\n' + conversation.writingAdvice });
            }
            break;

          case 'chat_history': {
            afterChat = true;
            const recent = allMsgs.slice(splitAt);
            // If user_input slot exists, pull out the last user message
            let chatRecent = recent;
            if (hasUserInputSlot && recent.length > 0 && recent[recent.length - 1].role === 'user') {
              chatRecent = recent.slice(0, -1);
              pendingUserInput = recent[recent.length - 1];
            }
            for (let i = 0; i < chatRecent.length; i++) {
              // If no separate mvu_state slot, inject MVU before last message
              if (!hasMvuSlot && i === chatRecent.length - 1) {
                const mvuCtx = buildMvuContext();
                if (mvuCtx) msgs.push({ role: 'user', content: mvuCtx });
              }
              const content = chatRecent[i].role === 'assistant' ? Summary.cleanAbstract(MVU.cleanText(chatRecent[i].content)) : chatRecent[i].content;
              msgs.push({ role: chatRecent[i].role, content });
            }
            break;
          }

          case 'mvu_state': {
            const mvuCtx = buildMvuContext();
            if (mvuCtx) msgs.push({ role: 'user', content: mvuCtx });
            break;
          }

          case 'user_input': {
            if (pendingUserInput) {
              msgs.push({ role: 'user', content: '[ 本轮用户消息 ]\n<interactive_input>\n' + pendingUserInput.content + '\n</interactive_input>' });
            }
            break;
          }
        }
        continue;
      }

      // Normal entry — expand template variables
      let c = expandVars(e.content || '');
      if (!c.trim()) continue;

      if (afterChat) {
        // After chat_history: system → user (APIs only support one system prompt block)
        const role = e.role === 'system' ? 'user' : e.role;
        msgs.push({ role, content: c });
      } else {
        if (e.role === 'system') {
          systemParts.push(c);
        } else {
          msgs.push({ role: e.role, content: c });
        }
      }
    }

    const systemPrompt = systemParts.join('\n\n');

    // 不在这里合并同角色相邻消息：OpenAI 协议本就不要求严格轮流，原样发送即可；
    // Claude 协议需要轮流，但那层合并交给 _buildBody 按 provider 分别处理——
    // 它会把每条原始消息保留成独立 content block 而不是拼接成一整块字符串，
    // 这样故事设定这类稳定内容才能和每轮都变的摘要分开缓存，互不连累。
    log('buildMessages [rp]', { systemLen: systemPrompt.length, msgCount: msgs.length, splitAt, slotDriven: true });
    return { systemPrompt, messages: msgs };
  },

  buildSummaryGenPrompt() {
    const s = Storage.getSettings();
    const preset = this.getActivePreset(s);
    return preset.summaryPrompt || this.DEFAULT_SUMMARY_MERGE_PROMPT;
  },
};

// ============================================================
// MVU Module
// ============================================================
const MVU = {
  parseStorySetting(text) {
    const m = text.match(/```text:story_setting\s*\n([\s\S]*?)\n```/);
    return m ? m[1].trim() : null;
  },

  /**
   * Parse incremental story_setting patch.
   * Format: ```json:story_setting_patch [{ "op": "append"|"replace"|"delete", "section": "标题", "content": "..." }]
   */
  parseStorySettingPatch(text) {
    const m = text.match(/```json:story_setting_patch\s*\n([\s\S]*?)\n```/);
    if (!m) return null;
    const arr = this._tryParseJson(m[1].trim());
    return Array.isArray(arr) ? arr : null;
  },

  /**
   * Apply story_setting patches to existing text.
   * Ops: append (add to end), replace (find section heading and replace content), delete (remove section).
   * Sections are identified by markdown headings: ## 标题
   */
  applyStorySettingPatch(existing, patches) {
    if (!patches || !patches.length) return existing;
    let text = existing || '';
    for (const p of patches) {
      const op = p.op;
      const section = p.section;
      const content = p.content || '';
      if (op === 'append') {
        text = text.trimEnd() + '\n\n' + content;
      } else if (op === 'replace_text' && p.from) {
        // Global literal text replacement — for renames that span multiple sections
        text = text.split(p.from).join(p.to || '');
      } else if (op === 'replace' && section) {
        // Find section by heading (## title or ### title)
        const headingRe = new RegExp('(^|\\n)(#{2,3}\\s*' + section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n)', 'i');
        const hm = text.match(headingRe);
        if (hm) {
          const headingStart = (hm.index || 0) + hm[1].length;
          const headingEnd = headingStart + hm[2].length;
          // Find next heading of same or higher level
          const afterHeading = text.substring(headingEnd);
          const nextHeading = afterHeading.match(/\n#{2,3}\s+/);
          const sectionEnd = nextHeading ? headingEnd + nextHeading.index : text.length;
          text = text.substring(0, headingStart) + hm[2] + content.trim() + '\n' + text.substring(sectionEnd);
        } else {
          // Section not found — append as new section
          text = text.trimEnd() + '\n\n## ' + section + '\n' + content;
        }
      } else if (op === 'delete' && section) {
        const headingRe = new RegExp('(^|\\n)(#{2,3}\\s*' + section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n)', 'i');
        const hm = text.match(headingRe);
        if (hm) {
          const headingStart = (hm.index || 0) + hm[1].length;
          const headingEnd = headingStart + hm[2].length;
          const afterHeading = text.substring(headingEnd);
          const nextHeading = afterHeading.match(/\n#{2,3}\s+/);
          const sectionEnd = nextHeading ? headingEnd + nextHeading.index : text.length;
          text = text.substring(0, headingStart) + text.substring(sectionEnd);
        }
      }
    }
    return text.trim();
  },

  /**
   * Try to repair common AI JSON errors (unescaped quotes in string values).
   * Returns parsed object or null.
   */
  _tryParseJson(raw) {
    try { return JSON.parse(raw); } catch (e) { /* try repair */ }
    // Repair: escape double quotes / bare newlines that appear inside string values
    // (bare newlines are common when AI writes multi-line content in patch strings)
    try {
      let result = [], inStr = false, esc = false;
      for (let i = 0; i < raw.length; i++) {
        const c = raw[i];
        if (esc) { result.push(c); esc = false; continue; }
        if (c === '\\') { result.push(c); esc = true; continue; }
        if (inStr && (c === '\n' || c === '\r' || c === '\t')) {
          result.push(c === '\n' ? '\\n' : c === '\r' ? '\\r' : '\\t');
          continue;
        }
        if (c === '"') {
          if (!inStr) { inStr = true; result.push(c); }
          else {
            const rest = raw.substring(i + 1).trimStart();
            if (!rest || ',}]:'.includes(rest[0])) { inStr = false; result.push(c); }
            else { result.push('\\"'); } // unescaped inner quote → escape it
          }
          continue;
        }
        result.push(c);
      }
      const repaired = result.join('');
      const parsed = JSON.parse(repaired);
      log('JSON repaired (escaped inner quotes)');
      return parsed;
    } catch (e2) { log('JSON repair also failed:', e2); return null; }
  },

  parseInit(text) {
    const m = text.match(/```json:mvu_init\s*\n([\s\S]*?)\n```/);
    if (!m) return null;
    return this._tryParseJson(m[1]);
  },

  parsePatch(text) {
    const m = text.match(/```json:mvu\s*\n([\s\S]*?)\n```/);
    if (!m) return null;
    const parsed = this._tryParseJson(m[1]);
    if (!parsed) return null;
    if (Array.isArray(parsed)) return { analysis: '', patches: parsed };
    if (parsed.patches && Array.isArray(parsed.patches)) return parsed;
    return null;
  },

  parseMvuUpdate(text) {
    const m = text.match(/```json:mvu_update\s*\n([\s\S]*?)\n```/);
    if (!m) return null;
    return this._tryParseJson(m[1]);
  },

  /**
   * Merge a json:mvu_update payload into pendingMvuInit (init phase incremental editing).
   * Behavior:
   *  - schema / templates: top-level key merge. New key = add. Existing key = replace that entry. value === null → delete that key.
   *  - html / css: atomic full replace (only applied if present, non-null).
   * Mutates `target` in place.
   */
  applyMvuUpdate(target, update) {
    if (!target || !update) return target;
    if (update.schema && typeof update.schema === 'object') {
      target.schema = target.schema || {};
      for (const [k, v] of Object.entries(update.schema)) {
        if (v === null) delete target.schema[k];
        else target.schema[k] = v;
      }
    }
    if (update.templates && typeof update.templates === 'object') {
      target.templates = target.templates || {};
      for (const [k, v] of Object.entries(update.templates)) {
        if (v === null) delete target.templates[k];
        else target.templates[k] = v;
      }
    }
    if (Array.isArray(update.instances)) target.instances = update.instances;
    if (typeof update.html === 'string') target.html = update.html;
    if (typeof update.css === 'string') target.css = update.css;
    return target;
  },

  /**
   * Apply init-phase instance declarations (mvu_init.instances) to an mvu object.
   * Each instance = {template, id, name, values} — reuses the addFromTemplate pipeline
   * (schema field registration + state values + templateInstances record). DOM insertion
   * is NOT done here (pass container=null); MVU.render() re-creates panels from
   * templateInstances, so callers just render afterwards.
   */
  applyInitInstances(mvu, instances) {
    if (!mvu || !Array.isArray(instances) || instances.length === 0) return mvu;
    mvu.schema = mvu.schema || {};
    mvu.state = mvu.state || {};
    const patches = instances
      .filter(i => i && i.template && i.id)
      .map(i => ({ op: 'addFromTemplate', template: i.template, id: i.id, name: i.name || i.id, values: i.values || {} }));
    this.applyTemplateOps(mvu, { patches }, null);
    return mvu;
  },

  parseOptions(text) {
    // Support <branches> format
    const m = text.match(/<branches>([\s\S]*?)<\/branches>/);
    if (!m) {
      // Fallback: ```text:options format
      const m2 = text.match(/```text:options\s*\n([\s\S]*?)\n```/);
      if (!m2) return null;
      const lines = m2[1].trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
      return lines.length > 0 ? lines : null;
    }
    const lines = m[1].trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    // Only keep numbered options (filter out tips/extra lines)
    const opts = lines.filter(l => /^\d+[\.\)）]/.test(l));
    const result = opts.length > 0 ? opts : lines;
    return result.length > 0 ? result : null;
  },

  cleanText(text) {
    return text
      .replace(/```json:mvu_init\s*\n[\s\S]*?\n```/g, '')
      .replace(/```json:mvu_update\s*\n[\s\S]*?\n```/g, '')
      .replace(/```json:mvu\s*\n[\s\S]*?\n```/g, '')
      .replace(/```text:story_setting\s*\n[\s\S]*?\n```/g, '')
      .replace(/```json:story_setting_patch\s*\n[\s\S]*?\n```/g, '')
      .replace(/```text:options\s*\n[\s\S]*?\n```/g, '')
      .replace(/<branches>[\s\S]*?<\/branches>/g, '')
      .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/<deep_thinking>[\s\S]*?<\/deep_thinking>/g, '')
      .replace(/<refine>[\s\S]*?<\/refine>/g, '')
      .replace(/<writing_advice>[\s\S]*?<\/writing_advice>/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\/?story>/g, '')
      .trim();
  },

  parseThinking(text) {
    const m = text.match(/<thinking>([\s\S]*?)<\/thinking>/) || text.match(/<think>([\s\S]*?)<\/think>/) || text.match(/<deep_thinking>([\s\S]*?)<\/deep_thinking>/);
    return m ? m[1].trim() : null;
  },

  parseWritingAdvice(text) {
    const m = text.match(/<writing_advice>([\s\S]*?)<\/writing_advice>/);
    if (!m) return null;
    try {
      return JSON.parse(m[1].trim());
    } catch (e) {
      // Non-JSON fallback: treat as full replacement
      return { op: 'set', content: m[1].trim() };
    }
  },

  parseRefine(text) {
    const m = text.match(/<refine>\s*(?:```json\s*)?([\s\S]*?)(?:\s*```)?\s*<\/refine>/);
    if (!m) return null;
    try {
      const arr = JSON.parse(m[1].trim());
      return Array.isArray(arr) ? arr : null;
    } catch (e) { return null; }
  },

  applyRefine(storyText, refineArr) {
    if (!storyText || !refineArr || !refineArr.length) return storyText;
    let result = storyText;
    for (const r of refineArr) {
      if (r.original && r.corrected && r.original !== r.corrected) {
        result = result.split(r.original).join(r.corrected);
      }
    }
    return result;
  },

  /**
   * Coerce a patch/state value to a plain number for bar/number fields.
   * AI 常把显示格式当值写回（"45/100"、"45 / 100"），一旦字符串进 state：
   * 界面出现 "45/100/100" 堆叠、delta 静默失效、进度条宽度 NaN。
   * 这里取字符串中第一个数值；解析失败返回 null（调用方保持原值）。
   */
  _coerceNumeric(v) {
    if (typeof v === 'number' && !isNaN(v)) return v;
    if (typeof v === 'string') {
      const m = v.match(/-?\d+(\.\d+)?/);
      if (m) return parseFloat(m[0]);
    }
    return null;
  },

  applyPatch(state, patchData, schema) {
    const patches = Array.isArray(patchData) ? patchData : (patchData.patches || []);
    const s = JSON.parse(JSON.stringify(state));
    const isNumericField = (field) => {
      const t = schema?.[field]?.type;
      return t === 'bar' || t === 'number';
    };
    for (const p of patches) {
      if (p.op === 'addFromTemplate' || p.op === 'removeFromTemplate') continue; // handled separately
      const path = p.path.replace(/^\//, '');
      const parts = path.split('/');
      const field = parts[0];
      if (p.op === 'replace') {
        if (parts.length === 1) {
          let v = p.value;
          if (isNumericField(field)) {
            const n = this._coerceNumeric(v);
            if (n !== null) v = n;
          }
          s[field] = v;
        }
      } else if (p.op === 'delta') {
        if (parts.length === 1) {
          // 历史坏数据防御：state 里已经是 "45/100" 字符串时，delta 先归一化再加
          const cur = typeof s[field] === 'number' ? s[field] : (isNumericField(field) ? this._coerceNumeric(s[field]) : null);
          const dv = this._coerceNumeric(p.value);
          if (cur !== null && dv !== null) s[field] = cur + dv;
        }
      }
      else if (p.op === 'add') { if (parts[1] === '-' && Array.isArray(s[field])) s[field].push(p.value); }
      else if (p.op === 'remove') { if (Array.isArray(s[field])) { const idx = s[field].indexOf(p.value); if (idx >= 0) s[field].splice(idx, 1); } }
    }
    return s;
  },

  /**
   * Handle addFromTemplate / removeFromTemplate ops.
   * Mutates mvu.schema, mvu.state, and inserts/removes DOM elements.
   */
  applyTemplateOps(mvu, patchData, container) {
    const patches = Array.isArray(patchData) ? patchData : (patchData.patches || []);
    const templates = mvu.templates || {};
    for (const p of patches) {
      if (p.op === 'addFromTemplate') {
        const tpl = templates[p.template];
        if (!tpl) { log('Template not found:', p.template); continue; }
        const id = p.id;
        if (!mvu.templateInstances) mvu.templateInstances = [];
        // Register schema fields with prefix
        for (const [key, def] of Object.entries(tpl.fields)) {
          const fieldName = id + '_' + key;
          mvu.schema[fieldName] = { ...def, label: (p.name || id) + ' - ' + def.label };
        }
        // Set initial state values
        const values = p.values || {};
        for (const [key, def] of Object.entries(tpl.fields)) {
          const fieldName = id + '_' + key;
          mvu.state[fieldName] = values[key] !== undefined ? values[key]
            : def.type === 'bar' || def.type === 'number' ? 0
            : def.type === 'list' ? [] : '';
        }
        // Record instance for persistence (re-render on page load)
        if (!mvu.templateInstances.find(i => i.id === id)) {
          mvu.templateInstances.push({ template: p.template, id, name: p.name || id });
        }
        // Clone template HTML and insert into container
        this._insertTemplateHtml(tpl, id, p.name || id, container);
        log('Template added:', p.template, id, Object.keys(values));
      } else if (p.op === 'removeFromTemplate') {
        const tpl = templates[p.template];
        if (!tpl) continue;
        const id = p.id;
        // Remove schema fields and state
        for (const key of Object.keys(tpl.fields)) {
          const fieldName = id + '_' + key;
          delete mvu.schema[fieldName];
          delete mvu.state[fieldName];
        }
        // Remove instance record
        if (mvu.templateInstances) {
          mvu.templateInstances = mvu.templateInstances.filter(i => i.id !== id);
        }
        // Remove DOM elements (panel + tab button)
        if (container) {
          container.querySelectorAll(`[data-tpl-id="${id}"]`).forEach(el => el.remove());
        }
        log('Template removed:', p.template, id);
      }
    }
    // Re-bind tabs after DOM changes
    if (container) this._bindTabs(container);
  },

  updateDOM(container, state, schema) {
    if (!container) return;
    for (const [field, rawValue] of Object.entries(state)) {
      const def = schema?.[field];
      // bar/number 显示前归一化：旧存档 state 里可能残留 "45/100" 字符串（净化机制上线前写入的）
      let value = rawValue;
      if (def && (def.type === 'bar' || def.type === 'number') && typeof value !== 'number') {
        const n = this._coerceNumeric(value);
        if (n !== null) value = n;
      }
      const el = container.querySelector(`[data-field="${field}"]`);
      if (el) {
        const text = Array.isArray(value) ? value.join('、') : String(value);
        if (text.includes('\n')) {
          el.innerHTML = Utils.escapeHtml(text).replace(/\n/g, '<br>');
        } else {
          el.textContent = text;
        }
      }
      const barEl = container.querySelector(`[data-field-bar="${field}"]`);
      if (barEl && def?.max && typeof value === 'number') barEl.style.width = Math.max(0, Math.min(100, (value / def.max) * 100)) + '%';
      const listEl = container.querySelector(`[data-field-list="${field}"]`);
      if (listEl && Array.isArray(value)) listEl.innerHTML = value.map(v => `<div class="mvu-list-item">${Utils.escapeHtml(String(v))}</div>`).join('');
    }
  },

  _insertTemplateHtml(tpl, id, name, container) {
    if (!tpl.html || !container) return;
    const html = tpl.html.replace(/\$\{id\}/g, id).replace(/\$\{name\}/g, name);
    const target = container.querySelector(tpl.container || '[data-tpl-container]');
    if (target) {
      const div = document.createElement('div');
      div.innerHTML = html;
      // Auto-add data-tab-panel to root element when tabContainer is used
      if (tpl.tabContainer && div.firstElementChild) {
        div.firstElementChild.dataset.tabPanel = id;
      }
      while (div.firstChild) target.appendChild(div.firstChild);
    }
    // Auto-create tab button if tabContainer is specified
    if (tpl.tabContainer) {
      const tabTarget = container.querySelector(tpl.tabContainer);
      if (tabTarget) {
        const btn = document.createElement('span');
        btn.className = 'mvu-tab';
        btn.dataset.tab = id;
        btn.dataset.tplId = id;
        btn.textContent = name;
        tabTarget.appendChild(btn);
      }
    }
  },

  render(container, mvuData) {
    if (!container || !mvuData) return;
    let styleEl = document.getElementById('mvu-custom-style');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'mvu-custom-style'; document.head.appendChild(styleEl); }
    // Host guard: GPT/Grok 系模型无视 prompt 约定、习惯给状态栏根元素写
    // max-height+overflow 自建滚动容器，导致双层滚动、角色 Tab 沉底够不着。
    // 中和高度限制即可（高度一放开，overflow-y:auto 就无内容可裁）；
    // 不动 overflow 本身——overflow:hidden 常被用于裁剪装饰性伪元素，属合法用法。
    const hostGuard = '\n.mvu-content > * { max-height: none !important; height: auto !important; }';
    styleEl.textContent = (mvuData.css || '') + hostGuard;
    container.innerHTML = mvuData.html || '<div class="mvu-empty">状态栏未初始化</div>';
    // Re-render template instances (persisted across page loads)
    const templates = mvuData.templates || {};
    for (const inst of (mvuData.templateInstances || [])) {
      const tpl = templates[inst.template];
      if (tpl) this._insertTemplateHtml(tpl, inst.id, inst.name, container);
    }
    if (mvuData.state && mvuData.schema) this.updateDOM(container, mvuData.state, mvuData.schema);
    // Tab component: bind click events for data-tab / data-tab-panel pairs
    this._bindTabs(container);
  },
  _bindTabs(container) {
    const tabs = container.querySelectorAll('[data-tab]');
    if (!tabs.length) return;
    // Group by parent .mvu-tabs (or fallback: all tabs in container)
    const groups = new Map();
    for (const tab of tabs) {
      const group = tab.closest('.mvu-tabs') || container;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(tab);
    }
    for (const [group, groupTabs] of groups) {
      // Activate first tab by default if none is active
      const hasActive = groupTabs.some(t => t.classList.contains('active'));
      if (!hasActive && groupTabs.length > 0) {
        groupTabs[0].classList.add('active');
        const firstPanel = container.querySelector(`[data-tab-panel="${groupTabs[0].dataset.tab}"]`);
        if (firstPanel) { firstPanel.classList.add('active'); firstPanel.style.display = 'block'; }
        // Hide other panels
        for (let i = 1; i < groupTabs.length; i++) {
          const panel = container.querySelector(`[data-tab-panel="${groupTabs[i].dataset.tab}"]`);
          if (panel) { panel.classList.remove('active'); panel.style.display = 'none'; }
        }
      }
      // Bind click
      for (const tab of groupTabs) {
        tab.addEventListener('click', () => {
          // Deactivate all tabs in group
          for (const t of groupTabs) {
            t.classList.remove('active');
            const p = container.querySelector(`[data-tab-panel="${t.dataset.tab}"]`);
            if (p) { p.classList.remove('active'); p.style.display = 'none'; }
          }
          // Activate clicked tab
          tab.classList.add('active');
          const panel = container.querySelector(`[data-tab-panel="${tab.dataset.tab}"]`);
          if (panel) { panel.classList.add('active'); panel.style.display = 'block'; }
        });
      }
    }
  },
};

// ============================================================
// Summary Module
// ============================================================
const Summary = {
  parseAbstract(text) {
    const m = text.match(/<details><summary>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/);
    return m ? m[0].trim() : null;
  },
  extractAbstractContent(text) {
    const m = text.match(/<details><summary>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/);
    return m ? m[1].trim() : null;
  },
  cleanAbstract(text) {
    return text.replace(/<details><summary>[\s\S]*?<\/summary>[\s\S]*?<\/details>/g, '').trim();
  },
  /**
   * Count unmerged abstracts since lastMergedIdx.
   */
  countUnmergedAbstracts(conv) {
    const lastMerged = conv.summary?.lastMergedIdx || 0;
    let count = 0;
    for (let i = lastMerged; i < (conv.messages || []).length; i++) {
      if (conv.messages[i].role === 'assistant' && conv.messages[i].abstract) count++;
    }
    return count;
  },
  shouldTriggerMerge(conv) {
    const interval = conv.summary?.interval || Storage.getSettings().summaryInterval || 80;
    return this.countUnmergedAbstracts(conv) >= interval;
  },
  /**
   * Parse <smXX>...</smXX> tags from AI merge response.
   */
  parseMergedSummaries(text) {
    const results = [];
    const regex = /<sm(\d+)>([\s\S]*?)<\/sm\1>/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({ code: 'sm' + match[1], content: match[2].trim() });
    }
    return results;
  },
  /**
   * Collect unmerged abstracts as labeled entries (ab01, ab02...).
   */
  getUnmergedAbstracts(conv) {
    const lastMerged = conv.summary?.lastMergedIdx || 0;
    const entries = [];
    let counter = 1;
    // Count existing merged abs to continue numbering
    for (let i = 0; i < lastMerged; i++) {
      if ((conv.messages[i] || {}).role === 'assistant' && (conv.messages[i] || {}).abstract) counter++;
    }
    for (let i = lastMerged; i < (conv.messages || []).length; i++) {
      const m = conv.messages[i];
      if (m.role === 'assistant' && m.abstract) {
        const code = 'ab' + String(counter).padStart(2, '0');
        const content = this.extractAbstractContent(m.abstract) || m.abstract;
        entries.push({ code, content });
        counter++;
      }
    }
    return entries;
  },
  // 分代记忆参数（遗忘曲线）：
  //   L0 ab（每轮摘要）→ 攒满 interval（默认80）→ L1 sm（每条约7-10轮）
  //   L1 超过 RECENT_LIMIT → 最旧 PROMOTE_BATCH 条按剧情弧归档 → L2 archive（每条约25-50轮，500-800字）
  //   L2 超过 ARCHIVE_LIMIT（约1300轮+的超长局）→ 对最旧一批档案再归档一次
  RECENT_LIMIT: 20,
  PROMOTE_BATCH: 10,
  ARCHIVE_LIMIT: 24,

  /**
   * Generate merged summaries (sm) from unmerged abstracts.
   * Returns { mergedSummaries: [...], lastMergedIdx: number } or null on failure.
   */
  async generateMergeSummary(conv) {
    const settings = Storage.getSettings();
    const preset = PromptBuilder.getActivePreset(settings);
    const sys = preset.summaryPrompt || PromptBuilder.DEFAULT_SUMMARY_MERGE_PROMPT;

    // 竞态防护：在收集 ab 的同一时刻定格消息数快照。合并请求飞行期间玩家可能又跑了
    // 新回合——那些 ab 不在本次输入里，lastMergedIdx 必须停在快照处，让它们留待下一轮，
    // 否则会被跨过并永久丢失（修复前的真实 bug）。
    const snapshotLen = (conv.messages || []).length;

    // Build user message
    let content = '';
    if (conv.storySetting) content += '【故事设定】\n' + conv.storySetting + '\n\n';

    const existingSm = conv.summary?.mergedSummaries || [];
    if (existingSm.length > 0) {
      content += '【已有压缩摘要（仅供上下文，不要重写）】\n';
      for (const sm of existingSm) {
        content += `<${sm.code}>${sm.content}</${sm.code}>\n\n`;
      }
    }

    const unmerged = this.getUnmergedAbstracts(conv);
    if (unmerged.length === 0) return null;
    content += '【待合并原始摘要】\n';
    for (const ab of unmerged) {
      content += `<${ab.code}>${ab.content}</${ab.code}>\n\n`;
    }

    // 目标条数按压缩比 1/10 ~ 1/7 动态计算（80条→8-11，100条→10-15），代码算好，不让模型自己算
    const lo = Math.max(1, Math.ceil(unmerged.length / 10));
    const hi = Math.max(lo, Math.ceil(unmerged.length / 7));
    content += `【本次要求】请将以上 ${unmerged.length} 条原始摘要合并为 ${lo}-${hi} 条 sm。`;

    log('generateMergeSummary: sending', unmerged.length, 'abstracts →', lo + '-' + hi, 'sm, existing sm:', existingSm.length);

    const result = await API.sendChat({
      apiProfileId: conv.apiProfileId || settings.defaultApiProfileId,
      model: conv.model || settings.defaultModel,
      systemPrompt: sys,
      messages: [{ role: 'user', content }],
    });

    if (!result.success) {
      log('Merge summary API failed:', result.error);
      return null;
    }

    const newSm = this.parseMergedSummaries(result.content);
    if (newSm.length === 0) {
      log('Merge summary: no <smXX> tags found in response');
      return null;
    }
    // 产出质量校验：偶发抽风时模型会把几十条 ab 压成一两条超短 sm（实测 flash 出现过：
    // 同输入第一次 1 条、重跑 9 条）。条数低于下限一半即判失败——ab 原样保留，下一轮自动重试。
    if (newSm.length < Math.max(1, Math.floor(lo / 2))) {
      log('Merge summary: got only', newSm.length, 'sm (expected', lo + '-' + hi, ') — rejected, will retry next turn');
      return null;
    }

    log('Merge summary: got', newSm.length, 'new sm entries');
    return {
      mergedSummaries: [...existingSm, ...newSm],
      lastMergedIdx: snapshotLen,
    };
  },

  /**
   * Parse <arXX>...</arXX> archive entries from AI response.
   */
  parseArchiveEntries(text) {
    const results = [];
    const regex = /<ar(\d+)>([\s\S]*?)<\/ar\1>/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({ code: 'ar' + match[1], content: match[2].trim() });
    }
    return results;
  },

  /** Whether recent sm list has grown past the promotion threshold. */
  shouldPromote(conv) {
    return (conv.summary?.mergedSummaries || []).length > this.RECENT_LIMIT;
  },

  /**
   * Promote the oldest sm entries into archive entries (L1 → L2 遗忘曲线晋升).
   * Returns { archive, mergedSummaries } or null on failure. Does not mutate conv.
   */
  async generateArchivePromotion(conv) {
    const settings = Storage.getSettings();
    const recent = conv.summary?.mergedSummaries || [];
    if (recent.length <= this.RECENT_LIMIT) return null;
    const batch = recent.slice(0, this.PROMOTE_BATCH);
    const existingAr = conv.summary?.archive || [];

    let content = '';
    if (conv.storySetting) content += '【故事设定】\n' + conv.storySetting + '\n\n';
    if (existingAr.length > 0) {
      content += '【已有档案（仅供上下文，不要重写）】\n';
      for (const ar of existingAr) content += `<${ar.code}>${ar.content}</${ar.code}>\n\n`;
    }
    content += '【待归档摘要】\n';
    for (const sm of batch) content += `<${sm.code}>${sm.content}</${sm.code}>\n\n`;
    content += `【本次要求】请将以上 ${batch.length} 条摘要按剧情弧归档为 2-4 条 ar（每条 500-800 字）。`;

    log('generateArchivePromotion: promoting', batch.length, 'sm → 2-3 ar, existing ar:', existingAr.length);

    const result = await API.sendChat({
      apiProfileId: conv.apiProfileId || settings.defaultApiProfileId,
      model: conv.model || settings.defaultModel,
      systemPrompt: PromptBuilder.DEFAULT_ARCHIVE_PROMPT,
      messages: [{ role: 'user', content }],
    });
    if (!result.success) { log('Archive promotion API failed:', result.error); return null; }

    const newAr = this.parseArchiveEntries(result.content);
    if (newAr.length === 0) { log('Archive promotion: no <arXX> tags found'); return null; }

    log('Archive promotion: got', newAr.length, 'archive entries');
    return {
      archive: [...existingAr, ...newAr],
      mergedSummaries: recent.slice(batch.length),
    };
  },

  /**
   * Re-archive the oldest archive entries when L2 itself overflows (超长局，约1300轮+才会发生).
   * Returns new archive array or null.
   */
  async generateArchiveCompaction(conv) {
    const settings = Storage.getSettings();
    const archive = conv.summary?.archive || [];
    if (archive.length <= this.ARCHIVE_LIMIT) return null;
    const batch = archive.slice(0, 8);
    const rest = archive.slice(8);

    let content = '';
    if (conv.storySetting) content += '【故事设定】\n' + conv.storySetting + '\n\n';
    content += '【待归档摘要】\n';
    for (const ar of batch) content += `<${ar.code}>${ar.content}</${ar.code}>\n\n`;
    content += `【本次要求】请将以上 ${batch.length} 条档案按剧情弧进一步归档为 2-4 条 ar（每条 500-800 字），编号从 ar01 重新开始。`;

    const result = await API.sendChat({
      apiProfileId: conv.apiProfileId || settings.defaultApiProfileId,
      model: conv.model || settings.defaultModel,
      systemPrompt: PromptBuilder.DEFAULT_ARCHIVE_PROMPT,
      messages: [{ role: 'user', content }],
    });
    if (!result.success) { log('Archive compaction API failed:', result.error); return null; }
    const newAr = this.parseArchiveEntries(result.content);
    if (newAr.length === 0) return null;
    // 重新编号，保持 ar 序列连续
    const merged = [...newAr, ...rest].map((ar, i) => ({ code: 'ar' + String(i + 1).padStart(2, '0'), content: ar.content }));
    log('Archive compaction:', archive.length, '→', merged.length);
    return merged;
  },
};

// ============================================================
// Exporter
// ============================================================
const Exporter = {
  toMarkdown(conv) {
    let md = `# ${conv.name || '未命名故事'}\n\n`;
    const archive = conv.summary?.archive || [];
    if (archive.length > 0) {
      md += `## 往事纪要\n`;
      for (const ar of archive) md += `**[${ar.code}]** ${ar.content}\n\n`;
      md += `---\n\n`;
    }
    const mergedSm = conv.summary?.mergedSummaries || [];
    if (mergedSm.length > 0) {
      md += `## 故事总结\n`;
      for (const sm of mergedSm) md += `**[${sm.code}]** ${sm.content}\n\n`;
      md += `---\n\n`;
    }
    md += `## 正文\n\n`;
    for (const m of (conv.messages || [])) {
      if (m.hidden) continue;
      const c = Summary.cleanAbstract(MVU.cleanText(m.content));
      md += m.role === 'assistant' ? `${c}\n\n` : `> ${c}\n\n`;
    }
    return md;
  },
  download(conv, fmt = 'md') {
    const name = conv.name || '未命名故事';
    const content = this.toMarkdown(conv);
    Utils.downloadFile(content, `${name}.${fmt}`, 'text/plain;charset=utf-8');
  },
};

// ============================================================
// Utils
// ============================================================
const Utils = {
  /** Download a file. Uses Android JavascriptInterface in WebView, blob URL otherwise. */
  downloadFile(content, filename, mimeType = 'application/json') {
    if (window.AndroidBridge?.saveFile) {
      window.AndroidBridge.saveFile(content, filename, mimeType);
      return;
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
  generateId(prefix = 'id') { return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`; },
  escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
  formatTime(ts) { return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); },
  formatRelative(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    return new Date(ts).toLocaleDateString('zh-CN');
  },
  renderMarkdown(text) {
    let h = Utils.escapeHtml(text);
    // Remove HTML comments (escaped by escapeHtml: &lt;!-- ... --&gt;) and collapse leftover blank lines
    h = h.replace(/&lt;!--[\s\S]*?--&gt;\s*/g, '');
    h = h.replace(/\n{3,}/g, '\n\n');
    h = h.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Dialogue quotes: "" "" 「」『』 — straight quotes first (before spans introduce " in attributes)
    h = h.replace(/"([^"]*)"/g, '<span class=\'quote-text\'>"$1"</span>');
    h = h.replace(/\u201c([^\u201c\u201d]*)\u201d/g, '<span class=\'quote-text\'>\u201c$1\u201d</span>');
    h = h.replace(/「([^「」]*)」/g, '<span class=\'quote-text\'>「$1」</span>');
    h = h.replace(/『([^『』]*)』/g, '<span class=\'quote-text\'>『$1』</span>');
    h = h.replace(/^(\*{3}|---)/gm, '<hr class="story-divider">');
    h = h.replace(/\n/g, '<br>');
    return h;
  },
  /**
   * Extract only <story>...</story> content from AI output.
   * Handles partial (unclosed) tags during streaming.
   * Falls back to old cleaning for backward compat (pre-story-tag messages).
   */
  extractStoryContent(text, applyRefinePass) {
    if (!text) return '';
    if (!text.includes('<story>')) {
      // Backward compat: no <story> tag, use old cleaning
      return Summary.cleanAbstract(MVU.cleanText(text));
    }
    let result = '';
    let pos = 0;
    while (pos < text.length) {
      const start = text.indexOf('<story>', pos);
      if (start === -1) break;
      const contentStart = start + 7;
      const end = text.indexOf('</story>', contentStart);
      if (end === -1) {
        // Unclosed tag — still streaming inside <story>
        result += text.substring(contentStart);
        break;
      }
      result += text.substring(contentStart, end);
      pos = end + 8;
    }
    result = result.trim();
    // Apply refine replacements if requested
    if (applyRefinePass) {
      const refineArr = MVU.parseRefine(text);
      if (refineArr) {
        result = MVU.applyRefine(result, refineArr);
      }
    }
    return result;
  },
};

// ============================================================
// UI Module
// ============================================================
const UI = {
  _pendingConfirm: null,

  showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = `toast-container toast-${type}`;
    t.innerHTML = `<div class="toast-content">${Utils.escapeHtml(message)}</div>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('toast-visible'));
    setTimeout(() => { t.classList.remove('toast-visible'); setTimeout(() => t.remove(), 300); }, 2500);
  },

  showModal({ title, content, buttons = [] }) {
    this.closeModal();
    const o = document.createElement('div');
    o.className = 'modal-overlay';
    o.innerHTML = `<div class="modal-box">
      <div class="modal-header"><span class="modal-title">${title || ''}</span><button class="modal-close-btn" onclick="UI.closeModal()">${Icons.close}</button></div>
      <div class="modal-body">${content}</div>
      ${buttons.length ? `<div class="modal-footer">${buttons.map(b => `<button class="btn ${b.class || ''}" onclick="${b.onclick}">${b.text}</button>`).join('')}</div>` : ''}
    </div>`;
    document.body.appendChild(o);
    requestAnimationFrame(() => o.classList.add('modal-visible'));
  },

  closeModal() {
    const m = document.querySelector('.modal-overlay');
    if (m) { m.classList.remove('modal-visible'); setTimeout(() => m.remove(), 200); }
  },

  showConfirm({ title, message, onConfirm }) {
    this._pendingConfirm = onConfirm;
    this.showModal({
      title, content: `<p>${message}</p>`,
      buttons: [
        { text: '取消', class: 'btn-secondary', onclick: 'UI.closeModal()' },
        { text: '确认', class: 'btn-primary', onclick: 'UI._execConfirm()' },
      ],
    });
  },

  _execConfirm() {
    const fn = this._pendingConfirm;
    this._pendingConfirm = null;
    this.closeModal();
    if (fn) fn();
  },
};

// ============================================================
// CSS Injection
// ============================================================
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Noto+Serif+SC:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');
    :root {
      --bg-deep: #0f0c08; --bg-primary: #18140e; --bg-surface: #211c14; --bg-elevated: #2a2318;
      --bg-glass: rgba(33, 28, 20, 0.85); --bg-glass-light: rgba(42, 35, 24, 0.7);
      --text-primary: #e8dcc8; --text-secondary: #b0a48e; --text-muted: #7a6f5e;
      --accent: #c9a44c; --accent-dim: rgba(201, 164, 76, 0.15); --accent-glow: rgba(201, 164, 76, 0.3);
      --border: rgba(201, 164, 76, 0.12); --border-strong: rgba(201, 164, 76, 0.25);
      --success: #7cb87a; --danger: #c96a5a;
      --font-display: 'Cormorant Garamond', 'Noto Serif SC', serif;
      --font-body: 'Noto Serif SC', 'Cormorant Garamond', serif;
      --font-ui: 'Outfit', sans-serif;
      --radius: 8px; --radius-lg: 14px;
      --shadow: 0 4px 24px rgba(0,0,0,0.4); --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--font-ui); background: var(--bg-deep); color: var(--text-primary); min-height: 100vh; overflow: hidden; }
    body::before { content: ''; position: fixed; inset: 0; background: url('assets/bg.jpg') center/cover no-repeat; opacity: 0.35; z-index: 0; pointer-events: none; }
    body::after { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse at 30% 20%, rgba(201,164,76,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(201,164,76,0.04) 0%, transparent 60%); z-index: 0; pointer-events: none; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; } ::-webkit-scrollbar-thumb:hover { background: var(--accent-glow); }
    .icon { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; } .icon svg { width: 100%; height: 100%; }
    .btn { font-family: var(--font-ui); font-size: 13px; font-weight: 500; padding: 8px 18px; border: none; border-radius: var(--radius); cursor: pointer; transition: all var(--transition); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
    .btn-primary { background: linear-gradient(135deg, var(--accent), #d4b05c); color: #1a1510; font-weight: 600; }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-secondary { background: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border); }
    .btn-secondary:hover { border-color: var(--border-strong); color: var(--text-primary); }
    .btn-ghost { background: transparent; color: var(--text-secondary); padding: 6px 10px; }
    .btn-ghost:hover { color: var(--accent); background: var(--accent-dim); }
    .btn-icon { width: 36px; height: 36px; padding: 0; display: inline-flex; align-items: center; justify-content: center; background: transparent; border: none; border-radius: var(--radius); color: var(--text-secondary); cursor: pointer; transition: all var(--transition); }
    .btn-icon:hover { color: var(--accent); background: var(--accent-dim); }
    input, textarea, select { font-family: var(--font-ui); font-size: 14px; background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; outline: none; transition: border-color var(--transition); width: 100%; }
    input[type="checkbox"], input[type="radio"] { width: auto; padding: 0; background: none; border: revert; border-radius: revert; cursor: pointer; }
    input:focus, textarea:focus, select:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
    textarea { resize: vertical; min-height: 80px; line-height: 1.6; } select { cursor: pointer; }
    label { font-size: 13px; color: var(--text-secondary); font-weight: 500; margin-bottom: 4px; display: block; }
    .toast-container { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-20px); z-index: 10000; opacity: 0; transition: all 0.3s ease; pointer-events: none; }
    .toast-visible { opacity: 1; transform: translateX(-50%) translateY(0); }
    .toast-content { padding: 10px 22px; border-radius: var(--radius); font-size: 13px; font-weight: 500; backdrop-filter: blur(12px); border: 1px solid var(--border); }
    .toast-info .toast-content { background: var(--bg-glass); color: var(--text-primary); }
    .toast-success .toast-content { background: rgba(124,184,122,0.15); color: var(--success); border-color: rgba(124,184,122,0.3); }
    .toast-error .toast-content { background: rgba(201,106,90,0.15); color: var(--danger); border-color: rgba(201,106,90,0.3); }
    .modal-overlay { position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s ease; pointer-events: none; }
    .modal-visible { opacity: 1; pointer-events: auto; }
    .modal-box { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 0; min-width: 360px; max-width: 520px; width: 90%; box-shadow: var(--shadow); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
    .modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--accent); }
    .modal-close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all var(--transition); }
    .modal-close-btn:hover { color: var(--text-primary); background: var(--accent-dim); }
    .modal-body { padding: 20px; line-height: 1.6; color: var(--text-secondary); font-size: 14px; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
    .quote-text { color: var(--accent); margin-right: 0.25em; }
    .story-divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .fade-in { animation: fadeIn 0.4s ease forwards; }
    .mvu-empty { text-align: center; padding: 40px 20px; color: var(--text-muted); font-style: italic; font-size: 14px; }
  `;
  document.head.appendChild(s);
})();
