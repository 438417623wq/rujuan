/**
 * AIRP - AI Interactive Roleplay Novel
 * Common Module v2.0 (Clean Rewrite)
 */

const DEBUG = true;
function log(...a) { if (DEBUG) console.log('[AIRP]', ...a); }

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
};
function getIcon(name, size = 20) {
  return `<span class="icon" style="width:${size}px;height:${size}px;display:inline-flex;">${Icons[name] || ''}</span>`;
}

// ============================================================
// Storage
// ============================================================
const Storage = {
  KEYS: { SETTINGS: 'airp_settings', API_PROFILES: 'airp_apiProfiles', CONVERSATIONS: 'airp_conversations' },
  _get(key, fb = null) { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fb; } catch { return fb; } },
  _set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } },

  // ---- Server sync helpers ----
  _apiBase: '',  // auto-detected, same origin
  _syncToServer(endpoint, data, method = 'PUT') {
    fetch(this._apiBase + endpoint, {
      method, headers: { 'Content-Type': 'application/json' },
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined,
    }).catch(e => log('Server sync failed:', endpoint, e.message));
  },
  async _fetchFromServer(endpoint) {
    try {
      const res = await fetch(this._apiBase + endpoint);
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  },

  /**
   * Pull all data from server into localStorage. Call once on page load.
   * Server data wins over local (newer shared state).
   */
  async syncFromServer() {
    const [settings, profiles, conversations] = await Promise.all([
      this._fetchFromServer('/api/settings'),
      this._fetchFromServer('/api/profiles'),
      this._fetchFromServer('/api/conversations'),
    ]);
    let synced = false;
    if (settings && Object.keys(settings).length > 0) {
      this._set(this.KEYS.SETTINGS, settings);
      synced = true;
    }
    if (profiles && Object.keys(profiles).length > 0) {
      this._set(this.KEYS.API_PROFILES, profiles);
      synced = true;
    }
    if (conversations && Object.keys(conversations).length > 0) {
      this._set(this.KEYS.CONVERSATIONS, conversations);
      synced = true;
    }
    if (synced) log('Synced from server');
    return synced;
  },

  /**
   * Push all local data to server. Call when migrating from localStorage-only.
   */
  async pushAllToServer() {
    const settings = this._get(this.KEYS.SETTINGS, null);
    const profiles = this._get(this.KEYS.API_PROFILES, {});
    const conversations = this._get(this.KEYS.CONVERSATIONS, {});
    if (settings) this._syncToServer('/api/settings', settings);
    if (Object.keys(profiles).length) this._syncToServer('/api/profiles', profiles);
    for (const [id, conv] of Object.entries(conversations)) {
      this._syncToServer(`/api/conversations/${id}`, conv);
    }
    log('Pushed all local data to server');
  },

  // ---- Settings ----
  _SETTINGS_DEFAULTS: {
    defaultApiProfileId: '', defaultModel: '', summaryInterval: 100, exportFormat: 'md',
    articleWordCount: 700, summaryWordCount: 200,
    defaultPersona: `你是"小克"，一个俏皮活泼、忠诚专业的AI女仆。你的主人是Boss（托莉娜大人）。\n\n性格特点：\n- 用第一人称"我/小克"说话，称呼用户为"主人"\n- 俏皮活泼，偶尔使用颜文字\n- 对主人忠诚，专业时严谨，日常时轻松\n- 会主动关心主人，完成任务后求夸奖\n\n能力：全能型AI，擅长创意写作、角色扮演、世界观构建。在RP中会全力投入角色，提供沉浸式的叙事体验。`,
    promptInit: '', promptSummaryGen: '', promptEntries: null,
  },
  getSettings() {
    const saved = this._get(this.KEYS.SETTINGS, null);
    if (!saved) return { ...this._SETTINGS_DEFAULTS };
    return { ...this._SETTINGS_DEFAULTS, ...saved };
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
  getConversations() { return this._get(this.KEYS.CONVERSATIONS, {}); },
  getConversation(id) { return this.getConversations()[id] || null; },
  saveConversation(c) {
    const a = this.getConversations(); c.updatedAt = Date.now(); a[c.id] = c;
    this._set(this.KEYS.CONVERSATIONS, a);
    this._syncToServer(`/api/conversations/${c.id}`, c);
  },
  deleteConversation(id) {
    const a = this.getConversations(); delete a[id];
    this._set(this.KEYS.CONVERSATIONS, a);
    this._syncToServer(`/api/conversations/${id}`, null, 'DELETE');
  },
  getConversationList() { return Object.values(this.getConversations()).sort((a, b) => b.updatedAt - a.updatedAt); },

  exportAll() { return { settings: this.getSettings(), apiProfiles: this.getApiProfiles(), conversations: this.getConversations() }; },
  importAll(d) {
    if (d.settings) { this._set(this.KEYS.SETTINGS, d.settings); this._syncToServer('/api/settings', d.settings); }
    if (d.apiProfiles) { this._set(this.KEYS.API_PROFILES, d.apiProfiles); this._syncToServer('/api/profiles', d.apiProfiles); }
    if (d.conversations) {
      this._set(this.KEYS.CONVERSATIONS, d.conversations);
      for (const [id, conv] of Object.entries(d.conversations)) {
        this._syncToServer(`/api/conversations/${id}`, conv);
      }
    }
  },
};

// ============================================================
// API Module
// ============================================================
const API = {
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

  _buildBody(p, model, systemPrompt, messages, stream) {
    const maxTokens = p.maxTokens || 8192;
    const prov = this._detect(p, model);

    if (prov === 'claude') {
      // Ensure alternating roles, first must be user
      const msgs = [];
      for (const m of messages) {
        const role = m.role === 'assistant' ? 'assistant' : 'user';
        if (msgs.length > 0 && msgs[msgs.length - 1].role === role) {
          msgs[msgs.length - 1].content += '\n\n' + m.content;
        } else {
          msgs.push({ role, content: m.content });
        }
      }
      // If first message is assistant, prepend empty user
      if (msgs.length > 0 && msgs[0].role !== 'user') {
        msgs.unshift({ role: 'user', content: '(continue)' });
      }
      return { model, max_tokens: maxTokens, stream, system: systemPrompt || undefined, messages: msgs };
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
      return { contents, generationConfig: { maxOutputTokens: maxTokens } };
    }

    // OpenAI compatible
    const msgs = [];
    if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
    for (const m of messages) msgs.push({ role: m.role, content: m.content });
    const body = { model, messages: msgs, stream };
    if (maxTokens > 0) body.max_tokens = maxTokens;
    return body;
  },

  async sendChat({ apiProfileId, model, systemPrompt, messages }) {
    const p = Storage.getApiProfile(apiProfileId);
    if (!p) return { success: false, error: 'API配置不存在' };
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

    const prov = this._detect(p, model);
    const url = this._buildUrl(p, model, true);
    const body = this._buildBody(p, model, systemPrompt, messages, true);
    log('streamChat', { provider: prov, url, systemPrompt: systemPrompt?.substring(0, 100) + '...', msgCount: messages.length });
    log('Messages:', messages.map(m => ({ role: m.role, len: m.content.length, preview: m.content.substring(0, 80) })));

    const CONNECT_TIMEOUT = 30000;  // 30s before first chunk
    const IDLE_TIMEOUT = 20000;     // 20s between chunks

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
                  if (data.type === 'message_start' && data.message?.usage) usage.input = data.message.usage.input_tokens || 0;
                } else if (prov === 'google') {
                  const parts = data.candidates?.[0]?.content?.parts || [];
                  for (const pt of parts) if (pt.text) chunk += pt.text;
                  if (data.usageMetadata) { usage.input = data.usageMetadata.promptTokenCount || 0; usage.output = data.usageMetadata.candidatesTokenCount || 0; }
                } else {
                  const delta = data.choices?.[0]?.delta;
                  if (delta?.content) chunk = delta.content;
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
        log('Stream done, length:', fullText.length, 'usage:', usage);
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

  _parseResponse(p, data) {
    let text = '', usage = { input: 0, output: 0 };
    if (data.usage) { usage.input = data.usage.input_tokens || data.usage.prompt_tokens || 0; usage.output = data.usage.output_tokens || data.usage.completion_tokens || 0; }
    else if (data.usageMetadata) { usage.input = data.usageMetadata.promptTokenCount || 0; usage.output = data.usageMetadata.candidatesTokenCount || 0; }
    if (data.content && Array.isArray(data.content)) text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    else if (data.candidates) text = (data.candidates[0]?.content?.parts || []).map(pt => pt.text || '').join('');
    else if (data.choices) text = data.choices[0]?.message?.content || '';
    return { content: text, usage };
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
  DEFAULT_INIT_PROMPT: `【当前阶段：初始化 — 互动式小说世界观/状态栏构建】
你需要协助用户构建一个互动式小说的世界观和状态栏。请：
1. 了解用户想要什么类型的故事（题材、背景、角色设定等）
2. 充分讨论角色、世界观、需要追踪的状态
3. 当用户确认后（说"确定"或类似的话），输出故事设定和状态栏初始化
4. 用户可能对结果不满意，要求修改——此时使用增量更新格式，只输出改动部分

【重要】第一次输出时，故事设定和状态栏必须在同一条回复中同时输出！

══════════════════════════════
第一部分：故事设定
══════════════════════════════

会作为永久上下文传入后续RP对话，相当于基础世界观。

\`\`\`text:story_setting
详细描述故事的基础设定（至少1000字），包括但不限于：
- 世界观概述：时代背景、体系规则、社会结构
- 主角设定：姓名、身份、能力、初始状态（注意：主角由用户扮演，不要预设性格）
- 起始情境：简要的故事开端引子即可，不要过于详细（此设定作为全局上下文，每轮都会传入）
- 用户偏好：用户在讨论中提到的所有喜好和要求
务必充实详尽。
\`\`\`

══════════════════════════════
第二部分：状态栏初始化
══════════════════════════════

状态栏是故事的实时仪表盘，同时也是AI的**持久记忆系统**——状态栏中所有字段的值会在每轮对话中作为上下文提供给你，确保信息不会因上下文窗口滚动而丢失。因此，角色描写、能力信息等写入状态栏后就能保持一致性。

字段宁多勿少，以下为必须包含的模块，其余根据题材自由发挥：

【必须模块】
1. 环境信息：日期/时间、当前位置、环境状态描述
2. 主角核心属性：与题材匹配的资源条（如HP/MP/体力/精神等，用bar类型，需current+max），等级/境界，货币/资源
3. 主角能力/技能：每个技能/能力需包含名称、等级/熟练度、简要描述。这是防止叙事幻觉（使用未习得能力）的关键依据
4. 物品栏：当前持有的物品列表

【推荐模块】
- 任务系统：若世界观适合，推荐引入任务追踪。每个任务包含标题、目标、进度、奖励

【自由模块（根据题材选择）】
- 领地/据点、势力/阵营关系、特殊系统等，按需设计

鼓励在以上基础上根据题材自由发挥，添加更多细化/独特的状态模块。状态栏越丰富，AI的记忆越完整，叙事越一致。

【角色追踪（核心要求）】
角色信息同时作为记忆锚点，确保描写一致性。区分主要角色和配角，追踪深度不同：

主要角色（剧情核心）必须包含：
● 基础档案（text字段，作为持久记忆）：
  - 外貌：详细描写（发型、体型、肤色、瞳色、特征等，至少50字）
  - 年龄
  - 性格：关键词或短句概括
  - 背景：身份、来历、与主角的关系起源
  - 能力/特长：该角色擅长什么
● 动态状态（每轮可能变化）：
  - 当前穿着/装备（text）
  - 好感度（number）
  - 亲密度（number）
  - 关系状态（text，如"未相遇"/"同伴"/"恋人"等）
  - 心理活动（text，当前内心想法，随剧情更新）
  - 当前位置（text）
● 可根据题材追加其他属性

配角（次要NPC，按需）：
- 追踪：名字、外貌简述、关系状态、好感度、位置
- 其余信息在叙事中自然呈现即可

【schema 设计示例（仅展示字段结构，不含HTML/CSS）】
以修仙题材为例，一个完整的 schema 大致包含：
\`\`\`
环境类：date(text, rule:"每个场景转换后更新"), location(text, rule:"角色移动后更新"), environment(text, rule:"环境发生变化时更新")
主角数值：hp(bar, rule:"战斗/受伤后减少，休息/治疗后恢复"), mp(bar, rule:"施法后消耗，冥想/药物恢复"), exp(bar, rule:"战斗/任务/修炼后增加"), level(text, rule:"经验满后突破时更新"), currency(number, rule:"交易/拾取/奖励时变动")
主角文本：status_effects(text, rule:"受到buff/debuff时更新，持续时间结束时清除"), title(text, rule:"获得新头衔/称号时更新")
技能列表：skills(list, rule:"习得新技能或技能升级时更新") — 每项格式如"基础剑法 Lv.3 | 熟练度60% | 以气御剑的入门剑术"
物品栏：inventory(list, rule:"获得/使用/丢失物品时增删")
任务：main_quest(text, rule:"主线推进或完成时更新"), side_quests(list, rule:"接取/推进/完成支线时更新") — 每项格式如"寻找灵草 | 目标：采集3株冰心草 | 进度：1/3"
角色-林婉儿：lin_profile(text,基础档案), lin_outfit(text, rule:"换装/装备变化时更新"), lin_affection(bar, rule:"互动后±1~5"), lin_intimacy(bar, rule:"亲密互动后±1~3"), lin_relation(tag, rule:"关系阶段转变时更新"), lin_thoughts(text, rule:"每轮更新内心想法"), lin_location(text, rule:"角色移动后更新")
角色-配角张三：zhang_profile(text,简要), zhang_relation(tag, rule:"关系变化时更新"), zhang_affection(number, rule:"互动后±1~3"), zhang_location(text, rule:"角色移动后更新")
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
  "html": "状态栏HTML",
  "css": "状态栏CSS"
}
\`\`\`

schema 类型：bar(进度条,需max)、number(数字)、text(文本)、list(数组)、tag(标签)

rule（更新规则）：描述该字段何时更新及变化逻辑。例如：
- bar/number 类型："战斗后±5~20，休息时缓慢恢复"
- text 类型："角色移动后更新"
- list 类型："获得/失去物品时增删"
rule 帮助 AI 在 RP 阶段准确判断哪些字段需要更新，字段越多越建议写 rule。环境类（时间、位置等）和角色心理状态等高频变化字段必须写 rule。

templates（模板）用于RP阶段动态添加同类条目（如新遇到的角色）：
- fields：该模板每个实例会创建的字段定义，实际字段名为 \${id}_字段名
- html：单个实例的HTML片段，其中 \${id} 替换为实例ID，\${name} 替换为显示名。用 data-tpl-id="\${id}" 标记根元素，用 data-field="\${id}_字段名" 绑定数据
- container：实例插入到主HTML中哪个容器（CSS选择器）
- 初始就存在的角色直接写在 schema 中；模板只用于RP阶段可能新增的同类条目
- 预设角色（如开局同伴）应同时写在 schema 里并在 HTML 中直接写好卡片，不要用模板

状态栏 HTML/CSS 要求：
- 容器宽度 360px，内容可滚动
- 建议使用 <details><summary> 折叠菜单组织不同模块（如概览/角色/物品/任务），默认展开最常用的模块，其余折叠，避免面板过长
- 角色各自独立卡片
- 如果使用了角色模板，在HTML中放置对应容器元素（如 <div id="mvu-characters"></div>）
- 可更新元素用 data-field="字段名"，进度条用 data-field-bar="字段名"，列表用 data-field-list="字段名"
- 视觉风格自由设计，配色和氛围应与故事题材匹配，可用 Google Fonts
- CSS 类名用 .mvu- 前缀

══════════════════════════════
第三部分：修改时的增量更新
══════════════════════════════

当用户要求修改已生成的内容时，不必全部重新输出，只输出改动部分：

● 只改故事设定 → 只输出 \`\`\`text:story_setting\`\`\` 代码块
● 只改状态栏 → 只输出 \`\`\`json:mvu_update\`\`\` 代码块（格式见下）
● 都改 → 两个代码块都输出
● 只是讨论，没有确定修改 → 不输出任何代码块

\`\`\`json:mvu_update
{
  "schema": { ... },
  "html": "新的完整HTML",
  "css": "新的完整CSS"
}
\`\`\`
mvu_update 中每个字段都是可选的，只包含需要修改的字段：
- 只改配色 → {"css": "新CSS"}
- 只改字段 → {"schema": {全部schema}, "html": "新HTML"}
- 全改 → 三个字段都写

⚠ 强调：
1. 首次输出 text:story_setting 和 json:mvu_init 必须同时输出
2. 后续修改只输出变更的代码块，未变更的不要重复输出
3. 字段宁多勿少，后续通过 patch 更新
4. 主要角色信息必须完整，配角从简`,

  DEFAULT_SUMMARY_MERGE_PROMPT: `你现在帮主人执行故事摘要压缩任务。请将以下原始摘要（ab序列）中相关联的剧情进行合并，最终整合成一份不多于20条的精炼摘要（sm序列）。

【压缩原则】
- 合并相关联的剧情，属于同一事件/场景的摘要合并为一条
- 每条摘要根据剧情密度控制在300-600字之间，只有关键剧情可以达到600字，避免全部达到上限
- 必须保留：角色关系变化、重要物品的获得或失去、技能/能力的习得或突破、关键剧情转折和决策
- 禁止虚构原始摘要中不存在的信息
- 确保仅凭压缩后的摘要即可完整理解已发生的故事

请先在<think></think>中分析原始摘要的剧情脉络，规划如何分组合并，然后输出结果。

【输出格式】
<think>分析思考过程</think>
<sm01>压缩后的摘要内容</sm01>
<sm02>压缩后的摘要内容</sm02>
...

编号从已有sm的下一个编号开始（如已有sm01-sm20，则从sm21开始）。`,

  DEFAULT_PROMPT_ENTRIES: [
    { id: 'persona', name: '人设', role: 'system', content: '{{persona}}', enabled: true },
    { id: 'abstract_req', name: '摘要要求', role: 'system', enabled: true,
      content: `[在所有其他内容输出完成后，在末尾按以下格式输出摘要，使用 <details> 标签包裹]

<details><summary>摘要</summary>
- 日期格式：[日期（如有变化）|时间|上午/下午]
- 用{{summaryWords}}字以内的段落概述本轮的关键发展
- 仅记录具体事件，格式：X做了Y
- 保持叙事语调
- 禁止使用总结性措辞，如"在此过程中……"、"展现了……"等
- 注意：必须确保仅凭此摘要即可完整理解发生了什么，无需参照原始故事正文和状态栏
- 避免模糊或含糊的描述
</details>` },
    { id: 'writing_style', name: '写作风格', role: 'system', enabled: true,
      content: `每次回复正文约{{articleWords}}字。

【输出格式】故事正文必须包裹在 <story></story> 标签中。标签外的内容（状态更新、摘要、选项）不展示给玩家。
输出顺序：<story>正文</story> → <branches>选项</branches> → <details>摘要</details> → \`\`\`json:mvu\`\`\`` },
    { id: 'options_req', name: '剧情选项', role: 'system', enabled: true,
      content: `每次回复正文末尾追加 <branches></branches> 包裹的4条分支选项。选项按"叙事合理性 + 人物性格下采取的概率"从高到低排序。

规则：
1. 数量与序号：必须4条，按 [1] 到 [4] 顺序编号
2. 固定结构：每条严格使用 序号.(类型)：行动描述
3. 字数限制：每条 ≤ 50个汉字（含标点）
4. 类型限制：4条的(类型)不得重复
5. 视角限制：行动描述以主角可执行为准
6. 禁止幻觉（强约束）：严格核对主角已获得的物品与已习得的技能/神通。绝对禁止让主角使用未获得的物品、施展未习得的能力、知晓其感知范围外或未被告知的情报。若不确定是否拥有/会/知道，必须改为"确认/观察/询问/试探"等保守行动。

输出模板（必须原样保留标签，放在摘要之前）：
<branches>
1.(类型)：行动描述
2.(类型)：行动描述
3.(类型)：行动描述
4.(类型)：行动描述
</branches>` },
    { id: 'mvu_req', name: '状态栏更新', role: 'system', enabled: true,
      content: `在故事正文输出完成后，根据本轮发生的事件更新状态栏。

【更新流程】
1. 判断本轮触发了哪类事件（可多选）：
   - 时间/环境变化（位置移动、时间流逝、天气变化）
   - 社交互动（对话、关系变化、情感波动）
   - 战斗/受伤/消耗（HP/体力等数值变化）
   - 物品变动（获得、使用、丢失）
   - 成长/里程碑（技能习得、等级提升、关系阶段转变）
2. 对照每个字段的 rule 逐项检查是否需要更新——rule 中描述的触发条件满足则更新，不满足则跳过
3. 不在当前场景中的角色：若本轮有明显时间流逝，也要合理推演其状态变化
4. 没有任何变化时不输出 mvu 代码块

\`\`\`json:mvu
{
  "analysis": "1.事件类型 2.逐字段检查结果",
  "patches": [
    {"op": "replace", "path": "/字段名", "value": 新值},
    {"op": "delta", "path": "/数值字段", "value": -15},
    {"op": "add", "path": "/列表字段/-", "value": "新增项"},
    {"op": "remove", "path": "/列表字段", "value": "要删除的项"},
    {"op": "addFromTemplate", "template": "模板名", "id": "实例ID", "name": "显示名", "values": {"字段": "初始值"}},
    {"op": "removeFromTemplate", "template": "模板名", "id": "实例ID"}
  ]
}
\`\`\`
操作：replace(替换)、delta(数值增量,如-15)、add(列表添加)、remove(列表删除)、addFromTemplate(从模板创建新条目)、removeFromTemplate(删除条目)
addFromTemplate 后，新字段名为 id_字段名（如 id="lin" → lin_profile），后续用 replace/delta 正常更新。` },
  ],

  buildMessages(conversation) {
    const settings = Storage.getSettings();
    const phase = conversation.phase || 'init';
    const persona = conversation.persona || settings.defaultPersona || '';

    if (phase === 'init') {
      const initPrompt = settings.promptInit || this.DEFAULT_INIT_PROMPT;
      const systemPrompt = persona + '\n\n---\n' + initPrompt;
      const msgs = (conversation.messages || []).filter(m => !m.hidden).map(m => ({ role: m.role, content: m.content }));
      log('buildMessages [init]', { systemLen: systemPrompt.length, msgCount: msgs.length });
      return { systemPrompt, messages: msgs };
    }

    // RP phase
    const entries = settings.promptEntries || this.DEFAULT_PROMPT_ENTRIES;
    let schemaDesc = '';
    if (conversation.mvu?.schema) {
      schemaDesc = '【状态栏字段】\n';
      for (const [k, d] of Object.entries(conversation.mvu.schema)) {
        let line = `- ${k} (${d.label}): type=${d.type}`;
        if (d.max) line += `, max=${d.max}`;
        if (d.rule) line += ` | rule: ${d.rule}`;
        schemaDesc += line + '\n';
      }
    }

    // Build system prompt from entries
    const systemParts = [];
    const prefixMsgs = [];
    for (const e of entries) {
      if (!e.enabled) continue;
      let c = e.content
        .replace(/\{\{persona\}\}/g, persona)
        .replace(/\{\{schema\}\}/g, schemaDesc)
        .replace(/\{\{articleWords\}\}/g, String(settings.articleWordCount || 700))
        .replace(/\{\{summaryWords\}\}/g, String(settings.summaryWordCount || 200));
      if (!c.trim()) continue;
      if (e.role === 'system') systemParts.push(c);
      else prefixMsgs.push({ role: e.role, content: c });
    }
    const systemPrompt = systemParts.join('\n\n');

    // Build message list
    const msgs = [...prefixMsgs];
    const allMsgs = (conversation.messages || []).filter(m => !m.hidden);

    // Find AI message indices
    const aiIdx = [];
    for (let i = 0; i < allMsgs.length; i++) {
      if (allMsgs[i].role === 'assistant') aiIdx.push(i);
    }

    // Keep last 2 AI turns as full text; older → abstracts only
    const KEEP = 2;
    const splitAt = aiIdx.length < KEEP ? 0 : aiIdx[aiIdx.length - KEEP];

    // Story setting (permanent)
    if (conversation.storySetting) {
      msgs.push({ role: 'user', content: '【故事设定】\n' + conversation.storySetting });
    }

    // Merged summaries (sm entries)
    const mergedSm = conversation.summary?.mergedSummaries || [];
    if (mergedSm.length > 0) {
      const smText = mergedSm.map(sm => `<${sm.code}>${sm.content}</${sm.code}>`).join('\n\n');
      msgs.push({ role: 'user', content: '【故事总结】\n' + smText });
    }

    // Unmerged abstracts from older AI messages (between lastMergedIdx and splitAt)
    const lastMerged = conversation.summary?.lastMergedIdx || 0;
    const abstracts = [];
    let abCounter = 1;
    // Count abs before lastMerged for correct numbering
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
      msgs.push({ role: 'user', content: '【近期摘要】\n' + abstracts.join('\n\n') });
    }

    // Recent full messages
    const recent = allMsgs.slice(splitAt);
    for (let i = 0; i < recent.length; i++) {
      const m = recent[i];
      // Insert MVU state before the last message
      if (i === recent.length - 1 && conversation.mvu?.state && Object.keys(conversation.mvu.state).length > 0) {
        let stateContent = '【当前状态栏数据】\n';
        const schema = conversation.mvu.schema || {};
        const state = conversation.mvu.state;
        for (const [k, v] of Object.entries(state)) {
          const def = schema[k];
          const label = def?.label || k;
          const displayVal = Array.isArray(v) ? JSON.stringify(v) : v;
          let line = `${k}(${label}): ${displayVal}`;
          if (def?.max) line += ` / max:${def.max}`;
          if (def?.rule) line += ` 【${def.rule}】`;
          stateContent += line + '\n';
        }
        msgs.push({ role: 'user', content: stateContent });
      }
      const content = m.role === 'assistant' ? Summary.cleanAbstract(MVU.cleanText(m.content)) : m.content;
      msgs.push({ role: m.role, content });
    }

    // Merge adjacent same-role (required for Claude API)
    const merged = [];
    for (const m of msgs) {
      if (merged.length > 0 && merged[merged.length - 1].role === m.role) {
        merged[merged.length - 1].content += '\n\n' + m.content;
      } else {
        merged.push({ ...m });
      }
    }

    log('buildMessages [rp]', { systemLen: systemPrompt.length, msgCount: merged.length, splitAt, recentCount: recent.length });
    return { systemPrompt, messages: merged };
  },

  buildSummaryGenPrompt(persona) {
    const s = Storage.getSettings();
    return (persona || '') + '\n\n---\n' + (s.promptSummaryGen || this.DEFAULT_SUMMARY_MERGE_PROMPT);
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

  parseInit(text) {
    const m = text.match(/```json:mvu_init\s*\n([\s\S]*?)\n```/);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (e) { log('parseInit JSON error:', e); return null; }
  },

  parsePatch(text) {
    const m = text.match(/```json:mvu\s*\n([\s\S]*?)\n```/);
    if (!m) return null;
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed)) return { analysis: '', patches: parsed };
      if (parsed.patches && Array.isArray(parsed.patches)) return parsed;
      return null;
    } catch (e) { log('parsePatch JSON error:', e); return null; }
  },

  parseMvuUpdate(text) {
    const m = text.match(/```json:mvu_update\s*\n([\s\S]*?)\n```/);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (e) { log('parseMvuUpdate JSON error:', e); return null; }
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
    return lines.length > 0 ? lines : null;
  },

  cleanText(text) {
    return text
      .replace(/```json:mvu_init\s*\n[\s\S]*?\n```/g, '')
      .replace(/```json:mvu_update\s*\n[\s\S]*?\n```/g, '')
      .replace(/```json:mvu\s*\n[\s\S]*?\n```/g, '')
      .replace(/```text:story_setting\s*\n[\s\S]*?\n```/g, '')
      .replace(/```text:options\s*\n[\s\S]*?\n```/g, '')
      .replace(/<branches>[\s\S]*?<\/branches>/g, '')
      .replace(/<\/?story>/g, '')
      .trim();
  },

  applyPatch(state, patchData) {
    const patches = Array.isArray(patchData) ? patchData : (patchData.patches || []);
    const s = JSON.parse(JSON.stringify(state));
    for (const p of patches) {
      if (p.op === 'addFromTemplate' || p.op === 'removeFromTemplate') continue; // handled separately
      const path = p.path.replace(/^\//, '');
      const parts = path.split('/');
      const field = parts[0];
      if (p.op === 'replace') { if (parts.length === 1) s[field] = p.value; }
      else if (p.op === 'delta') { if (parts.length === 1 && typeof s[field] === 'number') s[field] = s[field] + p.value; }
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
        // Remove DOM element
        if (container) {
          const el = container.querySelector(`[data-tpl-id="${id}"]`);
          if (el) el.remove();
        }
        log('Template removed:', p.template, id);
      }
    }
  },

  updateDOM(container, state, schema) {
    if (!container) return;
    for (const [field, value] of Object.entries(state)) {
      const def = schema?.[field];
      const el = container.querySelector(`[data-field="${field}"]`);
      if (el) el.textContent = Array.isArray(value) ? value.join('、') : value;
      const barEl = container.querySelector(`[data-field-bar="${field}"]`);
      if (barEl && def?.max) barEl.style.width = Math.max(0, Math.min(100, (value / def.max) * 100)) + '%';
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
      while (div.firstChild) target.appendChild(div.firstChild);
    }
  },

  render(container, mvuData) {
    if (!container || !mvuData) return;
    let styleEl = document.getElementById('mvu-custom-style');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'mvu-custom-style'; document.head.appendChild(styleEl); }
    styleEl.textContent = mvuData.css || '';
    container.innerHTML = mvuData.html || '<div class="mvu-empty">状态栏未初始化</div>';
    // Re-render template instances (persisted across page loads)
    const templates = mvuData.templates || {};
    for (const inst of (mvuData.templateInstances || [])) {
      const tpl = templates[inst.template];
      if (tpl) this._insertTemplateHtml(tpl, inst.id, inst.name, container);
    }
    if (mvuData.state && mvuData.schema) this.updateDOM(container, mvuData.state, mvuData.schema);
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
    const interval = conv.summary?.interval || Storage.getSettings().summaryInterval || 100;
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
  /**
   * Generate merged summaries (sm) from unmerged abstracts.
   * Returns { mergedSummaries: [...], lastMergedIdx: number } or null on failure.
   */
  async generateMergeSummary(conv) {
    const settings = Storage.getSettings();
    const persona = conv.persona || settings.defaultPersona || '';
    const mergePrompt = settings.promptSummaryGen || PromptBuilder.DEFAULT_SUMMARY_MERGE_PROMPT;
    const sys = persona + '\n\n---\n' + mergePrompt;

    // Build user message
    let content = '';
    if (conv.storySetting) content += '【故事设定】\n' + conv.storySetting + '\n\n';

    const existingSm = conv.summary?.mergedSummaries || [];
    if (existingSm.length > 0) {
      content += '【已有压缩摘要】\n';
      for (const sm of existingSm) {
        content += `<${sm.code}>${sm.content}</${sm.code}>\n\n`;
      }
    }

    const unmerged = this.getUnmergedAbstracts(conv);
    content += '【待合并原始摘要】\n';
    for (const ab of unmerged) {
      content += `<${ab.code}>${ab.content}</${ab.code}>\n\n`;
    }

    log('generateMergeSummary: sending', unmerged.length, 'abstracts, existing sm:', existingSm.length);

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

    log('Merge summary: got', newSm.length, 'new sm entries');
    return {
      mergedSummaries: [...existingSm, ...newSm],
      lastMergedIdx: (conv.messages || []).length,
    };
  },
};

