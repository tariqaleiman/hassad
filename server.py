#!/usr/bin/env python3
"""
حصاد — Local Fallback Server
NOTE: Firebase Realtime Database is now the primary data store for this app.
This local server is only used as a secondary fallback if Firebase is
unreachable (e.g. fully offline with no prior localStorage cache).
Run: python server.py
Then open: http://localhost:8080
Data saved to hassad_data.json (same folder as this script).
"""
import http.server, json, os, sys
from pathlib import Path

DATA_FILE = Path(__file__).parent / "hassad_data.json"
PORT = int(os.environ.get("PORT", 8080))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args): pass  # silent

    def do_GET(self):
        if self.path == "/api/db":
            if DATA_FILE.exists():
                body = DATA_FILE.read_bytes()
            else:
                body = b"{}"
            self.send_response(200)
            self.send_header("Content-Type","application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin","*")
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/db":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                json.loads(body)  # validate
                DATA_FILE.write_bytes(body)
                self.send_response(200)
                self.send_header("Content-Type","application/json")
                self.send_header("Access-Control-Allow-Origin","*")
                self.end_headers()
                self.wfile.write(b'{"ok":true}')
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(f'{{"error":"{e}"}}'.encode())
        else:
            self.send_response(404); self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type")
        self.end_headers()

if __name__ == "__main__":
    os.chdir(Path(__file__).parent)
    print(f"✅ حصاد يعمل على: http://localhost:{PORT}")
    print(f"📁 ملف البيانات: {DATA_FILE}")
    print("اضغط Ctrl+C للإيقاف")
    http.server.HTTPServer(("", PORT), Handler).serve_forever()
