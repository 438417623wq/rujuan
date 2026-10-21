/**
 * 入卷 - Agnes 生图模块
 * ------------------------------------------------------------
 * 直连 Agnes API（零服务端依赖，WebView / 浏览器均可）。
 *
 * 关键事实（实测 2026-xx）：
 *  - POST {endpoint}/images/generations
 *    body: { model, prompt, size, ratio?, extra_body: { response_format } }
 *  - response_format: "url"      → data[0].url，但图片 CDN
 *    (cos-platform-outputs.agnes-ai.cn) **不返回 CORS 头**，
 *    浏览器 fetch 会被拦，无法转 base64 持久化。
 *  - response_format: "b64_json" → data[0].b64_json 直接给 base64 PNG，
 *    这是本项目采用的路径（唯一能在前端落地的路径）。
 *  - ratio 仅在 size 为 1K/2K/3K/4K 时有效。
 */

const AgnesAPI = {
  DEFAULT_ENDPOINT: 'https://api.agnes-ai.cn/v1',
  DEFAULT_MODEL: 'agnes-image-2.1-flash',
  SIZES: ['1K', '2K', '3K', '4K'],
  RATIOS: ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9'],
  TIMEOUT_MS: 300000,

  /**
   * 双站点预设（实测：两站 CORS 均放行；同一个 Key 在两站账号体系独立，
   * 国内站的 Key 在国际站会报 401 Invalid token，反之亦然）。
   */
  STATIONS: [
    { label: '国内站', url: 'https://api.agnes-ai.cn/v1' },
    { label: '国际站', url: 'https://apihub.agnes-ai.cn/v1' },
  ],

  /** 读取当前生图配置（全部来自 Storage settings） */
  cfg() {
    const s = (typeof Storage !== 'undefined' && Storage.getSettings) ? Storage.getSettings() : {};
    return {
      endpoint: String(s.imageEndpoint || this.DEFAULT_ENDPOINT).replace(/\/+$/, ''),
      apiKey: String(s.imageApiKey || '').trim(),
      model: s.imageModel || this.DEFAULT_MODEL,
      size: s.imageSize || '1K',
      ratio: s.imageRatio || '16:9',
      style: s.imageStyle || '',
      maxPx: Number(s.imageMaxPx) > 0 ? Number(s.imageMaxPx) : 768,
      quality: Number(s.imageQuality) > 0 ? Number(s.imageQuality) : 0.72,
      maxPerConv: Number(s.imageMaxPerConv) > 0 ? Number(s.imageMaxPerConv) : 16,
    };
  },

  /** 判断 endpoint 属于哪个站点；未知地址返回自定义标记 */
  stationOf(endpoint) {
    const url = String(endpoint || '').replace(/\/+$/, '');
    const hit = this.STATIONS.find(st => url === st.url || url.startsWith(st.url));
    return hit ? hit.label : '自定义';
  },

  isEnabled() {
    const s = (typeof Storage !== 'undefined' && Storage.getSettings) ? Storage.getSettings() : {};
    return s.enableImageGen !== false;
  },

  isConfigured() { return !!this.cfg().apiKey; },

  /** 把用户提示词 + 全局风格后缀合成最终 prompt */
  composePrompt(prompt, style) {
    const p = String(prompt || '').trim();
    const st = String(style != null ? style : this.cfg().style || '').trim();
    if (!p) return '';
    return st ? `${p}，${st}` : p;
  },

  /**
   * 调用生图接口。
   * @returns {Promise<{b64:string, revised:string, url:string, ms:number}>}
   */
  async generate(opts = {}) {
    const c = this.cfg();
    const apiKey = String(opts.apiKey || c.apiKey).trim();
    if (!apiKey) throw new Error('未配置生图 API Key（设置 → 生图设置）');

    const prompt = this.composePrompt(opts.prompt, opts.style);
    if (!prompt) throw new Error('提示词不能为空');

    const size = opts.size || c.size;
    const ratio = opts.ratio || c.ratio;
    const model = opts.model || c.model;

    const body = {
      model,
      prompt,
      size,
      extra_body: { response_format: 'b64_json' },
    };
    // ratio 只在尺寸档位（1K/2K/3K/4K）下有效
    if (/^(1K|2K|3K|4K)$/i.test(String(size)) && ratio) body.ratio = ratio;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      else opts.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const started = Date.now();
    try {
      const res = await fetch(`${c.endpoint}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const raw = await res.text();
      let data = null;
      try { data = JSON.parse(raw); } catch { /* 非 JSON 响应 */ }

      if (!res.ok) {
        const msg = (data && (data.error?.message || data.message || data.error)) || raw.slice(0, 300);
        throw new Error(`生图失败 (HTTP ${res.status}): ${msg}`);
      }
      if (!data) throw new Error('生图返回不是合法 JSON: ' + raw.slice(0, 200));

      const item = (data.data && data.data[0]) || data;
      const b64 = item.b64_json || item.b64 || '';
      if (!b64) {
        if (item.url) {
          throw new Error('接口只返回了图片链接，但该 CDN 不允许跨域读取，无法保存到本地。请确认已开启 b64_json 返回。');
        }
        throw new Error('生图返回中没有图片数据');
      }
      return {
        b64,
        revised: item.revised_prompt || '',
        url: item.url || '',
        ms: Date.now() - started,
      };
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('生图超时或被取消');
      throw e;
    } finally {
      clearTimeout(timer);
    }
  },

  /** 连通性自检：用最小请求验证 Key 是否可用 */
  async test(apiKey) {
    const r = await this.generate({ apiKey, prompt: 'a small red lantern on dark background', size: '1K', ratio: '1:1', style: '' });
    return { ok: true, bytes: Math.floor(r.b64.length * 0.75), ms: r.ms };
  },

  /**
   * 拉取 /models 模型列表。
   * @param {object} opts { apiKey, endpoint } 缺省用当前配置
   * @returns {Promise<{models:string[], imageModels:string[], ms:number, station:string}>}
   *          models 为全部 id；imageModels 是筛出的生图模型（前端优先展示）。
   */
  async fetchModels(opts = {}) {
    const c = this.cfg();
    const apiKey = String(opts.apiKey != null ? opts.apiKey : c.apiKey).trim();
    if (!apiKey) throw new Error('未配置生图 API Key（设置 → 生图设置）');
    const endpoint = String(opts.endpoint || c.endpoint).replace(/\/+$/, '');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const started = Date.now();
    try {
      const res = await fetch(`${endpoint}/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      const raw = await res.text();
      let data = null;
      try { data = JSON.parse(raw); } catch { /* 非 JSON */ }

      if (!res.ok) {
        const msg = (data && (data.error?.message || data.message)) || raw.slice(0, 200);
        throw new Error(`获取模型列表失败 (HTTP ${res.status}): ${msg}`);
      }
      const arr = (data && Array.isArray(data.data)) ? data.data
        : (Array.isArray(data) ? data : []);
      const models = arr.map(m => String(m && (m.id || m.name) || '').trim()).filter(Boolean);
      const imageModels = models.filter(id => /image/i.test(id));
      if (!models.length) throw new Error('接口返回了空模型列表');
      return {
        models,
        imageModels: imageModels.length ? imageModels : models,
        ms: Date.now() - started,
        station: this.stationOf(endpoint),
      };
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('获取模型列表超时');
      throw e;
    } finally {
      clearTimeout(timer);
    }
  },
};

// ============================================================
// 图片压缩 / 转码
// ============================================================
const AgnesImage = {
  /** base64(无前缀) → dataURL */
  toDataUrl(b64, mime = 'image/png') {
    if (!b64) return '';
    return b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`;
  },

  /** dataURL → Blob（供下载/预览） */
  dataUrlToBlob(dataUrl) {
    const [head, body] = String(dataUrl || '').split(',');
    const mime = (head.match(/data:([^;]+)/) || [, 'image/png'])[1];
    const bin = atob(body || '');
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  },

  /** dataURL 的近似字节数（不解码） */
  approxBytes(dataUrl) {
    const body = String(dataUrl || '').split(',')[1] || '';
    return Math.floor(body.length * 0.75);
  },

  /**
   * 把 dataURL 缩放到最长边 maxPx 并重编码为 JPEG，返回新 dataURL。
   * 失败时原样返回（宁可不压缩也不丢图）。
   */
  async compress(dataUrl, maxPx = 768, quality = 0.72) {
    try {
      const img = await this._load(dataUrl);
      const w0 = img.naturalWidth || img.width;
      const h0 = img.naturalHeight || img.height;
      if (!w0 || !h0) return dataUrl;

      const scale = Math.min(1, maxPx / Math.max(w0, h0));
      const w = Math.max(1, Math.round(w0 * scale));
      const h = Math.max(1, Math.round(h0 * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      // 透明底转白，避免 JPEG 出现黑块
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const out = canvas.toDataURL('image/jpeg', quality);
      // 极端情况下压缩反而更大 —— 保留原图
      return out && out.length < dataUrl.length ? out : dataUrl;
    } catch (e) {
      log('AgnesImage.compress failed:', e && e.message);
      return dataUrl;
    }
  },

  _load(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片解码失败'));
      img.src = src;
    });
  },
};

// ============================================================
// 提示词模板
// ============================================================
const AgnesPrompt = {
  /**
   * 默认的「AI 自动配图」系统指令。
   * 用户可在 设置 → 生图设置 里整段替换（settings.imagePromptTemplate）。
   */
  DEFAULT_INSTRUCTION: [
    '【配图能力】',
    '你在叙事过程中可以为关键场景配图。当你判断某个画面极具视觉冲击力、值得定格时，',
    '在回复的**最末尾**（所有正文、思考、状态块之后）追加一个配图指令块：',
    '',
    '```json:image',
    '{"prompt": "画面描述", "ratio": "16:9"}',
    '```',
    '',
    '规则：',
    '1. 只在首次登场、场景切换、高潮、转折等值得定格的时刻配图；日常对话、赶路、寒暄不要配图。',
    '2. 每轮最多 1 个配图块，必须放在回复最末尾，不要夹在正文中间。',
    '3. prompt 用中文详细描述画面：主体与外貌服饰、动作姿态、环境背景、光线与氛围、构图视角、画风。',
    '   不要写对白台词，不要出现"图中""画面里"这类元描述词。',
    '4. ratio 可选 1:1 / 3:4 / 4:3 / 16:9 / 9:16 / 2:3 / 3:2 / 21:9，默认 16:9。',
    '5. 配图块是给系统的指令，不会展示给读者，因此不要用自然语言去解释或提及它。',
  ].join('\n'),

  /** 返回最终要注入 system prompt 的指令文本；未启用/未配置则返回 '' */
  buildInstruction() {
    if (typeof Storage === 'undefined' || !Storage.getSettings) return '';
    const s = Storage.getSettings();
    if (s.enableImageGen === false) return '';
    if (s.imageAutoTrigger === false) return '';
    if (!String(s.imageApiKey || '').trim()) return '';
    const tpl = String(s.imagePromptTemplate || '').trim();
    return tpl || this.DEFAULT_INSTRUCTION;
  },

  /** 从 AI 回复中解析配图指令块，返回 [{prompt, ratio, size}] */
  parseRequests(text) {
    if (!text || typeof MVU === 'undefined' || !MVU._extractFencedBlocks) return [];
    const out = [];
    for (const block of MVU._extractFencedBlocks(text, 'image')) {
      let obj = null;
      try { obj = MVU._tryParseJson ? MVU._tryParseJson(block) : JSON.parse(block); } catch { obj = null; }
      if (!obj) continue;
      const list = Array.isArray(obj) ? obj : [obj];
      for (const it of list) {
        if (!it) continue;
        const prompt = String(it.prompt || it.description || it.scene || '').trim();
        if (!prompt) continue;
        out.push({
          prompt,
          ratio: String(it.ratio || '').trim(),
          size: String(it.size || '').trim(),
        });
      }
    }
    return out;
  },

  /** 面板里给用户用的风格快捷选项 */
  STYLE_PRESETS: [
    { label: '水墨国风', value: '中国水墨画风格，写意留白，淡彩晕染，宣纸质感' },
    { label: '电影写实', value: '电影级写实摄影，浅景深，戏剧性打光，高细节，35mm 胶片质感' },
    { label: '仙侠唯美', value: '东方仙侠插画，唯美光效，飘渺云雾，精致服饰纹样，高细节' },
    { label: '暗黑厚涂', value: '暗黑奇幻厚涂插画，强对比光影，浓重笔触，史诗氛围' },
    { label: '日系动画', value: '日系动画赛璐璐风格，干净线条，通透色彩，背景精细' },
  ],
};

// ============================================================
// 生图编排（消息挂载 / 数量控制 / 持久化）
// ============================================================
const AgnesGen = {
  /** 正在生成的占位任务： { [msgId]: [{id, prompt, status, error}] } */
  _pending: {},

  pendingFor(msgId) { return this._pending[msgId] || []; },

  addPending(msgId, item) {
    if (!this._pending[msgId]) this._pending[msgId] = [];
    this._pending[msgId].push(item);
    return item;
  },

  clearPending(msgId, id) {
    const arr = this._pending[msgId];
    if (!arr) return;
    const i = arr.findIndex(x => x.id === id);
    if (i >= 0) arr.splice(i, 1);
    if (arr.length === 0) delete this._pending[msgId];
  },

  /**
   * 会话级数量上限：把所有消息里的图片按时间排序，超出 limit 的从最旧的开始丢弃。
   * 返回被改动的消息 id 列表（调用方据此局部重绘）。
   */
  enforceLimit(limit) {
    const list = (typeof conversation !== 'undefined' && conversation && conversation.messages) || [];
    if (!limit || limit <= 0) return [];
    const all = [];
    for (const m of list) {
      for (const im of (m.images || [])) all.push({ msg: m, img: im });
    }
    if (all.length <= limit) return [];
    all.sort((a, b) => (a.img.ts || 0) - (b.img.ts || 0));
    const drop = all.slice(0, all.length - limit);
    const touched = new Set();
    for (const d of drop) {
      const arr = d.msg.images || [];
      const i = arr.indexOf(d.img);
      if (i >= 0) { arr.splice(i, 1); touched.add(d.msg.id); }
    }
    return [...touched];
  },

  /** 目标消息：优先本轮 AI 消息，否则最后一条 assistant 消息 */
  resolveTargetMessage(msg) {
    if (msg) return msg;
    const list = (typeof conversation !== 'undefined' && conversation && conversation.messages) || [];
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].role === 'assistant') return list[i];
    }
    return null;
  },

  /**
   * 生成一张图并挂到消息上。
   * @param {object} msg      目标消息对象（必须有 id）
   * @param {string} prompt   提示词
   * @param {object} opts     { ratio, size, style, source }
   */
  async run(msg, prompt, opts = {}) {
    const target = this.resolveTargetMessage(msg);
    if (!target) throw new Error('找不到可挂载图片的消息');

    const cfg = AgnesAPI.cfg();
    const task = this.addPending(target.id, {
      id: Utils.generateId('imgtask'),
      prompt: String(prompt || '').trim(),
      status: 'loading',
      error: '',
      source: opts.source || 'manual',
    });
    if (typeof refreshMessageImages === 'function') refreshMessageImages(target.id);

    try {
      const res = await AgnesAPI.generate({
        prompt: task.prompt,
        ratio: opts.ratio || cfg.ratio,
        size: opts.size || cfg.size,
        style: opts.style != null ? opts.style : cfg.style,
      });

      const raw = AgnesImage.toDataUrl(res.b64, 'image/png');
      const dataUrl = await AgnesImage.compress(raw, cfg.maxPx, cfg.quality);

      if (!Array.isArray(target.images)) target.images = [];
      target.images.push({
        id: Utils.generateId('img'),
        dataUrl,
        prompt: task.prompt,
        revised: res.revised || '',
        ratio: opts.ratio || cfg.ratio,
        size: opts.size || cfg.size,
        source: task.source,
        ts: Date.now(),
        bytes: AgnesImage.approxBytes(dataUrl),
      });
      // 会话级数量上限：超出时丢弃最旧的（图片最大，最旧的最不重要）
      const touched = this.enforceLimit(cfg.maxPerConv);

      this.clearPending(target.id, task.id);
      if (typeof conversation !== 'undefined' && conversation && Storage.saveConversation) {
        Storage.saveConversation(conversation);
      }
      if (typeof refreshMessageImages === 'function') {
        refreshMessageImages(target.id);
        for (const id of touched) if (id !== target.id) refreshMessageImages(id);
      }
      return target.images[target.images.length - 1];
    } catch (e) {
      task.status = 'error';
      task.error = (e && e.message) || '生图失败';
      if (typeof refreshMessageImages === 'function') refreshMessageImages(target.id);
      // 错误卡片保留 8 秒后自动消失，避免长期占位
      setTimeout(() => {
        this.clearPending(target.id, task.id);
        if (typeof refreshMessageImages === 'function') refreshMessageImages(target.id);
      }, 8000);
      throw e;
    }
  },

  /** 处理 AI 回复里的自动配图指令（本轮 AI 消息） */
  async processAutoRequests(text, aiMsg) {
    if (typeof Storage === 'undefined') return;
    const s = Storage.getSettings();
    if (s.enableImageGen === false || s.imageAutoTrigger === false) return;
    if (!AgnesAPI.isConfigured()) return;

    const reqs = AgnesPrompt.parseRequests(text);
    if (!reqs.length) return;

    const cfg = AgnesAPI.cfg();
    // 单轮最多 2 张，避免 AI 滥发
    for (const r of reqs.slice(0, 2)) {
      try {
        await this.run(aiMsg, r.prompt, {
          ratio: r.ratio || cfg.ratio,
          size: r.size || cfg.size,
          source: 'auto',
        });
      } catch (e) {
        log('自动配图失败:', e && e.message);
        try { UI.showToast('自动配图失败：' + ((e && e.message) || ''), 'error'); } catch {}
      }
    }
  },

  /** 统计某会话的图片总量，用于设置页/提示 */
  stats() {
    const list = (typeof conversation !== 'undefined' && conversation && conversation.messages) || [];
    let count = 0, bytes = 0;
    for (const m of list) {
      for (const im of (m.images || [])) { count++; bytes += im.bytes || AgnesImage.approxBytes(im.dataUrl); }
    }
    return { count, bytes };
  },
};

// ============================================================
// PromptBuilder 挂钩：把配图指令追加到 system prompt 末尾
// ------------------------------------------------------------
// 用包装而非改动 common.js 的 6 个 return 点：
// 指令块是稳定内容，追加在 system 末尾不会破坏故事设定块的缓存前缀。
// ============================================================
(function hookPromptBuilder() {
  if (typeof PromptBuilder === 'undefined' || typeof PromptBuilder.buildMessages !== 'function') return;
  const orig = PromptBuilder.buildMessages.bind(PromptBuilder);
  PromptBuilder.buildMessages = function (conversation, options = {}) {
    const result = orig(conversation, options);
    try {
      const inst = AgnesPrompt.buildInstruction();
      if (inst && result && typeof result.systemPrompt === 'string') {
        result.systemPrompt = result.systemPrompt
          ? result.systemPrompt + '\n\n' + inst
          : inst;
      }
    } catch (e) { log('注入配图指令失败:', e && e.message); }
    return result;
  };
})();

if (typeof window !== 'undefined') {
  window.AgnesAPI = AgnesAPI;
  window.AgnesImage = AgnesImage;
  window.AgnesPrompt = AgnesPrompt;
  window.AgnesGen = AgnesGen;
}
