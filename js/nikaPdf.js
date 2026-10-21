/* NikaPdf · "Imprimir" que funciona en TODOS los dispositivos.
   · Computadora: abre el diálogo de impresión del navegador (guardar como PDF o imprimir), como siempre.
   · Celular / tablet: los navegadores móviles NO imprimen desde un iframe (iPhone/Android no mostraban nada), así que se genera un
     PDF real (A4) en el dispositivo y se descarga / abre para guardarlo o compartirlo.
   Uso: NikaPdf.imprimir(htmlCompleto, 'nombre-del-archivo') — llamarlo directo desde el clic del usuario. */
(function () {
  'use strict';
  const LIB = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  const ua = () => navigator.userAgent || '';
  const esIOS = () => /iPhone|iPad|iPod/i.test(ua()) || (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.platform || ''));
  const esMovil = () => esIOS() || /Android|Mobile|Silk/i.test(ua()) || (window.matchMedia && matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) < 900);
  const aviso = (m) => { try { if (typeof window.showToast === 'function') window.showToast(m); } catch (_) {} };
  const slug = (t) => String(t || 'nikamed').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'nikamed';

  function cargarLib() {
    if (window.html2pdf) return Promise.resolve();
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = LIB; s.crossOrigin = 'anonymous';
      const t = setTimeout(() => ko(new Error('tiempo agotado')), 20000);
      s.onload = () => { clearTimeout(t); ok(); };
      s.onerror = () => { clearTimeout(t); ko(new Error('no cargó la librería')); };
      document.head.appendChild(s);
    });
  }

  // Computadora: impresión nativa desde un iframe oculto
  function imprimirIframe(html) {
    const fr = document.createElement('iframe');
    fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(fr);
    fr.contentDocument.open(); fr.contentDocument.write(html); fr.contentDocument.close();
    setTimeout(() => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (_) { aviso('No se pudo abrir la impresión.'); } setTimeout(() => fr.remove(), 60000); }, 500);
  }

  async function generarPdf(html, nombre) {
    const fr = document.createElement('iframe');
    fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;background:#fff;visibility:hidden';
    document.body.appendChild(fr);
    try {
      fr.contentDocument.open(); fr.contentDocument.write(html); fr.contentDocument.close();
      await new Promise((r) => setTimeout(r, 700));                       // estilos e imágenes del documento
      const doc = fr.contentDocument, body = doc.body;
      fr.style.height = Math.max(1123, body.scrollHeight + 40) + 'px';
      fr.style.visibility = 'visible';
      const worker = window.html2pdf().set({
        margin: [10, 8, 12, 8], filename: nombre,
        image: { type: 'jpeg', quality: 0.88 },
        html2canvas: { scale: 1.7, useCORS: true, backgroundColor: '#ffffff', windowWidth: 794, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.q', '.np-it', '.esc-card', '.pilar-card', '.n', '.hoja', 'li', 'tr'] },
      }).from(body);
      return await worker.outputPdf('blob');
    } finally { fr.remove(); }
  }

  async function imprimir(html, titulo) {
    if (!esMovil()) { imprimirIframe(html); return; }
    const nombre = slug(titulo) + '.pdf';
    // iPhone: Safari solo deja abrir una pestaña si se pide dentro del toque; se abre ya y se completa cuando el PDF está listo
    let ventana = null;
    if (esIOS()) {
      try { ventana = window.open('', '_blank'); if (ventana) ventana.document.write('<meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui,sans-serif;padding:28px;text-align:center;color:#334155"><h3>Generando tu PDF…</h3><p>Esperá unos segundos.</p></body>'); } catch (_) { ventana = null; }
    }
    aviso('📄 Generando tu PDF…');
    try {
      await cargarLib();
      const blob = await generarPdf(html, nombre);
      const url = URL.createObjectURL(blob);
      if (ventana && !ventana.closed) { ventana.location.href = url; aviso('✅ PDF listo: guardalo o compartilo desde el menú del navegador.'); }
      else {
        const a = document.createElement('a'); a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
        aviso('✅ PDF descargado (revisá tus descargas).');
        if (esIOS()) setTimeout(() => { try { window.open(url, '_blank'); } catch (_) {} }, 500);
      }
      setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
    } catch (e) {
      console.warn('[NikaPdf]', e && e.message);
      // Sin conexión o sin librería: se abre la hoja en una pestaña para guardarla desde el menú del navegador
      try {
        const u = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        if (ventana && !ventana.closed) ventana.location.href = u; else window.open(u, '_blank');
        aviso('No se pudo armar el PDF: se abrió la hoja para que la guardes o compartas desde el navegador.');
      } catch (_) { aviso('No se pudo generar el PDF. Probá de nuevo con buena conexión.'); if (ventana) try { ventana.close(); } catch (__) {} }
    }
  }

  window.NikaPdf = { imprimir, esMovil, slug };
})();
