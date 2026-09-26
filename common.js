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
  save: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
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
  KEYS: { SETTINGS: 'airp_settings', API_PROFILES: 'airp_apiProfiles', CONVERSATIONS: 'airp_conversations', CONV_CACHE: 'airp_conv_cache', STORYLINES: 'airp_storylines', MEMORY_LIBS: 'airp_memoryLibraries' },

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
    const [settings, profiles, convMeta, storylines, memoryLibraries] = await Promise.all([
      this._fetchFromServer('/api/settings'),
      this._fetchFromServer('/api/profiles'),
      this._fetchFromServer('/api/conversations?meta=1'),
      this._fetchFromServer('/api/storylines'),
      this._fetchFromServer('/api/memoryLibraries'),
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
    // Storylines / memory libraries: merge by updatedAt (never drop a newer local copy)
    for (const [key, remote] of [[this.KEYS.STORYLINES, storylines], [this.KEYS.MEMORY_LIBS, memoryLibraries]]) {
      if (!remote || typeof remote !== 'object') continue;
      const local = this._get(key, {}) || {};
      const merged = { ...remote };
      for (const [id, item] of Object.entries(local)) {
        if (!merged[id] || (item.updatedAt || 0) > (merged[id].updatedAt || 0)) merged[id] = item;
      }
      this._set(key, merged);
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
    enableNotificationBar: true,
    showPromptInspector: false, enableWebSearch: false,
    promptInit: '', promptSummaryGen: '', promptEntries: null,
    promptPresets: null, activePresetId: 'default',
    optionsFabSendMode: 'send',
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
  _META_FIELDS: ['id', 'name', 'phase', 'createdAt', 'updatedAt', 'apiProfileId', 'model', 'msgCount', 'storylineId', 'presetId'],
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

  // ---- Storylines（故事线容器：把多个对话归到一条线下，新对话可继承）----
  getStorylines() { return this._get(this.KEYS.STORYLINES, {}); },
  getStoryline(id) { return this.getStorylines()[id] || null; },
  saveStoryline(s) {
    const all = this.getStorylines();
    all[s.id] = { ...s, updatedAt: Date.now() };
    this._set(this.KEYS.STORYLINES, all);
    this._syncToServer('/api/storylines', all);
    return all[s.id];
  },
  deleteStoryline(id) {
    const all = this.getStorylines();
    delete all[id];
    this._set(this.KEYS.STORYLINES, all);
    this._syncToServer('/api/storylines', all);
  },
  getStorylineList() {
    return Object.values(this.getStorylines()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },

  // ---- Memory libraries（记忆库：可跨对话复用的记忆条目集合）----
  getMemoryLibraries() { return this._get(this.KEYS.MEMORY_LIBS, {}); },
  getMemoryLibrary(id) { return this.getMemoryLibraries()[id] || null; },
  saveMemoryLibrary(lib) {
    const all = this.getMemoryLibraries();
    all[lib.id] = { ...lib, updatedAt: Date.now() };
    this._set(this.KEYS.MEMORY_LIBS, all);
    this._syncToServer('/api/memoryLibraries', all);
    return all[lib.id];
  },
  deleteMemoryLibrary(id) {
    const all = this.getMemoryLibraries();
    delete all[id];
    this._set(this.KEYS.MEMORY_LIBS, all);
    this._syncToServer('/api/memoryLibraries', all);
  },
  getMemoryLibraryList() {
    return Object.values(this.getMemoryLibraries()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },

  async exportAll() {
    if (this._isNative) {
      // Native mode: load all conversations from native storage
      const index = this.getConversations();
      const conversations = {};
      for (const id of Object.keys(index)) {
        const conv = this._nativeGet('conv_' + id, null);
        if (conv) conversations[id] = conv;
      }
      return {
        settings: this.getSettings(), apiProfiles: this.getApiProfiles(), conversations,
        storylines: this.getStorylines(), memoryLibraries: this.getMemoryLibraries(),
      };
    }
    // Web mode: fetch from server
    const conversations = await this._fetchFromServer('/api/conversations') || {};
    return {
      settings: this.getSettings(), apiProfiles: this.getApiProfiles(), conversations,
      storylines: this.getStorylines(), memoryLibraries: this.getMemoryLibraries(),
    };
  },
  async importAll(d) {
    if (d.settings) { this._set(this.KEYS.SETTINGS, d.settings); if (!this._isNative) this._putToServer('/api/settings', d.settings); }
    if (d.apiProfiles) { this._set(this.KEYS.API_PROFILES, d.apiProfiles); if (!this._isNative) this._putToServer('/api/profiles', d.apiProfiles); }
    if (d.storylines) { this._set(this.KEYS.STORYLINES, d.storylines); if (!this._isNative) this._putToServer('/api/storylines', d.storylines); }
    if (d.memoryLibraries) { this._set(this.KEYS.MEMORY_LIBS, d.memoryLibraries); if (!this._isNative) this._putToServer('/api/memoryLibraries', d.memoryLibraries); }
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
  _cacheControl1h() {
    return { type: 'ephemeral', ttl: '1h' };
  },

  _isClaudeModel(model = '') {
    return (model || '').toLowerCase().includes('claude');
  },

  _rejectsAssistantPrefill(model = '') {
    const m = (model || '').toLowerCase();
    return /opus-4-(?:6|7|8)|sonnet-4-6|fable-5|mythos/.test(m);
  },

  _normalizeClaudeMessage(m, model = '') {
    if (m._assistantPrefill && this._rejectsAssistantPrefill(model)) {
      return {
        role: 'user',
        content: '【回复起始格式要求】\n请在本次回复开头使用以下文本，然后继续完成回复：\n' + m.content,
      };
    }
    return m;
  },

  _isClewdrClaudeRoute(p, model = '') {
    if (p.provider !== 'openai' || !this._isClaudeModel(model)) return false;
    try {
      return /\/code\/v1\/?$/.test(new URL(this._getBaseUrl(p)).pathname);
    } catch {
      return /\/code\/v1\/?$/.test(this._getBaseUrl(p));
    }
  },

  _getBaseUrl(p) {
    if (p.baseUrl) return this._normalizeBaseUrl(p);
    const defaults = { openai: 'https://api.openai.com/v1', claude: 'https://api.anthropic.com/v1', 'google-ai-studio': 'https://generativelanguage.googleapis.com/v1beta' };
    return defaults[p.provider] || '';
  },

  _ensureBaseUrlScheme(raw) {
    let value = (raw || '').trim();
    if (!value) return '';
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) return value;
    if (value.startsWith('//')) return 'https:' + value;
    const isLocal = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?::\d+)?(?:\/|$)/.test(value);
    return (isLocal ? 'http://' : 'https://') + value;
  },

  _sanitizeBaseUrl(raw) {
    let value = this._ensureBaseUrlScheme(raw);
    if (!value) return '';
    value = value.split('#')[0].split('?')[0].replace(/\/+$/, '');
    value = value.replace(/\/models\/[^/]+:(?:streamGenerateContent|generateContent)$/i, '');
    value = value.replace(/\/(?:chat\/completions|responses|messages|models)$/i, '');
    return value.replace(/\/+$/, '');
  },

  _shouldAppendDefaultVersion(path) {
    const clean = (path || '').replace(/\/+$/, '');
    if (!clean) return true;
    if (/\/v\d+(?:beta)?$/i.test(clean)) return false;
    return /\/(?:api|openai)$/i.test(clean);
  },

  _appendPathSegment(path, segment) {
    const clean = (path || '').replace(/\/+$/, '');
    return clean ? clean + '/' + segment : '/' + segment;
  },

  _normalizeBaseUrl(p) {
    const provider = p?.provider || 'openai';
    const rawBase = this._sanitizeBaseUrl(p?.baseUrl || '');
    if (!rawBase) return '';
    try {
      const url = new URL(rawBase);
      let path = url.pathname.replace(/\/+$/, '');
      const host = url.hostname.toLowerCase();
      if (provider === 'google-ai-studio') {
        if (host.includes('generativelanguage.googleapis') && !/\/v\d+(?:beta)?$/i.test(path)) {
          path = this._appendPathSegment(path, 'v1beta');
        }
      } else if (provider === 'claude') {
        if (!path || /\/(?:api|anthropic)$/i.test(path)) path = this._appendPathSegment(path, 'v1');
      } else if (this._shouldAppendDefaultVersion(path)) {
        path = this._appendPathSegment(path, 'v1');
      }
      return `${url.protocol}//${url.host}${path}`.replace(/\/+$/, '');
    } catch {
      let value = rawBase;
      const path = value.replace(/^https?:\/\/[^/]+/i, '');
      if (provider === 'google-ai-studio') {
        if (value.includes('generativelanguage.googleapis') && !/\/v\d+(?:beta)?$/i.test(value)) value += '/v1beta';
      } else if (provider === 'claude') {
        if (/^https?:\/\/[^/]+$/i.test(value) || /\/(?:api|anthropic)$/i.test(value)) value += '/v1';
      } else if (this._shouldAppendDefaultVersion(path)) {
        value += '/v1';
      }
      return value.replace(/\/+$/, '');
    }
  },

  _getHeaders(p, model = '') {
    const h = { 'Content-Type': 'application/json' };
    const extra = this._parseExtraHeaders(p?.extraHeaders || '');
    const provider = this._detect(p, model);
    if (provider === 'claude') {
      if (!this._hasHeader(extra, 'x-api-key')) h['x-api-key'] = p.apiKey;
      if (!this._hasHeader(extra, 'anthropic-version')) h['anthropic-version'] = '2023-06-01';
    } else if (provider !== 'google') {
      if (!this._hasHeader(extra, 'authorization') && !this._hasHeader(extra, 'api-key') && !this._hasHeader(extra, 'x-api-key')) {
        h['Authorization'] = `Bearer ${p.apiKey}`;
      }
      if (this._isMimoProfile(p, model) && !this._hasHeader(extra, 'api-key')) h['api-key'] = p.apiKey;
    }
    // 删除用户指定的默认头（例如换用自己的鉴权方案时去掉 Authorization）
    for (const name of this._parsePathList(p?.excludeHeaders)) {
      const target = String(name).toLowerCase();
      for (const key of Object.keys(h)) {
        if (key.toLowerCase() === target) delete h[key];
      }
    }
    return { ...h, ...extra };
  },

  _parseExtraHeaders(raw) {
    const headers = {};
    const text = (raw || '').trim();
    if (!text) return headers;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const [key, value] of Object.entries(parsed)) {
          if (String(key).trim() && value !== undefined && value !== null && String(value).trim()) headers[String(key).trim()] = String(value).trim();
        }
        return headers;
      }
    } catch {}
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
      const idx = trimmed.indexOf(':');
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (key && value) headers[key] = value;
    }
    return headers;
  },

  _hasHeader(headers, name) {
    const target = String(name || '').toLowerCase();
    return Object.keys(headers || {}).some(key => key.toLowerCase() === target);
  },

  // ============================================================
  // Request parameter control
  //   采样参数 / 思考控制 / 自定义请求体与请求头
  // ============================================================

  // 这些字段永远不允许被用户自定义覆盖或删除，否则请求结构会被破坏
  PROTECTED_BODY_KEYS: ['messages', 'system', 'contents', 'stream'],

  _numOrNull(value) {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  },

  _clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  },

  /** 解析「自定义请求体」：优先 JSON（保留数字/布尔类型），退化为逐行 key: value */
  _parseExtraBody(raw) {
    const text = (raw || '').trim();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { ...parsed };
    } catch {}
    const out = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
      const idx = trimmed.indexOf(':');
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      if (!key) continue;
      const rawValue = trimmed.slice(idx + 1).trim();
      if (!rawValue) continue;
      try { out[key] = JSON.parse(rawValue); } catch { out[key] = rawValue; }
    }
    return Object.keys(out).length ? out : null;
  },

  /** 解析「删除字段 / 删除请求头」列表：一行一条（也容忍逗号分隔） */
  _parsePathList(raw) {
    return String(raw || '')
      .split(/\r?\n|,/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('#') && !s.startsWith('//'));
  },

  /** 按点号路径删除字段，如 a.b.c */
  _deletePath(target, path) {
    if (!target || !path) return false;
    const parts = String(path).split('.').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return false;
    let node = target;
    for (let i = 0; i < parts.length - 1; i++) {
      if (node === null || typeof node !== 'object') return false;
      node = node[parts[i]];
    }
    if (node === null || typeof node !== 'object') return false;
    const last = parts[parts.length - 1];
    if (!Object.prototype.hasOwnProperty.call(node, last)) return false;
    delete node[last];
    return true;
  },

  /** 按点号路径写入字段，中间层不存在则创建，如 generationConfig.temperature */
  _setPath(target, path, value) {
    if (!target || !path) return target;
    const parts = String(path).split('.').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return target;
    if (parts.length === 1) { target[parts[0]] = value; return target; }
    let node = target;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (node[key] === null || typeof node[key] !== 'object' || Array.isArray(node[key])) node[key] = {};
      node = node[key];
    }
    node[parts[parts.length - 1]] = value;
    return target;
  },

  /**
   * 采样参数：留空一律不发送（保证默认行为与老版本完全一致）。
   * 返回「点号路径 → 值」的映射，因为 Google 的采样参数藏在 generationConfig 下且用驼峰名，
   * 而 OpenAI / Claude 是顶层下划线名。两端都用同一套路径写入。
   */
  _samplerFields(p, model = '') {
    const out = {};
    const isGoogle = this._detect(p, model) === 'google';
    const t = this._numOrNull(p?.temperature);
    const tp = this._numOrNull(p?.topP);
    const tk = this._numOrNull(p?.topK);
    const mt = this._numOrNull(p?.maxTokens);
    const pp = this._numOrNull(p?.presencePenalty);
    const fp = this._numOrNull(p?.frequencyPenalty);

    if (isGoogle) {
      if (t !== null) out['generationConfig.temperature'] = this._clamp(t, 0, 2);
      if (tp !== null) out['generationConfig.topP'] = this._clamp(tp, 0, 1);
      if (tk !== null) out['generationConfig.topK'] = Math.max(1, Math.floor(tk));
      if (mt !== null && mt > 0) out['generationConfig.maxOutputTokens'] = Math.floor(mt);
      if (pp !== null) out['generationConfig.presencePenalty'] = pp;
      if (fp !== null) out['generationConfig.frequencyPenalty'] = fp;
      return out;
    }

    if (t !== null) out.temperature = this._clamp(t, 0, 2);
    if (tp !== null) out.top_p = this._clamp(tp, 0, 1);
    if (tk !== null) out.top_k = Math.max(0, Math.floor(tk));
    if (mt !== null && mt > 0) out.max_tokens = Math.floor(mt);
    if (pp !== null) out.presence_penalty = pp;
    if (fp !== null) out.frequency_penalty = fp;
    return out;
  },

  _thinkingSpec(p) {
    const mode = ['auto', 'off', 'on', 'effort', 'custom'].includes(p?.thinkingMode) ? p.thinkingMode : 'auto';
    const effort = ['minimal', 'low', 'medium', 'high', 'max'].includes(p?.reasoningEffort) ? p.reasoningEffort : '';
    const budgetRaw = this._numOrNull(p?.thinkingBudget);
    const budget = budgetRaw === null ? null : Math.max(0, Math.floor(budgetRaw));
    return { mode, effort, budget };
  },

  _claudeThinkingBudget(effort, cap) {
    if (effort === 'minimal') return 1024;
    const pct = { low: 0.15, medium: 0.25, high: 0.5, max: 0.95 }[effort];
    if (!pct) return null;
    return Math.max(1024, Math.floor(cap * pct));
  },

  /** Gemini 的 thinkingBudget 下限：Flash / Lite 可归零，Pro 系最低 128（官方硬限制） */
  _googleBudgetFloor(model) {
    const ml = (model || '').toLowerCase();
    return (ml.includes('flash') || ml.includes('lite')) ? 0 : 128;
  },

  _googleThinkingBudget(effort, cap, model) {
    const ml = (model || '').toLowerCase();
    const isFlash = ml.includes('flash');
    const isLite = ml.includes('lite');
    const floor = this._googleBudgetFloor(model);
    if (effort === 'minimal') return floor;
    const pct = { low: 0.15, medium: 0.25, high: 0.5, max: 1 }[effort];
    if (!pct) return null;
    const min = isLite ? 512 : 128;
    const ceiling = (isFlash || isLite) ? 24576 : 32768;
    return Math.min(Math.max(min, Math.floor(cap * pct)), ceiling);
  },

  /**
   * 思考控制 → 各家参数。
   * ⚠ 多数后端的推理无法真正关闭，「off」只是尽力而为；关不掉时可配合「隐藏思考内容」。
   * 返回 null 表示不发送任何思考相关参数。
   */
  _thinkingBody(p, model, cap) {
    const { mode, effort, budget } = this._thinkingSpec(p);
    if (mode === 'auto' || mode === 'custom') return null;

    const prov = this._detect(p, model);
    const ml = (model || '').toLowerCase();
    const off = mode === 'off';

    // GLM / Kimi / MiMo：官方支持 thinking.type 开关，但不支持力度
    if (/glm|z\.ai|zai|kimi|moonshot/.test(ml) || this._isMimoProfile(p, model)) {
      return { thinking: { type: off ? 'disabled' : 'enabled' } };
    }

    if (prov === 'claude') {
      if (off) return { thinking: { type: 'disabled' } };
      const b = budget ?? this._claudeThinkingBudget(effort, cap);
      return b ? { thinking: { type: 'enabled', budget_tokens: b } } : null;
    }

    if (prov === 'google') {
      // Gemini 3 系已改用 thinkingLevel，不再接受 thinkingBudget
      if (/gemini-3|gemini3/.test(ml)) {
        const lvl = { minimal: 'minimal', low: 'low', medium: 'medium', high: 'high', max: 'high' }[effort];
        if (off) return { generationConfig: { thinkingConfig: { thinkingLevel: 'minimal' } } };
        return lvl ? { generationConfig: { thinkingConfig: { thinkingLevel: lvl } } } : null;
      }
      if (off) {
        // Pro 系关不掉思考，只能压到官方下限 128；Flash / Lite 可以归零
        const b = budget === null
          ? this._googleThinkingBudget('minimal', cap, model)
          : Math.max(this._googleBudgetFloor(model), budget);
        return { generationConfig: { thinkingConfig: { thinkingBudget: b } } };
      }
      const b = budget ?? this._googleThinkingBudget(effort, cap, model);
      return b === null ? null : { generationConfig: { thinkingConfig: { thinkingBudget: b } } };
    }

    // OpenAI 兼容
    if (off) {
      // GPT-5.4+ 的「最低」即 none（真正禁用推理）
      if (/gpt-5\.[4-9]|gpt-5\.\d\d|gpt-6/.test(ml)) return { reasoning_effort: 'none' };
      return { reasoning_effort: 'minimal' };
    }
    const eff = { minimal: 'minimal', low: 'low', medium: 'medium', high: 'high', max: 'high' }[effort];
    return eff ? { reasoning_effort: eff } : null;
  },

  /** 预设里参与"覆盖 API 方案"的字段（只有明确给了值的才覆盖，空值表示不干预） */
  PRESET_SAMPLER_KEYS: ['temperature', 'topP', 'topK', 'maxTokens', 'presencePenalty', 'frequencyPenalty'],
  PRESET_THINKING_KEYS: ['thinkingMode', 'reasoningEffort', 'thinkingBudget', 'hideReasoning'],

  /**
   * 把预设里的采样 / 思考设置叠到 API 方案上。
   * 参数优先级链：对话级预设 > 全局预设 > API 方案 > 内置默认。
   * （对话级 / 全局级哪一级生效，由 PromptBuilder.getActivePreset 决定，这里只负责"叠加"。）
   * 返回 { merged, sources, presetName }，sources 记录每个字段的来源，供「预览最终请求」展示。
   */
  _mergeProfileWithPreset(p, preset = null) {
    const merged = { ...(p || {}) };
    const sources = {};
    const name = String(preset?.name || '').trim();
    const label = name ? `预设「${name}」` : '预设';
    if (!preset) return { merged, sources, presetName: '' };

    const sampler = preset.sampler || {};
    for (const key of this.PRESET_SAMPLER_KEYS) {
      const value = sampler[key];
      if (value === undefined || value === null || String(value).trim() === '') continue;
      merged[key] = value;
      sources[key] = label;
    }

    const thinking = preset.thinking || {};
    for (const key of this.PRESET_THINKING_KEYS) {
      const value = thinking[key];
      if (value === undefined || value === null) continue;
      if (key === 'hideReasoning') { merged[key] = !!value; sources[key] = label; continue; }
      if (String(value).trim() === '') continue;
      merged[key] = value;
      sources[key] = label;
    }
    return { merged, sources, presetName: name };
  },

  /**
   * 算出最终要注入的请求参数。
   * 供「预览最终请求」与安卓原生通道共用——provider 映射只在这一处，避免两端不同步。
   * @param preset 当前生效的预设（可选）；给了就叠加到 API 方案之上。
   */
  resolveRequestParams(p, model, baseMaxTokens, preset = null) {
    const { merged, sources } = this._mergeProfileWithPreset(p, preset);
    const sampler = this._samplerFields(merged, model);
    const cap = this._numOrNull(merged?.maxTokens) || baseMaxTokens || this._maxTokensForModel(model);
    return {
      sampler,
      thinking: this._thinkingBody(merged, model, cap) || null,
      extraBody: this._parseExtraBody(merged?.extraBody),
      excludeBody: this._parsePathList(merged?.excludeBody),
      extraHeaders: this._parseExtraHeaders(merged?.extraHeaders || ''),
      excludeHeaders: this._parsePathList(merged?.excludeHeaders),
      // 元信息：仅供 UI 展示来源，不参与请求体组装
      sources,
    };
  },

  /** 把算好的参数落到 body 上 */
  applyRequestParams(body, params) {
    if (!body || !params) return body;
    if (params.sampler) {
      for (const [path, value] of Object.entries(params.sampler)) this._setPath(body, path, value);
    }
    if (params.thinking) {
      for (const [key, value] of Object.entries(params.thinking)) {
        if (key === 'generationConfig') {
          body.generationConfig = { ...(body.generationConfig || {}), ...value };
        } else if (key === 'thinking') {
          body.thinking = { ...(body.thinking || {}), ...value };
        } else {
          body[key] = value;
        }
      }
    }
    const extra = params.extraBody;
    if (extra) {
      const safe = { ...extra };
      for (const k of this.PROTECTED_BODY_KEYS) delete safe[k];
      Object.assign(body, safe);
    }
    for (const path of (params.excludeBody || [])) {
      if (this.PROTECTED_BODY_KEYS.includes(String(path).trim())) continue;
      this._deletePath(body, path);
    }
    return body;
  },

  /** 预览最终会发出的请求（Key 已脱敏） */
  previewRequest(p, model, preset = null) {
    const sampleSystem = '（示例）你是一位小说作者，请续写接下来的剧情。';
    const sampleMessages = [{ role: 'user', content: '（示例）继续写下去' }];
    const body = this._buildBody(p, model, sampleSystem, sampleMessages, true, preset);
    const headers = this._getHeaders(p, model);
    const { sources, presetName } = this._mergeProfileWithPreset(p, preset);
    const mask = (value) => {
      const s = String(value);
      if (s.length <= 8) return '****';
      return s.slice(0, 4) + '****' + s.slice(-4);
    };
    const safeHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      safeHeaders[key] = /key|authorization|token|secret/i.test(key) ? mask(value) : value;
    }
    return {
      url: this._buildUrl(p, model, true),
      provider: this._detect(p, model),
      headers: safeHeaders,
      body,
      sources,
      presetName,
    };
  },

  _isMimoProfile(p, model = '') {
    const haystack = `${p?.provider || ''} ${p?.name || ''} ${p?.baseUrl || ''} ${model || ''}`.toLowerCase();
    return haystack.includes('mimo') || haystack.includes('xiaomi') || haystack.includes('mi.com');
  },

  // Detect actual provider from profile + URL + model name
  _detect(p, model = '') {
    if (p.provider === 'claude') return 'claude';
    if (p.provider === 'google-ai-studio') return 'google';
    const url = this._getBaseUrl(p).toLowerCase();
    if (url.includes('anthropic')) return 'claude';
    if (url.includes('generativelanguage.googleapis')) return 'google';
    // OpenAI-compatible (covers proxies for Claude/Gemini too)
    return 'openai';
  },

  _buildUrl(p, model, stream) {
    const base = this._getBaseUrl(p);
    const provider = this._detect(p, model);
    if (provider === 'google') {
      const act = stream ? 'streamGenerateContent?alt=sse&' : 'generateContent?';
      return `${base}/models/${encodeURIComponent(model)}:${act}key=${encodeURIComponent(p.apiKey || '')}`;
    }
    if (provider === 'claude') return `${base}/messages`;
    return `${base}/chat/completions`;
  },

  _maxTokensForModel(model) {
    const m = (model || '').toLowerCase();
    if (m.includes('opus-4-6') || m.includes('opus-4.6')) return 128000;
    if (m.includes('opus-4-1') || m.includes('opus-4.1') || m.includes('claude-3-opus')) return 32000;
    return 64000;
  },

  _buildBody(p, model, systemPrompt, messages, stream, preset = null) {
    const body = this._buildBodyCore(p, model, systemPrompt, messages, stream);
    return this.applyRequestParams(body, this.resolveRequestParams(p, model, body?.max_tokens, preset));
  },

  _buildBodyCore(p, model, systemPrompt, messages, stream) {
    const prov = this._detect(p, model);
    const webSearch = !!Storage.getSettings()?.enableWebSearch;

    if (prov === 'claude') {
      // Ensure alternating roles, first must be user.
      // 每条内部消息保留为独立 content block，让摘要可以逐条追加，并把缓存断点
      // 精确放在最新一条稳定摘要上。Anthropic 缓存匹配的是断点之前的完整前缀。
      const msgs = [];
      for (const original of messages) {
        const m = this._normalizeClaudeMessage(original, model);
        const role = m.role === 'assistant' ? 'assistant' : 'user';
        const block = { type: 'text', text: m.content };
        if (original._cacheControl || original._cacheAnchor) {
          block.cache_control = this._cacheControl1h();
        }
        if (msgs.length > 0 && msgs[msgs.length - 1].role === role) {
          msgs[msgs.length - 1].content.push(block);
        } else {
          msgs.push({ role, content: [block] });
        }
      }
      // If first message is assistant, prepend empty user
      if (msgs.length > 0 && msgs[0].role !== 'user') {
        msgs.unshift({ role: 'user', content: [{ type: 'text', text: '(continue)' }] });
      }
      // 固定 system 断点也让 ClewdR/多账号网关能够按稳定 system 选择粘性账号。
      const sys = systemPrompt ? [{ type: 'text', text: systemPrompt, cache_control: this._cacheControl1h() }] : undefined;
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

    // ClewdR /code/v1 accepts Claude cache_control as an OpenAI content-block extension,
    // then preserves it while converting Chat Completions to Claude Messages.
    if (this._isClewdrClaudeRoute(p, model)) {
      const msgs = [];
      if (systemPrompt) {
        msgs.push({
          role: 'system',
          content: [{ type: 'text', text: systemPrompt, cache_control: this._cacheControl1h() }],
        });
      }
      for (const original of messages) {
        const m = this._normalizeClaudeMessage(original, model);
        const role = m.role === 'assistant' ? 'assistant' : 'user';
        const block = { type: 'text', text: m.content };
        if (original._cacheControl || original._cacheAnchor) {
          block.cache_control = this._cacheControl1h();
        }
        if (msgs.length > 0 && msgs[msgs.length - 1].role === role && msgs[msgs.length - 1].role !== 'system') {
          msgs[msgs.length - 1].content.push(block);
        } else {
          msgs.push({ role, content: [block] });
        }
      }
      const body = { model, messages: msgs, stream, max_tokens: this._maxTokensForModel(model) };
      if (webSearch) {
        body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
      }
      return body;
    }

    // Generic OpenAI compatible
    const msgs = [];
    if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
    for (const m of messages) msgs.push({ role: m.role, content: m.content });
    const body = { model, messages: msgs, stream, max_tokens: this._maxTokensForModel(model) };
    if (this._isMimoProfile(p, model)) body.thinking = { type: 'disabled' };
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

  async sendChat({ apiProfileId, model, systemPrompt, messages, preset = null }) {
    const p = Storage.getApiProfile(apiProfileId);
    if (!p) return { success: false, error: 'API配置不存在' };
    // Server proxy mode
    if (p.provider === 'server-proxy') {
      return this._sendViaProxy({ model, systemPrompt, messages });
    }
    try {
      const res = await fetch(this._buildUrl(p, model, false), { method: 'POST', headers: this._getHeaders(p, model), body: JSON.stringify(this._buildBody(p, model, systemPrompt, messages, false, preset)) });
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
  streamChat({ apiProfileId, model, systemPrompt, messages, preset = null, onChunk, onDone, onError, onStatus }) {
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
      this._nonStreamAsStream({ apiProfileId, model, systemPrompt, messages, preset, onChunk, onDone, onError, onStatus, controller });
      return controller;
    }

    const prov = this._detect(p, model);
    const url = this._buildUrl(p, model, true);
    const body = this._buildBody(p, model, systemPrompt, messages, true, preset);
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
          headers: this._getHeaders(p, model),
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
        let buffer = '', fullText = '', usage = this._emptyUsage();
        let finishReason = '';
        const openAiStreamState = { reasoningOpen: false, regularStarted: false };
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
              if (!line.startsWith('data:')) continue;
              const raw = line.slice(5).trim();
              if (raw === '[DONE]') {
                if (openAiStreamState.reasoningOpen) {
                  const closeChunk = '</think>';
                  openAiStreamState.reasoningOpen = false;
                  fullText += closeChunk;
                  onChunk?.(closeChunk, fullText);
                }
                continue;
              }
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
                  if (data.type === 'message_delta' && data.usage) this._applyUsage(usage, data.usage);
                  if (data.type === 'message_delta' && data.delta?.stop_reason) finishReason = data.delta.stop_reason;
                  if (data.type === 'message_start' && data.message?.usage) this._applyUsage(usage, data.message.usage);
                } else if (prov === 'google') {
                  const cand = data.candidates?.[0];
                  if (cand && !cand.content) log('Google SSE: candidate without content:', JSON.stringify(cand).substring(0, 300));
                  if (cand?.finishReason) finishReason = cand.finishReason;
                  const parts = cand?.content?.parts || [];
                  for (const pt of parts) if (pt.text) chunk += pt.text;
                  if (data.usageMetadata) { usage.input = data.usageMetadata.promptTokenCount || 0; usage.output = data.usageMetadata.candidatesTokenCount || 0; }
                } else {
                  const choice = data.choices?.[0] || {};
                  chunk = this._openAiStreamChunk(choice.delta || choice, openAiStreamState);
                  if (choice.finish_reason) finishReason = choice.finish_reason;
                  if (data.usage) this._applyUsage(usage, data.usage);
                }
                if (chunk) { fullText += chunk; onChunk?.(chunk, fullText); }
              } catch (parseErr) { log('SSE parse error:', parseErr.message, 'raw:', raw.substring(0, 200)); }
            }
          }
        } finally {
          reader.releaseLock();
        }

        if (openAiStreamState.reasoningOpen) {
          const closeChunk = '</think>';
          openAiStreamState.reasoningOpen = false;
          fullText += closeChunk;
          onChunk?.(closeChunk, fullText);
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
  async _nonStreamAsStream({ apiProfileId, model, systemPrompt, messages, preset = null, onChunk, onDone, onError, onStatus, controller }) {
    try {
      onStatus?.('connecting');
      const p = Storage.getApiProfile(apiProfileId);
      const res = await fetch(this._buildUrl(p, model, false), {
        method: 'POST',
        headers: this._getHeaders(p),
        body: JSON.stringify(this._buildBody(p, model, systemPrompt, messages, false, preset)),
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
    let text = '', usage = this._emptyUsage();
    if (data.usage) this._applyUsage(usage, data.usage);
    else if (data.usageMetadata) { usage.input = data.usageMetadata.promptTokenCount || 0; usage.output = data.usageMetadata.candidatesTokenCount || 0; }
    if (data.content && Array.isArray(data.content)) text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    else if (data.candidates) text = (data.candidates[0]?.content?.parts || []).map(pt => pt.text || '').join('');
    else if (data.choices) {
      const msg = data.choices[0]?.message || {};
      text = this._openAiTextChunk(msg);
    }
    return { content: text, usage };
  },

  _openAiTextChunk(delta) {
    if (!delta) return '';
    const parts = this._openAiChunkParts(delta);
    return parts.reasoning + parts.content;
  },

  _openAiStreamChunk(delta, state) {
    const parts = this._openAiChunkParts(delta);
    let chunk = '';
    if (parts.reasoning && !state.regularStarted) {
      if (!state.reasoningOpen) {
        state.reasoningOpen = true;
        chunk += '<think>';
      }
      chunk += parts.reasoning;
    }
    if (parts.content) {
      if (state.reasoningOpen) {
        state.reasoningOpen = false;
        chunk += '</think>';
      }
      state.regularStarted = true;
      chunk += parts.content;
    }
    return chunk;
  },

  _openAiChunkParts(delta) {
    return {
      reasoning: this._normalizeOpenAiTextPart(delta?.reasoning_content ?? delta?.reasoning),
      content: this._normalizeOpenAiTextPart(delta?.content ?? delta?.text ?? delta?.output_text),
    };
  },

  _normalizeOpenAiTextPart(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === 'null' ? '' : value;
    }
    if (Array.isArray(value)) {
      return value.map(item => this._normalizeOpenAiTextPart(item)).join('');
    }
    if (typeof value === 'object') {
      return this._normalizeOpenAiTextPart(value.text ?? value.content ?? value.output_text ?? value.value);
    }
    return '';
  },

  _emptyUsage() {
    return { input: 0, output: 0, cacheRead: 0, cacheCreation: 0 };
  },

  _applyUsage(target, raw = {}) {
    target.input = raw.input_tokens ?? raw.prompt_tokens ?? target.input;
    target.output = raw.output_tokens ?? raw.completion_tokens ?? target.output;
    const details = raw.prompt_tokens_details || raw.input_tokens_details || {};
    target.cacheRead = raw.cache_read_input_tokens ?? details.cached_tokens ?? target.cacheRead;
    target.cacheCreation = raw.cache_creation_input_tokens ?? details.cache_write_tokens ?? target.cacheCreation;
    return target;
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
      let buffer = '', fullText = '', usage = this._emptyUsage();
      const openAiStreamState = { reasoningOpen: false, regularStarted: false };

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
              if (!line.startsWith('data:')) continue;
              const raw = line.slice(5).trim();
              if (raw === '[DONE]') {
                if (openAiStreamState.reasoningOpen) {
                  const closeChunk = '</think>';
                  openAiStreamState.reasoningOpen = false;
                  fullText += closeChunk;
                  onChunk?.(closeChunk, fullText);
                }
                continue;
              }
              try {
                const data = JSON.parse(raw);
                let chunk = '';
                if (prov === 'claude') {
                  if (data.type === 'content_block_delta' && data.delta?.text) chunk = data.delta.text;
                  if (data.type === 'message_delta' && data.usage) this._applyUsage(usage, data.usage);
                  if (data.type === 'message_delta' && data.delta?.stop_reason) finishReason = data.delta.stop_reason;
                  if (data.type === 'message_start' && data.message?.usage) this._applyUsage(usage, data.message.usage);
                } else if (prov === 'google') {
                  const cand = data.candidates?.[0];
                  if (cand?.finishReason) finishReason = cand.finishReason;
                  const parts = cand?.content?.parts || [];
                  for (const pt of parts) if (pt.text) chunk += pt.text;
                  if (data.usageMetadata) { usage.input = data.usageMetadata.promptTokenCount || 0; usage.output = data.usageMetadata.candidatesTokenCount || 0; }
                } else {
                  const choice = data.choices?.[0] || {};
                  chunk = this._openAiStreamChunk(choice.delta || choice, openAiStreamState);
                  if (choice.finish_reason) finishReason = choice.finish_reason;
                  if (data.usage) this._applyUsage(usage, data.usage);
                }
                if (chunk) { fullText += chunk; onChunk?.(chunk, fullText); }
              } catch {}
            }
          }
        } finally {
          reader.releaseLock();
        }

        if (openAiStreamState.reasoningOpen) {
          const closeChunk = '</think>';
          openAiStreamState.reasoningOpen = false;
          fullText += closeChunk;
          onChunk?.(closeChunk, fullText);
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
    if (window.AndroidBridge?.fetchModels) {
      try {
        const nativeResult = JSON.parse(window.AndroidBridge.fetchModels(JSON.stringify(p)) || '{}');
        if (nativeResult.success) return nativeResult;
      } catch (e) {
        log('Native fetchModels failed, fallback to fetch:', e.message);
      }
    }
    const base = this._getBaseUrl(p);
    const provider = this._detect(p);
    const urls = provider === 'google'
      ? [`${base}/models?key=${encodeURIComponent(p.apiKey || '')}`]
      : [...new Set([`${base}/models`, base.toLowerCase().includes('nano-gpt') ? `${base}/models?detailed=true` : ''].filter(Boolean))];
    const diagnostics = [];
    try {
      for (const url of urls) {
        try {
          const res = await fetch(url, { headers: this._getHeaders(p) });
          const text = await res.text();
          if (!res.ok) {
            diagnostics.push({ url, status: res.status, error: text.slice(0, 300) });
            continue;
          }
          const data = text ? JSON.parse(text) : {};
          const models = this._extractModelIds(data, provider);
          if (models.length) return { success: true, models, endpoint: url };
          diagnostics.push({ url, status: res.status, error: '接口成功返回，但未解析到模型列表' });
        } catch (e) {
          diagnostics.push({ url, status: 0, error: e.message });
        }
      }
      return { success: false, models: [], diagnostics, error: diagnostics[0]?.error || '拉取失败' };
    } catch (e) { return { success: false, models: [], error: e.message, diagnostics }; }
  },

  _extractModelIds(data, provider = '') {
    const out = [];
    const seen = new Set();
    const add = value => {
      const clean = String(value || '').trim().replace(/^models\//, '');
      if (!clean || seen.has(clean)) return;
      if (provider === 'google' && !clean.includes('gemini')) return;
      seen.add(clean);
      out.push(clean);
    };
    const collect = arr => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (typeof item === 'string') add(item);
        else if (item && typeof item === 'object') add(item.id || item.name || item.model || item.slug || item.value);
      }
    };
    if (Array.isArray(data)) collect(data);
    if (data && typeof data === 'object') {
      collect(data.data);
      collect(data.models);
      collect(data.items);
      collect(data.results);
      collect(data.model_list);
      collect(data.data?.models);
      collect(data.data?.items);
      collect(data.result?.models);
      collect(data.result?.items);
    }
    return out;
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
- 交互增强（必须优先支持）：物品、角色、任务、技能、地点等可点击对象可添加 data-mvu-detail，并可附加 data-mvu-title、data-mvu-type、data-mvu-desc、data-mvu-field。系统会在美化视图中自动弹出精美详情卡。不要写 <script>、onclick 或自定义 JavaScript。
- 可增长集合要求：任务必须优先使用 main_quests/side_quests 对象数组，角色必须优先使用 characters 对象数组。遇到新任务/新角色时后续 RP 更新应向数组追加对象，不要长期覆盖单个 main_quest 或单个 *_profile 字段。
- 系统托管组件优先：角色、任务、物品、技能等可增长列表优先使用 data-field-list 绑定，让系统渲染列表项；AI 负责主题外壳、分区、标题、氛围装饰和 CSS 换皮，不要手写每个角色/任务/物品的固定正文。
- 视觉设计要求：
  · 生成前必须先确定一个明确的「视觉载体」：状态栏看起来像什么物件或界面，而不只是换颜色。可选方向包括但不限于：玉简/命盘/符箓/宗门玉牒、学生手账/课程表/社团公告栏、赛博终端/HUD/权限卡、刑侦案卷/证物袋/红线板、末日求生手册/电台面板、宫廷奏折/绢帛/朱批、都市App/监控面板、奇幻羊皮书/魔法阵。
  · 必须选择一种布局骨架，并让 HTML 结构体现出来：档案式、仪表盘式、卷轴式、手账式、地图路线式、终端式、案卷式。不要所有题材都做纵向深色卡片堆叠。
  · CSS 中必须在 .mvu-root 或最外层容器定义主题变量：--mvu-bg、--mvu-panel、--mvu-card、--mvu-accent、--mvu-accent-2、--mvu-warn、--mvu-text、--mvu-muted、--mvu-border、--mvu-radius、--mvu-shadow、--mvu-texture。系统托管角色卡和详情弹窗会优先读取这些变量。
  · 必须有至少 1 个题材符号或微装饰：如符箓角标、案卷编号、终端状态灯、手账贴纸、警示封条、朱批印章、地图路线点、魔法纹章。可用 CSS 伪元素、边框、背景纹理实现，不要依赖外部图片。
  · 字体是个性的核心。可以通过 Google Fonts 或系统字体栈选择有辨识度的字体，避免所有主题都使用 Arial、Inter、Roboto 等通用字体。
  · 用背景氛围替代纯色块——透明度、渐变、纹理、模糊、网格、纸张纹理、扫描线、暗纹等手法都可以创造层次和沉浸感。
  · 配色必须包含主色、辅助色、警示/强调色三个层级；不要只堆同一色系的深浅变化。
  · 反同质化硬性规则：不要默认黑底金边半透明卡片；不要所有模块都是圆角卡片；不要只靠渐变表达题材；不要重复使用同一套模板。每个故事的状态栏都应该像该世界里真实存在的随身界面。
  · 移动端 360px 内必须可读：长文本放入详情弹窗或变量视图，主卡片只显示摘要；标题、按钮、标签不得互相遮挡。
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
After addFromTemplate, new field names become id_fieldName (e.g. id="lin" → lin_profile), subsequently use replace/delta for normal updates.
For task and character growth, prefer add to /main_quests/-, /side_quests/-, and /characters/- with object values when a new task/character appears. Do not keep overwriting a single main_quest or one *_profile field for the entire playthrough.` },
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
Operations: replace, delta (numeric increment, e.g. -15), add (list append), remove (list delete), addFromTemplate (create new entry from template), removeFromTemplate (delete entry)
For task and character growth, prefer add to /main_quests/-, /side_quests/-, and /characters/- with object values when a new task/character appears. Do not keep overwriting a single main_quest or one *_profile field for the entire playthrough.` },
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


  /**
   * 解析当前生效的预设。
   * 优先级：对话级预设（conversation.presetId）> 全局预设（settings.activePresetId）> 代码内置。
   * 对话级是"整体覆盖"而不是"逐字段叠加"——预设是一整包（提示词 + 采样 + 思考），
   * 只换一半会得到谁也不认识的东西。
   */
  getActivePreset(settings, conversation = null) {
    const presets = settings?.promptPresets || {};
    const convId = conversation?.presetId;
    if (convId && presets[convId]) return presets[convId];
    const globalId = settings?.activePresetId;
    if (globalId && presets[globalId]) return presets[globalId];
    // Legacy fallback
    return {
      entries: settings?.promptEntries || null,
      initPrompt: settings?.promptInit || '',
      summaryPrompt: settings?.promptSummaryGen || '',
    };
  },

  /** 预设里参与"覆盖 API 方案"的字段（只有明确给了值的才覆盖，空值表示不干预） */
  PRESET_SAMPLER_KEYS: ['temperature', 'topP', 'topK', 'maxTokens', 'presencePenalty', 'frequencyPenalty'],
  PRESET_THINKING_KEYS: ['thinkingMode', 'reasoningEffort', 'thinkingBudget', 'hideReasoning'],

  /**
   * 把预设里的采样 / 思考设置叠到 API 方案上。
   * 返回 { merged, sources, presetName }，sources 记录每个字段的来源，供「预览最终请求」展示。
   */
  _mergeProfileWithPreset(p, preset = null) {
    const merged = { ...(p || {}) };
    const sources = {};
    const name = String(preset?.name || '').trim();
    const label = name ? `预设「${name}」` : '预设';
    if (!preset) return { merged, sources, presetName: '' };

    const sampler = preset.sampler || {};
    for (const key of this.PRESET_SAMPLER_KEYS) {
      const value = sampler[key];
      if (value === undefined || value === null || String(value).trim() === '') continue;
      merged[key] = value;
      sources[key] = label;
    }

    const thinking = preset.thinking || {};
    for (const key of this.PRESET_THINKING_KEYS) {
      const value = thinking[key];
      if (value === undefined || value === null) continue;
      if (key === 'hideReasoning') { merged[key] = !!value; sources[key] = label; continue; }
      if (String(value).trim() === '') continue;
      merged[key] = value;
      sources[key] = label;
    }
    return { merged, sources, presetName: name };
  },


  /**
   * 解析当前生效的「作者注 / 上帝指令」（conversation.writingNote）。
   * 兼容历史字段 conversation.writingAdvice（旧版是固定塞在摘要之后的普通消息）。
   * 返回 null 表示本轮不注入。
   */
  resolveWritingNote(conversation) {
    const note = conversation?.writingNote;
    if (note && typeof note === 'object') {
      if (note.enabled === false) return null;
      const text = String(note.text || '').trim();
      if (!text) return null;
      return {
        text,
        depth: Math.max(0, Math.floor(Number(note.depth) || 0)),
        role: note.role === 'assistant' ? 'assistant' : 'user',
        oneShot: !!note.oneShot,
      };
    }
    // 历史兼容：旧字段当成「深度 1、常驻」
    const legacy = String(conversation?.writingAdvice || '').trim();
    if (!legacy) return null;
    return { text: legacy, depth: 1, role: 'user', oneShot: false };
  },

  /** 汇总所有要走 @Depth 注入的内容：世界书 at_depth 条目 + 面板文风 + 骰子 + 作者注 */
  collectAtDepthBlocks(conversation, worldBookBlocks) {
    const blocks = [...(worldBookBlocks?.atDepth || [])];
    const style = Panel.toStyleBlock(conversation);
    if (style) blocks.push(style);
    const dice = Dice.buildBlock(conversation?.pendingDice, !!conversation?.hardcoreDice);
    if (dice) blocks.push({ depth: 1, role: 'user', content: dice });
    const note = this.resolveWritingNote(conversation);
    if (note) {
      blocks.push({
        depth: note.depth,
        role: note.role,
        content: '【主人的写作建议】\n' + note.text,
      });
    }
    return blocks;
  },

  /**
   * @Depth 注入：把 position='at_depth' 的条目插到距离对话末尾第 N 条的位置。
   *   depth 1 → 紧贴最后一条消息之前（最"当下"，适合文风 / 上帝指令）
   *   depth 2 → 倒数第二条之前
   *   depth 0 → 追加到所有消息之后（最末尾）
   * 语义对标 SillyTavern 的 Author's Note @Depth。
   * 一次性重建数组而不是反复 splice，避免插入下标互相位移。
   */
  applyAtDepth(msgs, blocks) {
    const items = blocks?.atDepth || [];
    if (!items.length || !Array.isArray(msgs)) return msgs;
    const n = msgs.length;
    const byIndex = new Map();
    for (const item of items) {
      const depth = Math.max(0, Math.floor(Number(item.depth) || 0));
      const at = depth <= 0 ? n : Math.max(0, n - depth);
      if (!byIndex.has(at)) byIndex.set(at, []);
      byIndex.get(at).push({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.content });
    }
    const out = [];
    for (let i = 0; i <= n; i++) {
      if (byIndex.has(i)) out.push(...byIndex.get(i));
      if (i < n) out.push(msgs[i]);
    }
    return out;
  },

  buildMessages(conversation, options = {}) {
    const settings = Storage.getSettings();
    const phase = conversation.phase || 'init';
    const preset = this.getActivePreset(settings, conversation);
    const worldBookBlocks = WorldBook.buildPromptBlocks(conversation, { commit: !!options.commitWorldBook });
    // 故事设定 = 已有 storySetting（可能是 init 阶段生成的）+ 空白起步面板里填的字段
    const storySettingText = Panel.toSettingText(conversation);

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
        const withDepth = this.applyAtDepth(merged, { atDepth: this.collectAtDepthBlocks(conversation, worldBookBlocks) });
        log('buildMessages [init/writing-card]', { systemLen: systemPrompt.length, msgCount: withDepth.length, atDepthCount: worldBookBlocks.atDepth?.length || 0 });
        return { systemPrompt, messages: withDepth, preset };
      }

      // Default init: single initPrompt string
      const initPrompt = preset.initPrompt || this.DEFAULT_INIT_PROMPT;
      const systemPrompt = initPrompt;
      const msgs = [];
      if (worldBookBlocks.beforeStory) msgs.push({ role: 'user', content: worldBookBlocks.beforeStory });
      if (worldBookBlocks.afterStory) msgs.push({ role: 'user', content: worldBookBlocks.afterStory });
      const initMessages = (conversation.messages || []).filter(m => !m.hidden && m.content?.trim());
      for (let i = 0; i < initMessages.length; i++) {
        const isLatestUser = i === initMessages.length - 1 && initMessages[i].role === 'user';
        if (isLatestUser && worldBookBlocks.beforeInput) msgs.push({ role: 'user', content: worldBookBlocks.beforeInput });
        msgs.push({ role: initMessages[i].role, content: initMessages[i].content });
        if (isLatestUser && worldBookBlocks.afterInput) msgs.push({ role: 'user', content: worldBookBlocks.afterInput });
      }
      const withDepth = this.applyAtDepth(msgs, { atDepth: this.collectAtDepthBlocks(conversation, worldBookBlocks) });
      log('buildMessages [init]', { systemLen: systemPrompt.length, msgCount: withDepth.length, atDepthCount: worldBookBlocks.atDepth?.length || 0, worldBookActiveCount: worldBookBlocks.active?.length || 0 });
      return {
        systemPrompt,
        messages: withDepth,
        preset,
        activeWorldBookEntries: worldBookBlocks.active || [],
        blockedWorldBookEntries: worldBookBlocks.blocked || [],
        candidateWorldBookEntries: worldBookBlocks.candidates || [],
        worldBookScanSources: worldBookBlocks.scanSources || [],
        worldBookSettings: worldBookBlocks.worldBookSettings || {},
      };
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
      for (let i = 0; i < archive.length; i++) {
        const ar = archive[i];
        const heading = i === 0 ? '【往事纪要】（更早的剧情档案）\n' : '';
        parts.push({ role: 'user', content: heading + `<${ar.code}>${ar.content}</${ar.code}>` });
      }
      const mergedSm = conversation.summary?.mergedSummaries || [];
      for (let i = 0; i < mergedSm.length; i++) {
        const sm = mergedSm[i];
        const heading = i === 0 ? '【故事总结】\n' : '';
        parts.push({ role: 'user', content: heading + `<${sm.code}>${sm.content}</${sm.code}>` });
      }
      const lastMerged = conversation.summary?.lastMergedIdx || 0;
      let abstractCount = 0;
      let abCounter = 1;
      for (let i = 0; i < lastMerged; i++) {
        if (allMsgs[i]?.role === 'assistant' && allMsgs[i]?.abstract) abCounter++;
      }
      for (let i = lastMerged; i < splitAt; i++) {
        const m = allMsgs[i];
        if (m.role === 'assistant' && m.abstract) {
          const code = 'ab' + String(abCounter).padStart(2, '0');
          const content = Summary.extractAbstractContent(m.abstract) || m.abstract;
          const heading = abstractCount === 0 ? '【近期摘要】\n' : '';
          parts.push({ role: 'user', content: heading + `<${code}>${content}</${code}>` });
          abstractCount++;
          abCounter++;
        }
      }
      // 移动断点只放在最后一个摘要 block。下一轮追加一条摘要时，Anthropic 向前
      // 回看一个 block 即可命中上一轮断点；摘要总数不受 20-block 回看窗口限制。
      if (parts.length > 0) {
        parts[parts.length - 1]._cacheControl = true;
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
      if (worldBookBlocks.beforeStory) {
        msgs.push({ role: 'user', content: worldBookBlocks.beforeStory });
      }
      if (storySettingText) {
        msgs.push({ role: 'user', content: '【故事设定】\n' + storySettingText, _cacheAnchor: true });
      }
      if (worldBookBlocks.afterStory) {
        msgs.push({ role: 'user', content: worldBookBlocks.afterStory });
      }
      msgs.push(...buildSummaries(allMsgs, splitAt));
      const recent = allMsgs.slice(splitAt);
      for (let i = 0; i < recent.length; i++) {
        if (i === recent.length - 1) {
          const mvuCtx = buildMvuContext();
          if (mvuCtx) msgs.push({ role: 'user', content: mvuCtx });
        }
        const isLatestUser = i === recent.length - 1 && recent[i].role === 'user';
        if (isLatestUser && worldBookBlocks.beforeInput) {
          msgs.push({ role: 'user', content: worldBookBlocks.beforeInput });
        }
        const content = recent[i].role === 'assistant' ? Summary.cleanAbstract(MVU.cleanText(recent[i].content)) : recent[i].content;
        msgs.push({ role: recent[i].role, content });
        if (isLatestUser && worldBookBlocks.afterInput) {
          msgs.push({ role: 'user', content: worldBookBlocks.afterInput });
        }
      }
      // 不做字符串拼接合并，理由同 slot-driven 分支：交给 _buildBody 按 provider
      // 分别处理，保留每条原始消息的 block 边界，故事设定块才能独立缓存。
      const withDepth = this.applyAtDepth(msgs, { atDepth: this.collectAtDepthBlocks(conversation, worldBookBlocks) });
      log('buildMessages [rp]', { systemLen: systemPrompt.length, msgCount: withDepth.length, splitAt, recentCount: recent.length, atDepthCount: worldBookBlocks.atDepth?.length || 0, worldBookActiveCount: worldBookBlocks.active?.length || 0 });
      return {
        systemPrompt,
        messages: withDepth,
        preset,
        activeWorldBookEntries: worldBookBlocks.active || [],
        blockedWorldBookEntries: worldBookBlocks.blocked || [],
        candidateWorldBookEntries: worldBookBlocks.candidates || [],
        worldBookScanSources: worldBookBlocks.scanSources || [],
        worldBookSettings: worldBookBlocks.worldBookSettings || {},
      };
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
            if (worldBookBlocks.beforeStory) {
              msgs.push({ role: 'user', content: worldBookBlocks.beforeStory });
            }
            if (storySettingText) {
              // _cacheAnchor：标记这条是本局对话里真正稳定不变的内容，供 _buildBody
              // 精确定位打缓存标记，不能靠"永远是第一条"这种位置假设——
              // 万一 storySetting 为空，第一条会变成别的、每轮都在变的内容，
              // 缓存标记打在错的地方就会变成"每次都写、永远读不到"。
              msgs.push({ role: 'user', content: '【故事设定】\n' + storySettingText, _cacheAnchor: true });
            }
            if (worldBookBlocks.afterStory) {
              msgs.push({ role: 'user', content: worldBookBlocks.afterStory });
            }
            break;

          case 'summaries':
            msgs.push(...buildSummaries(allMsgs, splitAt));
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
              if (worldBookBlocks.beforeInput) {
                msgs.push({ role: 'user', content: worldBookBlocks.beforeInput });
              }
              msgs.push({ role: 'user', content: '[ 本轮用户消息 ]\n<interactive_input>\n' + pendingUserInput.content + '\n</interactive_input>' });
              if (worldBookBlocks.afterInput) {
                msgs.push({ role: 'user', content: worldBookBlocks.afterInput });
              }
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
        const msg = { role, content: c };
        if (role === 'assistant') msg._assistantPrefill = true;
        msgs.push(msg);
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
    const withDepth = this.applyAtDepth(msgs, { atDepth: this.collectAtDepthBlocks(conversation, worldBookBlocks) });
    log('buildMessages [rp]', { systemLen: systemPrompt.length, msgCount: withDepth.length, splitAt, slotDriven: true, atDepthCount: worldBookBlocks.atDepth?.length || 0, worldBookActiveCount: worldBookBlocks.active?.length || 0 });
    return {
      systemPrompt,
      messages: withDepth,
      preset,
      activeWorldBookEntries: worldBookBlocks.active || [],
      blockedWorldBookEntries: worldBookBlocks.blocked || [],
      candidateWorldBookEntries: worldBookBlocks.candidates || [],
      worldBookScanSources: worldBookBlocks.scanSources || [],
      worldBookSettings: worldBookBlocks.worldBookSettings || {},
    };
  },

  buildSummaryGenPrompt(conversation = null) {
    const s = Storage.getSettings();
    const preset = this.getActivePreset(s, conversation);
    return preset.summaryPrompt || this.DEFAULT_SUMMARY_MERGE_PROMPT;
  },
};

