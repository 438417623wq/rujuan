#!/usr/bin/env python3
"""
AIRP Server - Static files + JSON storage API
Usage: python3 server.py [port]
"""

import http.server
import json
import os
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
CONV_DIR = os.path.join(DATA_DIR, 'conversations')


def ensure_dirs():
    os.makedirs(CONV_DIR, exist_ok=True)


def read_json(path, default=None):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


class AirpHandler(http.server.SimpleHTTPRequestHandler):
    """Serves static files and handles /api/* routes."""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/settings':
            self._json_response(read_json(os.path.join(DATA_DIR, 'settings.json'), {}))
        elif path == '/api/profiles':
            self._json_response(read_json(os.path.join(DATA_DIR, 'profiles.json'), {}))
        elif path == '/api/conversations':
            self._json_response(self._get_all_conversations())
        elif path.startswith('/api/conversations/'):
            conv_id = path.split('/')[-1]
            data = read_json(os.path.join(CONV_DIR, f'{conv_id}.json'))
            if data:
                self._json_response(data)
            else:
                self._json_response({'error': 'not found'}, 404)
        else:
            super().do_GET()

    def do_PUT(self):
        path = urllib.parse.urlparse(self.path).path
        body = self._read_body()
        if body is None:
            return

        if path == '/api/settings':
            write_json(os.path.join(DATA_DIR, 'settings.json'), body)
            self._json_response({'ok': True})
        elif path == '/api/profiles':
            write_json(os.path.join(DATA_DIR, 'profiles.json'), body)
            self._json_response({'ok': True})
        elif path.startswith('/api/conversations/'):
            conv_id = path.split('/')[-1]
            write_json(os.path.join(CONV_DIR, f'{conv_id}.json'), body)
            self._json_response({'ok': True})
        else:
            self._json_response({'error': 'not found'}, 404)

    def do_DELETE(self):
        path = urllib.parse.urlparse(self.path).path
        if path.startswith('/api/conversations/'):
            conv_id = path.split('/')[-1]
            filepath = os.path.join(CONV_DIR, f'{conv_id}.json')
            try:
                os.remove(filepath)
                self._json_response({'ok': True})
            except FileNotFoundError:
                self._json_response({'ok': True})  # idempotent
        else:
            self._json_response({'error': 'not found'}, 404)

    def _get_all_conversations(self):
        result = {}
        if not os.path.isdir(CONV_DIR):
            return result
        for fname in os.listdir(CONV_DIR):
            if fname.endswith('.json'):
                data = read_json(os.path.join(CONV_DIR, fname))
                if data and 'id' in data:
                    result[data['id']] = data
        return result

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
        self.send_header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        if '/api/' in (args[0] if args else ''):
            super().log_message(format, *args)


if __name__ == '__main__':
    ensure_dirs()
    server = http.server.HTTPServer(('0.0.0.0', PORT), AirpHandler)
    print(f'AIRP Server running on http://0.0.0.0:{PORT}')
    print(f'Data directory: {DATA_DIR}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutdown.')
        server.server_close()
