/* NikaImprimir — botón y hoja A4 con el estilo NikaMed para imprimir / «Guardar como PDF» los resultados de los simuladores.
   hoja({titulo, sub, nota, pilares:[{n, c, v}], cuerpo, estilosPagina}) abre el diálogo de impresión en un iframe aislado. */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const ICONO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9V3h10v6"/><rect class="papel" x="7" y="14" width="10" height="7" rx="1" fill="rgba(255,255,255,.35)"/><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/></svg>';
  const color = (v) => (v >= 8 ? '#16a34a' : v >= 6 ? '#d97706' : '#dc2626');

  function boton(etiqueta, onclick, extra) {
    return '<button type="button" class="nk-print' + (extra ? ' ' + extra : '') + '" onclick="' + onclick + '"><span class="nk-print-ic">' + ICONO + '</span><span>' + esc(etiqueta) + '</span></button>';
  }

  // Gráfico de araña de los 4 pilares (valores 0-10, null = no aplicó)
  function radar(pilares) {
    const cx = 120, cy = 120, R = 82, ang = [-90, 0, 90, 180].map((a) => a * Math.PI / 180);
    const pt = (i, v) => (cx + R * (v / 10) * Math.cos(ang[i])).toFixed(1) + ',' + (cy + R * (v / 10) * Math.sin(ang[i])).toFixed(1);
    const anillos = [2.5, 5, 7.5, 10].map((v) => '<polygon points="' + [0, 1, 2, 3].map((i) => pt(i, v)).join(' ') + '" fill="none" stroke="#c7d2fe" stroke-width="1"/>').join('');
    const ejes = [0, 1, 2, 3].map((i) => { const q = pt(i, 10).split(','); return '<line x1="120" y1="120" x2="' + q[0] + '" y2="' + q[1] + '" stroke="#c7d2fe"/>'; }).join('');
    const poli = '<polygon points="' + [0, 1, 2, 3].map((i) => pt(i, pilares[i].v || 0)).join(' ') + '" fill="#6366f1" fill-opacity=".25" stroke="#4338ca" stroke-width="2.5"/>';
    const pos = [{ x: 120, y: 14, a: 'middle' }, { x: 234, y: 124, a: 'end' }, { x: 120, y: 238, a: 'middle' }, { x: 6, y: 124, a: 'start' }];
    const et = pos.map((p, i) => '<text x="' + p.x + '" y="' + p.y + '" text-anchor="' + p.a + '" font-size="11" font-weight="700" fill="#475569">' + esc(pilares[i].c || pilares[i].n) + '</text>').join('');
    return '<svg viewBox="0 0 240 246" style="width:100%;max-width:240px">' + anillos + ejes + poli + et + '</svg>';
  }

  function panelPilares(pilares) {
    if (!pilares || pilares.length !== 4) return '';
    const barras = pilares.map((p) => '<div class="np-pil"><div class="np-pil-h"><span>' + esc(p.n) + '</span><b style="color:' + (p.v == null ? '#64748b' : color(p.v)) + '">' + (p.v == null ? 'No aplicó' : String(Math.round(p.v * 10) / 10).replace('.', ',') + ' / 10') + '</b></div><div class="np-tr"><i style="width:' + (p.v == null ? 0 : p.v * 10) + '%;background:' + (p.v == null ? '#cbd5e1' : color(p.v)) + '"></i></div></div>').join('');
    return '<section class="np-panel"><h2>Los 4 pilares</h2><div class="np-pgrid"><div>' + radar(pilares) + '</div><div>' + barras + '</div></div></section>';
  }

  function hoja(o) {
    const estilos = o.estilosPagina ? Array.from(document.querySelectorAll('style,link[rel="stylesheet"]')).map((e) => e.outerHTML).join('') : '';
    const css = '<style>:root{--border:#e2e8f0;--text-main:#1e293b;--text-muted:#64748b;--card-bg:#fff;--bg-body:#fff;--bg-main:#fff;--success:#16a34a;--danger:#dc2626;--warning:#d97706;--nika-primary:#6366f1}' +
      '@page{size:A4;margin:14mm 12mm}*{box-sizing:border-box}html,body{background:#fff!important;color:#1e293b!important;font-family:Segoe UI,Arial,sans-serif;font-size:12px;line-height:1.5;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      'body::before,body::after{display:none!important}.np-hd{background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;border-radius:14px;padding:18px 20px;display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:14px}' +
      '.np-hd h1{margin:0;font-size:20px;color:#fff}.np-hd p{margin:3px 0 0;opacity:.92;font-size:11px}.np-nota{background:#fff;color:#4338ca;border-radius:12px;padding:8px 16px;text-align:center;font-weight:900;font-size:24px;white-space:nowrap}' +
      '.np-panel{border:1px solid #ddd6fe;background:#f5f3ff;border-radius:12px;padding:12px 14px;margin-bottom:14px;break-inside:avoid}.np-panel h2{margin:0 0 6px;font-size:14px;color:#4338ca}.np-pgrid{display:grid;grid-template-columns:240px 1fr;gap:14px;align-items:center}' +
      '.np-pil{margin-bottom:9px}.np-pil-h{display:flex;justify-content:space-between;font-weight:700;margin-bottom:3px}.np-tr{height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden}.np-tr i{display:block;height:100%;border-radius:99px}' +
      '.esc-card,.pilar-card,.feedback-box,.esc-alerta,.np-it{break-inside:avoid}.np-ft{margin-top:14px;padding-top:8px;border-top:2px solid #c7d2fe;font-size:10px;color:#6b7280;text-align:center}.np-ft b{color:#4338ca}' + (o.css || '') + '</style>';
    const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    const html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>NikaMed · ' + esc(o.titulo) + '</title>' + estilos + css + '</head><body>' +
      '<div class="np-hd"><div><h1>⚕️ NikaMed · ' + esc(o.titulo) + '</h1><p>' + esc(fecha) + (o.sub ? ' · ' + esc(o.sub) : '') + '</p></div><div class="np-nota">' + esc(o.nota) + ' / 10</div></div>' +
      panelPilares(o.pilares) + (o.cuerpo || '') +
      '<div class="np-ft"><b>nikamed.com.ar</b> · ' + esc(o.pie || 'Corrección orientativa hecha por IA; material educativo que no reemplaza la bibliografía ni el criterio clínico.') + '</div></body></html>';
    if (window.NikaPdf) { window.NikaPdf.imprimir(html, 'nikamed-' + (o.titulo || 'resultados')); return; }
    const fr = document.createElement('iframe');
    fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(fr);
    fr.contentDocument.open(); fr.contentDocument.write(html); fr.contentDocument.close();
    setTimeout(() => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (_) { alert('No se pudo abrir la impresión.'); } setTimeout(() => fr.remove(), 60000); }, 600);
  }

  window.NikaImprimir = { boton, hoja, radar, esc };
})();