// ============================================================
// WorldBook Module
// ============================================================
const WorldBook = {
  DEFAULT_SETTINGS: {
    scanDepth: 6,
    maxEntries: 24,
    maxChars: 8000,
    recursiveScan: true,
    maxRecursionSteps: 2,
    caseSensitive: false,
    matchWholeWords: false,
    scanSourceVersion: 2,
    includeStorySetting: false,
    includeMvuState: false,
  },

  POSITION_MAP: {
    before_char: 0,
    after_char: 1,
    before_input: 2,
    after_input: 3,
    at_depth: 4,
  },

  LOGIC_MAP: {
    and_any: 0,
    and_all: 1,
    not_any: 2,
    not_all: 3,
  },

  createEmptyBook(name = '世界书') {
    return {
      version: 1,
      name,
      description: '',
      settings: { ...this.DEFAULT_SETTINGS },
      entries: [],
    };
  },

  createEntry(partial = {}) {
    const uid = Number(partial.uid ?? partial.id ?? (Date.now() + Math.floor(Math.random() * 1000)));
    const secondaryKeys = this._normalizeList(partial.secondaryKeys ?? partial.keysecondary ?? []);
    return {
      uid,
      title: partial.title || partial.comment || partial.name || '新条目',
      comment: partial.comment || partial.title || partial.name || '新条目',
      keys: this._normalizeList(partial.keys ?? partial.key ?? []),
      secondaryKeys,
      selective: partial.selective === undefined ? secondaryKeys.length > 0 : !!partial.selective,
      content: String(partial.content || partial.text || ''),
      enabled: partial.enabled !== false && partial.disable !== true && partial.disabled !== true,
      constant: !!(partial.constant || partial.alwaysActive || partial.always_active),
      manualActive: false,
      order: Number.isFinite(Number(partial.order)) ? Number(partial.order) : 100,
      position: this._normalizePosition(partial.position),
      selectiveLogic: this._normalizeSelectiveLogic(partial.selectiveLogic ?? partial.selective_logic),
      useRegex: !!(partial.useRegex || partial.use_regex),
      matchWholeWords: partial.matchWholeWords === undefined
        ? (partial.match_whole_words === undefined ? null : !!partial.match_whole_words)
        : !!partial.matchWholeWords,
      caseSensitive: partial.caseSensitive === undefined
        ? (partial.case_sensitive === undefined ? null : !!partial.case_sensitive)
        : !!partial.caseSensitive,
      preventRecursion: !!(partial.preventRecursion || partial.disableRecursion || partial.excludeRecursion || partial.prevent_recursion),
      probability: Number.isFinite(Number(partial.probability)) ? Math.max(0, Math.min(100, Number(partial.probability))) : 100,
    };
  },

  normalizeBook(book, fallbackName = '世界书') {
    if (!book || typeof book !== 'object') return this.createEmptyBook(fallbackName);
    const settings = { ...this.DEFAULT_SETTINGS, ...(book.settings || {}) };
    if (book.maxEntries !== undefined) settings.maxEntries = Number(book.maxEntries) || settings.maxEntries;
    if (book.maxChars !== undefined) settings.maxChars = Number(book.maxChars) || settings.maxChars;
    if (book.tokenBudget !== undefined) settings.maxChars = Number(book.tokenBudget) || settings.maxChars;
    if (book.scanDepth !== undefined) settings.scanDepth = Number(book.scanDepth) || settings.scanDepth;
    if (book.maxRecursionSteps !== undefined) settings.maxRecursionSteps = Number(book.maxRecursionSteps) || settings.maxRecursionSteps;
    if (book.recursiveScan !== undefined) settings.recursiveScan = !!book.recursiveScan;
    if (book.recursiveScanning !== undefined) settings.recursiveScan = !!book.recursiveScanning;
    if (book.caseSensitive !== undefined) settings.caseSensitive = !!book.caseSensitive;
    if (book.matchWholeWords !== undefined) settings.matchWholeWords = !!book.matchWholeWords;
    if (book.includeStorySetting !== undefined) settings.includeStorySetting = !!book.includeStorySetting;
    if (book.includeMvuState !== undefined) settings.includeMvuState = !!book.includeMvuState;
    if ((book.settings || {}).scanSourceVersion === undefined && book.includeMvuState === undefined) {
      settings.includeMvuState = false;
    }
    settings.scanSourceVersion = this.DEFAULT_SETTINGS.scanSourceVersion;

    let rawEntries = [];
    if (Array.isArray(book.entries)) rawEntries = book.entries;
    else if (book.entries && typeof book.entries === 'object') rawEntries = Object.values(book.entries);
    else if (Array.isArray(book.worldInfos)) rawEntries = book.worldInfos;

    return {
      version: 1,
      name: String(book.name || book.title || fallbackName),
      description: String(book.description || ''),
      settings,
      entries: rawEntries.map((entry, index) => this.createEntry({ ...entry, id: entry?.id ?? index + 1 })),
    };
  },

  ensureConversation(conversation) {
    if (!conversation) return this.createEmptyBook();
    conversation.worldBook = this.normalizeBook(
      conversation.worldBook,
      (conversation.name || '未命名故事') + ' 世界书'
    );
    return conversation.worldBook;
  },

  buildPromptBlocks(conversation) {
    const book = this.ensureConversation(conversation);
    const active = this.getActiveEntries(book, conversation);
    const buckets = {
      beforeStory: [],
      afterStory: [],
      beforeInput: [],
      afterInput: [],
    };
    const atDepth = [];

    for (const entry of active) {
      const prompt = this._formatEntryPrompt(entry);
      if (!prompt) continue;
      if (entry.position === 'at_depth') {
        atDepth.push({
          depth: Math.max(0, Math.floor(Number(entry.depth) || 0)),
          role: entry.role === 'assistant' ? 'assistant' : 'user',
          content: prompt,
        });
        continue;
      }
      if (entry.position === 'before_char') buckets.beforeStory.push(prompt);
      else if (entry.position === 'before_input') buckets.beforeInput.push(prompt);
      else if (entry.position === 'after_input') buckets.afterInput.push(prompt);
      else buckets.afterStory.push(prompt);
    }

    return {
      beforeStory: this._wrapPromptBucket('背景前置', buckets.beforeStory),
      afterStory: this._wrapPromptBucket('补充设定', buckets.afterStory),
      beforeInput: this._wrapPromptBucket('本轮触发条目', buckets.beforeInput),
      afterInput: this._wrapPromptBucket('输入后补充', buckets.afterInput),
      atDepth,
      active,
      blocked: active.blocked || [],
      scanSources: active.scanSources || [],
      worldBookSettings: active.settings || book.settings || {},
      totalChars: active.totalChars || 0,
    };
  },

  getActiveEntries(book, conversation) {
    const normalized = this.normalizeBook(book, (conversation?.name || '世界书') + ' 世界书');
    const entries = normalized.entries.filter(entry => (
      entry.enabled
      && String(entry.content || '').trim()
    ));
    if (!entries.length) {
      const empty = [];
      empty.blocked = [];
      empty.scanSources = [];
      empty.settings = normalized.settings;
      return empty;
    }

    const active = [];
    const addedIds = new Set();
    const blocked = [];
    let totalChars = 0;

    const compareForInsertion = (a, b) => {
      const posA = this.POSITION_MAP[a.position] ?? 99;
      const posB = this.POSITION_MAP[b.position] ?? 99;
      if (posA !== posB) return posA - posB;
      if (a.constant !== b.constant) return a.constant ? -1 : 1;
      if ((a._matchStep || 0) !== (b._matchStep || 0)) return (a._matchStep || 0) - (b._matchStep || 0);
      if (a.order !== b.order) return b.order - a.order;
      return a.uid - b.uid;
    };

    const compareForBudget = (a, b) => {
      const rankA = this._activationBudgetRank(a);
      const rankB = this._activationBudgetRank(b);
      if (rankA !== rankB) return rankA - rankB;
      if ((a._matchStep || 0) !== (b._matchStep || 0)) return (a._matchStep || 0) - (b._matchStep || 0);
      if (a.order !== b.order) return b.order - a.order;
      return a.uid - b.uid;
    };

    const tryAdd = (entry, budgetIndex = active.length) => {
      if (!entry || addedIds.has(entry.uid)) return false;
      const nextLen = String(entry.content || '').length;
      if (active.length >= normalized.settings.maxEntries) {
        blocked.push({
          ...entry,
          _blockedReason: 'maxEntries',
          _blockedDetail: `达到最大注入条目 ${normalized.settings.maxEntries}`,
          _budgetRank: budgetIndex + 1,
          _currentChars: totalChars,
          _entryChars: nextLen,
        });
        return false;
      }
      if (active.length > 0 && totalChars + nextLen > normalized.settings.maxChars) {
        blocked.push({
          ...entry,
          _blockedReason: 'budget',
          _blockedDetail: `${totalChars} + ${nextLen} > ${normalized.settings.maxChars}`,
          _budgetRank: budgetIndex + 1,
          _currentChars: totalChars,
          _entryChars: nextLen,
        });
        return false;
      }
      active.push({
        ...entry,
        _budgetRank: budgetIndex + 1,
        _currentCharsBefore: totalChars,
        _entryChars: nextLen,
      });
      addedIds.add(entry.uid);
      totalChars += nextLen;
      return true;
    };

    const constantEntries = entries
      .filter(entry => entry.constant)
      .map(entry => ({
        ...entry,
        _activationMode: 'constant',
        _matchKind: 'constant',
        _matchedPrimaryKeys: [],
        _matchedSecondaryKeys: [],
        _matchSources: [{ kind: 'constant', label: '常驻条目', preview: '' }],
        _matchStep: 0,
      }))
      .sort(compareForBudget);

    const candidates = [...constantEntries];
    const candidateIds = new Set(candidates.map(entry => entry.uid));

    const autoEntries = entries
      .filter(entry => !entry.constant && (entry.keys || []).length > 0)
      .sort((a, b) => (a.order !== b.order ? b.order - a.order : a.uid - b.uid));

    const baseScanSources = this._buildScanSources(conversation, normalized.settings);
    let recursiveSources = [];
    const recursionSteps = normalized.settings.recursiveScan
      ? Math.max(0, Number(normalized.settings.maxRecursionSteps) || 0)
      : 0;
    const maxSteps = 1 + recursionSteps;

    for (let step = 0; step < maxSteps; step++) {
      const sourcePool = step === 0 ? baseScanSources : recursiveSources;
      if (!sourcePool.length) break;
      const matchedThisStep = [];
      for (const entry of autoEntries) {
        if (candidateIds.has(entry.uid)) continue;
        if (step > 0 && entry.preventRecursion) continue;
        const match = this._findEntryMatch(entry, sourcePool, normalized.settings);
        if (!match.matched) continue;
        if (!this._passesProbability(entry, conversation, step)) continue;
        matchedThisStep.push({
          ...entry,
          _activationMode: 'auto',
          _matchKind: step === 0 ? 'direct' : 'recursive',
          _matchStep: step,
          _matchedPrimaryKeys: match.primaryMatches,
          _matchedSecondaryKeys: match.secondaryMatches,
          _matchSources: match.sources,
        });
      }

      if (!matchedThisStep.length) break;
      matchedThisStep.sort(compareForBudget);
      const addedThisStep = [];
      for (const entry of matchedThisStep) {
        candidates.push(entry);
        candidateIds.add(entry.uid);
        addedThisStep.push(entry);
      }
      if (!normalized.settings.recursiveScan || !addedThisStep.length) break;
      recursiveSources = addedThisStep.map(entry => ({
        kind: 'recursion',
        label: `递归：${entry.comment || entry.title || entry.uid}`,
        content: String(entry.content || ''),
      }));
    }

    candidates.sort(compareForBudget);
    candidates.forEach((entry, index) => tryAdd(entry, index));
    active.sort(compareForInsertion);
    active.blocked = blocked;
    active.scanSources = baseScanSources;
    active.settings = normalized.settings;
    active.totalChars = totalChars;
    return active;
  },

  exportAirp(book) {
    return { type: 'airp_worldbook_v1', ...this.normalizeBook(book) };
  },

  exportSillyTavern(book) {
    const normalized = this.normalizeBook(book);
    const entries = {};
    for (const entry of normalized.entries) {
      entries[String(entry.uid)] = {
        uid: entry.uid,
        comment: entry.comment || entry.title || '',
        content: entry.content,
        constant: entry.constant,
        selective: !!entry.selective && entry.secondaryKeys.length > 0,
        key: [...entry.keys],
        keysecondary: [...entry.secondaryKeys],
        order: entry.order,
        position: this.POSITION_MAP[entry.position] ?? 1,
        disable: !entry.enabled,
        probability: entry.probability,
        selectiveLogic: this.LOGIC_MAP?.[entry.selectiveLogic] ?? 0,
      };
    }
    return {
      name: normalized.name,
      description: normalized.description,
      entries,
      tokenBudget: normalized.settings.maxChars,
      scanDepth: normalized.settings.scanDepth,
      recursiveScanning: normalized.settings.recursiveScan,
      maxRecursionSteps: normalized.settings.maxRecursionSteps,
      matchWholeWords: normalized.settings.matchWholeWords,
      caseSensitive: normalized.settings.caseSensitive,
      includeStorySetting: normalized.settings.includeStorySetting,
      includeMvuState: normalized.settings.includeMvuState,
    };
  },

  importAny(raw) {
    return this.normalizeBook(raw);
  },

  _normalizeList(value) {
    if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
    if (typeof value === 'string') return value.split(/\r?\n|,/).map(v => v.trim()).filter(Boolean);
    return [];
  },

  _normalizePosition(value) {
    if (typeof value === 'number') {
      return Object.keys(this.POSITION_MAP).find(key => this.POSITION_MAP[key] === value) || 'after_char';
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized in this.POSITION_MAP) return normalized;
      if (normalized === 'before_an') return 'before_input';
      if (normalized === 'after_an') return 'after_input';
    }
    return 'after_char';
  },

  _normalizeSelectiveLogic(value) {
    if (typeof value === 'number') {
      return Object.keys(this.LOGIC_MAP || {}).find(key => this.LOGIC_MAP[key] === value) || 'and_any';
    }
    const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    return ['and_any', 'and_all', 'not_any', 'not_all'].includes(normalized) ? normalized : 'and_any';
  },

  _activationBudgetRank(entry) {
    if (entry?.constant || entry?._activationMode === 'constant') return 0;
    if (entry?._matchKind === 'direct') return 1;
    if (entry?._matchKind === 'recursive') return 2;
    return 3;
  },

  _buildScanSources(conversation, settings) {
    const sources = [];
    const messages = (conversation?.messages || []).filter(msg => !msg.hidden && String(msg.content || '').trim());
    const depth = Math.max(1, Number(settings.scanDepth) || 6);
    const recent = messages.slice(-depth);
    const lastUserIndex = recent.map(msg => msg.role).lastIndexOf('user');
    for (let i = 0; i < recent.length; i++) {
      const msg = recent[i];
      let content = String(msg.content || '');
      if (msg.role === 'assistant' && typeof Summary !== 'undefined' && typeof MVU !== 'undefined') {
        content = Summary.cleanAbstract(MVU.cleanText(content));
      }
      sources.push({
        kind: msg.role === 'user' && i === lastUserIndex ? 'latest_user' : 'chat',
        label: msg.role === 'user' && i === lastUserIndex ? '最新用户输入' : (msg.role === 'assistant' ? '最近AI回复' : '最近用户输入'),
        content,
      });
    }
    if (settings.includeStorySetting && conversation?.storySetting) {
      sources.push({ kind: 'story', label: '故事设定', content: Panel.toSettingText(conversation) });
    }
    if (settings.includeMvuState && conversation?.mvu?.state) {
      sources.push({ kind: 'mvu', label: '状态栏', content: JSON.stringify(conversation.mvu.state, null, 2) });
    }
    return sources.filter(source => String(source.content || '').trim());
  },

  _findEntryMatch(entry, sources, defaults) {
    const matchedSources = [];
    const primarySet = new Set();
    const secondarySet = new Set();
    for (const source of sources) {
      const details = this._entryMatches(entry, source.content, defaults);
      if (!details.matched) continue;
      details.primaryMatches.forEach(key => primarySet.add(key));
      details.secondaryMatches.forEach(key => secondarySet.add(key));
      matchedSources.push({
        kind: source.kind,
        label: source.label,
        preview: String(source.content || '').slice(0, 120),
        primaryMatches: details.primaryMatches,
        secondaryMatches: details.secondaryMatches,
      });
    }
    return {
      matched: matchedSources.length > 0,
      primaryMatches: [...primarySet],
      secondaryMatches: [...secondarySet],
      sources: matchedSources,
    };
  },

  _entryMatches(entry, text, defaults) {
    const primaryMatches = (entry.keys || []).filter(keyword => this._matchKeyword(keyword, text, entry, defaults));
    if (!primaryMatches.length) return { matched: false, primaryMatches: [], secondaryMatches: [] };
    const secondaryKeys = entry.secondaryKeys || [];
    if (!entry.selective || !secondaryKeys.length) {
      return { matched: true, primaryMatches, secondaryMatches: [] };
    }
    const secondaryMatches = secondaryKeys.filter(keyword => this._matchKeyword(keyword, text, entry, defaults));
    const logic = entry.selectiveLogic || 'and_any';
    let passed = false;
    if (logic === 'and_all') passed = secondaryMatches.length === secondaryKeys.length;
    else if (logic === 'not_any') passed = secondaryMatches.length === 0;
    else if (logic === 'not_all') passed = secondaryMatches.length < secondaryKeys.length;
    else passed = secondaryMatches.length > 0;
    return { matched: passed, primaryMatches, secondaryMatches };
  },

  _matchKeyword(keyword, text, entry, defaults) {
    const raw = String(keyword || '').trim();
    const source = String(text || '');
    if (!raw || !source) return false;
    const caseSensitive = entry.caseSensitive === null || entry.caseSensitive === undefined
      ? defaults.caseSensitive
      : entry.caseSensitive;
    const wholeWords = entry.matchWholeWords === null || entry.matchWholeWords === undefined
      ? defaults.matchWholeWords
      : entry.matchWholeWords;
    if (entry.useRegex || /^\/.*\/[gimsuy]*$/.test(raw)) {
      try {
        if (/^\/.*\/[gimsuy]*$/.test(raw)) {
          const lastSlash = raw.lastIndexOf('/');
          const pattern = raw.slice(1, lastSlash);
          const flags = raw.slice(lastSlash + 1);
          const finalFlags = caseSensitive || flags.includes('i') ? flags : flags + 'i';
          return new RegExp(pattern, finalFlags).test(source);
        }
        return new RegExp(raw, caseSensitive ? '' : 'i').test(source);
      } catch {
        return this._plainKeywordMatch(raw, source, caseSensitive, wholeWords);
      }
    }
    return this._plainKeywordMatch(raw, source, caseSensitive, wholeWords);
  },

  _plainKeywordMatch(raw, source, caseSensitive, wholeWords) {
    const haystack = caseSensitive ? source : source.toLowerCase();
    const needle = caseSensitive ? raw : raw.toLowerCase();
    if (!wholeWords) return haystack.includes(needle);
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}($|[^\\p{L}\\p{N}_])`, caseSensitive ? 'u' : 'iu').test(source);
    } catch {
      return haystack.includes(needle);
    }
  },

  _passesProbability(entry, conversation, step) {
    const probability = Number.isFinite(Number(entry.probability)) ? Number(entry.probability) : 100;
    if (probability >= 100) return true;
    if (probability <= 0) return false;
    const lastUser = [...(conversation?.messages || [])].reverse().find(msg => msg.role === 'user')?.content || '';
    const seed = `${conversation?.id || ''}|${(conversation?.messages || []).length}|${entry.uid}|${step}|${lastUser}`;
    return (this._stableHash(seed) % 100) < probability;
  },

  _stableHash(text) {
    let hash = 2166136261;
    const input = String(text || '');
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  },

  _formatEntryPrompt(entry) {
    const title = entry.comment || entry.title || `条目 ${entry.uid}`;
    return `### ${title}\n${String(entry.content || '').trim()}`;
  },

  _wrapPromptBucket(label, items) {
    if (!items || items.length === 0) return '';
    return `【世界书：${label}】\n` + items.join('\n\n');
  },
};

