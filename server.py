#!/usr/bin/env python3
"""
AIRP Server - Static files + JSON storage API
Supports local mode (default) and public mode (AIRP_MODE=public)
Usage: python3 server.py [port]
"""

import http.server
import http.client
import json
import os
import secrets
import ssl
import sys
import threading
import urllib.parse
from datetime import date

_port_env = os.environ.get('PORT', '').strip()
PORT = int(_port_env) if _port_env.isdigit() else (int(sys.argv[1]) if len(sys.argv) > 1 else 8080)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get('AIRP_DATA_DIR') or os.path.join(BASE_DIR, 'data')
CONV_DIR = os.path.join(DATA_DIR, 'conversations')

# ── Public mode config ──────────────────────────────────────
PUBLIC_MODE = os.environ.get('AIRP_MODE') == 'public'
INVITE_CODES = set(c.strip() for c in os.environ.get('AIRP_INVITE_CODES', '').split(',') if c.strip()) if PUBLIC_MODE else set()
API_PROVIDER = os.environ.get('AIRP_API_PROVIDER', 'openai')
API_KEY = os.environ.get('AIRP_API_KEY', '')
API_BASE_URL = os.environ.get('AIRP_API_BASE_URL', '')
API_MODEL = os.environ.get('AIRP_API_MODEL', '')
API_MAX_TOKENS = int(os.environ.get('AIRP_API_MAX_TOKENS', '20000'))
DAILY_LIMIT = int(os.environ.get('AIRP_DAILY_LIMIT', '300'))
DEFAULT_PERSONA = os.environ.get('AIRP_DEFAULT_PERSONA',
    '你是一个专业的互动小说AI助手。你擅长创意写作、角色扮演、世界观构建。'
    '在RP中会全力投入角色，提供沉浸式的叙事体验。')

# ── Thread-safe data ────────────────────────────────────────
_users_lock = threading.Lock()
_rate_lock = threading.Lock()
_rate_limits = {}  # {userId: {date_str: count}}


def _default_api_base():
    if API_BASE_URL:
        return API_BASE_URL.rstrip('/')
    defaults = {
        'openai': 'https://api.openai.com/v1',
        'claude': 'https://api.anthropic.com/v1',
        'google-ai-studio': 'https://generativelanguage.googleapis.com/v1beta',
    }
    return defaults.get(API_PROVIDER, 'https://api.openai.com/v1')


# ── Helpers ─────────────────────────────────────────────────
def ensure_dirs():
    os.makedirs(CONV_DIR, exist_ok=True)
    if PUBLIC_MODE:
        os.makedirs(os.path.join(DATA_DIR, 'u'), exist_ok=True)


def read_json(path, default=None):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _user_data_dir(user_id):
    """Return data dir for a user in public mode."""
    return os.path.join(DATA_DIR, 'u', user_id)


def _user_conv_dir(user_id):
    return os.path.join(_user_data_dir(user_id), 'conversations')


# ── Auth helpers ────────────────────────────────────────────
def _load_users():
    return read_json(os.path.join(DATA_DIR, 'users.json'), {})


def _save_users(users):
    write_json(os.path.join(DATA_DIR, 'users.json'), users)


def _find_user_by_token(token):
    """Return username if token valid, else None."""
    if not token:
        return None
    users = _load_users()
    for username, info in users.items():
        if info.get('token') == token:
            return username
    return None


# ── Rate limiting ───────────────────────────────────────────
def _check_rate_limit(user_id):
    """Return (allowed, remaining). Increments count if allowed."""
    today = date.today().isoformat()
    with _rate_lock:
        user_limits = _rate_limits.setdefault(user_id, {})
        # Reset if new day
        if today not in user_limits:
            user_limits.clear()
            user_limits[today] = 0
        count = user_limits[today]
        if count >= DAILY_LIMIT:
            return False, 0
        user_limits[today] = count + 1
        return True, DAILY_LIMIT - count - 1


def _get_usage_today(user_id):
    today = date.today().isoformat()
    with _rate_lock:
        return _rate_limits.get(user_id, {}).get(today, 0)


