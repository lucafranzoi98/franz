#!/usr/bin/env python3
"""Server di prova con gli URL "puliti" come su Netlify (/percorsi/25km -> percorsi/25km.html).
Uso: python3 _build/serve.py   poi apri http://localhost:8765"""
import http.server, os, socketserver

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path, _, query = self.path.partition("?")
        clean = path.rstrip("/")
        if clean and not os.path.splitext(clean)[1] and os.path.isfile(os.path.join(ROOT, clean.lstrip("/") + ".html")):
            self.path = clean + ".html" + ("?" + query if query else "")
        elif not os.path.exists(os.path.join(ROOT, path.split("#")[0].lstrip("/"))):
            self.path = "/404.html"
        return super().send_head()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", 8765), Handler) as s:
    print("http://localhost:8765")
    s.serve_forever()