Object.assign(WorldBook.DEFAULT_SETTINGS, {
  scanSourceVersion: 3,
  scanMode: WorldBook.DEFAULT_SETTINGS.scanMode || 'recent_chat',
});

Object.assign(WorldBook, {
  _legacyCreateEntry: WorldBook.createEntry,
  _legacyNormalizeBook: WorldBook.normalizeBook,
  _legacyBuildPromptBlocks: WorldBook.buildPromptBlocks,
  _legacyGetActiveEntries: WorldBook.getActiveEntries,

  createEmptyBook(name = '世界书') {
    return {
      version: 1,
      name,
      description: '',
      settings: { ...this.DEFAULT_SETTINGS },
      entries: [],
      worldBookState: { entries: {} },
    };
  },

  createEntry(partial = {}) {
    const entry = this._legacyCreateEntry(partial);
    entry.role = this._normalizeRole(partial.role);
    entry.depth = this._nonNegativeNumber(partial.depth ?? partial.insertionDepth ?? partial.insertion_depth, 0);
    entry.scanDepth = this._nullablePositiveNumber(partial.scanDepth ?? partial.scan_depth ?? partial.extensions?.scanDepth);
    entry.group = String(partial.group ?? partial.groupName ?? partial.group_name ?? '').trim();
    entry.groupWeight = Number.isFinite(Number(partial.groupWeight ?? partial.group_weight))
      ? Number(partial.groupWeight ?? partial.group_weight)
      : 100;
    entry.groupScoring = this._normalizeGroupScoring(partial.groupScoring ?? partial.group_scoring);
    entry.sticky = this._nonNegativeNumber(partial.sticky ?? partial.stickyDelay ?? partial.sticky_delay, 0);
    entry.cooldown = this._nonNegativeNumber(partial.cooldown ?? partial.cooldownDelay ?? partial.cooldown_delay, 0);
    entry.delay = this._nonNegativeNumber(partial.delay ?? partial.activationDelay ?? partial.activation_delay, 0);
    return entry;
  },

  normalizeBook(book, fallbackName = '世界书') {
    const normalized = this._legacyNormalizeBook(book, fallbackName);
    normalized.settings = { ...this.DEFAULT_SETTINGS, ...(normalized.settings || {}) };
    normalized.settings.scanMode = this._normalizeScanMode(normalized.settings.scanMode);
    normalized.settings.maxEntries = Math.max(1, Number(normalized.settings.maxEntries) || this.DEFAULT_SETTINGS.maxEntries);
    normalized.settings.maxChars = Math.max(200, Number(normalized.settings.maxChars) || this.DEFAULT_SETTINGS.maxChars);
    normalized.settings.scanDepth = Math.max(1, Number(normalized.settings.scanDepth) || this.DEFAULT_SETTINGS.scanDepth);
    normalized.settings.maxRecursionSteps = Math.max(0, Number(normalized.settings.maxRecursionSteps) || 0);
    normalized.settings.scanSourceVersion = this.DEFAULT_SETTINGS.scanSourceVersion;
    normalized.worldBookState = this._normalizeState(book?.worldBookState || book?.entryState || {});
    normalized.entries = (normalized.entries || []).map(entry => this.createEntry(entry));
    return normalized;
  },

  buildPromptBlocks(conversation, options = {}) {
    const book = this.ensureConversation(conversation);
    const active = this.getActiveEntries(book, conversation, options);
    const buckets = {
      beforeStory: [],
      afterStory: [],
      beforeInput: [],
      afterInput: [],
    };
    // @Depth：插到距离对话末尾第 depth 条的位置（对标酒馆 Author's Note 的 @Depth）
    const atDepth = [];

    for (const entry of active) {
      const prompt = this._formatEntryPrompt(entry);
      if (!prompt) continue;
      if (entry.position === 'at_depth') {
        atDepth.push({
          depth: Math.max(0, Math.floor(Number(entry.depth) || 0)),
          role: entry.role === 'assistant' ? 'assistant' : 'user',
          content: prompt,
        });
        continue;
      }
      if (entry.position === 'before_char') buckets.beforeStory.push(prompt);
      else if (entry.position === 'before_input') buckets.beforeInput.push(prompt);
      else if (entry.position === 'after_input') buckets.afterInput.push(prompt);
      else buckets.afterStory.push(prompt);
    }

    return {
      beforeStory: this._wrapPromptBucket('背景前置', buckets.beforeStory),
      afterStory: this._wrapPromptBucket('补充设定', buckets.afterStory),
      beforeInput: this._wrapPromptBucket('本轮触发条目', buckets.beforeInput),
      afterInput: this._wrapPromptBucket('输入后补充', buckets.afterInput),
      atDepth,
      active,
      blocked: active.blocked || [],
      candidates: active.candidates || [],
      scanSources: active.scanSources || [],
      worldBookSettings: active.settings || book.settings || {},
      totalChars: active.totalChars || 0,
    };
  },

  getActiveEntries(book, conversation, options = {}) {
    const normalized = this.normalizeBook(book, (conversation?.name || '世界书') + ' 世界书');
    const commit = !!options.commit;
    const entries = normalized.entries.filter(entry => entry.enabled && String(entry.content || '').trim());
    const active = [];
    const blocked = [];
    const candidates = [];
    const addedIds = new Set();
    const blockedKeys = new Set();
    let totalChars = 0;

    const attachMeta = (entry, meta = {}) => ({
      ...entry,
      _matchedPrimaryKeys: meta.primaryMatches || entry._matchedPrimaryKeys || [],
      _matchedSecondaryKeys: meta.secondaryMatches || entry._matchedSecondaryKeys || [],
      _matchSources: meta.sources || entry._matchSources || [],
      _matchStep: Number.isFinite(Number(meta.step ?? entry._matchStep)) ? Number(meta.step ?? entry._matchStep) : 0,
      _matchKind: meta.kind || entry._matchKind || 'direct',
      _activationMode: meta.mode || entry._activationMode || 'auto',
      _turnIndex: meta.turnIndex,
      _turnKey: meta.turnKey,
      _matchScore: meta.matchScore ?? entry._matchScore ?? 0,
      _sourceDepth: meta.sourceDepth ?? entry._sourceDepth ?? null,
    });

    const compareForInsertion = (a, b) => {
      const posA = this.POSITION_MAP[a.position] ?? 99;
      const posB = this.POSITION_MAP[b.position] ?? 99;
      if (posA !== posB) return posA - posB;
      if ((a.depth || 0) !== (b.depth || 0)) return (a.depth || 0) - (b.depth || 0);
      if (a.constant !== b.constant) return a.constant ? -1 : 1;
      if ((a._matchStep || 0) !== (b._matchStep || 0)) return (a._matchStep || 0) - (b._matchStep || 0);
      if (a.order !== b.order) return b.order - a.order;
      return a.uid - b.uid;
    };

    const compareForBudget = (a, b) => {
      const rankA = this._activationBudgetRank(a);
      const rankB = this._activationBudgetRank(b);
      if (rankA !== rankB) return rankA - rankB;
      if ((a._matchStep || 0) !== (b._matchStep || 0)) return (a._matchStep || 0) - (b._matchStep || 0);
      if ((b._matchScore || 0) !== (a._matchScore || 0)) return (b._matchScore || 0) - (a._matchScore || 0);
      if ((b.groupWeight || 0) !== (a.groupWeight || 0)) return (b.groupWeight || 0) - (a.groupWeight || 0);
      if (a.order !== b.order) return b.order - a.order;
      return a.uid - b.uid;
    };

    const blockEntry = (entry, reason, detail = '', extra = {}) => {
      if (!entry) return;
      const key = `${entry.uid}:${reason}:${entry._matchKind || ''}:${entry._matchStep || 0}`;
      if (blockedKeys.has(key)) return;
      blockedKeys.add(key);
      blocked.push({ ...entry, ...extra, _blockedReason: reason, _blockedDetail: detail });
    };

    const tryAdd = (entry, budgetIndex = active.length) => {
      if (!entry || addedIds.has(entry.uid)) return false;
      const nextLen = String(entry.content || '').length;
      if (active.length >= normalized.settings.maxEntries) {
        blockEntry(entry, 'maxEntries', `达到最大注入条目 ${normalized.settings.maxEntries}`, {
          _budgetRank: budgetIndex + 1,
          _currentChars: totalChars,
          _entryChars: nextLen,
        });
        return false;
      }
      if (active.length > 0 && totalChars + nextLen > normalized.settings.maxChars) {
        blockEntry(entry, 'budget', `${totalChars} + ${nextLen} > ${normalized.settings.maxChars}`, {
          _budgetRank: budgetIndex + 1,
          _currentChars: totalChars,
          _entryChars: nextLen,
        });
        return false;
      }
      active.push({
        ...entry,
        _budgetRank: budgetIndex + 1,
        _currentCharsBefore: totalChars,
        _entryChars: nextLen,
      });
      addedIds.add(entry.uid);
      totalChars += nextLen;
      return true;
    };

    const maxScanDepth = this._maxScanDepth(entries, normalized.settings);
    const baseScanSources = this._buildScanSources(conversation, normalized.settings, maxScanDepth);
    const state = normalized.worldBookState || { entries: {} };
    const turnIndex = this._getTurnIndex(conversation);
    const turnKey = this._getTurnKey(conversation, turnIndex);

    if (!entries.length) {
      active.blocked = [];
      active.candidates = [];
      active.scanSources = baseScanSources;
      active.settings = normalized.settings;
      active.totalChars = 0;
      return active;
    }

    const constantEntries = entries
      .filter(entry => entry.constant)
      .map(entry => attachMeta(entry, {
        mode: 'constant',
        kind: 'constant',
        step: 0,
        turnIndex,
        turnKey,
        sources: [{ kind: 'constant', label: '常驻条目', preview: '' }],
      }));
    for (const entry of constantEntries) candidates.push(entry);

    const candidateIds = new Set(constantEntries.map(entry => entry.uid));
    const autoEntries = entries
      .filter(entry => !entry.constant && (entry.keys || []).length > 0)
      .sort((a, b) => (a.order !== b.order ? b.order - a.order : a.uid - b.uid));

    let recursiveSources = [];
    const recursionSteps = normalized.settings.recursiveScan
      ? Math.max(0, Number(normalized.settings.maxRecursionSteps) || 0)
      : 0;
    const maxSteps = 1 + recursionSteps;

    for (let step = 0; step < maxSteps; step++) {
      const sourcePool = step === 0 ? baseScanSources : recursiveSources;
      if (!sourcePool.length) break;
      const matchedThisStep = [];

      for (const entry of autoEntries) {
        if (candidateIds.has(entry.uid)) continue;
        if (step > 0 && entry.preventRecursion) continue;
        const entrySources = step === 0
          ? this._selectScanSourcesForEntry(entry, sourcePool, normalized.settings)
          : sourcePool;
        const match = this._findEntryMatch(entry, entrySources, normalized.settings);
        if (!match.matched) continue;

        const matchedEntry = attachMeta(entry, {
          mode: 'auto',
          kind: step === 0 ? 'direct' : 'recursive',
          step,
          turnIndex,
          turnKey,
          primaryMatches: match.primaryMatches,
          secondaryMatches: match.secondaryMatches,
          sources: match.sources,
          matchScore: this._scoreMatch(match),
          sourceDepth: entry.scanDepth || normalized.settings.scanDepth,
        });

        const timing = this._passesTimedEffects(matchedEntry, state.entries?.[String(entry.uid)] || {}, turnIndex, turnKey);
        if (!timing.passed) {
          blockEntry(matchedEntry, timing.reason, timing.detail, timing.extra || {});
          candidateIds.add(entry.uid);
          continue;
        }
        const probability = this._passesProbability(matchedEntry, conversation, step, turnKey);
        if (!probability.passed) {
          blockEntry(matchedEntry, 'probability', probability.detail, { _probabilityRoll: probability.roll });
          candidateIds.add(entry.uid);
          continue;
        }
        matchedThisStep.push(matchedEntry);
      }

      if (step === 0) {
        for (const entry of autoEntries) {
          if (candidateIds.has(entry.uid)) continue;
          const stickyEntry = this._buildStickyCandidate(entry, state.entries?.[String(entry.uid)] || {}, turnIndex, turnKey);
          if (stickyEntry) matchedThisStep.push(stickyEntry);
        }
      }

      if (!matchedThisStep.length) break;
      matchedThisStep.sort(compareForBudget);
      const addedThisStep = [];
      for (const entry of matchedThisStep) {
        if (candidateIds.has(entry.uid)) continue;
        candidates.push(entry);
        candidateIds.add(entry.uid);
        addedThisStep.push(entry);
      }
      if (!normalized.settings.recursiveScan || !addedThisStep.length) break;
      recursiveSources = addedThisStep
        .filter(entry => !entry.preventRecursion)
        .map(entry => ({
          kind: 'recursion',
          label: `递归：${entry.comment || entry.title || entry.uid}`,
          content: String(entry.content || ''),
        }));
    }

    const budgetCandidates = this._applyGroups(candidates, compareForBudget, blockEntry);
    budgetCandidates.sort(compareForBudget);
    budgetCandidates.forEach((entry, index) => tryAdd(entry, index));
    active.sort(compareForInsertion);

    active.blocked = blocked.sort(compareForBudget);
    active.candidates = candidates.sort(compareForBudget);
    active.scanSources = baseScanSources;
    active.settings = normalized.settings;
    active.totalChars = totalChars;

    if (commit) this._commitActivationState(book, normalized, conversation, active, blocked, turnIndex, turnKey);
    return active;
  },

  exportSillyTavern(book) {
    const normalized = this.normalizeBook(book);
    const entries = {};
    for (const entry of normalized.entries) {
      entries[String(entry.uid)] = {
        uid: entry.uid,
        comment: entry.comment || entry.title || '',
        content: entry.content,
        constant: entry.constant,
        selective: !!entry.selective && entry.secondaryKeys.length > 0,
        key: [...entry.keys],
        keysecondary: [...entry.secondaryKeys],
        order: entry.order,
        position: this.POSITION_MAP[entry.position] ?? 1,
        role: entry.role,
        depth: entry.depth,
        scanDepth: entry.scanDepth,
        group: entry.group,
        groupWeight: entry.groupWeight,
        groupScoring: entry.groupScoring,
        sticky: entry.sticky,
        cooldown: entry.cooldown,
        delay: entry.delay,
        disable: !entry.enabled,
        probability: entry.probability,
        selectiveLogic: this.LOGIC_MAP?.[entry.selectiveLogic] ?? 0,
      };
    }
    return {
      name: normalized.name,
      description: normalized.description,
      entries,
      tokenBudget: normalized.settings.maxChars,
      scanDepth: normalized.settings.scanDepth,
      scanMode: normalized.settings.scanMode,
      recursiveScanning: normalized.settings.recursiveScan,
      maxRecursionSteps: normalized.settings.maxRecursionSteps,
      matchWholeWords: normalized.settings.matchWholeWords,
      caseSensitive: normalized.settings.caseSensitive,
      includeStorySetting: normalized.settings.includeStorySetting,
      includeMvuState: normalized.settings.includeMvuState,
    };
  },

  commitConversationActivation(conversation) {
    if (!conversation) return null;
    const blocks = this.buildPromptBlocks(conversation, { commit: true });
    return blocks;
  },

  commitPromptSnapshot(conversation, promptSnapshot) {
    if (!conversation || !promptSnapshot) return null;
    const book = this.ensureConversation(conversation);
    const normalized = this.normalizeBook(book, (conversation?.name || '世界书') + ' 世界书');
    const turnIndex = this._getTurnIndex(conversation);
    const turnKey = this._getTurnKey(conversation, turnIndex);
    this._commitActivationState(
      book,
      normalized,
      conversation,
      promptSnapshot.activeWorldBookEntries || [],
      promptSnapshot.blockedWorldBookEntries || [],
      turnIndex,
      turnKey
    );
    return conversation.worldBook?.worldBookState || null;
  },

  _normalizeRole(value) {
    if (typeof value === 'number') return ['system', 'user', 'assistant'][value] || 'user';
    const normalized = String(value || '').trim().toLowerCase();
    return ['system', 'user', 'assistant'].includes(normalized) ? normalized : 'user';
  },

  _normalizeGroupScoring(value) {
    const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    return ['order', 'weight', 'score'].includes(normalized) ? normalized : 'weight';
  },

  _normalizeScanMode(value) {
    const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    return ['recent_chat', 'latest_user'].includes(normalized) ? normalized : 'recent_chat';
  },

  _normalizeState(state) {
    const rawEntries = state?.entries && typeof state.entries === 'object' ? state.entries : {};
    const entries = {};
    for (const [uid, item] of Object.entries(rawEntries)) {
      if (!item || typeof item !== 'object') continue;
      entries[String(uid)] = {
        firstMatchTurn: Number.isFinite(Number(item.firstMatchTurn)) ? Number(item.firstMatchTurn) : null,
        lastMatchTurn: Number.isFinite(Number(item.lastMatchTurn)) ? Number(item.lastMatchTurn) : null,
        lastActiveTurn: Number.isFinite(Number(item.lastActiveTurn)) ? Number(item.lastActiveTurn) : null,
        lastPromptKey: String(item.lastPromptKey || ''),
      };
    }
    return { entries };
  },

  _nonNegativeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
  },

  _nullablePositiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : null;
  },

  _activationBudgetRank(entry) {
    if (entry?.constant || entry?._activationMode === 'constant') return 0;
    if (entry?._activationMode === 'sticky') return 1;
    if (entry?._matchKind === 'direct') return 2;
    if (entry?._matchKind === 'recursive') return 3;
    return 4;
  },

  _maxScanDepth(entries, settings) {
    return Math.max(
      Math.max(1, Number(settings.scanDepth) || this.DEFAULT_SETTINGS.scanDepth),
      ...entries.map(entry => Number(entry.scanDepth) || 0)
    );
  },

  _buildScanSources(conversation, settings, depthOverride = null) {
    const sources = [];
    const messages = (conversation?.messages || []).filter(msg => !msg.hidden && String(msg.content || '').trim());
    const depth = Math.max(1, Number(depthOverride ?? settings.scanDepth) || 6);
    let recent = messages.slice(-depth);
    if (settings.scanMode === 'latest_user') {
      const lastUser = [...messages].reverse().find(msg => msg.role === 'user' && String(msg.content || '').trim());
      recent = lastUser ? [lastUser] : [];
    }
    const lastUserIndex = recent.map(msg => msg.role).lastIndexOf('user');
    for (let i = 0; i < recent.length; i++) {
      const msg = recent[i];
      let content = String(msg.content || '');
      if (msg.role === 'assistant' && typeof Summary !== 'undefined' && typeof MVU !== 'undefined') {
        content = Summary.cleanAbstract(MVU.cleanText(content));
      }
      sources.push({
        kind: msg.role === 'user' && i === lastUserIndex ? 'latest_user' : 'chat',
        label: msg.role === 'user' && i === lastUserIndex ? '最新用户输入' : (msg.role === 'assistant' ? '最近AI回复' : '最近用户输入'),
        role: msg.role,
        messageOrdinal: i,
        content,
      });
    }
    if (settings.includeStorySetting && conversation?.storySetting) {
      sources.push({ kind: 'story', label: '故事设定', content: Panel.toSettingText(conversation) });
    }
    if (settings.includeMvuState && conversation?.mvu?.state) {
      sources.push({ kind: 'mvu', label: '状态栏', content: JSON.stringify(conversation.mvu.state, null, 2) });
    }
    return sources.filter(source => String(source.content || '').trim());
  },

  _selectScanSourcesForEntry(entry, sources, settings) {
    const depth = Number(entry.scanDepth) || Number(settings.scanDepth) || 6;
    if (!Number.isFinite(depth) || depth <= 0) return sources;
    const messageSources = sources.filter(source => source.messageOrdinal !== undefined);
    const kept = new Set(messageSources.slice(-depth).map(source => source));
    return sources.filter(source => source.messageOrdinal === undefined || kept.has(source));
  },

  _passesTimedEffects(entry, entryState, turnIndex, turnKey) {
    const state = entryState || {};
    const delay = Math.max(0, Number(entry.delay) || 0);
    if (delay > 0 && (state.firstMatchTurn === null || state.firstMatchTurn === undefined)) {
      return {
        passed: false,
        reason: 'delay',
        detail: `首次命中后延迟 ${delay} 轮`,
        extra: { _pendingFirstMatchTurn: turnIndex },
      };
    }
    if (delay > 0 && state.firstMatchTurn !== null && turnIndex - Number(state.firstMatchTurn) < delay) {
      return {
        passed: false,
        reason: 'delay',
        detail: `还需 ${delay - (turnIndex - Number(state.firstMatchTurn))} 轮后注入`,
      };
    }
    const cooldown = Math.max(0, Number(entry.cooldown) || 0);
    if (
      cooldown > 0
      && state.lastActiveTurn !== null
      && state.lastPromptKey !== turnKey
      && turnIndex - Number(state.lastActiveTurn) <= cooldown
    ) {
      return {
        passed: false,
        reason: 'cooldown',
        detail: `冷却中，剩余 ${cooldown - (turnIndex - Number(state.lastActiveTurn)) + 1} 轮`,
      };
    }
    return { passed: true };
  },

  _passesProbability(entry, conversation, step, turnKey = '') {
    const probability = Number.isFinite(Number(entry.probability)) ? Number(entry.probability) : 100;
    if (probability >= 100) return { passed: true, roll: 0, detail: '100%' };
    if (probability <= 0) return { passed: false, roll: 100, detail: '触发概率为 0%' };
    const seed = `${conversation?.id || ''}|${turnKey}|${entry.uid}|${step}|${entry._matchKind || ''}`;
    const roll = this._stableHash(seed) % 100;
    return {
      passed: roll < probability,
      roll,
      detail: `概率 ${probability}%，本轮 ${roll + 1}`,
    };
  },

  _buildStickyCandidate(entry, entryState, turnIndex, turnKey) {
    const sticky = Math.max(0, Number(entry.sticky) || 0);
    if (!sticky || entryState.lastActiveTurn === null || !entryState.lastPromptKey) return null;
    const elapsed = turnIndex - Number(entryState.lastActiveTurn);
    if (elapsed <= 0 || elapsed > sticky) return null;
    return {
      ...entry,
      _activationMode: 'sticky',
      _matchKind: 'sticky',
      _matchStep: 0,
      _matchedPrimaryKeys: [],
      _matchedSecondaryKeys: [],
      _matchSources: [{ kind: 'sticky', label: '黏滞保留', preview: `上次命中后保留 ${sticky} 轮` }],
      _turnIndex: turnIndex,
      _turnKey: turnKey,
      _matchScore: Math.max(1, sticky - elapsed + 1),
    };
  },

  _scoreMatch(match) {
    return (
      (match.primaryMatches || []).length * 10
      + (match.secondaryMatches || []).length * 4
      + (match.sources || []).length
    );
  },

  _applyGroups(candidates, compareForBudget, blockEntry) {
    const grouped = new Map();
    const ungrouped = [];
    for (const entry of candidates) {
      const group = String(entry.group || '').trim();
      if (!group) {
        ungrouped.push(entry);
        continue;
      }
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group).push(entry);
    }
    const winners = [];
    for (const [group, entries] of grouped.entries()) {
      const sorted = [...entries].sort((a, b) => this._compareGroupChoice(a, b, compareForBudget));
      const winner = sorted[0];
      winners.push(winner);
      for (const loser of sorted.slice(1)) {
        blockEntry(loser, 'group', `同组「${group}」由「${winner.comment || winner.title || winner.uid}」胜出`, {
          _groupWinnerUid: winner.uid,
        });
      }
    }
    return [...ungrouped, ...winners];
  },

  _compareGroupChoice(a, b, compareForBudget) {
    const scoring = a.groupScoring || b.groupScoring || 'weight';
    if (scoring === 'score' && (b._matchScore || 0) !== (a._matchScore || 0)) {
      return (b._matchScore || 0) - (a._matchScore || 0);
    }
    if (scoring === 'weight' && (b.groupWeight || 0) !== (a.groupWeight || 0)) {
      return (b.groupWeight || 0) - (a.groupWeight || 0);
    }
    if (a.order !== b.order) return b.order - a.order;
    return compareForBudget(a, b);
  },

  _commitActivationState(book, normalized, conversation, active, blocked, turnIndex, turnKey) {
    const state = normalized.worldBookState || { entries: {} };
    state.entries = state.entries || {};
    const markFirstMatch = entry => {
      if (!entry || !entry.uid) return;
      const uid = String(entry.uid);
      const item = state.entries[uid] || {};
      if (item.firstMatchTurn === null || item.firstMatchTurn === undefined) item.firstMatchTurn = turnIndex;
      item.lastMatchTurn = turnIndex;
      state.entries[uid] = item;
    };
    for (const entry of [...active, ...blocked]) {
      if (entry._matchKind && !['constant', 'sticky'].includes(entry._matchKind)) markFirstMatch(entry);
      if (entry._pendingFirstMatchTurn !== undefined) markFirstMatch(entry);
    }
    for (const entry of active) {
      const uid = String(entry.uid);
      const item = state.entries[uid] || {};
      if (item.firstMatchTurn === null || item.firstMatchTurn === undefined) item.firstMatchTurn = turnIndex;
      if (entry._activationMode !== 'sticky') item.lastActiveTurn = turnIndex;
      item.lastPromptKey = turnKey;
      state.entries[uid] = item;
    }
    book.worldBookState = state;
    if (conversation?.worldBook) conversation.worldBook.worldBookState = state;
  },

  _getTurnIndex(conversation) {
    return (conversation?.messages || []).filter(msg => !msg.hidden && msg.role === 'user').length;
  },

  _getTurnKey(conversation, turnIndex) {
    const lastUser = [...(conversation?.messages || [])].reverse().find(msg => !msg.hidden && msg.role === 'user') || {};
    return `${conversation?.id || ''}|${turnIndex}|${lastUser.id || ''}|${this._stableHash(lastUser.content || '')}`;
  },

  _formatEntryPrompt(entry) {
    const title = entry.comment || entry.title || `条目 ${entry.uid}`;
    return `### ${title}\n${String(entry.content || '').trim()}`;
  },

  _wrapPromptBucket(label, items) {
    if (!items || items.length === 0) return '';
    return `【世界书：${label}】\n` + items.join('\n\n');
  },
});

