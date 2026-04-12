#!/usr/bin/env python3
"""
Prompt Inspector CLI — 模拟 PromptBuilder.buildMessages()，输出发送给 AI 的完整上下文。

用法:
  python3 debug_prompt.py                         # 使用最近的对话 + 当前活跃预设
  python3 debug_prompt.py <conversation_id>        # 指定对话
  python3 debug_prompt.py <conversation_id> <preset_id>  # 指定对话和预设
  python3 debug_prompt.py --list                   # 列出所有对话和预设
  python3 debug_prompt.py --json                   # 输出 JSON 格式（方便程序处理）
"""

import json, os, sys, re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
SETTINGS_PATH = os.path.join(DATA_DIR, 'settings.json')
CONV_DIR = os.path.join(DATA_DIR, 'conversations')


def load_settings():
    with open(SETTINGS_PATH) as f:
        return json.load(f)


def load_conversation(conv_id):
    path = os.path.join(CONV_DIR, f'{conv_id}.json')
    if not os.path.exists(path):
        # Try matching by prefix
        for f in os.listdir(CONV_DIR):
            if conv_id in f:
                path = os.path.join(CONV_DIR, f)
                break
    with open(path) as f:
        return json.load(f)


def get_latest_conversation():
    files = sorted(os.listdir(CONV_DIR), key=lambda f: os.path.getmtime(os.path.join(CONV_DIR, f)), reverse=True)
    if not files:
        print('No conversations found.')
        sys.exit(1)
    with open(os.path.join(CONV_DIR, files[0])) as f:
        return json.load(f)


def list_all():
    settings = load_settings()
    print('=== Conversations ===')
    for f in sorted(os.listdir(CONV_DIR), key=lambda f: os.path.getmtime(os.path.join(CONV_DIR, f)), reverse=True):
        with open(os.path.join(CONV_DIR, f)) as fh:
            c = json.load(fh)
        msgs = c.get('messages', [])
        print(f'  {c.get("id","?")}  "{c.get("name","")}"  ({len(msgs)} msgs, {c.get("phase","?")})')

    print('\n=== Presets ===')
    presets = settings.get('promptPresets', {})
    active = settings.get('activePresetId', 'default')
    for pid, p in presets.items():
        entries = p.get('entries') or []
        enabled = sum(1 for e in entries if e.get('enabled'))
        marker = ' ← active' if pid == active else ''
        print(f'  {pid}  "{p.get("name","")}"  ({enabled}/{len(entries)} enabled){marker}')


def clean_ai_content(text):
    """Simulate MVU.cleanText + Summary.cleanAbstract"""
    text = re.sub(r'```json:mvu_init\s*\n[\s\S]*?\n```', '', text)
    text = re.sub(r'```json:mvu_update\s*\n[\s\S]*?\n```', '', text)
    text = re.sub(r'```json:mvu\s*\n[\s\S]*?\n```', '', text)
    text = re.sub(r'```text:story_setting\s*\n[\s\S]*?\n```', '', text)
    text = re.sub(r'```json:story_setting_patch\s*\n[\s\S]*?\n```', '', text)
    text = re.sub(r'```text:options\s*\n[\s\S]*?\n```', '', text)
    text = re.sub(r'<branches>[\s\S]*?</branches>', '', text)
    text = re.sub(r'<thinking>[\s\S]*?</thinking>', '', text)
    text = re.sub(r'<think>[\s\S]*?</think>', '', text)
    text = re.sub(r'<deep_thinking>[\s\S]*?</deep_thinking>', '', text)
    text = re.sub(r'<refine>[\s\S]*?</refine>', '', text)
    text = re.sub(r'<writing_advice>[\s\S]*?</writing_advice>', '', text)
    text = re.sub(r'<!--[\s\S]*?-->', '', text)
    text = re.sub(r'</?story>', '', text)
    # cleanAbstract
    text = re.sub(r'<details><summary>[\s\S]*?</summary>[\s\S]*?</details>', '', text)
    return text.strip()


