# build-web.ps1 — Bundles renderer/* into:
#   Homeboard.html        (standalone single-file, for Windows/USB)
#   docs/index.html       (PWA version, for GitHub Pages / Chromebook install)
# Run from the homeboard\ directory: .\build-web.ps1
# Keep this file saved as UTF-8 *with BOM*: Windows PowerShell reads BOM-less scripts as ANSI and garbles any non-ASCII text.

$dir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$css  = Get-Content "$dir\renderer\styles.css"  -Raw -Encoding UTF8
$js   = Get-Content "$dir\renderer\renderer.js"  -Raw -Encoding UTF8
$html = Get-Content "$dir\renderer\index.html"   -Raw -Encoding UTF8

# ── Web compatibility shim (replaces Electron IPC) ──────────────────
$shim = @'
<script>
(function () {
  'use strict';

  async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const km = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }
  const toB64 = u => btoa(String.fromCharCode(...u));
  const frB64 = s => new Uint8Array(atob(s).split('').map(c => c.charCodeAt(0)));

  async function hbEncrypt(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await deriveKey(password, salt);
    const buf  = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, new TextEncoder().encode(plaintext)));
    return { s: toB64(salt), i: toB64(iv), t: toB64(buf.slice(-16)), d: toB64(buf.slice(0, -16)) };
  }

  async function hbDecrypt(obj, password) {
    try {
      const salt = frB64(obj.s), iv = frB64(obj.i);
      const key  = await deriveKey(password, salt);
      const combined = new Uint8Array([...frB64(obj.d), ...frB64(obj.t)]);
      return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, combined));
    } catch { return null; }
  }

  const STORAGE_KEY = 'hb-data';
  function loadData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  }
  function saveData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch(e) {
      console.warn('Save failed (storage full?)', e); return false;
    }
  }

  function openFilePicker(accept) {
    return new Promise(resolve => {
      const input = Object.assign(document.createElement('input'), { type: 'file', accept: accept });
      input.style.display = 'none';
      document.body.appendChild(input);
      let resolved = false;
      const done = val => {
        if (resolved) return; resolved = true;
        try { document.body.removeChild(input); } catch {}
        resolve(val);
      };
      input.onchange = () => {
        const file = input.files[0];
        if (!file) { done(null); return; }
        const reader = new FileReader();
        reader.onload  = () => done(reader.result);
        reader.onerror = () => done(null);
        reader.readAsDataURL(file);
      };
      window.addEventListener('focus', function onFocus() {
        window.removeEventListener('focus', onFocus);
        setTimeout(() => done(null), 500);
      }, { once: true });
      input.click();
    });
  }

  function openApp() {
    const t = Object.assign(document.createElement('div'), { textContent: 'App launch is not available in browser mode' });
    Object.assign(t.style, { position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
      background:'#1c1916', color:'#e8e0d8', padding:'10px 20px', borderRadius:'8px',
      zIndex:'9999', fontSize:'13px', pointerEvents:'none' });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
    return Promise.resolve();
  }

  const noop = () => Promise.resolve();

  function exportData(json) {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([json], { type: 'application/json' })),
      download: 'homeboard-backup-' + new Date().toISOString().slice(0, 10) + '.json',
    });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return Promise.resolve(true);
  }

  function importData() {
    return new Promise(resolve => {
      const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json,application/json' });
      input.style.display = 'none';
      document.body.appendChild(input);
      input.onchange = () => {
        const file = input.files[0]; input.remove();
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      };
      input.click();
    });
  }

  window.hb = {
    loadData:       () => Promise.resolve(loadData()),
    saveData:       data => Promise.resolve(saveData(data)),
    saveDataSync:   saveData,
    exportData:     exportData,
    importData:     importData,
    openApp:        openApp,
    minimize:       noop, maximize: noop, close: noop, setStartup: noop,
    openImage:      () => openFilePicker('image/*'),
    openBoardImage: () => openFilePicker('image/*'),
    openShortcutIcon: () => openFilePicker('image/*'),
    pickApp:        () => Promise.resolve(null),
    fileIcon:       () => Promise.resolve(null),
    encrypt:        (t, p) => hbEncrypt(t, p),
    decrypt:        (o, p) => hbDecrypt(o, p),
  };

  // Desktop-only bits: window buttons, start-with-Windows, app shortcuts
  document.addEventListener('DOMContentLoaded', () => {
    const wc = document.getElementById('win-controls');
    if (wc) wc.style.display = 'none';
    const su = document.getElementById('setting-startup');
    if (su) { const row = su.closest('.setting-row'); if (row) row.style.display = 'none'; }
    const appsWidget = document.getElementById('widget-apps');
    if (appsWidget) appsWidget.style.display = 'none';
    const sc = document.getElementById('shortcuts-list');
    if (sc) { const sec = sc.closest('.settings-section'); if (sec) sec.style.display = 'none'; }
  });
})();
</script>
'@

# ── PWA extras injected into the <head> ─────────────────────────────
$pwaHead = @'
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#1c1916">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Homeboard">
  <link rel="apple-touch-icon" href="icon-192.png">
'@

# ── Service worker registration injected before </body> ──────────────
$swReg = @'
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW:', e));
  });
}
</script>
'@

# ── Build the shared base (CSS + shim + JS inlined) ──────────────────
$cssBlock = "<style>`r`n$css`r`n</style>"
$jsBlock  = "<script>`r`n$js`r`n</script>"

$base = $html
$base = $base.Replace('<link rel="stylesheet" href="styles.css">', $cssBlock)
$base = $base.Replace('<script src="renderer.js"></script>', "$shim`r`n$jsBlock")

# ── 1. Standalone single file (no PWA, works from USB/file://) ───────
$standalone = $base
[System.IO.File]::WriteAllText("$dir\Homeboard.html", $standalone, [System.Text.Encoding]::UTF8)
$kb1 = [math]::Round((Get-Item "$dir\Homeboard.html").Length / 1024)
Write-Host "Homeboard.html ($kb1 KB) - standalone"

# ── 2. PWA version for GitHub Pages ──────────────────────────────────
$pwa = $base
$pwa = $pwa.Replace('</head>', "$pwaHead`r`n</head>")
$pwa = $pwa.Replace('</body>', "$swReg`r`n</body>")

New-Item -ItemType Directory -Force -Path "$dir\docs" | Out-Null
[System.IO.File]::WriteAllText("$dir\docs\index.html", $pwa, [System.Text.Encoding]::UTF8)
$kb2 = [math]::Round((Get-Item "$dir\docs\index.html").Length / 1024)
Write-Host "docs/index.html ($kb2 KB) - PWA (GitHub Pages)"