// ============================================================
// MVU Module
// ============================================================
const MVU = {
  BASE_STYLE: `
    .mvu-root {
      --mvu-bg: transparent;
      --mvu-panel: rgba(255,255,255,0.025);
      --mvu-card: rgba(255,255,255,0.04);
      --mvu-accent: var(--accent);
      --mvu-accent-2: #67c7b4;
      --mvu-warn: #e8bf5a;
      --mvu-text: var(--text-primary);
      --mvu-muted: var(--text-muted);
      --mvu-border: rgba(201,164,76,0.18);
      --mvu-radius: 8px;
      --mvu-shadow: none;
      --mvu-texture: none;
    }
    .mvu-empty { text-align: center; padding: 40px 20px; color: var(--text-muted); font-style: italic; font-size: 14px; }
    .mvu-panel, .mvu-section { border: 1px solid var(--mvu-border, rgba(201,164,76,0.16)); background: var(--mvu-panel, rgba(255,255,255,0.025)); border-radius: var(--mvu-radius, 8px); box-shadow: var(--mvu-shadow, none); padding: 12px; margin-bottom: 10px; }
    details.mvu-section > summary { cursor: pointer; list-style: none; color: var(--mvu-accent, var(--accent)); font-weight: 700; font-size: 13px; display: flex; justify-content: space-between; gap: 8px; align-items: center; margin: -2px 0 8px; }
    details.mvu-section > summary::-webkit-details-marker { display: none; }
    details.mvu-section > summary small { color: var(--mvu-muted, var(--text-muted)); font-size: 10px; font-weight: 500; }
    .mvu-managed-body { display: grid; gap: 2px; }
    .mvu-managed-field { border-radius: max(6px, calc(var(--mvu-radius, 8px) - 2px)); padding-left: 6px; padding-right: 6px; background: color-mix(in srgb, var(--mvu-card, rgba(255,255,255,0.04)), transparent 28%); }
    .mvu-section-title, .mvu-title { color: var(--mvu-accent, var(--accent)); font-weight: 600; font-size: 13px; margin-bottom: 8px; letter-spacing: 0; }
    .mvu-field { display: grid; grid-template-columns: minmax(82px, 0.42fr) minmax(0, 1fr); gap: 8px; align-items: start; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .mvu-field:last-child { border-bottom: 0; }
    .mvu-label { color: var(--mvu-muted, var(--text-muted)); font-size: 12px; line-height: 1.5; }
    .mvu-value, [data-field] { color: var(--mvu-text, var(--text-primary)); font-size: 13px; line-height: 1.55; word-break: break-word; }
    .mvu-bar-track { height: 8px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,0.08); margin-top: 4px; }
    .mvu-bar-fill, [data-field-bar] { display: block; height: 100%; min-width: 2px; border-radius: inherit; background: linear-gradient(90deg, var(--mvu-accent, var(--accent)), var(--mvu-accent-2, #e1bd64)); transition: width 0.35s ease; }
    .mvu-list-item { padding: 6px 8px; border-radius: max(6px, calc(var(--mvu-radius, 8px) - 2px)); background: var(--mvu-card, rgba(255,255,255,0.04)); border: 1px solid color-mix(in srgb, var(--mvu-border, rgba(201,164,76,0.18)), transparent 35%); margin-bottom: 5px; font-size: 12px; line-height: 1.45; color: var(--mvu-text, var(--text-primary)); }
    .mvu-character-grid { display: grid; gap: 8px; }
    .mvu-character-card { display: grid; gap: 7px; min-height: 104px; max-height: 150px; overflow: hidden; padding: 10px; border: 1px solid var(--mvu-border, rgba(201,164,76,0.18)); border-radius: var(--mvu-radius, 8px); background: var(--mvu-card, rgba(255,255,255,0.04)); background-image: var(--mvu-texture, none); box-shadow: var(--mvu-shadow, none); cursor: pointer; position: relative; }
    .mvu-character-card::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 22px; pointer-events: none; background: linear-gradient(180deg, rgba(20,18,13,0), rgba(20,18,13,0.92)); opacity: 0.86; }
    .mvu-character-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 8px; }
    .mvu-character-name { color: var(--mvu-accent, var(--accent)); font-size: 14px; font-weight: 800; line-height: 1.3; min-width: 0; word-break: break-word; }
    .mvu-character-role { max-width: 92px; color: var(--mvu-muted, var(--text-muted)); font-size: 11px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mvu-character-meta { display: flex; flex-wrap: wrap; gap: 5px; }
    .mvu-character-chip { max-width: 100%; color: var(--mvu-text, var(--text-secondary)); font-size: 11px; line-height: 1.25; border: 1px solid color-mix(in srgb, var(--mvu-border, rgba(255,255,255,0.08)), transparent 25%); border-radius: 999px; padding: 2px 7px; background: color-mix(in srgb, var(--mvu-panel, rgba(0,0,0,0.12)), transparent 18%); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mvu-character-desc { color: var(--mvu-text, var(--text-primary)); font-size: 12px; line-height: 1.5; opacity: 0.92; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
    .mvu-character-more { color: var(--mvu-accent, var(--accent)); font-size: 11px; font-weight: 700; opacity: 0.82; }
    .mvu-tab { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--mvu-border, rgba(201,164,76,0.22)); color: var(--mvu-text, var(--text-secondary)); background: var(--mvu-card, rgba(255,255,255,0.03)); font-size: 12px; cursor: pointer; white-space: nowrap; transition: all 0.18s ease; }
    .mvu-tab.active { color: var(--mvu-bg, #1a1510); background: var(--mvu-accent, var(--accent)); border-color: var(--mvu-accent, var(--accent)); }
    .mvu-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 10px; }
    .mvu-field-changed { animation: mvuPulseChanged 1.4s ease; }
    @keyframes mvuPulseChanged { 0% { box-shadow: 0 0 0 0 rgba(201,164,76,0.0); background-color: rgba(201,164,76,0.0); } 18% { box-shadow: 0 0 0 2px rgba(201,164,76,0.28); background-color: rgba(201,164,76,0.12); } 100% { box-shadow: 0 0 0 0 rgba(201,164,76,0.0); background-color: transparent; } }
    .mvu-data-view { display: flex; flex-direction: column; gap: 10px; }
    .mvu-data-group { border: 1px solid rgba(201,164,76,0.16); border-radius: 8px; background: rgba(255,255,255,0.025); overflow: hidden; }
    .mvu-data-group summary { cursor: pointer; list-style: none; padding: 10px 12px; color: var(--accent); font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .mvu-data-group summary::-webkit-details-marker { display: none; }
    .mvu-data-fields { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 10px; }
    .mvu-data-field { display: grid; gap: 6px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .mvu-data-field:last-child { border-bottom: 0; padding-bottom: 0; }
    .mvu-data-head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
    .mvu-data-label { color: var(--text-secondary); font-size: 12px; font-weight: 600; }
    .mvu-data-key { color: var(--text-muted); font-size: 11px; font-family: monospace; }
    .mvu-data-input, .mvu-data-textarea { width: 100%; border: 1px solid var(--border); border-radius: 6px; background: rgba(0,0,0,0.18); color: var(--text-primary); padding: 8px 9px; font-size: 12px; }
    .mvu-data-textarea { min-height: 68px; resize: vertical; line-height: 1.45; }
    .mvu-data-range-row { display: grid; grid-template-columns: minmax(0, 1fr) 72px; gap: 8px; align-items: center; }
    .mvu-data-list { display: flex; flex-direction: column; gap: 6px; }
    .mvu-data-list-row { display: grid; grid-template-columns: minmax(0, 1fr) 30px; gap: 6px; align-items: center; }
    .mvu-data-mini-btn { height: 30px; border-radius: 6px; border: 1px solid var(--border); background: rgba(255,255,255,0.04); color: var(--text-secondary); cursor: pointer; }
    .mvu-data-mini-btn:hover { color: var(--accent); border-color: var(--accent); }
    .mvu-data-empty { color: var(--text-muted); text-align: center; font-size: 12px; padding: 24px 8px; }
    .mvu-changes-view { display: flex; flex-direction: column; gap: 10px; }
    .mvu-changes-summary { border: 1px solid rgba(201,164,76,0.18); border-radius: 8px; background: rgba(201,164,76,0.07); padding: 12px; display: grid; gap: 3px; }
    .mvu-changes-summary strong { color: var(--accent); font-size: 14px; }
    .mvu-changes-summary span { color: var(--text-muted); font-size: 12px; line-height: 1.45; }
    .mvu-change-card { border: 1px solid rgba(201,164,76,0.16); border-radius: 8px; background: rgba(255,255,255,0.028); padding: 11px; display: grid; gap: 9px; }
    .mvu-change-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    .mvu-change-title { min-width: 0; display: grid; gap: 2px; }
    .mvu-change-label { color: var(--text-primary); font-size: 13px; font-weight: 700; word-break: break-word; }
    .mvu-change-key { color: var(--text-muted); font-size: 10px; font-family: monospace; word-break: break-all; }
    .mvu-change-delta { flex: 0 0 auto; max-width: 90px; border: 1px solid rgba(201,164,76,0.24); border-radius: 999px; background: rgba(201,164,76,0.11); color: var(--accent); font-size: 11px; font-weight: 700; line-height: 1.25; padding: 3px 8px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mvu-change-meta { display: flex; flex-wrap: wrap; gap: 5px; }
    .mvu-change-tag { border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; background: rgba(255,255,255,0.04); color: var(--text-muted); font-size: 10px; line-height: 1.2; padding: 3px 7px; }
    .mvu-change-compare { display: grid; grid-template-columns: minmax(0, 1fr); gap: 7px; }
    .mvu-change-side { border-radius: 7px; background: rgba(0,0,0,0.16); padding: 8px; display: grid; gap: 4px; min-width: 0; }
    .mvu-change-side b { color: var(--text-muted); font-size: 10px; font-weight: 600; }
    .mvu-change-side p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; max-height: 84px; overflow: auto; }
    .mvu-change-side.after p { color: var(--text-primary); }
    .mvu-change-empty { border: 1px dashed rgba(201,164,76,0.2); border-radius: 8px; padding: 28px 14px; text-align: center; color: var(--text-muted); font-size: 12px; line-height: 1.6; background: rgba(255,255,255,0.02); }
  `,
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

  /** 去掉思考块（含流式过程中未闭合的残缺块） */
  stripThinking(text) {
    return String(text || '')
      .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
      .replace(/<deep_thinking>[\s\S]*?<\/deep_thinking>/g, '')
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/<thinking>[\s\S]*$/g, '')
      .replace(/<deep_thinking>[\s\S]*$/g, '')
      .replace(/<think>[\s\S]*$/g, '');
  },

  /** 是否隐藏思考内容（按当前 API 方案的设置） */
  shouldHideReasoning() {
    try {
      const s = Storage.getSettings();
      const p = Storage.getApiProfile(s?.defaultApiProfileId);
      return !!p?.hideReasoning;
    } catch (e) {
      return false;
    }
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
    const resolveParent = (root, parts, create = false) => {
      let target = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = Array.isArray(target) ? (parts[i] === '-' ? target.length : Number(parts[i])) : parts[i];
        if (target[key] === undefined) {
          if (!create) return null;
          const nextIsIndex = /^\d+$/.test(parts[i + 1]) || parts[i + 1] === '-';
          target[key] = nextIsIndex ? [] : {};
        }
        target = target[key];
        if (target === null || typeof target !== 'object') return null;
      }
      return target;
    };
    const assignKey = (target, keyPart, value) => {
      if (!target) return;
      if (Array.isArray(target)) {
        if (keyPart === '-') target.push(value);
        else target[Number(keyPart)] = value;
      } else {
        target[keyPart] = value;
      }
    };
    const removeValue = (target, keyPart, value) => {
      if (!target) return;
      if (Array.isArray(target)) {
        if (keyPart !== undefined && keyPart !== '' && keyPart !== '-') {
          const idx = Number(keyPart);
          if (Number.isInteger(idx)) target.splice(idx, 1);
        } else {
          const idx = target.findIndex(item => JSON.stringify(item) === JSON.stringify(value) || item === value);
          if (idx >= 0) target.splice(idx, 1);
        }
      } else if (keyPart) {
        delete target[keyPart];
      }
    };

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
        let v = p.value;
        if (parts.length === 1) {
          if (isNumericField(field)) {
            const n = this._coerceNumeric(v);
            if (n !== null) v = n;
          }
          s[field] = v;
        } else {
          assignKey(resolveParent(s, parts, true), parts[parts.length - 1], v);
        }
      } else if (p.op === 'delta') {
        const parent = parts.length === 1 ? s : resolveParent(s, parts, false);
        const key = parts.length === 1 ? field : parts[parts.length - 1];
        if (parent) {
          // 历史坏数据防御：state 里已经是 "45/100" 字符串时，delta 先归一化再加
          const rawCur = parent[key];
          const cur = typeof rawCur === 'number' ? rawCur : (isNumericField(key) ? this._coerceNumeric(rawCur) : null);
          const dv = this._coerceNumeric(p.value);
          if (cur !== null && dv !== null) parent[key] = cur + dv;
        }
      } else if (p.op === 'add') {
        const parent = resolveParent(s, parts, true);
        assignKey(parent, parts[parts.length - 1], p.value);
      } else if (p.op === 'remove') {
        if (parts.length === 1 && Array.isArray(s[field])) removeValue(s[field], '', p.value);
        else removeValue(resolveParent(s, parts, false), parts[parts.length - 1], p.value);
      }
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

  _formatDisplayValue(value) {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.map(v => this._formatDisplayValue(v)).filter(Boolean).join('、');
    if (typeof value === 'object') {
      const title = value.title || value.name || value.label || value.objective || value.profile || value.desc || value.description || '';
      const status = value.status ? `（${value.status}）` : '';
      const progress = value.progress ? ` - ${value.progress}` : '';
      if (title) return `${title}${status}${progress}`;
      return Object.entries(value).map(([k, v]) => `${k}: ${this._formatDisplayValue(v)}`).join('；');
    }
    return String(value);
  },

  _shortText(value, max = 64) {
    const text = this._formatDisplayValue(value).replace(/\s+/g, ' ').trim();
    return text.length > max ? text.slice(0, Math.max(0, max - 3)) + '...' : text;
  },

  _pickCharacterSummary(character) {
    const source = character.summary || character.brief || character.profile || character.desc || character.description
      || character.thoughts || character.note || this._formatDisplayValue(character);
    return this._shortText(source, 72);
  },

  _renderListItem(value) {
    const text = this._formatDisplayValue(value);
    if (value && typeof value === 'object') {
      const title = value.title || value.name || value.label || text;
      const type = value.type || value.status || value.category || '详情';
      const desc = value.desc || value.description || value.objective || value.profile || value.progress || text;
      return `<div class="mvu-list-item" data-mvu-detail data-mvu-title="${Utils.escapeHtml(String(title))}" data-mvu-type="${Utils.escapeHtml(String(type))}" data-mvu-desc="${Utils.escapeHtml(String(desc))}">${Utils.escapeHtml(text)}</div>`;
    }
    return `<div class="mvu-list-item">${Utils.escapeHtml(text)}</div>`;
  },

  _renderCharacterCards(value) {
    if (!Array.isArray(value) || !value.length) return '<div class="mvu-list-item">\u6682\u65e0\u89d2\u8272\u8bb0\u5f55</div>';
    const cards = value.map((character, index) => {
      if (!character || typeof character !== 'object') return this._renderListItem(character);
      const name = character.name || character.title || character.label || `\u89d2\u8272 ${index + 1}`;
      const role = character.role || character.identity || character.relation || character.status || '\u89d2\u8272';
      const desc = this._pickCharacterSummary(character);
      const chips = [
        character.relation && `\u5173\u7cfb\uff1a${this._shortText(character.relation, 16)}`,
        character.affection !== undefined && character.affection !== '' && `\u597d\u611f\uff1a${this._shortText(character.affection, 10)}`,
        character.location && `\u4f4d\u7f6e\uff1a${this._shortText(character.location, 18)}`,
        character.status && `\u72b6\u6001\uff1a${this._shortText(character.status, 16)}`,
      ].filter(Boolean).slice(0, 4);
      const fallback = Object.entries(character)
        .filter(([key, val]) => !['id', 'name', 'title', 'label', 'role', 'identity', 'profile', 'desc', 'description', 'note'].includes(key) && val !== '' && val !== undefined && val !== null)
        .map(([key, val]) => `${key}: ${this._formatDisplayValue(val)}`)
        .join('\n');
      return `<div class="mvu-character-card" data-mvu-detail data-mvu-index="${index}" data-mvu-title="${Utils.escapeHtml(String(name))}" data-mvu-type="${Utils.escapeHtml(String(role))}">
        <div class="mvu-character-head">
          <span class="mvu-character-name">${Utils.escapeHtml(String(name))}</span>
          <span class="mvu-character-role">${Utils.escapeHtml(String(role))}</span>
        </div>
        ${chips.length ? `<div class="mvu-character-meta">${chips.map(chip => `<span class="mvu-character-chip">${Utils.escapeHtml(String(chip))}</span>`).join('')}</div>` : ''}
        <div class="mvu-character-desc">${Utils.escapeHtml(String(desc || fallback || '\u6682\u65e0\u8be6\u7ec6\u8bb0\u5f55'))}</div>
        <div class="mvu-character-more">\u70b9\u51fb\u67e5\u770b\u5b8c\u6574\u6863\u6848</div>
      </div>`;
    }).join('');
    return `<div class="mvu-character-grid">${cards}</div>`;
  },

  _renderList(field, value) {
    if (field === 'characters') return this._renderCharacterCards(value);
    return value.map(v => this._renderListItem(v)).join('');
  },

  updateDOM(container, state, schema, changedFields = []) {
    if (!container) return;
    const changed = new Set(changedFields || []);
    container.querySelectorAll('.mvu-field-changed').forEach(el => el.classList.remove('mvu-field-changed'));
    for (const [field, rawValue] of Object.entries(state)) {
      const def = schema?.[field];
      // bar/number 显示前归一化：旧存档 state 里可能残留 "45/100" 字符串（净化机制上线前写入的）
      let value = rawValue;
      if (def && (def.type === 'bar' || def.type === 'number') && typeof value !== 'number') {
        const n = this._coerceNumeric(value);
        if (n !== null) value = n;
      }
      const els = [...container.querySelectorAll(`[data-field="${field}"]`)];
      for (const el of els) {
        const text = this._formatDisplayValue(value);
        if (text.includes('\n')) {
          el.innerHTML = Utils.escapeHtml(text).replace(/\n/g, '<br>');
        } else {
          el.textContent = text;
        }
      }
      const barEls = [...container.querySelectorAll(`[data-field-bar="${field}"]`)];
      for (const barEl of barEls) {
        if (def?.max && typeof value === 'number') barEl.style.width = Math.max(0, Math.min(100, (value / def.max) * 100)) + '%';
      }
      const listEls = [...container.querySelectorAll(`[data-field-list="${field}"]`)];
      for (const listEl of listEls) {
        if (Array.isArray(value)) listEl.innerHTML = this._renderList(field, value, def);
      }
      if (changed.has(field)) {
        for (const target of [...els, ...barEls, ...listEls]) {
          if (!target) continue;
          (target.closest('.mvu-field') || target).classList.add('mvu-field-changed');
        }
      }
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

  renderDataView(container, mvuData, options = {}) {
    if (!container || !mvuData) return;
    let styleEl = document.getElementById('mvu-custom-style');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'mvu-custom-style'; document.head.appendChild(styleEl); }
    styleEl.textContent = this.BASE_STYLE + '\n' + (mvuData.css || '');

    const schema = mvuData.schema || {};
    const state = mvuData.state || {};
    const changed = new Set(mvuData._changedFields || []);
    const query = (options.query || '').trim().toLowerCase();
    const groups = new Map();
    const entries = Object.entries(state).filter(([field, value]) => {
      const def = schema[field] || {};
      const valueText = Array.isArray(value) ? value.join(' ') : String(value ?? '');
      const haystack = `${field} ${def.label || ''} ${def.group || ''} ${valueText}`.toLowerCase();
      return !query || haystack.includes(query);
    });

    for (const [field, value] of entries) {
      const def = schema[field] || {};
      const group = def.group || this._inferGroup(field, def);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push([field, value, def]);
    }

    if (!entries.length) {
      container.innerHTML = '<div class="mvu-data-empty">没有匹配的变量</div>';
      return;
    }

    let html = '<div class="mvu-data-view">';
    for (const [group, fields] of groups) {
      html += `<details class="mvu-data-group" open><summary>${Utils.escapeHtml(group)} · ${fields.length}</summary><div class="mvu-data-fields">`;
      for (const [field, value, def] of fields) html += this._renderDataField(field, value, def, changed.has(field));
      html += '</div></details>';
    }
    html += '</div>';
    container.innerHTML = html;
  },

  _inferGroup(field, def) {
    if (def?.label && String(def.label).includes(' - ')) return String(def.label).split(' - ')[0];
    const parts = String(field).split('_');
    return parts.length > 1 ? parts[0] : '基础变量';
  },

  _renderDataField(field, value, def = {}, isChanged = false) {
    const type = def.type || (Array.isArray(value) ? 'list' : typeof value === 'number' ? 'number' : 'text');
    const label = def.label || field;
    const changedClass = isChanged ? ' mvu-field-changed' : '';
    const fieldArg = JSON.stringify(field);
    let control = '';

    if (type === 'bar') {
      const max = Number(def.max || 100);
      const num = Number(value || 0);
      control = `<div class="mvu-data-range-row">
        <input class="mvu-data-input" type="range" min="0" max="${max}" value="${num}" oninput='handleMvuFieldInput(${fieldArg}, "bar", this.value)'>
        <input class="mvu-data-input" type="number" min="0" max="${max}" value="${num}" onchange='handleMvuFieldInput(${fieldArg}, "bar", this.value)'>
      </div>`;
    } else if (type === 'number') {
      control = `<input class="mvu-data-input" type="number" value="${Utils.escapeHtml(String(value ?? ''))}" onchange='handleMvuFieldInput(${fieldArg}, "number", this.value)'>`;
    } else if (type === 'list' && Array.isArray(value)) {
      control = '<div class="mvu-data-list">';
      value.forEach((item, idx) => {
        const itemText = item && typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item ?? '');
        control += `<div class="mvu-data-list-row">
          <textarea class="mvu-data-textarea" onchange='handleMvuListItemInput(${fieldArg}, ${idx}, this.value)'>${Utils.escapeHtml(itemText)}</textarea>
          <button class="mvu-data-mini-btn" onclick='removeMvuListItem(${fieldArg}, ${idx})'>×</button>
        </div>`;
      });
      control += `<button class="mvu-data-mini-btn" onclick='addMvuListItem(${fieldArg})'>添加条目</button></div>`;
    } else if (type === 'tag') {
      control = `<input class="mvu-data-input" value="${Utils.escapeHtml(String(value ?? ''))}" onchange='handleMvuFieldInput(${fieldArg}, "tag", this.value)'>`;
    } else {
      control = `<textarea class="mvu-data-textarea" onchange='handleMvuFieldInput(${fieldArg}, "text", this.value)'>${Utils.escapeHtml(String(value ?? ''))}</textarea>`;
    }

    return `<div class="mvu-data-field${changedClass}">
      <div class="mvu-data-head">
        <span class="mvu-data-label">${Utils.escapeHtml(label)}</span>
        <span class="mvu-data-key">${Utils.escapeHtml(field)}</span>
      </div>
      ${control}
    </div>`;
  },

  renderChangesView(container, mvuData) {
    if (!container || !mvuData) return;
    let styleEl = document.getElementById('mvu-custom-style');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'mvu-custom-style'; document.head.appendChild(styleEl); }
    styleEl.textContent = this.BASE_STYLE + '\n' + (mvuData.css || '');

    const changes = Array.isArray(mvuData._lastChanges) ? mvuData._lastChanges : [];
    if (!changes.length) {
      container.innerHTML = `<div class="mvu-changes-view">
        <div class="mvu-change-empty">本轮暂无状态栏变化<br><span>AI 回复或手动编辑状态栏后，会在这里显示变化记录</span></div>
      </div>`;
      return;
    }

    const sourceLabel = this._formatChangeSource(changes[0]?.source);
    const latestTime = changes.reduce((max, change) => Math.max(max, Number(change.time || 0)), 0);
    let html = `<div class="mvu-changes-view">
      <div class="mvu-changes-summary">
        <strong>本轮变化 · ${changes.length}</strong>
        <span>来源：${Utils.escapeHtml(sourceLabel)}${latestTime ? ` · ${Utils.escapeHtml(this._formatChangeTime(latestTime))}` : ''}</span>
      </div>`;
    for (const change of changes) html += this._renderChangeCard(change);
    html += '</div>';
    container.innerHTML = html;
  },

  _renderChangeCard(change) {
    const label = change.label || change.field || '未命名条目';
    const field = change.field || '';
    const type = change.type || '';
    const delta = change.delta || this._inferChangeDelta(change.before, change.after);
    const before = this._formatChangeValue(change.before);
    const after = this._formatChangeValue(change.after);
    const source = this._formatChangeSource(change.source);
    const time = change.time ? this._formatChangeTime(change.time) : '';
    return `<article class="mvu-change-card">
      <div class="mvu-change-head">
        <div class="mvu-change-title">
          <span class="mvu-change-label">${Utils.escapeHtml(String(label))}</span>
          ${field ? `<span class="mvu-change-key">${Utils.escapeHtml(String(field))}</span>` : ''}
        </div>
        <span class="mvu-change-delta">${Utils.escapeHtml(String(delta || '修改'))}</span>
      </div>
      <div class="mvu-change-meta">
        ${type ? `<span class="mvu-change-tag">${Utils.escapeHtml(String(type))}</span>` : ''}
        <span class="mvu-change-tag">${Utils.escapeHtml(source)}</span>
        ${time ? `<span class="mvu-change-tag">${Utils.escapeHtml(time)}</span>` : ''}
      </div>
      <div class="mvu-change-compare">
        <div class="mvu-change-side before"><b>修改前</b><p>${Utils.escapeHtml(before || '空')}</p></div>
        <div class="mvu-change-side after"><b>修改后</b><p>${Utils.escapeHtml(after || '空')}</p></div>
      </div>
    </article>`;
  },

  _formatChangeValue(value) {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'string') return this._limitChangeText(value);
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
      if (!value.length) return '[]';
      return this._limitChangeText(value.map(item => this._formatDisplayValue(item)).join('\n'));
    }
    if (typeof value === 'object') {
      const summary = this._formatDisplayValue(value);
      return this._limitChangeText(summary || JSON.stringify(value, null, 2));
    }
    return this._limitChangeText(String(value));
  },

  _limitChangeText(text, max = 420) {
    const clean = String(text || '').trim();
    return clean.length > max ? clean.slice(0, max - 3) + '...' : clean;
  },

  _formatChangeSource(source) {
    const map = { ai: 'AI 更新', edit: '手动编辑', manual: '手动编辑' };
    return map[source] || '状态栏更新';
  },

  _formatChangeTime(time) {
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  },

  _inferChangeDelta(before, after) {
    if (typeof before === 'number' && typeof after === 'number') {
      const diff = after - before;
      if (diff > 0) return `+${diff}`;
      if (diff < 0) return String(diff);
      return '0';
    }
    if (Array.isArray(before) && Array.isArray(after)) {
      const diff = after.length - before.length;
      if (diff > 0) return `新增 ${diff}`;
      if (diff < 0) return `删除 ${Math.abs(diff)}`;
    }
    if (before === undefined || before === null || before === '') return '新增';
    if (after === undefined || after === null || after === '') return '清空';
    return '修改';
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
    styleEl.textContent = this.BASE_STYLE + '\n' + (mvuData.css || '') + hostGuard;
    container.innerHTML = mvuData.html || '<div class="mvu-empty">状态栏未初始化</div>';
    // Re-render template instances (persisted across page loads)
    const templates = mvuData.templates || {};
    for (const inst of (mvuData.templateInstances || [])) {
      const tpl = templates[inst.template];
      if (tpl) this._insertTemplateHtml(tpl, inst.id, inst.name, container);
    }
    if (mvuData.state && mvuData.schema) this.updateDOM(container, mvuData.state, mvuData.schema, mvuData._changedFields || []);
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
    const preset = PromptBuilder.getActivePreset(settings, conv);
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
// Memory —— 记忆占用统计 / 导出 / 粘贴回填
//   三层摘要（ab → sm → ar）+ 世界书 + 对话历史，各自算占用，
//   让「上下文为什么满了」变成可看的数字，而不是靠感觉。
// ============================================================
const Memory = {
  /** 记忆导出格式版本号，粘贴时用于识别 */
  EXPORT_VERSION: 1,

  /**
   * 粗略 token 估算。中日韩字符按 1 字 ≈ 1 token，其余按 4 字符 ≈ 1 token。
   * 只用于「长度条」的量级提示，不做精确计费——真要精确必须用各家 tokenizer。
   */
  estimateTokens(text) {
    const s = String(text || '');
    if (!s) return 0;
    let cjk = 0, other = 0;
    for (const ch of s) {
      if (/[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/.test(ch)) cjk++;
      else other++;
    }
    return Math.ceil(cjk + other / 4);
  },

  _part(items) {
    const text = (items || []).map(it => String(it?.content || '')).join('\n');
    return { count: (items || []).length, chars: text.length, tokens: this.estimateTokens(text) };
  },

  /**
   * 统计当前对话的记忆占用。
   * 世界书部分用「当前会命中的条目」实时计算（只读，不写激活状态）。
   */
  getMemoryStats(conversation) {
    const abstracts = Summary.getUnmergedAbstracts(conversation);
    const recent = this._part(abstracts);
    const merged = this._part(conversation?.summary?.mergedSummaries || []);
    const archive = this._part(conversation?.summary?.archive || []);

    const msgs = (conversation?.messages || []).filter(m => !m.hidden && String(m.content || '').trim());
    const dialogue = this._part(msgs);

    let worldBook = { count: 0, chars: 0, tokens: 0 };
    try {
      const blocks = WorldBook.buildPromptBlocks(conversation);
      const active = blocks?.active || [];
      worldBook = this._part(active);
      const note = PromptBuilder.resolveWritingNote(conversation);
      if (note) {
        const noteText = '【主人的写作建议】\n' + note.text;
        worldBook.count += 1;
        worldBook.chars += noteText.length;
        worldBook.tokens += this.estimateTokens(noteText);
      }
    } catch (e) {
      log('getMemoryStats: world book failed', e.message);
    }

    const totalTokens = recent.tokens + merged.tokens + archive.tokens + worldBook.tokens + dialogue.tokens;
    const totalChars = recent.chars + merged.chars + archive.chars + worldBook.chars + dialogue.chars;
    return {
      recent, merged, archive, worldBook, dialogue,
      totalTokens, totalChars,
      pendingMerge: Summary.countUnmergedAbstracts(conversation),
      mergeInterval: conversation?.summary?.interval || Storage.getSettings().summaryInterval || 80,
    };
  },

  /** 导出为可读、可再粘贴的文本（<smNN> / <arNN> 标签，与内部解析器同一套） */
  exportMemory(conversation) {
    const merged = conversation?.summary?.mergedSummaries || [];
    const archive = conversation?.summary?.archive || [];
    const lines = [];
    lines.push(`# 入卷记忆导出 v${this.EXPORT_VERSION}`);
    lines.push(`# 对话：${conversation?.name || '未命名'}`);
    lines.push(`# 导出时间：${new Date().toISOString()}`);
    lines.push(`# 合并摘要 ${merged.length} 条 · 往事纪要 ${archive.length} 条`);
    lines.push('# 直接改内容后粘贴回来即可；标签名不要改。');
    lines.push('');
    lines.push('## 合并摘要 (sm)');
    for (const sm of merged) lines.push(`<${sm.code}>${sm.content}</${sm.code}>`);
    lines.push('');
    lines.push('## 往事纪要 (archive)');
    for (const ar of archive) lines.push(`<${ar.code}>${ar.content}</${ar.code}>`);
    lines.push('');
    return lines.join('\n');
  },

  /**
   * 解析导出文本。容忍标签之间有多余空行 / 说明文字。
   * 返回 { mergedSummaries, archive, warnings }
   */
  parseMemoryExport(text) {
    const raw = String(text || '');
    const mergedSummaries = Summary.parseMergedSummaries(raw);
    const archive = Summary.parseArchiveEntries(raw);
    const warnings = [];
    if (raw.trim() && mergedSummaries.length === 0 && archive.length === 0) {
      warnings.push('没有找到 <smNN> 或 <arNN> 标签，请确认粘贴的是导出的记忆文本。');
    }
    // 去重（同 code 只保留最后一条）
    const dedupe = (list) => {
      const map = new Map();
      for (const it of list) map.set(it.code, it);
      return [...map.values()];
    };
    return { mergedSummaries: dedupe(mergedSummaries), archive: dedupe(archive), warnings };
  },

  /** 把粘贴的内容写回对话（覆盖式）。返回 { ok, mergedCount, archiveCount, warnings } */
  importMemory(conversation, text) {
    if (!conversation) return { ok: false, mergedCount: 0, archiveCount: 0, warnings: ['没有打开的对话'] };
    const { mergedSummaries, archive, warnings } = this.parseMemoryExport(text);
    if (!mergedSummaries.length && !archive.length) {
      return { ok: false, mergedCount: 0, archiveCount: 0, warnings };
    }
    conversation.summary = conversation.summary || {};
    conversation.summary.mergedSummaries = mergedSummaries;
    conversation.summary.archive = archive;
    // 粘贴回来的记忆不属于"当前消息"，把 lastMergedIdx 停在当前长度，
    // 避免下一轮把已经在记忆里的旧消息再压缩一遍。
    conversation.summary.lastMergedIdx = (conversation.messages || []).length;
    conversation.updatedAt = Date.now();
    Storage.saveConversation(conversation);
    return { ok: true, mergedCount: mergedSummaries.length, archiveCount: archive.length, warnings };
  },

  /** 一键收束：把摘要条数与"最近 N 条"目标对齐所需的信息给出来（不擅自删内容） */
  summarizeBudget(stats) {
    const s = stats || {};
    return {
      totalTokens: s.totalTokens || 0,
      dialogueTokens: s.dialogue?.tokens || 0,
      memoryTokens: (s.recent?.tokens || 0) + (s.merged?.tokens || 0) + (s.archive?.tokens || 0),
      worldBookTokens: s.worldBook?.tokens || 0,
    };
  },
};

// ============================================================
// Storyline —— 故事线容器
//   一条故事线 = 一份「开局模板」（世界观 / 世界书 / 状态栏 / 预设）+ 归在它下面的多个对话。
//   新建对话时继承模板，于是「保留面板开新对话」不用每次重配。
// ============================================================
const Storyline = {
  /** 从对话里抽取开局模板（只取设定，不取消息历史） */
  captureTemplate(conversation) {
    if (!conversation) return null;
    return {
      storySetting: conversation.storySetting || null,
      worldBook: conversation.worldBook ? JSON.parse(JSON.stringify(conversation.worldBook)) : null,
      mvu: conversation.mvu ? JSON.parse(JSON.stringify(conversation.mvu)) : null,
      presetId: conversation.presetId || '',
      apiProfileId: conversation.apiProfileId || '',
      model: conversation.model || '',
      writingNote: conversation.writingNote ? JSON.parse(JSON.stringify(conversation.writingNote)) : null,
      panel: conversation.panel ? JSON.parse(JSON.stringify(conversation.panel)) : null,
    };
  },

  create({ name, description = '', conversation = null } = {}) {
    const id = Utils.generateId('story');
    const saved = Storage.saveStoryline({
      id,
      name: String(name || '新的故事线').trim() || '新的故事线',
      description: String(description || '').trim(),
      sourceConversationId: conversation?.id || '',
      template: this.captureTemplate(conversation),
      createdAt: Date.now(),
    });
    if (conversation) {
      conversation.storylineId = id;
      Storage.saveConversation(conversation);
    }
    return saved;
  },

  rename(id, name, description) {
    const s = Storage.getStoryline(id);
    if (!s) return null;
    s.name = String(name || s.name).trim() || s.name;
    if (description !== undefined) s.description = String(description).trim();
    return Storage.saveStoryline(s);
  },

  /**
   * 删除故事线本身；对话不删，只是解除归属（避免误删内容）。
   * 注意必须 loadConversation 拿完整对话再存回——getConversation 只返回元数据索引，
   * 直接 saveConversation 会把对话内容覆盖成索引（会丢内容）。
   */
  async remove(id) {
    for (const meta of this.conversations(id)) {
      try {
        const full = await Storage.loadConversation(meta.id);
        if (full && full.storylineId === id) {
          delete full.storylineId;
          Storage.saveConversation(full);
        }
      } catch (e) {
        log('Storyline.remove: failed to detach', meta.id, e.message);
      }
    }
    Storage.deleteStoryline(id);
  },

  conversations(id) {
    return Storage.getConversationList().filter(c => c.storylineId === id);
  },

  /**
   * 按故事线模板造一个全新的对话。
   * 继承：世界观 / 世界书 / 状态栏 / 预设 / 作者注 / API 方案；不继承消息历史。
   */
  buildConversation(storyline, { name = '' } = {}) {
    const tpl = storyline?.template || {};
    const settings = Storage.getSettings();
    const profiles = Storage.getApiProfiles();
    const profileList = Object.values(profiles);
    const apiProfileId = tpl.apiProfileId || settings.defaultApiProfileId || (profileList[0] ? profileList[0].id : '');
    const model = tpl.model || settings.defaultModel || '';
    const id = Utils.generateId('conv');
    return {
      id,
      name: String(name || `${storyline?.name || '新'} · ${new Date().toLocaleDateString()}`).trim(),
      phase: 'init',
      apiProfileId,
      model,
      presetId: tpl.presetId || '',
      storylineId: storyline?.id || '',
      messages: [],
      mvu: tpl.mvu ? JSON.parse(JSON.stringify(tpl.mvu)) : null,
      storySetting: tpl.storySetting || null,
      worldBook: tpl.worldBook ? JSON.parse(JSON.stringify(tpl.worldBook)) : null,
      writingNote: tpl.writingNote ? JSON.parse(JSON.stringify(tpl.writingNote)) : undefined,
      panel: tpl.panel ? JSON.parse(JSON.stringify(tpl.panel)) : undefined,
      summary: { mergedSummaries: [], lastMergedIdx: 0, interval: settings.summaryInterval || 80 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },

  /** 把故事线模板用当前对话的内容刷新一遍（"以此对话为准"） */
  refreshTemplate(id, conversation) {
    const s = Storage.getStoryline(id);
    if (!s || !conversation) return null;
    s.template = this.captureTemplate(conversation);
    s.sourceConversationId = conversation.id;
    return Storage.saveStoryline(s);
  },
};

// ============================================================
// MemoryLibrary —— 记忆库
//   把某个对话的记忆（合并摘要 + 往事纪要）存成一份可复用的集合，
//   供其它对话继承——跨对话的知识延续。
// ============================================================
const MemoryLibrary = {
  capture(conversation, name = '') {
    if (!conversation) return null;
    const merged = conversation.summary?.mergedSummaries || [];
    const archive = conversation.summary?.archive || [];
    if (!merged.length && !archive.length) return null;
    const id = Utils.generateId('memlib');
    return Storage.saveMemoryLibrary({
      id,
      name: String(name || `${conversation.name || '对话'}的记忆`).trim(),
      sourceConversationId: conversation.id,
      sourceConversationName: conversation.name || '',
      mergedSummaries: JSON.parse(JSON.stringify(merged)),
      archive: JSON.parse(JSON.stringify(archive)),
      createdAt: Date.now(),
    });
  },

  /** 把记忆库写进对话。mode='merge' 追加去重，mode='replace' 覆盖 */
  applyTo(library, conversation, mode = 'merge') {
    if (!library || !conversation) return { ok: false, mergedCount: 0, archiveCount: 0 };
    conversation.summary = conversation.summary || {};
    const dedupe = (list) => {
      const map = new Map();
      for (const it of list || []) if (it && it.code) map.set(it.code, it);
      return [...map.values()];
    };
    const libMerged = library.mergedSummaries || [];
    const libArchive = library.archive || [];

    if (mode === 'replace') {
      conversation.summary.mergedSummaries = dedupe(libMerged);
      conversation.summary.archive = dedupe(libArchive);
    } else {
      conversation.summary.mergedSummaries = dedupe([...(conversation.summary.mergedSummaries || []), ...libMerged]);
      conversation.summary.archive = dedupe([...(conversation.summary.archive || []), ...libArchive]);
    }
    conversation.updatedAt = Date.now();
    Storage.saveConversation(conversation);
    return {
      ok: true,
      mergedCount: conversation.summary.mergedSummaries.length,
      archiveCount: conversation.summary.archive.length,
    };
  },

  remove(id) { Storage.deleteMemoryLibrary(id); },
};

// ============================================================
// Panel —— 空白起步面板
//   「一开始框架就应该稳固」：新对话可以先填五个字段（世界观 / 角色 / 开场 /
//   文风 / 规则），而不是空着让 AI 自由发挥。
//   注入策略：世界观 + 角色 + 开场 + 规则 → 合并进【故事设定】（走缓存，稳定）；
//             文风 → @Depth 1（最贴近"当下"，对语气影响最直接）。
// ============================================================
const Panel = {
  FIELDS: [
    { key: 'world', label: '世界观', placeholder: '时代、地点、基本规则……', rows: 3 },
    { key: 'characters', label: '角色', placeholder: '主角 / 配角的身份、性格、与主角的关系……', rows: 4 },
    { key: 'opening', label: '开场', placeholder: '故事从哪个场景、哪一刻开始……', rows: 3 },
    { key: 'style', label: '文风', placeholder: '例：克制、白描、少用形容词，对话留白。', rows: 2 },
    { key: 'rules', label: '规则 / 禁忌', placeholder: '例：不出现现代物品；主角不会主动认输。', rows: 2 },
  ],

  /** 参与【故事设定】的字段（稳定内容，走前缀缓存） */
  SETTING_KEYS: ['world', 'characters', 'opening', 'rules'],

  empty() {
    const p = {};
    for (const f of this.FIELDS) p[f.key] = '';
    return p;
  },

  normalize(panel) {
    const out = this.empty();
    for (const f of this.FIELDS) out[f.key] = String(panel?.[f.key] ?? '').trim();
    return out;
  },

  isEmpty(panel) {
    const p = this.normalize(panel);
    return this.FIELDS.every(f => !p[f.key]);
  },

  /** 面板是否真的填了东西（用于 UI 显示"已设置面板"） */
  isConfigured(conversation) {
    return !this.isEmpty(conversation?.panel);
  },

  /**
   * 合并成【故事设定】的正文：已有的 storySetting（可能是 AI 生成的）+ 面板字段。
   * 返回空串表示没有故事设定。
   */
  toSettingText(conversation) {
    const parts = [];
    const story = String(conversation?.storySetting || '').trim();
    if (story) parts.push(story);
    const panel = this.normalize(conversation?.panel);
    for (const key of this.SETTING_KEYS) {
      const value = panel[key];
      if (!value) continue;
      const label = this.FIELDS.find(f => f.key === key)?.label || key;
      parts.push(`【${label}】\n${value}`);
    }
    return parts.join('\n\n');
  },

  /** 文风走 @Depth 注入（不塞进故事设定，因为它需要"最贴近当下"） */
  toStyleBlock(conversation) {
    const style = this.normalize(conversation?.panel).style;
    if (!style) return null;
    return { depth: 1, role: 'user', content: '【文风要求】\n' + style };
  },

  /** 给 AI 的改写指令：把一段自然语言变成结构化面板 */
  buildAiRewriteMessages(description, current = null) {
    const cur = current ? this.normalize(current) : null;
    const currentText = cur && !this.isEmpty(cur)
      ? '\n\n当前面板内容（可在此基础上修改，未提到的部分保留）：\n' + this.FIELDS
          .filter(f => cur[f.key])
          .map(f => `【${f.label}】${cur[f.key]}`)
          .join('\n')
      : '';
    const system = [
      '你是一个小说设定整理助手。用户会用自然语言描述他想要的故事，你要把它整理成结构化面板。',
      '',
      '严格输出一个 JSON 对象，不要任何解释、不要 markdown 代码块围栏。键固定为：',
      'world（世界观：时代、地点、基本规则）',
      'characters（角色：身份、性格、关系）',
      'opening（开场：从哪个场景哪一刻开始）',
      'style（文风：叙述语气、节奏、用词偏好）',
      'rules（规则与禁忌：必须遵守或绝不能出现的东西）',
      '',
      '每个值都是一段可直接使用的中文文本。用户没有提到的项，给一个合理的默认值或留空字符串。',
    ].join('\n');
    const user = `用户的描述：\n${String(description || '').trim()}${currentText}`;
    return { systemPrompt: system, messages: [{ role: 'user', content: user }] };
  },

  /** 从 AI 回复里解析面板。容忍 markdown 围栏和前后杂文 */
  parseAiRewrite(text) {
    const raw = String(text || '').trim();
    if (!raw) return { ok: false, panel: null, error: '空回复' };
    let jsonText = raw;
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) jsonText = fence[1];
    else {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start >= 0 && end > start) jsonText = raw.slice(start, end + 1);
    }
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      return { ok: false, panel: null, error: 'JSON 解析失败：' + e.message };
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, panel: null, error: '返回的不是对象' };
    }
    const panel = this.empty();
    for (const f of this.FIELDS) {
      const v = parsed[f.key];
      if (v === undefined || v === null) continue;
      panel[f.key] = String(Array.isArray(v) ? v.join('\n') : v).trim();
    }
    if (this.isEmpty(panel)) return { ok: false, panel: null, error: '没有解析到任何字段' };
    return { ok: true, panel, error: '' };
  },
};