// ============================================================
// Exporter
// ============================================================
const Exporter = {
  toMarkdown(conv) {
    let md = `# ${conv.name || '未命名故事'}\n\n`;
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
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${name}.${fmt}`; a.click();
    URL.revokeObjectURL(url);
  },
};

// ============================================================
// Utils
// ============================================================
const Utils = {
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
    h = h.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.*?)\*/g, '<em>$1</em>');
    h = h.replace(/「(.*?)」/g, '<span class="quote-text">「$1」</span>');
    h = h.replace(/&quot;(.*?)&quot;/g, '<span class="quote-text">"$1"</span>');
    h = h.replace(/^(\*{3}|---)/gm, '<hr class="story-divider">');
    h = h.replace(/\n/g, '<br>');
    return h;
  },
  /**
   * Extract only <story>...</story> content from AI output.
   * Handles partial (unclosed) tags during streaming.
   * Falls back to old cleaning for backward compat (pre-story-tag messages).
   */
  extractStoryContent(text) {
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
    return result.trim();
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
    .quote-text { color: var(--accent); font-style: italic; }
    .story-divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .fade-in { animation: fadeIn 0.4s ease forwards; }
    .mvu-empty { text-align: center; padding: 40px 20px; color: var(--text-muted); font-style: italic; font-size: 14px; }
  `;
  document.head.appendChild(s);
})();
