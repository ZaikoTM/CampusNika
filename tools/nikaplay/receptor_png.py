# -*- coding: utf-8 -*-
"""Receptor local para guardar los PNG que renderiza tools/nikaplay/doctor3d/index.html.
Uso (solo desarrollo):  python tools/nikaplay/receptor_png.py
Escucha en http://localhost:5518 y guarda POST /guardar?nombre=doctor-idle.png en tools/nikaplay/doctor3d/render/ (luego tools/nikaplay/optimizar_doctor.py los pasa a assets).
Solo acepta nombres doctor-<pose>.png (sin rutas) y cuerpos PNG de hasta 40 MB."""
import os, re, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DESTINO = os.path.join(RAIZ, 'tools', 'nikaplay', 'doctor3d', 'render')   # PNG a resolución completa (no se versionan)
PERMITIDO = re.compile(r'^(doctor|prop)-[a-z0-9_]+\.png$')


class Receptor(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_POST(self):
        url = urlparse(self.path)
        nombre = (parse_qs(url.query).get('nombre') or [''])[0]
        if url.path != '/guardar' or not PERMITIDO.match(nombre):
            self.send_response(400); self._cors(); self.end_headers(); self.wfile.write(b'nombre no permitido'); return
        largo = int(self.headers.get('Content-Length') or 0)
        if largo <= 0 or largo > 40 * 1024 * 1024:
            self.send_response(413); self._cors(); self.end_headers(); return
        datos = self.rfile.read(largo)
        if not datos.startswith(b'\x89PNG\r\n\x1a\n'):
            self.send_response(415); self._cors(); self.end_headers(); self.wfile.write(b'no es PNG'); return
        os.makedirs(DESTINO, exist_ok=True)
        with open(os.path.join(DESTINO, nombre), 'wb') as f:
            f.write(datos)
        self.send_response(200); self._cors(); self.end_headers(); self.wfile.write(('guardado %s (%d bytes)' % (nombre, len(datos))).encode())
        print('guardado', nombre, len(datos))

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    print('Receptor en http://localhost:5518 -> ' + DESTINO)
    HTTPServer(('127.0.0.1', 5518), Receptor).serve_forever()