# ── Upstream API helpers ────────────────────────────────────
def _build_upstream_url(model, stream):
    base = _default_api_base()
    if API_PROVIDER == 'google-ai-studio':
        act = 'streamGenerateContent?alt=sse&' if stream else 'generateContent?'
        return f'{base}/models/{model}:{act}key={API_KEY}'
    if API_PROVIDER == 'claude':
        return f'{base}/messages'
    return f'{base}/chat/completions'


def _build_upstream_headers():
    h = {'Content-Type': 'application/json'}
    if API_PROVIDER == 'claude':
        h['x-api-key'] = API_KEY
        h['anthropic-version'] = '2023-06-01'
    elif API_PROVIDER != 'google-ai-studio':
        h['Authorization'] = f'Bearer {API_KEY}'
    return h


def _build_upstream_body(model, system_prompt, messages, stream):
    max_tokens = API_MAX_TOKENS

    if API_PROVIDER == 'claude':
        msgs = []
        for m in messages:
            role = 'assistant' if m['role'] == 'assistant' else 'user'
            if msgs and msgs[-1]['role'] == role:
                msgs[-1]['content'] += '\n\n' + m['content']
            else:
                msgs.append({'role': role, 'content': m['content']})
        if msgs and msgs[0]['role'] != 'user':
            msgs.insert(0, {'role': 'user', 'content': '(continue)'})
        body = {'model': model, 'max_tokens': max_tokens, 'stream': stream, 'messages': msgs}
        if system_prompt:
            body['system'] = system_prompt
        return body

    if API_PROVIDER == 'google-ai-studio':
        contents = []
        if system_prompt:
            contents.append({'role': 'user', 'parts': [{'text': system_prompt}]})
            contents.append({'role': 'model', 'parts': [{'text': '好的，我明白了。'}]})
        for m in messages:
            contents.append({
                'role': 'model' if m['role'] == 'assistant' else 'user',
                'parts': [{'text': m['content']}]
            })
        return {'contents': contents, 'generationConfig': {'maxOutputTokens': max_tokens}}

    # OpenAI compatible
    msgs = []
    if system_prompt:
        msgs.append({'role': 'system', 'content': system_prompt})
    for m in messages:
        msgs.append({'role': m['role'], 'content': m['content']})
    body = {'model': model, 'messages': msgs, 'stream': stream}
    if max_tokens > 0:
        body['max_tokens'] = max_tokens
    return body


def _parse_non_stream_response(data):
    """Extract content and usage from non-streaming API response."""
    text = ''
    usage = {'input': 0, 'output': 0}
    if 'usage' in data:
        u = data['usage']
        usage['input'] = u.get('input_tokens') or u.get('prompt_tokens') or 0
        usage['output'] = u.get('output_tokens') or u.get('completion_tokens') or 0
    elif 'usageMetadata' in data:
        u = data['usageMetadata']
        usage['input'] = u.get('promptTokenCount', 0)
        usage['output'] = u.get('candidatesTokenCount', 0)

    if 'content' in data and isinstance(data['content'], list):
        text = '\n'.join(b['text'] for b in data['content'] if b.get('type') == 'text')
    elif 'candidates' in data:
        parts = (data['candidates'][0].get('content', {}).get('parts') or [])
        text = ''.join(p.get('text', '') for p in parts)
    elif 'choices' in data:
        text = (data['choices'][0].get('message', {}).get('content') or '')
    return text, usage


