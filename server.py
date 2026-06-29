# -*- coding: utf-8 -*-
"""KMBA菁英計畫 2026 AI Chatbot — local web server."""
from __future__ import annotations

import json
import mimetypes
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(DIR))

from kb_engine import KB  # noqa: E402

PORT = 8788
HOST = "127.0.0.1"


class ChatHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _file(self, path: Path) -> None:
        if not path.is_file():
            self.send_error(404)
            return
        data = path.read_bytes()
        ctype = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path in ("/", "/index.html", "/chat"):
            self._file(DIR / "index.html")
            return
        if path == "/api/health":
            self._json(200, {"ok": True, "kb": KB.path.name, "mode": "lang-auto"})
            return
        if path == "/api/suggestions":
            self._json(200, {"suggestions": KB.get_suggestions()})
            return
        candidate = DIR / path.lstrip("/")
        if candidate.is_file():
            self._file(candidate)
            return
        self.send_error(404)

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path != "/api/chat":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            self._json(400, {"error": "Invalid JSON"})
            return
        message = str(data.get("message", "")).strip()
        self._json(200, KB.answer(message))


def main() -> None:
    KB.reload()
    server = ThreadingHTTPServer((HOST, PORT), ChatHandler)
    url = f"http://{HOST}:{PORT}/"
    print("KMBA菁英計畫 2026 AI Chatbot（中文/英文自動切換）")
    print(f"Knowledge Base: {KB.path.name}")
    print(f"Open: {url}")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