def extract_abstract_content(text):
    m = re.search(r'<details><summary>[\s\S]*?</summary>([\s\S]*?)</details>', text)
    return m.group(1).strip() if m else None


def build_messages(conversation, preset, settings):
    entries = preset.get('entries') or []
    phase = conversation.get('phase', 'init')

    if phase == 'init':
        init_prompt = preset.get('initPrompt') or ''
        # If no initPrompt in preset, we'd use DEFAULT_INIT_PROMPT but we don't have it here
        if not init_prompt:
            init_prompt = '(DEFAULT_INIT_PROMPT — see common.js)'
        msgs = [m for m in conversation.get('messages', []) if not m.get('hidden') and m.get('content', '').strip()]
        msgs = [{'role': m['role'], 'content': m['content']} for m in msgs]
        return {'systemPrompt': init_prompt, 'messages': msgs}

    # RP phase
    schema = conversation.get('mvu', {}).get('schema', {})
    templates = conversation.get('mvu', {}).get('templates', {})
    state = conversation.get('mvu', {}).get('state', {})

    # Schema description
    schema_desc = ''
    if schema:
        schema_desc = '【状态栏字段】\n'
        for k, d in schema.items():
            line = f'- {k} ({d.get("label", k)}): type={d.get("type", "?")}'
            if d.get('max'): line += f', max={d["max"]}'
            if d.get('rule'): line += f' | rule: {d["rule"]}'
            schema_desc += line + '\n'
    if templates:
        schema_desc += '\n【可用模板（用 addFromTemplate 动态添加新条目）】\n'
        for name, tpl in templates.items():
            schema_desc += f'模板 "{name}"：\n'
            for k, d in tpl.get('fields', {}).items():
                line = f'  - {k} ({d.get("label", k)}): type={d.get("type", "?")}'
                if d.get('max'): line += f', max={d["max"]}'
                schema_desc += line + '\n'

    # Template variable expansion
    def expand_vars(text):
        text = text.replace('{{schema}}', schema_desc)
        text = text.replace('{{articleWords}}', str(settings.get('articleWordCount', 500)))
        text = text.replace('{{summaryWords}}', str(settings.get('summaryWordCount', 50)))
        return text

    # MVU context
    def build_mvu_context():
        if not state:
            return ''
        ctx = '【当前状态栏数据】\n'
        for k, v in state.items():
            if v is None or v == '' or (isinstance(v, list) and len(v) == 0):
                continue
            d = schema.get(k, {})
            label = d.get('label', k)
            display = json.dumps(v, ensure_ascii=False) if isinstance(v, list) else v
            line = f'{k}({label}): {display}'
            if d.get('max'): line += f' / {d["max"]}'
            ctx += line + '\n'
        return ctx

    # Prepare messages
    all_msgs = [m for m in conversation.get('messages', []) if not m.get('hidden') and m.get('content', '').strip()]
    ai_idx = [i for i, m in enumerate(all_msgs) if m['role'] == 'assistant']
    KEEP = 2
    split_at = ai_idx[-KEEP] if len(ai_idx) >= KEEP else 0

    # Build summaries
    def build_summaries():
        parts = []
        merged_sm = conversation.get('summary', {}).get('mergedSummaries', [])
        if merged_sm:
            sm_text = '\n\n'.join(f'<{sm["code"]}>{sm["content"]}</{sm["code"]}>' for sm in merged_sm)
            parts.append({'role': 'user', 'content': '【故事总结】\n' + sm_text})
        last_merged = conversation.get('summary', {}).get('lastMergedIdx', 0)
        abstracts = []
        ab_counter = 1
        for i in range(last_merged):
            if i < len(all_msgs) and all_msgs[i]['role'] == 'assistant' and all_msgs[i].get('abstract'):
                ab_counter += 1
        for i in range(last_merged, split_at):
            if i < len(all_msgs):
                m = all_msgs[i]
                if m['role'] == 'assistant' and m.get('abstract'):
                    code = f'ab{ab_counter:02d}'
                    content = extract_abstract_content(m['abstract']) or m['abstract']
                    abstracts.append(f'<{code}>{content}</{code}>')
                    ab_counter += 1
        if abstracts:
            parts.append({'role': 'user', 'content': '【近期摘要】\n' + '\n\n'.join(abstracts)})
        return parts

    # Check slot system
    has_slots = any(e.get('slot') for e in entries)

    if not has_slots:
        # Legacy path
        system_parts = []
        prefix_msgs = []
        for e in entries:
            if not e.get('enabled'): continue
            c = expand_vars(e.get('content', ''))
            if not c.strip(): continue
            if e.get('role') == 'system':
                system_parts.append(c)
            else:
                prefix_msgs.append({'role': e['role'], 'content': c})
        system_prompt = '\n\n'.join(system_parts)
        msgs = list(prefix_msgs)
        if conversation.get('storySetting'):
            msgs.append({'role': 'user', 'content': '【故事设定】\n' + conversation['storySetting']})
        msgs.extend(build_summaries())
        if conversation.get('writingAdvice'):
            msgs.append({'role': 'user', 'content': '【主人的写作建议】\n' + conversation['writingAdvice']})
        recent = all_msgs[split_at:]
        for i, m in enumerate(recent):
            if i == len(recent) - 1:
                mvu_ctx = build_mvu_context()
                if mvu_ctx: msgs.append({'role': 'user', 'content': mvu_ctx})
            content = clean_ai_content(m['content']) if m['role'] == 'assistant' else m['content']
            msgs.append({'role': m['role'], 'content': content})
    else:
        # Slot-driven assembly
        has_mvu_slot = any(e.get('slot') == 'mvu_state' and e.get('enabled') for e in entries)
        has_user_input_slot = any(e.get('slot') == 'user_input' and e.get('enabled') for e in entries)
        system_parts = []
        msgs = []
        after_chat = False
        pending_user_input = None

        for e in entries:
            if not e.get('enabled'): continue

            if e.get('slot'):
                slot = e['slot']
                if slot == 'story_setting':
                    if conversation.get('storySetting'):
                        msgs.append({'role': 'user', 'content': '【故事设定】\n' + conversation['storySetting']})
                elif slot == 'summaries':
                    msgs.extend(build_summaries())
                    if conversation.get('writingAdvice'):
                        msgs.append({'role': 'user', 'content': '【主人的写作建议】\n' + conversation['writingAdvice']})
                elif slot == 'chat_history':
                    after_chat = True
                    recent = all_msgs[split_at:]
                    chat_recent = recent
                    if has_user_input_slot and recent and recent[-1]['role'] == 'user':
                        chat_recent = recent[:-1]
                        pending_user_input = recent[-1]
                    for i, m in enumerate(chat_recent):
                        if not has_mvu_slot and i == len(chat_recent) - 1:
                            mvu_ctx = build_mvu_context()
                            if mvu_ctx: msgs.append({'role': 'user', 'content': mvu_ctx})
                        content = clean_ai_content(m['content']) if m['role'] == 'assistant' else m['content']
                        msgs.append({'role': m['role'], 'content': content})
                elif slot == 'mvu_state':
                    mvu_ctx = build_mvu_context()
                    if mvu_ctx: msgs.append({'role': 'user', 'content': mvu_ctx})
                elif slot == 'user_input':
                    if pending_user_input:
                        msgs.append({'role': 'user', 'content': '[ 本轮用户消息 ]\n' + pending_user_input['content']})
                continue

            c = expand_vars(e.get('content', ''))
            if not c.strip(): continue

            if after_chat:
                role = 'user' if e.get('role') == 'system' else e.get('role', 'system')
                msgs.append({'role': role, 'content': c})
            else:
                if e.get('role') == 'system':
                    system_parts.append(c)
                else:
                    msgs.append({'role': e.get('role', 'system'), 'content': c})

        system_prompt = '\n\n'.join(system_parts)

    # Merge adjacent same-role
    merged = []
    for m in msgs:
        if merged and merged[-1]['role'] == m['role']:
            merged[-1]['content'] += '\n\n' + m['content']
        else:
            merged.append(dict(m))

    return {'systemPrompt': system_prompt, 'messages': merged}