// ============================================================
// Dice —— 骰子
//   前端摇，结果以 @Depth 注入文本（对标酒馆 STscript /roll 的做法）。
//   硬核模式下结果不可更改、不可重摇，且会明确告诉模型"必须照此续写"。
// ============================================================
const Dice = {
  DEFAULT_SPECS: ['1d20', '1d100', '1d6'],

  /** 解析 NdM[+K] */
  parse(spec) {
    const m = String(spec || '').trim().toLowerCase().replace(/\s+/g, '').match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!m) return { ok: false, error: '格式应为 NdM（例如 1d20、2d6+1）' };
    const count = m[1] === '' ? 1 : parseInt(m[1], 10);
    const sides = parseInt(m[2], 10);
    const modifier = m[3] ? parseInt(m[3], 10) : 0;
    if (!Number.isFinite(count) || count < 1 || count > 100) return { ok: false, error: '骰子个数需在 1~100' };
    if (!Number.isFinite(sides) || sides < 2 || sides > 1000000) return { ok: false, error: '面数需在 2~1000000' };
    const modText = modifier > 0 ? '+' + modifier : (modifier < 0 ? String(modifier) : '');
    return { ok: true, count, sides, modifier, normalized: `${count}d${sides}${modText}` };
  },

  roll(spec, rng = Math.random) {
    const p = this.parse(spec);
    if (!p.ok) return { ok: false, error: p.error };
    const rolls = [];
    for (let i = 0; i < p.count; i++) rolls.push(1 + Math.floor(rng() * p.sides));
    const sum = rolls.reduce((a, b) => a + b, 0);
    return {
      ok: true,
      spec: p.normalized,
      count: p.count,
      sides: p.sides,
      modifier: p.modifier,
      rolls,
      sum,
      total: sum + p.modifier,
      at: Date.now(),
    };
  },

  /** 单条结果的文字形式，如 `2d6+1 → 9（3 + 5 + 1）` */
  formatRoll(roll) {
    if (!roll?.ok) return '';
    const modText = roll.modifier > 0 ? ' + ' + roll.modifier : (roll.modifier < 0 ? ' - ' + Math.abs(roll.modifier) : '');
    const detail = roll.count > 1 ? `（${roll.rolls.join(' + ')}${modText}）` : '';
    return `${roll.spec} → ${roll.total}${detail}`;
  },

  /** 组装成注入用的文本块；没有有效结果返回 null */
  buildBlock(rolls, hardcore = false) {
    const list = (rolls || []).filter(r => r?.ok);
    if (!list.length) return null;
    const lines = list.map(r => '· ' + this.formatRoll(r));
    const note = hardcore ? '\n（硬核模式：骰子结果已经确定，不可更改。请严格按此结果续写，不要给出"重新掷"之类的选项。）' : '';
    return '【骰子结果】\n' + lines.join('\n') + note;
  },
};