# ── Handler ─────────────────────────────────────────────────
class AirpHandler(http.server.SimpleHTTPRequestHandler):
    """Serves static files and handles /api/* routes."""

    def _get_data_dir(self, user_id=None):
        """Return the appropriate data dir. Public mode uses per-user dirs."""
        if PUBLIC_MODE and user_id:
            return _user_data_dir(user_id)
        return DATA_DIR

    def _get_conv_dir(self, user_id=None):
        if PUBLIC_MODE and user_id:
            d = _user_conv_dir(user_id)
            os.makedirs(d, exist_ok=True)
            return d
        return CONV_DIR

    def _auth_required(self):
        """In public mode, validate Bearer token. Return user_id or None (sends 401)."""
        if not PUBLIC_MODE:
            return '__local__'
        auth = self.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            self._json_response({'error': '未登录'}, 401)
            return None
        token = auth[7:]
        user_id = _find_user_by_token(token)
        if not user_id:
            self._json_response({'error': 'Token 无效'}, 401)
            return None
        return user_id

    # ── GET ────────────────────────────────────────────────
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/config':
            self._handle_config()
        elif path == '/api/auth/me':
            self._handle_auth_me()
        elif path == '/api/settings':
            user_id = self._auth_required()
            if not user_id:
                return
            if PUBLIC_MODE:
                # Return server-preset settings (read-only)
                self._json_response({
                    'defaultApiProfileId': '__server__',
                    'defaultModel': API_MODEL,
                    'defaultPersona': DEFAULT_PERSONA,
                    'summaryInterval': 100,
                    'exportFormat': 'md',
                    'articleWordCount': 700,
                    'summaryWordCount': 200,
                })
            else:
                self._json_response(read_json(os.path.join(DATA_DIR, 'settings.json'), {}))
        elif path == '/api/profiles':
            user_id = self._auth_required()
            if not user_id:
                return
            if PUBLIC_MODE:
                self._json_response({
                    '__server__': {
                        'id': '__server__',
                        'name': 'Server',
                        'provider': 'server-proxy',
                        'apiKey': '',
                        'baseUrl': '',
                        'maxTokens': API_MAX_TOKENS,
                    }
                })
            else:
                self._json_response(read_json(os.path.join(DATA_DIR, 'profiles.json'), {}))
        elif path == '/api/conversations':
            user_id = self._auth_required()
            if not user_id:
                return
            self._json_response(self._get_all_conversations(user_id))
        elif path.startswith('/api/conversations/'):
            user_id = self._auth_required()
            if not user_id:
                return
            conv_id = path.split('/')[-1]
            conv_dir = self._get_conv_dir(user_id)
            data = read_json(os.path.join(conv_dir, f'{conv_id}.json'))
            if data:
                self._json_response(data)
            else:
                self._json_response({'error': 'not found'}, 404)
        else:
            super().do_GET()

    # ── POST ───────────────────────────────────────────────
    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path

        if path == '/api/auth/login':
            self._handle_login()
        elif path == '/api/chat/stream':
            self._handle_chat_stream()
        elif path == '/api/chat':
            self._handle_chat()
        else:
            self._json_response({'error': 'not found'}, 404)

    # ── PUT ────────────────────────────────────────────────
    def do_PUT(self):
        path = urllib.parse.urlparse(self.path).path
        body = self._read_body()
        if body is None:
            return

        user_id = self._auth_required()
        if not user_id:
            return

        if path == '/api/settings':
            if PUBLIC_MODE:
                self._json_response({'ok': True})  # ignore in public mode
            else:
                write_json(os.path.join(DATA_DIR, 'settings.json'), body)
                self._json_response({'ok': True})
        elif path == '/api/profiles':
            if PUBLIC_MODE:
                self._json_response({'ok': True})  # ignore
            else:
                write_json(os.path.join(DATA_DIR, 'profiles.json'), body)
                self._json_response({'ok': True})
        elif path.startswith('/api/conversations/'):
            conv_id = path.split('/')[-1]
            conv_dir = self._get_conv_dir(user_id)
            write_json(os.path.join(conv_dir, f'{conv_id}.json'), body)
            self._json_response({'ok': True})
        else:
            self._json_response({'error': 'not found'}, 404)

    # ── DELETE ─────────────────────────────────────────────
    def do_DELETE(self):
        path = urllib.parse.urlparse(self.path).path

        user_id = self._auth_required()
        if not user_id:
            return

        if path.startswith('/api/conversations/'):
            conv_id = path.split('/')[-1]
            conv_dir = self._get_conv_dir(user_id)
            filepath = os.path.join(conv_dir, f'{conv_id}.json')
            try:
                os.remove(filepath)
            except FileNotFoundError:
                pass
            self._json_response({'ok': True})
        else:
            self._json_response({'error': 'not found'}, 404)

    # ── Config endpoint (no auth) ──────────────────────────
    def _handle_config(self):
        self._json_response({
            'mode': 'public' if PUBLIC_MODE else 'local',
            'provider': API_PROVIDER if PUBLIC_MODE else 'openai',
            'defaultModel': API_MODEL if PUBLIC_MODE else '',
        })

    # ── Auth endpoints ─────────────────────────────────────
    def _handle_login(self):
        if not PUBLIC_MODE:
            self._json_response({'error': '本地模式不需要登录'}, 400)
            return

        body = self._read_body()
        if body is None:
            return

        invite_code = (body.get('inviteCode') or '').strip()
        username = (body.get('username') or '').strip()

        if not username:
            self._json_response({'error': '请填写用户名'}, 400)
            return

        # Sanitize username (alphanumeric + CJK + underscore/hyphen, 2-20 chars)
        safe = ''.join(c for c in username if c.isalnum() or c in '_-' or '\u4e00' <= c <= '\u9fff')
        if len(safe) < 2 or len(safe) > 20:
            self._json_response({'error': '用户名长度需要2-20个字符'}, 400)
            return
        username = safe

        with _users_lock:
            users = _load_users()
            if username in users:
                # Existing user: just return token (no invite code needed)
                token = users[username]['token']
            elif invite_code:
                # New user registration: need valid & unused invite code
                if invite_code not in INVITE_CODES:
                    self._json_response({'error': '邀请码无效'}, 403)
                    return
                # Check invite code not already used by another user
                for u, info in users.items():
                    if info.get('inviteCode') == invite_code:
                        self._json_response({'error': '该邀请码已被使用'}, 403)
                        return
                token = secrets.token_hex(32)
                users[username] = {
                    'inviteCode': invite_code,
                    'token': token,
                    'createdAt': date.today().isoformat(),
                }
                _save_users(users)
                os.makedirs(_user_conv_dir(username), exist_ok=True)
            else:
                # No invite code and user doesn't exist
                self._json_response({'error': '新用户请填写邀请码'}, 403)
                return

        self._json_response({'ok': True, 'token': token, 'username': username})

    def _handle_auth_me(self):
        if not PUBLIC_MODE:
            self._json_response({'ok': True, 'username': 'local', 'usage': 0, 'limit': 0})
            return

        user_id = self._auth_required()
        if not user_id:
            return

        usage = _get_usage_today(user_id)
        self._json_response({
            'ok': True,
            'username': user_id,
            'usage': usage,
            'limit': DAILY_LIMIT,
        })

    # ── Chat proxy endpoints ───────────────────────────────
    def _handle_chat_stream(self):
        if not PUBLIC_MODE:
            self._json_response({'error': '本地模式不支持代理'}, 400)
            return

        user_id = self._auth_required()
        if not user_id:
            return

        # Rate limit
        allowed, remaining = _check_rate_limit(user_id)
        if not allowed:
            self._json_response({'error': f'今日请求已达上限 ({DAILY_LIMIT}次)'}, 429)
            return

        body = self._read_body()
        if body is None:
            return

        model = body.get('model') or API_MODEL
        system_prompt = body.get('systemPrompt', '')
        messages = body.get('messages', [])

        url = _build_upstream_url(model, stream=True)
        headers = _build_upstream_headers()
        upstream_body = _build_upstream_body(model, system_prompt, messages, stream=True)

        try:
            parsed = urllib.parse.urlparse(url)
            if parsed.scheme == 'https':
                ctx = ssl.create_default_context()
                conn = http.client.HTTPSConnection(parsed.hostname, parsed.port or 443, context=ctx, timeout=60)
            else:
                conn = http.client.HTTPConnection(parsed.hostname, parsed.port or 80, timeout=60)

            path_and_query = parsed.path
            if parsed.query:
                path_and_query += '?' + parsed.query

            conn.request('POST', path_and_query, json.dumps(upstream_body).encode('utf-8'), headers)
            upstream_res = conn.getresponse()

            if upstream_res.status != 200:
                error_body = upstream_res.read().decode('utf-8', errors='replace')
                self._json_response({'error': f'Upstream error: {upstream_res.status} {error_body[:500]}'}, upstream_res.status)
                conn.close()
                return

            # Stream SSE to client
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream; charset=utf-8')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            while True:
                chunk = upstream_res.read(4096)
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                    self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError):
                    break

            conn.close()

        except Exception as e:
            try:
                self._json_response({'error': f'Proxy error: {str(e)}'}, 502)
            except Exception:
                pass

    def _handle_chat(self):
        """Non-streaming chat proxy (used for summary merge)."""
        if not PUBLIC_MODE:
            self._json_response({'error': '本地模式不支持代理'}, 400)
            return

        user_id = self._auth_required()
        if not user_id:
            return

        allowed, remaining = _check_rate_limit(user_id)
        if not allowed:
            self._json_response({'error': f'今日请求已达上限 ({DAILY_LIMIT}次)'}, 429)
            return

        body = self._read_body()
        if body is None:
            return

        model = body.get('model') or API_MODEL
        system_prompt = body.get('systemPrompt', '')
        messages = body.get('messages', [])

        url = _build_upstream_url(model, stream=False)
        headers = _build_upstream_headers()
        upstream_body = _build_upstream_body(model, system_prompt, messages, stream=False)

        try:
            parsed = urllib.parse.urlparse(url)
            if parsed.scheme == 'https':
                ctx = ssl.create_default_context()
                conn = http.client.HTTPSConnection(parsed.hostname, parsed.port or 443, context=ctx, timeout=120)
            else:
                conn = http.client.HTTPConnection(parsed.hostname, parsed.port or 80, timeout=120)

            path_and_query = parsed.path
            if parsed.query:
                path_and_query += '?' + parsed.query

            conn.request('POST', path_and_query, json.dumps(upstream_body).encode('utf-8'), headers)
            upstream_res = conn.getresponse()
            response_body = upstream_res.read().decode('utf-8', errors='replace')
            conn.close()

            if upstream_res.status != 200:
                self._json_response({'error': f'Upstream error: {upstream_res.status}'}, upstream_res.status)
                return

            data = json.loads(response_body)
            content, usage = _parse_non_stream_response(data)
            self._json_response({'ok': True, 'content': content, 'usage': usage})

        except Exception as e:
            self._json_response({'error': f'Proxy error: {str(e)}'}, 502)

    # ── Conversation helpers ───────────────────────────────
    def _get_all_conversations(self, user_id=None):
        conv_dir = self._get_conv_dir(user_id)
        result = {}
        if not os.path.isdir(conv_dir):
            return result
        for fname in os.listdir(conv_dir):
            if fname.endswith('.json'):
                data = read_json(os.path.join(conv_dir, fname))
                if data and 'id' in data:
                    result[data['id']] = data
        return result

    # ── JSON / body helpers ────────────────────────────────
    def _read_body(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            raw = self.rfile.read(length)
            return json.loads(raw)
        except (json.JSONDecodeError, ValueError) as e:
            self._json_response({'error': f'Invalid JSON: {e}'}, 400)
            return None

    def _json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def log_message(self, format, *args):
        if '/api/' in (args[0] if args else ''):
            super().log_message(format, *args)


# ── Main ────────────────────────────────────────────────────
if __name__ == '__main__':
    ensure_dirs()

    if PUBLIC_MODE:
        server = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), AirpHandler)
        print(f'AIRP Server running in PUBLIC mode on http://0.0.0.0:{PORT}')
        print(f'  Provider: {API_PROVIDER}')
        print(f'  Model: {API_MODEL}')
        print(f'  Daily limit: {DAILY_LIMIT}/user')
        print(f'  Invite codes: {len(INVITE_CODES)}')
    else:
        server = http.server.HTTPServer(('0.0.0.0', PORT), AirpHandler)
        print(f'AIRP Server running in LOCAL mode on http://0.0.0.0:{PORT}')

    print(f'Data directory: {DATA_DIR}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutdown.')
        server.server_close()