def build_structure(conversation, preset, settings):
    """Build a structural view showing where each component is placed."""
    entries = preset.get('entries') or []
    phase = conversation.get('phase', 'init')

    if phase == 'init':
        return [('SYS', 'INIT_PROMPT', '(initPrompt or DEFAULT_INIT_PROMPT)')]

    all_msgs = [m for m in conversation.get('messages', []) if not m.get('hidden') and m.get('content', '').strip()]
    ai_idx = [i for i, m in enumerate(all_msgs) if m['role'] == 'assistant']
    KEEP = 2
    split_at = ai_idx[-KEEP] if len(ai_idx) >= KEEP else 0

    # Count summaries
    merged_sm = conversation.get('summary', {}).get('mergedSummaries', [])
    last_merged = conversation.get('summary', {}).get('lastMergedIdx', 0)
    ab_count = sum(1 for i in range(last_merged, split_at) if i < len(all_msgs) and all_msgs[i]['role'] == 'assistant' and all_msgs[i].get('abstract'))

    recent = all_msgs[split_at:]
    has_slots = any(e.get('slot') for e in entries)
    has_mvu_slot = any(e.get('slot') == 'mvu_state' and e.get('enabled') for e in entries)
    has_user_input_slot = any(e.get('slot') == 'user_input' and e.get('enabled') for e in entries)

    # Separate user input from recent if user_input slot exists
    chat_recent = recent
    has_pending_input = False
    if has_user_input_slot and recent and recent[-1]['role'] == 'user':
        chat_recent = recent[:-1]
        has_pending_input = True

    mvu_fields = len(conversation.get('mvu', {}).get('state', {}))
    story_len = len(conversation.get('storySetting', ''))

    structure = []

    if not has_slots:
        # Legacy path
        for e in entries:
            if not e.get('enabled'): continue
            c = e.get('content', '')
            if not c.strip(): continue
            if e.get('role') == 'system':
                structure.append(('SYS', f'预设: {e.get("name")}', f'{len(c)} chars'))
            else:
                structure.append((e.get('role','?').upper(), f'预设: {e.get("name")}', f'{len(c)} chars'))
        if story_len:
            structure.append(('USER', '【故事设定】', f'{story_len} chars'))
        if merged_sm:
            structure.append(('USER', f'【故事总结】', f'{len(merged_sm)} 条 sm'))
        if ab_count:
            structure.append(('USER', f'【近期摘要】', f'{ab_count} 条 ab'))
        for i, m in enumerate(chat_recent):
            if m['role'] == 'assistant':
                structure.append(('AI', f'AI 回复 (近期 {len(chat_recent)-i}/{len(chat_recent)})', f'{len(m["content"])} chars'))
            else:
                structure.append(('USER', f'用户消息', f'{len(m["content"])} chars'))
        if mvu_fields:
            structure.append(('USER', '【当前状态栏数据】', f'{mvu_fields} fields'))
    else:
        # Slot-driven
        after_chat = False
        for e in entries:
            if not e.get('enabled'): continue

            if e.get('slot'):
                slot = e['slot']
                if slot == 'story_setting':
                    if story_len:
                        structure.append(('USER', '[SLOT] 故事设定', f'{story_len} chars'))
                    else:
                        structure.append(('—', '[SLOT] 故事设定', '(empty)'))
                elif slot == 'summaries':
                    if merged_sm:
                        structure.append(('USER', '[SLOT] 故事总结 (sm)', f'{len(merged_sm)} 条'))
                    if ab_count:
                        structure.append(('USER', '[SLOT] 近期摘要 (ab)', f'{ab_count} 条'))
                elif slot == 'chat_history':
                    after_chat = True
                    ai_in_recent = sum(1 for m in chat_recent if m['role'] == 'assistant')
                    user_in_recent = sum(1 for m in chat_recent if m['role'] == 'user')
                    structure.append(('混合', f'[SLOT] 对话历史', f'{len(chat_recent)} 条 (AI:{ai_in_recent} USER:{user_in_recent})'))
                elif slot == 'mvu_state':
                    if mvu_fields:
                        structure.append(('USER', '[SLOT] 状态栏数据', f'{mvu_fields} fields'))
                    else:
                        structure.append(('—', '[SLOT] 状态栏数据', '(empty)'))
                elif slot == 'user_input':
                    if has_pending_input:
                        structure.append(('USER', '[SLOT] 用户输入', f'{len(recent[-1]["content"])} chars'))
                    else:
                        structure.append(('—', '[SLOT] 用户输入', '(empty)'))
                continue

            c = e.get('content', '')
            if not c.strip(): continue
            role_display = e.get('role', 'system').upper()
            if after_chat and e.get('role') == 'system':
                role_display = 'USER*'  # system→user after chat_history
            structure.append((role_display, f'预设: {e.get("name")}', f'{len(c)} chars'))

    return structure