// ============================================================
// QuickReply —— 快捷指令栏（对标酒馆 Quick Reply）
// ============================================================
const QuickReply = {
  DEFAULTS: [
    { id: 'qr-d20', label: 'd20', type: 'dice', payload: '1d20' },
    { id: 'qr-d100', label: 'd100', type: 'dice', payload: '1d100' },
    { id: 'qr-d6', label: 'd6', type: 'dice', payload: '1d6' },
    { id: 'qr-continue', label: '继续', type: 'insert', payload: '继续' },
  ],

  list() {
    const s = Storage.getSettings();
    if (!Array.isArray(s?.quickReplies)) return this.DEFAULTS.map(q => ({ ...q }));
    return s.quickReplies;
  },

  save(list) {
    const s = Storage.getSettings();
    s.quickReplies = Array.isArray(list) ? list : [];
    Storage.saveSettings(s);
  },

  add(item) {
    const list = this.list();
    list.push({
      id: Utils.generateId('qr'),
      label: String(item?.label || '指令').trim() || '指令',
      type: item?.type === 'dice' ? 'dice' : 'insert',
      payload: String(item?.payload || '').trim(),
    });
    this.save(list);
    return list;
  },

  remove(id) {
    const list = this.list().filter(q => q.id !== id);
    this.save(list);
    return list;
  },

  reset() {
    this.save(this.DEFAULTS.map(q => ({ ...q })));
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
    text = Utils.cleanNullFlood(text);
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
  cleanNullFlood(text) {
    if (!text) return '';
    return String(text)
      .replace(/(?:^|(?<=\s))(?:null){3,}(?=\s|$)/gi, '')
      .replace(/(?:null){12,}/gi, '')
      .trim();
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