def main():
    args = sys.argv[1:]
    output_json = '--json' in args
    args = [a for a in args if a != '--json']

    if '--list' in args:
        list_all()
        return

    settings = load_settings()

    if args:
        conv = load_conversation(args[0])
    else:
        conv = get_latest_conversation()

    presets = settings.get('promptPresets', {})
    if len(args) >= 2:
        preset = presets.get(args[1])
        if not preset:
            print(f'Preset not found: {args[1]}')
            print('Available:', ', '.join(presets.keys()))
            sys.exit(1)
    else:
        active_id = settings.get('activePresetId', 'default')
        preset = presets.get(active_id, {})

    if output_json:
        result = build_messages(conv, preset, settings)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return

    # Structure view
    print(f'Conversation: "{conv.get("name", "")}" ({conv.get("phase", "?")}, {len(conv.get("messages", []))} msgs)')
    print(f'Preset: "{preset.get("name", "")}"')

    all_msgs = [m for m in conv.get('messages', []) if not m.get('hidden') and m.get('content', '').strip()]
    ai_idx = [i for i, m in enumerate(all_msgs) if m['role'] == 'assistant']
    split_at = ai_idx[-2] if len(ai_idx) >= 2 else 0
    print(f'Context window: 保留最近 {len(all_msgs) - split_at} 条, 摘要化 {split_at} 条')
    print()

    structure = build_structure(conv, preset, settings)

    print('┌─ SYSTEM PROMPT (chat_history 之前的 system 条目合并)')
    sys_entries = [s for s in structure if s[0] == 'SYS']
    for s in sys_entries:
        print(f'│  ├ {s[1]}  ({s[2]})')
    print('│')

    print('├─ MESSAGES (按发送顺序)')
    non_sys = [s for s in structure if s[0] != 'SYS']
    for i, s in enumerate(non_sys):
        prefix = '│  ├' if i < len(non_sys) - 1 else '│  └'
        role_tag = f'[{s[0]}]'
        print(f'{prefix} {role_tag:8s} {s[1]}  ({s[2]})')
    print('│')

    # Token estimate
    result = build_messages(conv, preset, settings)
    total_chars = len(result['systemPrompt']) + sum(len(m['content']) for m in result['messages'])
    print(f'└─ Total: ~{total_chars:,} chars (~{total_chars // 2:,} tokens)')
    print(f'   Messages after merge: {len(result["messages"])} 条 (相邻同 role 已合并)')


if __name__ == '__main__':
    main()
