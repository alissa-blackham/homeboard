'use strict';

// ═══════════════════════════════════════════════════════════════
// NAVIGATION — defined and exposed globally FIRST so onclick=""
// attributes in HTML always work, even before init() runs.
// ═══════════════════════════════════════════════════════════════

window.goHome = function () {
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  const nb = document.getElementById('nav-board');
  if (nb) nb.classList.add('active');
};

window.togglePanel = function (name) {
  const panel = document.getElementById('panel-' + name);
  if (!panel) return;
  const opening = panel.classList.contains('hidden');
  // Close everything first
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  const nb = document.getElementById('nav-board');
  if (nb) nb.classList.add('active');
  if (opening) {
    panel.classList.remove('hidden');
    const navBtn = document.querySelector('.nav-link[data-panel="' + name + '"]');
    if (navBtn) navBtn.classList.add('active');
    if (nb) nb.classList.remove('active');
    // Refresh diary lock screen text whenever panel opens
    if (name === 'journal') syncJournalUI();
  }
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const PINS = [
  { id:'none',    type:'none' },
  { id:'red',     color:'#c0392b', type:'disc' },
  { id:'blue',    color:'#2980b9', type:'disc' },
  { id:'teal',    color:'#16a085', type:'disc' },
  { id:'gold',    color:'#e6a817', type:'disc' },
  { id:'purple',  color:'#8e44ad', type:'disc' },
  { id:'rose',    color:'#d63384', type:'disc' },
  { id:'black',   color:'#2c2c2c', type:'disc' },
  { id:'rainbow', type:'rainbow' },
  { id:'star',    emoji:'⭐', type:'emoji' },
  { id:'bow',     emoji:'🎀', type:'emoji' },
  { id:'flower',  emoji:'🌸', type:'emoji' },
  { id:'heart',   emoji:'💝', type:'emoji' },
];

const NOTE_COLORS = [
  '#f5f0e8','#dce5d8','#cdd8e6','#e6d8cd',
  '#e8d5d5','#d8d0e8','#e8e6d8','#f0e0cc',
];

const KB_SHORTCUTS = [
  { keys:'Ctrl+Shift+H', label:'Home / close panel' },
  { keys:'Ctrl+Shift+B', label:'Browser' },
  { keys:'Ctrl+Shift+N', label:'Notes' },
  { keys:'Ctrl+Shift+T', label:'To-Do' },
  { keys:'Ctrl+Shift+V', label:'Vault' },
  { keys:'Ctrl+Shift+A', label:'New sticky note' },
  { keys:'Ctrl+Shift+I', label:'Add image pin' },
  { keys:'Ctrl+Shift+,', label:'Settings' },
  { keys:'Escape',       label:'Close panel' },
];

// ── Decoration Studio data ───────────────────────────────────────
const AESTHETIC_STICKERS = [
  '✦','✧','✶','✷','✸','✹','✺','✻','✼','✽','✾',
  '⭒','★','☆','✰','✯','⟡','◈','❋','❊','❉','❈','❇',
  '☽','☾','◐','◑','◒','◓',
  '♡','♥','❥','❣',
  '✿','❀','❁','⚘',
  '◆','◇','◉','◎','○','●','◯','⊹','⊕',
  '†','‡','§','⁂','※','✠',
  '∞','≋','≈',
  '⌘','⌂',
  '❦','❧','☙','❃','✤','✣','✢','✡','✙','✚',
  '◁','▷','△','▽','◬','◭','◮',
];

const WASHI_TAPES = [
  { id:'w-pink-dots',  label:'Pink Dots',     bg:'#f9c0cc', pattern:'dots'    },
  { id:'w-mint',       label:'Mint',          bg:'#b2dfdb', pattern:'none'    },
  { id:'w-lavender',   label:'Lavender',      bg:'#ce93d8', pattern:'dots'    },
  { id:'w-sage',       label:'Sage',          bg:'#a5d6a7', pattern:'stripes' },
  { id:'w-cream',      label:'Cream',         bg:'#fff8e1', pattern:'none'    },
  { id:'w-peach',      label:'Peach',         bg:'#ffccbc', pattern:'none'    },
  { id:'w-sky',        label:'Sky Blue',      bg:'#90caf9', pattern:'dots'    },
  { id:'w-rose',       label:'Rose',          bg:'#ef9a9a', pattern:'none'    },
  { id:'w-lemon',      label:'Lemon',         bg:'#fff176', pattern:'stripes' },
  { id:'w-lilac',      label:'Lilac',         bg:'#e1bee7', pattern:'floral'  },
  { id:'w-dark',       label:'Charcoal',      bg:'#546e7a', pattern:'none'    },
  { id:'w-rust',       label:'Rust',          bg:'#d4856a', pattern:'none'    },
  { id:'w-kraft',      label:'Kraft',         bg:'#c8a870', pattern:'none'    },
  { id:'w-blush',      label:'Blush',         bg:'#f8bbd0', pattern:'none'    },
  { id:'w-forest',     label:'Forest',        bg:'#81c784', pattern:'stripes' },
  { id:'w-denim',      label:'Denim',         bg:'#64b5f6', pattern:'none'    },
];

const AESTHETIC_CARDS = [
  { id:'c-sunset',     label:'Sunset',         css:'linear-gradient(135deg,#ff9a9e,#fad0c4 50%,#ffecd2)',    art:'' },
  { id:'c-dusk',       label:'Dusk',           css:'linear-gradient(150deg,#a18cd1,#fbc2eb)',                art:'' },
  { id:'c-ocean',      label:'Ocean',          css:'linear-gradient(180deg,#a8edea,#fed6e3)',                art:'' },
  { id:'c-midnight',   label:'Midnight',       css:'linear-gradient(135deg,#0c0c1e,#1a1a4e,#2d1b69)',       art:'✨'},
  { id:'c-lavender',   label:'Lavender Sky',   css:'linear-gradient(135deg,#e0c3fc,#8ec5fc)',               art:'' },
  { id:'c-sage',       label:'Sage Garden',    css:'linear-gradient(160deg,#d4e8d0,#b2c9b0,#8faf8c)',       art:'🌿'},
  { id:'c-cream',      label:'Cream Latte',    css:'linear-gradient(160deg,#fdfcfb,#f5e6d0,#e8d5b0)',       art:'' },
  { id:'c-peach',      label:'Peach Sorbet',   css:'linear-gradient(135deg,#ffecd2,#fcb69f)',               art:'' },
  { id:'c-moody',      label:'Moody Blue',     css:'linear-gradient(160deg,#536976,#292e49)',               art:'' },
  { id:'c-cherry',     label:'Cherry Blossom', css:'linear-gradient(160deg,#fce4ec,#f8bbd0,#f48fb1)',       art:'🌸'},
  { id:'c-autumn',     label:'Autumn',         css:'linear-gradient(160deg,#d4580a,#c47c28,#b8a040)',       art:'🍂'},
  { id:'c-darkacad',   label:'Dark Academia',  css:'linear-gradient(160deg,#2c1810,#4a2c1a,#6b3f25)',       art:'📚'},
  { id:'c-starry',     label:'Starry Night',   css:'linear-gradient(160deg,#0a0a2e,#1a1a6e,#2d2d9e)',       art:'⭐'},
  { id:'c-botanical',  label:'Botanical',      css:'linear-gradient(160deg,#2d5016,#4a7c2a,#6fa83d)',       art:'🌿'},
  { id:'c-cottagecore',label:'Cottagecore',    css:'linear-gradient(160deg,#c8a87a,#b89460,#a08050)',       art:'🍄'},
  { id:'c-rose',       label:'Rose Gold',      css:'linear-gradient(135deg,#f8e1e8,#e8c4d4,#d4a0c0)',       art:'' },
  { id:'c-ink',        label:'Ink Blue',       css:'linear-gradient(160deg,#1a237e,#283593,#3949ab)',       art:'' },
  { id:'c-moss',       label:'Moss',           css:'linear-gradient(160deg,#33691e,#558b2f,#7cb342)',       art:'' },
];

const IMAGE_FRAMES = [
  { id:'none',     label:'No Frame'  },
  { id:'polaroid', label:'Polaroid'  },
  { id:'vintage',  label:'Vintage'   },
  { id:'film',     label:'Film Strip'},
  { id:'passport', label:'Passport'  },
];

const NOTE_BORDERS = [
  { id:'none',       label:'None'        },
  { id:'ribbon',     label:'Pink Ribbon',  color:'#f9c0cc' },
  { id:'sage',       label:'Sage',         color:'#a5d6a7' },
  { id:'lavender',   label:'Lavender',     color:'#ce93d8' },
  { id:'kraft',      label:'Kraft',        color:'#c8a870' },
  { id:'gold',       label:'Gold',         color:'#f5d27d' },
];

// ── Widget settings schema ────────────────────────────────────────
const WIDGET_SETTINGS = {
  clock: [
    { key:'clockFormat',  label:'Time format',   type:'select', options:[{v:'24',l:'24-hour'},{v:'12',l:'12-hour'}] },
    { key:'clockSeconds', label:'Show seconds',  type:'toggle', default:true },
    { key:'clockDate',    label:'Show date line', type:'toggle', default:true },
  ],
  moon: [
    { key:'moonStyle',    label:'Display style', type:'select', options:[{v:'full',l:'Full (emoji + stats)'},{v:'compact',l:'Compact (emoji + name only)'}] },
    { key:'moonNextFull', label:'Show days to full moon', type:'toggle', default:true },
    { key:'moonAge',      label:'Show moon age', type:'toggle', default:true },
    { key:'moonIllum',    label:'Show illumination %', type:'toggle', default:true },
  ],
  pomodoro: [
    { key:'pomoWork',  label:'Focus duration (min)', type:'number', min:1, max:90, default:25 },
    { key:'pomoBreak', label:'Break duration (min)', type:'number', min:1, max:30, default:5  },
  ],
  calendar: [
    { key:'calStartDay', label:'Week starts on', type:'select', options:[{v:'0',l:'Sunday'},{v:'1',l:'Monday'}] },
  ],
  habits: [
    { key:'habitsShowCount', label:'Show completion count', type:'toggle', default:false },
  ],
};

// ── Inline modal (replaces prompt()) ─────────────────────────────
window.closeInlineModal = function() {
  document.getElementById('inline-modal')?.classList.add('hidden');
};
function showInlineModal(title, placeholder, onOk) {
  const m = document.getElementById('inline-modal'); if (!m) return;
  document.getElementById('inline-modal-title').textContent = title;
  const inp = document.getElementById('inline-modal-input');
  inp.value = ''; inp.placeholder = placeholder || '';
  m.classList.remove('hidden');
  setTimeout(() => inp.focus(), 50);
  const submit = () => { const v = inp.value.trim(); if (!v) return; window.closeInlineModal(); onOk(v); };
  document.getElementById('inline-modal-ok').onclick = submit;
  inp.onkeydown = e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') window.closeInlineModal(); };
}

// ── Widget settings modal ─────────────────────────────────────────
window.closeWidgetSettings = function() {
  document.getElementById('widget-settings-modal')?.classList.add('hidden');
};
function openWidgetSettings(w) {
  const schema = WIDGET_SETTINGS[w.type]; if (!schema || !schema.length) return;
  const modal = document.getElementById('widget-settings-modal'); if (!modal) return;
  const labels = { clock:'Clock', moon:'Moon Phase', pomodoro:'Pomodoro', calendar:'Calendar', habits:'Habit Tracker' };
  document.getElementById('wsm-title').textContent = (labels[w.type] || w.type) + ' Settings';
  const body = document.getElementById('wsm-body'); body.innerHTML = '';
  if (!w.opts) w.opts = {};
  schema.forEach(field => {
    const row = document.createElement('div'); row.className = 'wsm-row';
    const cur = w.opts[field.key] !== undefined ? w.opts[field.key] : field.default;
    if (field.type === 'select') {
      row.innerHTML = '<label class="wsm-label">' + field.label + '</label><select class="wsm-select">' +
        field.options.map(o => '<option value="' + o.v + '"' + (String(cur ?? field.options[0].v) === String(o.v) ? ' selected' : '') + '>' + o.l + '</option>').join('') + '</select>';
      row.querySelector('select').onchange = e => { w.opts[field.key] = e.target.value; save(); refreshMiniWidget(w); };
    } else if (field.type === 'toggle') {
      const chk = cur !== false && cur !== undefined ? (cur !== null ? cur : (field.default !== false)) : false;
      row.innerHTML = '<label class="wsm-label">' + field.label + '</label><label class="wsm-switch"><input type="checkbox"' + (chk ? ' checked' : '') + '><span class="wsm-slider"></span></label>';
      row.querySelector('input').onchange = e => { w.opts[field.key] = e.target.checked; save(); refreshMiniWidget(w); };
    } else if (field.type === 'number') {
      row.innerHTML = '<label class="wsm-label">' + field.label + '</label><input type="number" class="wsm-number" value="' + (cur ?? field.default ?? '') + '" min="' + (field.min||1) + '" max="' + (field.max||99) + '" />';
      row.querySelector('input').onchange = e => { w.opts[field.key] = parseInt(e.target.value) || field.default; save(); refreshMiniWidget(w); };
    }
    body.appendChild(row);
  });
  modal.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

let state = {
  boardNotes:   [],
  boardWidgets: [],
  todos:        [],
  projects:     [],
  vault:        { verifier: null, entries: [] },
  diary:        { entries: [] },   // entries encrypted with masterPassword
  boardDecors:  [],               // stickers, washi tape, aesthetic cards
  shortcuts:    [],
  settings: {
    startWithWindows: false,
    boardBg: 'cork',
    boardImagePath: null,
    accentColor: '#9c6b5e',
    fontFamily: 'Nunito',
    widgetOpacity: 0.95,
    widgetBlur: true,
    noteStyle: 'classic',
    clockFormat: '24',
    darkTopbar: true,
    boardTintColor: '#000000',
    boardTintOpacity: 0,
    widgetPositions: {},
  },
};

let selectedColor    = '#e8d5d5';
let vaultUnlocked    = false;
let masterPassword   = null;
let currentProjectId = null;
let currentNoteId    = null;
let editingVaultId   = null;
let todoFilter       = 'all';
let activePinEl      = null;

const save = () => window.hb.saveData(state);

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════

async function init() {
  try {
    const loaded = await window.hb.loadData();
    if (loaded) {
      state = {
        ...state, ...loaded,
        settings:     { ...state.settings, ...(loaded.settings || {}) },
        boardWidgets: loaded.boardWidgets || [],
        diary:        { entries: [], ...(loaded.diary || {}) },
        boardDecors:  loaded.boardDecors || [],
      };
      // migrate shortcuts that were saved without ids
      state.shortcuts = (state.shortcuts || []).map(s => s.id ? s : { ...s, id: uid() });
    }
  } catch (e) { console.error('Load error', e); }

  setupTitlebar();
  setupKeyboardShortcuts();
  setupAddMenu();
  setupClock();
  setupBoard();
  setupPinPicker();
  setupNotes();
  setupTodos();
  setupVault();
  setupJournal();
  setupSettings();

  renderApps();
  renderProjects();
  renderTodos();
  renderBoardWidgets();
  applySettings();
  applyWidgetPositions();
  applyHiddenWidgets();

  // Always start on the board
  window.goHome();
}

// ═══════════════════════════════════════════════════════════════
// TITLEBAR
// ═══════════════════════════════════════════════════════════════

function setupTitlebar() {
  document.getElementById('btn-minimize').onclick = () => window.hb.minimize();
  document.getElementById('btn-maximize').onclick = () => window.hb.maximize();
  document.getElementById('btn-close').onclick    = () => window.hb.close();
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { window.goHome(); return; }
    if (e.ctrlKey && e.shiftKey) {
      const k = e.key.toUpperCase();
      if      (k === 'H') { e.preventDefault(); window.goHome(); }
      else if (k === 'B') { e.preventDefault(); window.togglePanel('browser'); }
      else if (k === 'N') { e.preventDefault(); window.togglePanel('notes'); }
      else if (k === 'T') { e.preventDefault(); window.togglePanel('todos'); }
      else if (k === 'V') { e.preventDefault(); window.togglePanel('vault'); }
      else if (k === ',') { e.preventDefault(); window.togglePanel('settings'); }
      else if (k === 'A') { e.preventDefault(); createTextNote(); }
      else if (k === 'I') { e.preventDefault(); createImagePin(); }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// ADD MENU (topbar +)
// ═══════════════════════════════════════════════════════════════

function setupAddMenu() {
  const btn  = document.getElementById('topbar-add-btn');
  const drop = document.getElementById('topbar-add-dropdown');
  if (!btn || !drop) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !drop.classList.contains('hidden');
    drop.classList.toggle('hidden', open);
    btn.classList.toggle('open', !open);
  });

  document.addEventListener('click', () => {
    drop.classList.add('hidden');
    btn.classList.remove('open');
  });
  drop.addEventListener('click', e => e.stopPropagation());

  document.querySelectorAll('.tad-item').forEach(item => {
    item.addEventListener('click', async () => {
      drop.classList.add('hidden');
      btn.classList.remove('open');
      const action = item.dataset.action;
      if      (action === 'note')  createTextNote();
      else if (action === 'image') createImagePin();
      else if (action && action.startsWith('widget-')) addBoardWidgetByType(action.replace('widget-',''));
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════════════════════════════

function setupClock() {
  const timeEl = document.getElementById('clock-time');
  const secEl  = document.getElementById('clock-seconds');
  const dateEl = document.getElementById('clock-date');
  if (!timeEl) return;

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function tick() {
    const cs = state.settings.clockOpts || {};
    const fmt = cs.clockFormat || state.settings.clockFormat || '24';
    const showSec  = cs.clockSeconds !== false;
    const showDate = cs.clockDate    !== false;
    const now = new Date();
    let h = now.getHours(), suffix = '';
    if (fmt === '12') { suffix = h >= 12 ? ' PM' : ' AM'; h = h % 12 || 12; }
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    if (timeEl) timeEl.textContent = String(h).padStart(2,'0') + ':' + m;
    if (secEl)  { secEl.textContent = showSec ? ':' + s + suffix : (fmt === '12' ? suffix : ''); secEl.style.display = showSec || fmt==='12' ? '' : 'none'; }
    if (dateEl) { dateEl.textContent = DAYS[now.getDay()] + ', ' + now.getDate() + ' ' + MONTHS[now.getMonth()] + ' ' + now.getFullYear(); dateEl.style.display = showDate ? '' : 'none'; }
  }
  tick();
  setInterval(tick, 1000);

  // Gear button on built-in clock opens a simple settings modal
  const clockWidget = document.getElementById('widget-clock');
  if (clockWidget) {
    const gearBtn = document.createElement('button');
    gearBtn.className = 'bw-settings-btn'; gearBtn.title = 'Clock settings'; gearBtn.textContent = '⚙';
    gearBtn.onclick = () => {
      // Synthesise a fake widget object backed by state.settings.clockOpts
      if (!state.settings.clockOpts) state.settings.clockOpts = {};
      const fakeW = { id:'__clock__', type:'clock', opts: state.settings.clockOpts };
      // Patch save to flush opts back
      openWidgetSettings(fakeW);
    };
    const dragBar = clockWidget.querySelector('.bw-drag-bar');
    if (dragBar) dragBar.insertBefore(gearBtn, dragBar.querySelector('.bw-close-btn'));
  }
}

// ═══════════════════════════════════════════════════════════════
// BOARD + DRAG + RESIZE
// ═══════════════════════════════════════════════════════════════

function setupBoard() {
  const board = document.getElementById('board');
  if (!board) return;

  // Toolbar colour picker
  document.querySelectorAll('.nc').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nc').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
    });
  });

  const addNoteBtn  = document.getElementById('add-note-btn');
  const addImageBtn = document.getElementById('add-image-btn');
  if (addNoteBtn)  addNoteBtn.addEventListener('click',  createTextNote);
  if (addImageBtn) addImageBtn.addEventListener('click', createImagePin);

  const aoBtn = document.getElementById('apps-open-settings');
  const agBtn = document.getElementById('apps-go-settings');
  if (aoBtn) aoBtn.addEventListener('click', () => window.togglePanel('settings'));
  if (agBtn) agBtn.addEventListener('click', () => window.togglePanel('settings'));

  // Render saved items
  state.boardNotes.forEach(n => {
    try {
      if (n.type === 'image') appendImageNote(n);
      else appendTextNote(n);
    } catch(e) { console.error('Note render error', e); }
  });
  state.boardDecors.forEach(d => { try { appendDecor(d); } catch(e) {} });
  setupAestheticLibrary();

  // ── Drag ──────────────────────────────────────────────
  let dragging = false, dragEl = null, offX = 0, offY = 0;
  let resizing = false, resEl  = null, rsX = 0, rsY = 0, rsW = 0, rsH = 0;

  board.addEventListener('mousemove', e => {
    if (dragging && dragEl) {
      const br = board.getBoundingClientRect();
      dragEl.style.left  = Math.max(0, e.clientX - br.left  + board.scrollLeft - offX) + 'px';
      dragEl.style.top   = Math.max(0, e.clientY - br.top   + board.scrollTop  - offY) + 'px';
      dragEl.style.right = 'auto';
    } else if (resizing && resEl) {
      const newW = Math.max(140, rsW + e.clientX - rsX);
      const newH = Math.max(100, rsH + e.clientY - rsY);
      resEl.style.width = newW + 'px';
      if (!resEl.classList.contains('board-image')) resEl.style.height = newH + 'px';
    }
  });

  board.addEventListener('mouseup', () => {
    if (dragging && dragEl) {
      const x = parseInt(dragEl.style.left) || 0;
      const y = parseInt(dragEl.style.top)  || 0;
      const kind = dragEl.dataset.draggable;
      const id   = dragEl.dataset.id;
      if (kind === 'note') {
        const n = state.boardNotes.find(n => n.id === id);
        if (n) { n.x = x; n.y = y; }
      } else if (kind === 'decor') {
        const d = state.boardDecors.find(d => d.id === id);
        if (d) { d.x = x; d.y = y; }
      } else if (kind === 'builtin') {
        if (!state.settings.widgetPositions) state.settings.widgetPositions = {};
        state.settings.widgetPositions[id] = { x, y };
      } else if (kind === 'board-widget') {
        const w = state.boardWidgets.find(w => w.id === id);
        if (w) { w.x = x; w.y = y; }
      }
      dragEl.classList.remove('dragging');
      save();
      dragging = false; dragEl = null;
    }
    if (resizing && resEl) {
      const id   = resEl.dataset.id;
      const kind = resEl.dataset.draggable;
      const w = resEl.offsetWidth, h = resEl.offsetHeight;
      if (kind === 'note') {
        const n = state.boardNotes.find(n => n.id === id);
        if (n) { n.width = w; if (n.type !== 'image') n.height = h; }
      } else if (kind === 'board-widget') {
        const widget = state.boardWidgets.find(x => x.id === id);
        if (widget) { widget.width = w; widget.height = h; }
      }
      save();
      resizing = false; resEl = null;
    }
  });

  window._startResize = function(el, e) {
    e.stopPropagation(); e.preventDefault();
    resizing = true; resEl = el;
    rsX = e.clientX; rsY = e.clientY;
    rsW = el.offsetWidth; rsH = el.offsetHeight;
  };

  window._drag = function(el, e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (!el.style.left || el.style.left === 'auto') {
      const er = el.getBoundingClientRect(), br = board.getBoundingClientRect();
      el.style.left  = (er.left - br.left + board.scrollLeft) + 'px';
      el.style.top   = (er.top  - br.top  + board.scrollTop)  + 'px';
      el.style.right = 'auto';
    }
    dragging = true; dragEl = el;
    const er = el.getBoundingClientRect();
    offX = e.clientX - er.left; offY = e.clientY - er.top;
    el.classList.add('dragging'); e.preventDefault();
  };
}

function applyWidgetPositions() {
  const pos = state.settings.widgetPositions || {};
  ['clock','apps'].forEach(id => {
    if (pos[id]) {
      const el = document.getElementById('widget-' + id);
      if (el) { el.style.left = pos[id].x + 'px'; el.style.top = pos[id].y + 'px'; el.style.right = 'auto'; }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// PINS
// ═══════════════════════════════════════════════════════════════

function pinHTML(pinId) {
  const pin = PINS.find(p => p.id === pinId) || PINS[1]; // PINS[1] = red (skip none)
  if (pin.type === 'none') return '<div class="board-pin board-pin-none" title="Click to add pin"></div>';
  let disc = '';
  if (pin.type === 'rainbow') disc = '<div class="pin-disc pin-rainbow"></div>';
  else if (pin.type === 'emoji') disc = '<div class="pin-disc pin-emoji">' + pin.emoji + '</div>';
  else disc = '<div class="pin-disc" style="background:' + pin.color + '"></div>';
  return '<div class="board-pin" title="Click to change pin">' + disc + '<div class="pin-needle"></div></div>';
}

function setupPinPicker() {
  const picker = document.getElementById('pin-picker');
  if (!picker) return;

  PINS.forEach(pin => {
    const opt = document.createElement('div');
    opt.className = 'pp-opt';
    opt.title = pin.id;
    opt.dataset.pin = pin.id;
    if (pin.type === 'none')       { opt.textContent = '✕'; opt.style.cssText='display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--text-3);border:1.5px dashed var(--border)'; }
    else if (pin.type === 'rainbow')    opt.innerHTML = '<div class="pp-rainbow"></div>';
    else if (pin.type === 'emoji') opt.textContent = pin.emoji;
    else                           opt.style.background = pin.color;

    opt.addEventListener('click', e => {
      e.stopPropagation();
      if (!activePinEl) return;
      const parent = activePinEl.closest('[data-draggable]');
      if (!parent) return;
      const id = parent.dataset.id, kind = parent.dataset.draggable;
      if (kind === 'note') {
        const n = state.boardNotes.find(n => n.id === id);
        if (n) n.pin = pin.id;
      } else if (kind === 'board-widget') {
        const w = state.boardWidgets.find(w => w.id === id);
        if (w) w.pin = pin.id;
      } else if (kind === 'builtin') {
        if (!state.settings.widgetPositions) state.settings.widgetPositions = {};
        state.settings.widgetPositions[id + '_pin'] = pin.id;
      }
      // Replace the pin element
      const newPin = document.createElement('div');
      newPin.innerHTML = pinHTML(pin.id);
      const pinEl = newPin.firstElementChild;
      activePinEl.replaceWith(pinEl);
      attachPinClick(pinEl);
      save();
      picker.classList.add('hidden');
      activePinEl = null;
    });
    picker.appendChild(opt);
  });

  document.addEventListener('click', () => { picker.classList.add('hidden'); activePinEl = null; });
  picker.addEventListener('click', e => e.stopPropagation());
}

function attachPinClick(pinEl) {
  pinEl.addEventListener('click', e => {
    e.stopPropagation();
    activePinEl = pinEl;
    const picker = document.getElementById('pin-picker');
    const rect = pinEl.getBoundingClientRect();
    picker.style.left = rect.left - 4 + 'px';
    picker.style.top  = rect.bottom + 6 + 'px';
    picker.classList.remove('hidden');
  });
}

function attachPinsInEl(el) {
  el.querySelectorAll('.board-pin').forEach(p => attachPinClick(p));
}

// ═══════════════════════════════════════════════════════════════
// CREATE NOTES / IMAGES
// ═══════════════════════════════════════════════════════════════

function createTextNote() {
  window.goHome();
  const note = {
    id: uid(), type: 'text', title: '', content: '', color: selectedColor, pin: 'red',
    x: 80 + Math.round(Math.random() * 260),
    y: 80 + Math.round(Math.random() * 160),
    rotation: +((Math.random() - 0.5) * 6).toFixed(2),
  };
  state.boardNotes.push(note);
  appendTextNote(note);
  save();
}

async function createImagePin() {
  window.goHome();
  try {
    const src = await window.hb.openBoardImage();
    if (!src) return;
    const pinOpts = ['star','bow','flower','gold','rainbow'];
    const note = {
      id: uid(), type: 'image', src, caption: '',
      pin: pinOpts[Math.floor(Math.random() * pinOpts.length)],
      x: 80 + Math.round(Math.random() * 240),
      y: 80 + Math.round(Math.random() * 150),
      rotation: +((Math.random() - 0.5) * 8).toFixed(2),
      width: 200,
    };
    state.boardNotes.push(note);
    appendImageNote(note);
    save();
  } catch(e) { console.error('Image pin error', e); }
}

function appendTextNote(note) {
  const board = document.getElementById('board');
  if (!board) return;
  const el = document.createElement('div');
  el.className = 'sticky-note';
  el.dataset.draggable = 'note';
  el.dataset.id = note.id;
  el.style.cssText = 'left:' + note.x + 'px;top:' + note.y + 'px;background:' + note.color + ';transform:rotate(' + note.rotation + 'deg)';
  if (note.width)  el.style.width  = note.width  + 'px';
  if (note.height) el.style.height = note.height + 'px';
  // Apply saved border
  if (note.noteBorder && note.noteBorder !== 'none') {
    const bd = NOTE_BORDERS.find(b => b.id === note.noteBorder);
    if (bd) { el.style.setProperty('--note-border-color', bd.color); el.classList.add('note-border-' + note.noteBorder); }
  }

  const palette = NOTE_COLORS.map(c =>
    '<button class="np-dot" data-color="' + c + '" style="background:' + c + '"></button>'
  ).join('');

  // Tape topper
  let tapeHTML = '';
  if (note.tapeColor) {
    const tape = WASHI_TAPES.find(t => t.id === note.tapeColor);
    if (tape) {
      let tapeStyle = 'background:' + tape.bg + ';opacity:0.88;';
      if (tape.pattern === 'dots')    tapeStyle += 'background-image:radial-gradient(circle,rgba(255,255,255,0.45) 2px,transparent 2px);background-size:10px 10px;';
      if (tape.pattern === 'stripes') tapeStyle += 'background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(255,255,255,0.3) 5px,rgba(255,255,255,0.3) 7px);';
      tapeHTML = '<div class="note-tape" style="' + tapeStyle + '"></div>';
    }
  }
  el.innerHTML = tapeHTML + pinHTML(note.pin || 'red') +
    '<div class="note-handle" onmousedown="window._drag(this.parentElement,event)">' +
      '<input class="note-title-input" type="text" value="' + esc(note.title) + '" placeholder="Title" />' +
      '<div class="note-palette">' + palette + '</div>' +
      '<button class="note-tape-btn" title="Add tape">&#9135;</button>' +
      '<button class="note-del">&#10005;</button>' +
    '</div>' +
    '<div class="note-body">' +
      '<textarea class="note-content-input" placeholder="Write something…">' + esc(note.content) + '</textarea>' +
    '</div>' +
    '<div class="resize-handle" onmousedown="window._startResize(this.parentElement,event)"></div>';

  el.querySelector('.note-title-input').addEventListener('input', e => {
    const n = state.boardNotes.find(n => n.id === note.id);
    if (n) { n.title = e.target.value; save(); }
  });
  el.querySelector('.note-content-input').addEventListener('input', e => {
    const n = state.boardNotes.find(n => n.id === note.id);
    if (n) { n.content = e.target.value; save(); }
  });
  el.querySelector('.note-del').addEventListener('click', () => {
    state.boardNotes = state.boardNotes.filter(n => n.id !== note.id);
    el.remove(); save();
  });
  el.querySelector('.note-tape-btn').addEventListener('click', e => {
    e.stopPropagation();
    openNoteTapePicker(el, note);
  });
  el.querySelectorAll('.np-dot').forEach(dot => {
    dot.addEventListener('click', e => {
      e.stopPropagation();
      el.style.background = dot.dataset.color;
      const n = state.boardNotes.find(n => n.id === note.id);
      if (n) { n.color = dot.dataset.color; save(); }
    });
  });

  attachPinsInEl(el);
  // Pin drags the note
  const stickyPin = el.querySelector('.board-pin');
  if (stickyPin) {
    stickyPin.style.cursor = 'grab';
    stickyPin.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      window._drag(el, e);
    });
  }
  board.appendChild(el);
}

function appendImageNote(note) {
  const board = document.getElementById('board');
  if (!board) return;
  const el = document.createElement('div');
  const frame = note.frame || 'none';
  el.className = 'board-image' + (frame !== 'none' ? ' frame-' + frame : '');
  if (note.noteBorder && note.noteBorder !== 'none') {
    const bd = NOTE_BORDERS.find(b => b.id === note.noteBorder);
    if (bd) el.style.setProperty('--note-border-color', bd.color);
    el.classList.add('note-border-' + note.noteBorder);
  }
  el.dataset.draggable = 'note';
  el.dataset.id = note.id;
  el.style.cssText = 'left:' + note.x + 'px;top:' + note.y + 'px;transform:rotate(' + note.rotation + 'deg);width:' + (note.width || 200) + 'px';

  el.innerHTML = pinHTML(note.pin || 'star') +
    '<div class="bi-handle" onmousedown="window._drag(this.parentElement,event)">' +
      '<span class="bi-dots">&#8942; &#8942;</span>' +
      '<button class="bi-frame-btn" title="Change frame">&#128247;</button>' +
      '<button class="bi-border-btn" title="Border style">&#9645;</button>' +
      '<button class="bi-del">&#10005;</button>' +
    '</div>' +
    '<div class="bi-img-wrap"><img src="' + esc(note.src) + '" alt="" draggable="false" /></div>' +
    '<input class="bi-caption" type="text" value="' + esc(note.caption) + '" placeholder="Add a caption…" />' +
    '<div class="resize-handle" onmousedown="window._startResize(this.parentElement,event)"></div>';

  // Make the pin itself draggable too
  const pinEl = el.querySelector('.board-pin');
  if (pinEl) {
    pinEl.style.cursor = 'grab';
    pinEl.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      window._drag(el, e);
    });
  }

  el.querySelector('.bi-caption').addEventListener('input', e => {
    const n = state.boardNotes.find(n => n.id === note.id);
    if (n) { n.caption = e.target.value; save(); }
  });
  el.querySelector('.bi-del').addEventListener('click', () => {
    state.boardNotes = state.boardNotes.filter(n => n.id !== note.id);
    el.remove(); save();
  });
  el.querySelector('.bi-frame-btn').addEventListener('click', e => {
    e.stopPropagation();
    openFramePicker(el, note);
  });
  el.querySelector('.bi-border-btn').addEventListener('click', e => {
    e.stopPropagation();
    openBorderPicker(el, note);
  });

  attachPinsInEl(el);
  board.appendChild(el);
}

function openNoteTapePicker(el, note) {
  document.querySelectorAll('.tape-picker-popup').forEach(p => p.remove());
  const pop = document.createElement('div'); pop.className = 'tape-picker-popup';
  const noBtn = document.createElement('button'); noBtn.className = 'tp-btn tp-none'; noBtn.textContent = 'No tape';
  noBtn.onclick = () => { const n = state.boardNotes.find(n => n.id === note.id); if (n) { n.tapeColor = ''; save(); } el.remove(); const u = state.boardNotes.find(n => n.id === note.id); if (u) appendTextNote(u); pop.remove(); };
  pop.appendChild(noBtn);
  WASHI_TAPES.forEach(tape => {
    const btn = document.createElement('button'); btn.className = 'tp-btn';
    let s = 'background:' + tape.bg + ';';
    if (tape.pattern === 'dots')    s += 'background-image:radial-gradient(circle,rgba(255,255,255,0.45) 2px,transparent 2px);background-size:10px 10px;';
    if (tape.pattern === 'stripes') s += 'background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(255,255,255,0.3) 5px,rgba(255,255,255,0.3) 7px);';
    btn.style.cssText = s;
    btn.title = tape.label;
    btn.classList.toggle('active', note.tapeColor === tape.id);
    btn.onclick = () => { const n = state.boardNotes.find(n => n.id === note.id); if (n) { n.tapeColor = tape.id; save(); } el.remove(); const u = state.boardNotes.find(n => n.id === note.id); if (u) appendTextNote(u); pop.remove(); };
    pop.appendChild(btn);
  });
  el.appendChild(pop);
  setTimeout(() => document.addEventListener('click', () => pop.remove(), { once: true }), 0);
}

function openFramePicker(el, note) {
  document.querySelectorAll('.frame-picker-popup').forEach(p => p.remove());
  const pop = document.createElement('div');
  pop.className = 'frame-picker-popup';
  pop.innerHTML = IMAGE_FRAMES.map(f =>
    '<button class="fp-btn' + (note.frame === f.id || (!note.frame && f.id==='none') ? ' active' : '') + '" data-frame="' + f.id + '">' + f.label + '</button>'
  ).join('');
  pop.querySelectorAll('.fp-btn').forEach(btn => {
    btn.onclick = () => {
      const n = state.boardNotes.find(n => n.id === note.id);
      if (n) { n.frame = btn.dataset.frame; save(); }
      // Re-render the image note
      el.remove();
      const updated = state.boardNotes.find(n => n.id === note.id);
      if (updated) appendImageNote(updated);
      pop.remove();
    };
  });
  el.appendChild(pop);
  setTimeout(() => document.addEventListener('click', () => pop.remove(), { once: true }), 0);
}

function openBorderPicker(el, note) {
  document.querySelectorAll('.border-picker-popup').forEach(p => p.remove());
  const pop = document.createElement('div');
  pop.className = 'border-picker-popup';
  pop.innerHTML = NOTE_BORDERS.map(b =>
    '<button class="bp-btn' + (note.noteBorder === b.id || (!note.noteBorder && b.id==='none') ? ' active' : '') + '" data-border="' + b.id + '">' +
      (b.color ? '<span class="bp-swatch" style="background:' + b.color + '"></span>' : '') + b.label +
    '</button>'
  ).join('');
  pop.querySelectorAll('.bp-btn').forEach(btn => {
    btn.onclick = () => {
      const n = state.boardNotes.find(n => n.id === note.id);
      if (n) { n.noteBorder = btn.dataset.border; save(); }
      el.remove();
      const updated = state.boardNotes.find(n => n.id === note.id);
      if (updated) appendImageNote(updated);
      pop.remove();
    };
  });
  el.appendChild(pop);
  setTimeout(() => document.addEventListener('click', () => pop.remove(), { once: true }), 0);
}

// ═══════════════════════════════════════════════════════════════
// DECORATIONS (stickers, washi tape, aesthetic cards)
// ═══════════════════════════════════════════════════════════════

function appendDecor(d) {
  const board = document.getElementById('board'); if (!board) return;
  const el = document.createElement('div');
  el.className = 'board-decor board-decor-' + d.type;
  el.dataset.draggable = 'decor';
  el.dataset.id = d.id;
  el.style.cssText = 'left:' + d.x + 'px;top:' + d.y + 'px;' +
    (d.rotation ? 'transform:rotate(' + d.rotation + 'deg);' : '') +
    (d.width  ? 'width:'  + d.width  + 'px;' : '') +
    (d.height ? 'height:' + d.height + 'px;' : '');

  if (d.type === 'sticker') {
    el.style.fontSize = (d.size || 36) + 'px';
    el.style.color = d.color || 'var(--accent)';
    el.innerHTML = '<span class="decor-sticker-content">' + d.content + '</span>' +
      '<button class="decor-del">&#10005;</button>' +
      '<div class="decor-resize" onmousedown="window._startDecorResize(this.parentElement,event)"></div>' +
      '<div class="sticker-color-row"><input type="color" class="sticker-color-pick" value="' + (d.color||'#9c6b5e') + '" title="Colour" /></div>';
    const cp = el.querySelector('.sticker-color-pick');
    cp.addEventListener('input', e => { el.style.color = e.target.value; });
    cp.addEventListener('change', e => { const dec = state.boardDecors.find(x => x.id === d.id); if (dec) { dec.color = e.target.value; save(); } });
    cp.addEventListener('mousedown', e => e.stopPropagation());
  } else if (d.type === 'washi') {
    const tape = WASHI_TAPES.find(t => t.id === d.washiId) || WASHI_TAPES[0];
    el.style.background = tape.bg;
    el.style.opacity = '0.88';
    if (tape.pattern === 'dots')    { el.style.backgroundImage = 'radial-gradient(circle, rgba(255,255,255,0.45) 2px, transparent 2px)'; el.style.backgroundSize = '10px 10px'; }
    if (tape.pattern === 'stripes') el.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 7px)';
    if (tape.pattern === 'floral')  { el.style.backgroundImage = 'radial-gradient(circle at 5px 5px, rgba(255,255,255,0.4) 3px, transparent 3px), radial-gradient(circle at 15px 15px, rgba(255,255,255,0.4) 3px, transparent 3px)'; el.style.backgroundSize = '20px 20px'; }
    el.innerHTML =
      '<button class="decor-del washi-del">&#10005;</button>' +
      '<div class="washi-length-handle" title="Drag to change length"></div>' +
      '<div class="washi-rotate-handle" title="Drag to rotate">&#8635;</div>';

    // Length handle — drags horizontally to resize width
    const lenHandle = el.querySelector('.washi-length-handle');
    lenHandle.addEventListener('mousedown', e => {
      e.stopPropagation(); e.preventDefault();
      const startX = e.clientX, startW = el.offsetWidth;
      const onMove = mv => {
        const newW = Math.max(40, startW + (mv.clientX - startX));
        el.style.width = newW + 'px';
        const dec = state.boardDecors.find(x => x.id === d.id);
        if (dec) dec.width = Math.round(newW);
      };
      const onUp = () => { save(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Rotation handle — drag in arc to rotate
    const rotHandle = el.querySelector('.washi-rotate-handle');
    rotHandle.addEventListener('mousedown', e => {
      e.stopPropagation(); e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const onMove = mv => {
        const angle = Math.atan2(mv.clientY - cy, mv.clientX - cx) * 180 / Math.PI + 90;
        const snapped = Math.round(angle / 5) * 5; // snap to 5°
        el.style.transform = 'rotate(' + snapped + 'deg)';
        const dec = state.boardDecors.find(x => x.id === d.id);
        if (dec) dec.rotation = snapped;
      };
      const onUp = () => { save(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  } else if (d.type === 'card') {
    const card = AESTHETIC_CARDS.find(c => c.id === d.cardId) || AESTHETIC_CARDS[0];
    el.style.background = card.css;
    el.innerHTML =
      '<div class="decor-card-art">' + (card.art || '') + '</div>' +
      (d.caption ? '<div class="decor-card-caption">' + esc(d.caption) + '</div>' : '') +
      '<input class="decor-card-input" placeholder="Add caption…" value="' + esc(d.caption || '') + '" />' +
      '<button class="decor-del">&#10005;</button>' +
      '<div class="decor-resize" onmousedown="window._startDecorResize(this.parentElement,event)"></div>';
    el.querySelector('.decor-card-input').addEventListener('input', e => {
      const dec = state.boardDecors.find(x => x.id === d.id);
      if (dec) { dec.caption = e.target.value; save(); }
    });
    el.querySelector('.decor-card-input').addEventListener('blur', e => {
      const dec = state.boardDecors.find(x => x.id === d.id);
      const capEl = el.querySelector('.decor-card-caption');
      if (dec && capEl) capEl.textContent = e.target.value;
    });
  } else if (d.type === 'album') {
    const style = d.albumStyle || 'square';
    el.style.width = (d.width || 160) + 'px';
    let artHTML = '';
    if (style === 'circle') {
      artHTML = '<div class="album-circle-art" style="background-image:url(\'' + esc(d.artUrl||'') + '\')"></div>';
    } else if (style === 'polaroid') {
      artHTML = '<div class="album-polaroid-frame"><img src="' + esc(d.artUrl||'') + '" draggable="false" /></div>';
    } else {
      artHTML = '<div class="album-square-art"><img src="' + esc(d.artUrl||'') + '" draggable="false" /></div>';
    }
    el.innerHTML = artHTML +
      '<div class="album-info">' +
        (d.title  ? '<div class="album-title">'  + esc(d.title)  + '</div>' : '') +
        (d.artist ? '<div class="album-artist">' + esc(d.artist) + '</div>' : '') +
      '</div>' +
      '<button class="decor-del">&#10005;</button>' +
      '<div class="decor-resize" onmousedown="window._startDecorResize(this.parentElement,event)"></div>';

  } else if (d.type === 'apppin') {
    const iconBg = d.color || '#9c6b5e';
    el.innerHTML =
      '<div class="apppin-icon' + (d.iconImage ? ' has-img' : '') + '" style="background:' + iconBg + '" title="Open ' + esc(d.label||'') + '">' +
        (d.iconImage ? '<img src="' + esc(d.iconImage) + '" alt="" draggable="false">' : esc(d.icon || '?')) +
      '</div>' +
      '<div class="apppin-label">' + esc(d.label || 'App') + '</div>' +
      '<button class="decor-del apppin-del">&#10005;</button>';
    el.querySelector('.apppin-icon').addEventListener('click', e => {
      e.stopPropagation();
      if (d.path) window.hb.openApp(d.path);
    });
    // Prevent drag from icon click
    el.querySelector('.apppin-icon').addEventListener('mousedown', e => e.stopPropagation());
  }

  if (el.querySelector('.decor-del')) el.querySelector('.decor-del').addEventListener('click', e => {
    e.stopPropagation();
    state.boardDecors = state.boardDecors.filter(x => x.id !== d.id);
    el.remove(); save();
  });

  el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('decor-del') || e.target.classList.contains('decor-resize') ||
        e.target.classList.contains('washi-length-handle') || e.target.classList.contains('washi-rotate-handle') ||
        e.target.classList.contains('apppin-icon') || e.target.classList.contains('sticker-color-pick')) return;
    window._drag(el, e);
  });

  // Sticker resize
  window._startDecorResize = function(el, e) {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX, startW = el.offsetWidth, startH = el.offsetHeight;
    const startFS = parseInt(el.style.fontSize) || 48;
    const onMove = mv => {
      const dx = mv.clientX - startX;
      if (el.classList.contains('board-decor-sticker')) {
        const newSize = Math.max(20, Math.min(200, startFS + dx / 2));
        el.style.fontSize = newSize + 'px';
        const dec = state.boardDecors.find(x => x.id === el.dataset.id);
        if (dec) dec.size = Math.round(newSize);
      } else {
        el.style.width  = Math.max(60, startW + dx) + 'px';
        el.style.height = Math.max(40, startH + (mv.clientY - e.clientY)) + 'px';
        const dec = state.boardDecors.find(x => x.id === el.dataset.id);
        if (dec) { dec.width = el.offsetWidth; dec.height = el.offsetHeight; }
      }
    };
    const onUp = () => { save(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  board.appendChild(el);
}

// ── Decoration Studio Modal ──────────────────────────────────────
window.closeAestheticLibrary = function() {
  document.getElementById('aesthetic-library')?.classList.add('hidden');
};

function openAestheticLibrary(tab) {
  const modal = document.getElementById('aesthetic-library'); if (!modal) return;
  modal.classList.remove('hidden');
  renderAestheticTab(tab || 'cards');
}

function renderAestheticTab(tab) {
  document.querySelectorAll('.al-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  const content = document.getElementById('al-content'); if (!content) return;
  content.innerHTML = '';

  if (tab === 'cards') {
    const grid = document.createElement('div'); grid.className = 'al-grid';
    AESTHETIC_CARDS.forEach(card => {
      const btn = document.createElement('button'); btn.className = 'al-card-btn';
      btn.style.background = card.css;
      btn.innerHTML = '<span class="al-card-art">' + (card.art || '') + '</span><span class="al-card-label">' + card.label + '</span>';
      btn.onclick = () => {
        const d = { id: uid(), type:'card', cardId: card.id, caption:'',
          x: 120 + Math.round(Math.random()*200), y: 80 + Math.round(Math.random()*120),
          rotation: +((Math.random()-0.5)*6).toFixed(1), width:180, height:140 };
        state.boardDecors.push(d); appendDecor(d); save();
        window.closeAestheticLibrary();
      };
      grid.appendChild(btn);
    });
    content.appendChild(grid);

  } else if (tab === 'stickers') {
    const grid = document.createElement('div'); grid.className = 'al-symbol-grid';
    AESTHETIC_STICKERS.forEach(sym => {
      const btn = document.createElement('button'); btn.className = 'al-symbol-btn';
      btn.textContent = sym;
      btn.onclick = () => {
        const d = { id: uid(), type:'sticker', content: sym, size: 36,
          x: 120 + Math.round(Math.random()*250), y: 80 + Math.round(Math.random()*150),
          rotation: +((Math.random()-0.5)*15).toFixed(1) };
        state.boardDecors.push(d); appendDecor(d); save();
        window.closeAestheticLibrary();
      };
      grid.appendChild(btn);
    });
    content.appendChild(grid);

  } else if (tab === 'washi') {
    const grid = document.createElement('div'); grid.className = 'al-washi-grid';
    WASHI_TAPES.forEach(tape => {
      const btn = document.createElement('button'); btn.className = 'al-washi-btn';
      btn.style.background = tape.bg;
      if (tape.pattern === 'dots')    { btn.style.backgroundImage='radial-gradient(circle, rgba(255,255,255,0.45) 2px, transparent 2px)'; btn.style.backgroundSize='10px 10px'; }
      if (tape.pattern === 'stripes') btn.style.backgroundImage='repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 7px)';
      btn.innerHTML = '<span class="al-washi-label">' + tape.label + '</span>';
      btn.onclick = () => {
        const d = { id: uid(), type:'washi', washiId: tape.id,
          x: 100 + Math.round(Math.random()*200), y: 60 + Math.round(Math.random()*150),
          rotation: +((Math.random()-0.5)*30).toFixed(1), width: 180, height: 28 };
        state.boardDecors.push(d); appendDecor(d); save();
        window.closeAestheticLibrary();
      };
      grid.appendChild(btn);
    });
    content.appendChild(grid);

  } else if (tab === 'frames') {
    const note = '<div class="al-frame-tip">Click a frame to select it, then click any image pin on the board to apply it. You can also use the frame button that appears when hovering an image pin.</div>';
    const framesDiv = document.createElement('div'); framesDiv.innerHTML = note;
    const grid = document.createElement('div'); grid.className = 'al-frame-grid';
    IMAGE_FRAMES.forEach(f => {
      const btn = document.createElement('button'); btn.className = 'al-frame-btn frame-preview frame-preview-' + f.id;
      btn.innerHTML = '<div class="fp-demo"></div><span>' + f.label + '</span>';
      btn.onclick = () => {
        window._pendingFrame = f.id;
        window.closeAestheticLibrary();
        document.getElementById('frame-pending-toast')?.remove();
        const t = document.createElement('div'); t.id = 'frame-pending-toast';
        t.textContent = 'Click an image pin to apply "' + f.label + '" frame';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
      };
      grid.appendChild(btn);
    });
    framesDiv.appendChild(grid);
    content.appendChild(framesDiv);

    // Note border section
    const bdSec = document.createElement('div'); bdSec.className = 'al-section';
    bdSec.innerHTML = '<div class="al-section-label">Sticky Note Borders</div>';
    const bdGrid = document.createElement('div'); bdGrid.className = 'al-washi-grid';
    NOTE_BORDERS.filter(b => b.id !== 'none').forEach(b => {
      const btn = document.createElement('button'); btn.className = 'al-washi-btn';
      btn.style.cssText = 'background:' + b.color + ';color:#333';
      btn.innerHTML = '<span class="al-washi-label">' + b.label + '</span>';
      btn.onclick = () => {
        window._pendingBorder = b.id;
        window.closeAestheticLibrary();
        const t = document.createElement('div'); t.id = 'frame-pending-toast';
        t.textContent = 'Click a sticky note to apply "' + b.label + '" border';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
      };
      bdGrid.appendChild(btn);
    });
    bdSec.appendChild(bdGrid);
    content.appendChild(bdSec);

  } else if (tab === 'albums') {
    const wrap = document.createElement('div'); wrap.className = 'al-form';
    let selectedStyle = 'square';
    wrap.innerHTML =
      '<div class="al-form-label">Album art image URL</div>' +
      '<input type="text" id="al-art-url" placeholder="Paste image URL here…" />' +
      '<div class="al-art-preview-wrap"><div class="al-art-preview" id="al-art-preview"></div></div>' +
      '<input type="text" id="al-title" placeholder="Album title…" />' +
      '<input type="text" id="al-artist" placeholder="Artist name…" />' +
      '<div class="al-form-label">Style</div>' +
      '<div class="al-style-row">' +
        '<button class="al-style-btn active" data-style="square">Square</button>' +
        '<button class="al-style-btn" data-style="circle">Circle</button>' +
        '<button class="al-style-btn" data-style="polaroid">Polaroid</button>' +
      '</div>' +
      '<button class="action-btn" id="al-add-album">Add to Board</button>';
    content.appendChild(wrap);
    // Preview URL on input
    const urlInp = content.querySelector('#al-art-url');
    const preview = content.querySelector('#al-art-preview');
    urlInp.addEventListener('input', () => {
      preview.innerHTML = urlInp.value.trim()
        ? '<img src="' + esc(urlInp.value.trim()) + '" style="width:100%;height:100%;object-fit:cover;border-radius:4px" />'
        : '';
    });
    // Style toggle
    content.querySelectorAll('.al-style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        content.querySelectorAll('.al-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedStyle = btn.dataset.style;
      });
    });
    content.querySelector('#al-add-album').addEventListener('click', () => {
      const artUrl = content.querySelector('#al-art-url').value.trim();
      const title  = content.querySelector('#al-title').value.trim();
      const artist = content.querySelector('#al-artist').value.trim();
      if (!artUrl && !title) { content.querySelector('#al-art-url').focus(); return; }
      const d = { id:uid(), type:'album', albumStyle:selectedStyle, artUrl, title, artist,
        x:100+Math.round(Math.random()*200), y:70+Math.round(Math.random()*130),
        rotation:+((Math.random()-0.5)*8).toFixed(1), width:160 };
      state.boardDecors.push(d); appendDecor(d); save();
      window.closeAestheticLibrary();
    });

  } else if (tab === 'apps') {
    const wrap = document.createElement('div'); wrap.className = 'al-form';
    wrap.innerHTML =
      '<div class="al-form-label">Add an app icon to the board — click it to launch the app</div>' +
      '<div class="appform-icon-row">' +
        '<input type="text" id="al-app-icon" maxlength="3" placeholder="Icon" />' +
        '<input type="color" id="al-app-color" value="#9c6b5e" title="Icon background colour" />' +
        '<div class="apppin-preview" id="al-apppin-preview" style="background:#9c6b5e">A</div>' +
      '</div>' +
      '<input type="text" id="al-app-name" placeholder="App name (shown as label)…" />' +
      '<input type="text" id="al-app-path" placeholder="Path to .exe or file to open…" />' +
      '<button class="action-btn" id="al-add-apppin">Add to Board</button>';

    // Show existing shortcuts as quick-add chips
    if (state.shortcuts && state.shortcuts.length) {
      const label = document.createElement('div'); label.className = 'al-form-label'; label.style.marginTop='12px'; label.textContent = 'Quick-add from your shortcuts';
      const chips = document.createElement('div'); chips.className = 'al-shortcuts-quick';
      state.shortcuts.forEach(sc => {
        const chip = document.createElement('button'); chip.className = 'al-shortcut-chip';
        chip.innerHTML = '<span class="chip-icon">' + shortcutIconHtml(sc, sc.name[0]) + '</span><span>' + esc(sc.name) + '</span>';
        chip.onclick = () => {
          const d = { id:uid(), type:'apppin', icon:sc.emoji||sc.name[0], iconImage:sc.iconImage||null, label:sc.name, path:sc.path, color:sc.iconImage?'transparent':'#9c6b5e',
            x:100+Math.round(Math.random()*220), y:80+Math.round(Math.random()*140) };
          state.boardDecors.push(d); appendDecor(d); save();
          window.closeAestheticLibrary();
        };
        chips.appendChild(chip);
      });
      wrap.appendChild(label); wrap.appendChild(chips);
    }
    content.appendChild(wrap);

    // Live preview
    const iconInp  = content.querySelector('#al-app-icon');
    const colorInp = content.querySelector('#al-app-color');
    const pprev    = content.querySelector('#al-apppin-preview');
    const syncPreview = () => { pprev.textContent = iconInp.value || 'A'; pprev.style.background = colorInp.value; };
    iconInp.addEventListener('input', syncPreview);
    colorInp.addEventListener('input', syncPreview);

    content.querySelector('#al-add-apppin').addEventListener('click', () => {
      const icon  = iconInp.value.trim() || '?';
      const label = content.querySelector('#al-app-name').value.trim() || 'App';
      const path  = content.querySelector('#al-app-path').value.trim();
      const color = colorInp.value;
      const d = { id:uid(), type:'apppin', icon, label, path, color,
        x:100+Math.round(Math.random()*220), y:80+Math.round(Math.random()*140) };
      state.boardDecors.push(d); appendDecor(d); save();
      window.closeAestheticLibrary();
    });
  }
}

function setupAestheticLibrary() {
  document.getElementById('tad-library-btn')?.addEventListener('click', () => {
    document.getElementById('topbar-add-dropdown')?.classList.add('hidden');
    document.getElementById('topbar-add-btn')?.classList.remove('open');
    openAestheticLibrary('cards');
  });
  document.querySelectorAll('.al-tab').forEach(tab => {
    tab.addEventListener('click', () => renderAestheticTab(tab.dataset.tab));
  });

  // Handle pending frame/border application when clicking on board items
  const board = document.getElementById('board');
  board?.addEventListener('click', e => {
    if (window._pendingFrame) {
      const img = e.target.closest('.board-image');
      if (img) {
        const id = img.dataset.id;
        const n = state.boardNotes.find(n => n.id === id);
        if (n) { n.frame = window._pendingFrame; save(); img.remove(); appendImageNote(n); }
        window._pendingFrame = null;
        document.getElementById('frame-pending-toast')?.remove();
      }
    }
    if (window._pendingBorder) {
      const note = e.target.closest('.sticky-note');
      if (note) {
        const id = note.dataset.id;
        const n = state.boardNotes.find(n => n.id === id);
        if (n) { n.noteBorder = window._pendingBorder; save(); applyNoteBorder(note, n); }
        window._pendingBorder = null;
        document.getElementById('frame-pending-toast')?.remove();
      }
    }
  });
}

function applyNoteBorder(el, note) {
  NOTE_BORDERS.forEach(b => el.classList.remove('note-border-' + b.id));
  if (note.noteBorder && note.noteBorder !== 'none') {
    const bd = NOTE_BORDERS.find(b => b.id === note.noteBorder);
    if (bd) { el.style.setProperty('--note-border-color', bd.color); el.classList.add('note-border-' + note.noteBorder); }
  }
}

// ═══════════════════════════════════════════════════════════════
// APP SHORTCUTS
// ═══════════════════════════════════════════════════════════════

function renderApps() {
  const grid = document.getElementById('apps-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!state.shortcuts.length) {
    grid.innerHTML = '<span style="font-size:11px;color:var(--text-3);font-style:italic">No shortcuts yet</span>';
    return;
  }
  state.shortcuts.forEach(app => {
    const btn = document.createElement('button');
    btn.className = 'app-btn'; btn.title = app.path;
    btn.innerHTML = '<span class="app-icon">' + shortcutIconHtml(app) + '</span><span>' + esc(app.name) + '</span>';
    btn.addEventListener('click', () => window.hb.openApp(app.path));
    grid.appendChild(btn);
  });
}

// ═══════════════════════════════════════════════════════════════
// MINI BOARD WIDGETS
// ═══════════════════════════════════════════════════════════════

function renderBoardWidgets() {
  document.querySelectorAll('.mini-widget').forEach(el => el.remove());
  state.boardWidgets.forEach(w => {
    try { appendBoardWidget(w); } catch(e) { console.error('Widget error', e); }
  });
}

function addBoardWidgetByType(type) {
  const existing = state.boardWidgets.find(w => w.type === type);
  if (existing) {
    const el = document.querySelector('.mini-widget[data-wtype="' + type + '"]');
    if (el) {
      el.style.outline = '2px solid var(--accent)';
      setTimeout(() => { el.style.outline = ''; }, 1400);
    }
    return;
  }
  const w = { id:uid(), type, x:120+Math.round(Math.random()*180), y:80+Math.round(Math.random()*120), pin:'blue' };
  state.boardWidgets.push(w);
  appendBoardWidget(w);
  save();
}

function appendBoardWidget(w) {
  const board = document.getElementById('board');
  if (!board) return;
  const el = document.createElement('div');
  el.className = 'mini-widget';
  el.dataset.draggable = 'board-widget';
  el.dataset.id    = w.id;
  el.dataset.wtype = w.type;

  let s = 'left:' + Math.round(w.x) + 'px;top:' + Math.round(w.y) + 'px';
  if (w.width)  s += ';width:'  + w.width  + 'px';
  if (w.height) s += ';height:' + w.height + 'px';
  el.style.cssText = s;

  const titles  = { todo:'To-Do', notes:'Notes', vault:'Vault', shortcuts:'Shortcuts', calendar:'Calendar', pomodoro:'Pomodoro', habits:'Habits', countdown:'Countdown', moon:'Moon Phase', journal:'Journal', 'journal-invite':'Write Today', vinyl:'Now Playing', quote:'Quote', photostrip:'Photo Strip' };
  const panels  = { todo:'todos', notes:'notes', vault:'vault', journal:'journal', 'journal-invite':'journal' };

  let footerHTML = '';
  if (w.type === 'todo') {
    footerHTML = '<div class="mw-footer"><div class="mw-quick-add"><input type="text" placeholder="Quick add task…" id="mwq-' + w.id + '" /><button>+</button></div></div>';
  }

  el.innerHTML = pinHTML(w.pin || 'blue') +
    '<div class="mw-header" onmousedown="window._drag(this.parentElement,event)">' +
      '<span class="mw-title">' + (titles[w.type] || w.type) + '</span>' +
      '<div class="mw-controls">' +
        (panels[w.type] ? '<button class="mw-btn mw-expand" title="Open">&#8599;</button>' : '') +
        (WIDGET_SETTINGS[w.type] ? '<button class="mw-btn mw-gear" title="Settings">&#9881;</button>' : '') +
        '<button class="mw-btn mw-close" title="Remove">&#10005;</button>' +
      '</div>' +
    '</div>' +
    '<div class="mw-body" id="mw-body-' + w.id + '"></div>' +
    footerHTML +
    '<div class="resize-handle" onmousedown="window._startResize(this.parentElement,event)"></div>';

  const expandBtn = el.querySelector('.mw-expand');
  if (expandBtn && panels[w.type]) {
    expandBtn.addEventListener('click', () => window.togglePanel(panels[w.type]));
  }
  el.querySelector('.mw-close').addEventListener('click', () => {
    state.boardWidgets = state.boardWidgets.filter(x => x.id !== w.id);
    el.remove(); save();
  });
  const gearBtn = el.querySelector('.mw-gear');
  if (gearBtn) gearBtn.addEventListener('click', () => openWidgetSettings(w));

  if (w.type === 'todo') {
    const input  = el.querySelector('#mwq-' + w.id);
    const addBtn = el.querySelector('.mw-quick-add button');
    const addFn = () => {
      if (!input) return;
      const text = input.value.trim(); if (!text) return;
      state.todos.push({ id:uid(), text, done:false, priority:'normal' });
      input.value = '';
      refreshMiniTodo(w.id); renderTodos(); save();
    };
    if (addBtn) addBtn.addEventListener('click', addFn);
    if (input)  input.addEventListener('keydown', e => e.key === 'Enter' && addFn());
  }

  attachPinsInEl(el);
  board.appendChild(el);
  refreshMiniWidget(w);
}

function refreshMiniWidget(w) {
  try {
    if (w.type === 'todo')      refreshMiniTodo(w.id);
    if (w.type === 'notes')     refreshMiniNotes(w.id);
    if (w.type === 'vault')     refreshMiniVault(w.id);
    if (w.type === 'shortcuts') refreshMiniShortcuts(w.id);
    if (w.type === 'calendar')  renderCalendarWidget(w.id);
    if (w.type === 'pomodoro')  renderPomodoroWidget(w.id);
    if (w.type === 'habits')    renderHabitsWidget(w.id);
    if (w.type === 'countdown') renderCountdownWidget(w.id);
    if (w.type === 'moon')      renderMoonWidget(w.id);
    if (w.type === 'journal')        renderJournalWidget(w.id);
    if (w.type === 'journal-invite') renderJournalInviteWidget(w.id);
    if (w.type === 'vinyl')          renderVinylWidget(w.id);
    if (w.type === 'quote')          renderQuoteWidget(w.id);
    if (w.type === 'photostrip')     renderPhotoStripWidget(w.id);
  } catch(e) { console.error('Widget refresh error', e); }
}

function refreshAllMiniWidgets(type) {
  state.boardWidgets.filter(w => w.type === type).forEach(w => refreshMiniWidget(w));
}

function refreshMiniTodo(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  body.innerHTML = '';
  const active = state.todos.filter(t => !t.done).slice(0,7);
  const doneCount = state.todos.filter(t => t.done).length;
  if (!active.length && !state.todos.length) {
    body.innerHTML = '<div class="mw-empty">No tasks yet.</div>'; return;
  }
  active.forEach(todo => {
    const el = document.createElement('div'); el.className = 'mw-todo-item';
    el.innerHTML = '<input type="checkbox" /><span class="mw-todo-text">' + esc(todo.text) + '</span>';
    el.querySelector('input').addEventListener('change', e => {
      const t = state.todos.find(t => t.id === todo.id);
      if (t) { t.done = e.target.checked; renderTodos(); save(); }
      refreshMiniTodo(wid);
    });
    body.appendChild(el);
  });
  if (doneCount) {
    const s = document.createElement('div');
    s.style.cssText = 'font-size:10px;color:var(--text-3);padding:4px 12px 2px';
    s.textContent = doneCount + ' completed'; body.appendChild(s);
  }
}

function refreshMiniNotes(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  body.innerHTML = '';
  if (!state.projects.length) { body.innerHTML = '<div class="mw-empty">No projects yet.</div>'; return; }
  state.projects.forEach(proj => {
    const ph = document.createElement('div'); ph.className = 'mw-proj-item';
    ph.innerHTML = '<span class="mw-proj-name">' + esc(proj.name) + '</span><span class="mw-proj-count">' + proj.notes.length + '</span>';
    ph.addEventListener('click', () => { currentProjectId = proj.id; renderProjects(); window.togglePanel('notes'); });
    body.appendChild(ph);
    proj.notes.slice(0,3).forEach(note => {
      const ni = document.createElement('div'); ni.className = 'mw-note-item';
      ni.textContent = note.title || 'Untitled';
      ni.addEventListener('click', () => {
        currentProjectId = proj.id; currentNoteId = note.id;
        document.getElementById('note-title').value   = note.title;
        document.getElementById('note-content').value = note.content;
        showEditor(true); renderProjects(); window.togglePanel('notes');
      });
      body.appendChild(ni);
    });
  });
}

function refreshMiniVault(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  body.innerHTML = '';
  if (!vaultUnlocked) {
    const ld = document.createElement('div'); ld.className = 'mw-vault-lock';
    const pwId = 'mwvp-' + wid;
    ld.innerHTML = '<p>Vault locked</p><input type="password" id="' + pwId + '" placeholder="Master password" autocomplete="off" />';
    body.appendChild(ld);
    const btn = document.createElement('button');
    btn.className = 'action-btn'; btn.style.cssText = 'margin:0 12px 10px;width:calc(100% - 24px)';
    btn.textContent = 'Unlock';
    const tryUnlock = async () => {
      const inp = document.getElementById(pwId); if (!inp) return;
      const pw = inp.value; if (!pw) return;
      try {
        if (!state.vault.verifier) {
          state.vault.verifier = await window.hb.encrypt('hb-verify', pw);
          masterPassword = pw; vaultUnlocked = true; await save();
        } else {
          const r = await window.hb.decrypt(state.vault.verifier, pw);
          if (r !== 'hb-verify') { inp.value=''; inp.placeholder='Incorrect password'; return; }
          masterPassword = pw; vaultUnlocked = true;
        }
        syncVaultUI(); refreshAllMiniWidgets('vault');
      } catch(e) { console.error('Vault unlock error', e); }
    };
    btn.addEventListener('click', tryUnlock);
    const inp = ld.querySelector('input');
    if (inp) inp.addEventListener('keydown', e => e.key === 'Enter' && tryUnlock());
    body.appendChild(btn); return;
  }
  const entries = state.vault.entries.slice(0,5);
  if (!entries.length) { body.innerHTML = '<div class="mw-empty">No passwords saved.</div>'; return; }
  entries.forEach(entry => {
    const el = document.createElement('div'); el.className = 'mw-vault-entry';
    el.innerHTML = '<div class="mw-ve-icon">' + entry.name.charAt(0).toUpperCase() + '</div>' +
      '<div class="mw-ve-info"><div class="mw-ve-name">' + esc(entry.name) + '</div>' +
      '<div class="mw-ve-user">' + esc(entry.username||'—') + '</div></div>' +
      '<button class="mw-copy-btn">Copy</button>';
    el.querySelector('.mw-copy-btn').addEventListener('click', async () => {
      if (!entry.encPassword) return;
      try {
        const pw = await window.hb.decrypt(entry.encPassword, masterPassword);
        if (pw) { await navigator.clipboard.writeText(pw); const b=el.querySelector('.mw-copy-btn'); b.textContent='✓'; setTimeout(()=>{b.textContent='Copy';},2000); }
      } catch(e) {}
    });
    body.appendChild(el);
  });
  if (state.vault.entries.length > 5) {
    const more = document.createElement('div');
    more.style.cssText = 'font-size:11px;color:var(--text-3);padding:4px 12px 6px;cursor:pointer';
    more.textContent = '+ ' + (state.vault.entries.length-5) + ' more';
    more.addEventListener('click', () => window.togglePanel('vault')); body.appendChild(more);
  }
}

function refreshMiniShortcuts(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  body.innerHTML = '';
  KB_SHORTCUTS.forEach(sc => {
    const row = document.createElement('div'); row.className = 'mw-shortcut-row';
    row.innerHTML = '<span class="mw-shortcut-label">' + esc(sc.label) + '</span><span class="mw-shortcut-keys">' + esc(sc.keys) + '</span>';
    body.appendChild(row);
  });
}


// ═══════════════════════════════════════════════════════════════
// NEW WIDGETS: CALENDAR, POMODORO, HABITS, COUNTDOWN
// ═══════════════════════════════════════════════════════════════

// ── Calendar ────────────────────────────────────────────────────
function renderCalendarWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  const w = state.boardWidgets.find(x => x.id === wid); const opts = w?.opts || {};
  const startDay = parseInt(opts.calStartDay ?? 0); // 0=Sun, 1=Mon
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
  const rawFirst = new Date(year, month, 1).getDay();
  const first = ((rawFirst - startDay) + 7) % 7;
  const days  = new Date(year, month+1, 0).getDate();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dowLabels = startDay === 1 ? ['Mo','Tu','We','Th','Fr','Sa','Su'] : ['Su','Mo','Tu','We','Th','Fr','Sa'];
  // Which column indices are weekend? Sun=0, Sat=6 relative to start
  const sunCol = ((0 - startDay) + 7) % 7;
  const satCol = ((6 - startDay) + 7) % 7;
  const weekendCols = new Set([sunCol, satCol]);

  let html = '<div class="cal-head"><span class="cal-month">' + months[month] + ' ' + year + '</span></div>';
  html += '<div class="cal-grid">';
  dowLabels.forEach((d, i) => {
    html += '<span class="cal-dow' + (weekendCols.has(i) ? ' cal-weekend-dow' : '') + '">' + d + '</span>';
  });
  for (let i = 0; i < first; i++) html += '<span class="cal-day empty"></span>';
  for (let d = 1; d <= days; d++) {
    const col = (first + d - 1) % 7;
    const isWeekend = weekendCols.has(col);
    const isToday   = d === today;
    let cls = 'cal-day';
    if (isToday)   cls += ' today';
    if (isWeekend && !isToday) cls += ' cal-weekend';
    html += '<span class="' + cls + '">' + d + '</span>';
  }
  html += '</div>';
  body.innerHTML = html;
}

// ── Pomodoro ─────────────────────────────────────────────────────
const _pomo = {};
function renderPomodoroWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  const w = state.boardWidgets.find(x => x.id === wid); const opts = w?.opts || {};
  const workSecs  = (opts.pomoWork  ?? 25) * 60;
  const breakSecs = (opts.pomoBreak ?? 5)  * 60;
  if (!_pomo[wid]) _pomo[wid] = { phase:'work', remaining:workSecs, running:false, sessions:0 };
  const state_ = _pomo[wid];
  const total = state_.phase === 'work' ? workSecs : breakSecs;
  const pct   = state_.remaining / total;
  const r = 38, circ = 2 * Math.PI * r;
  const dash = circ * pct, gap = circ * (1 - pct);
  const isWork = state_.phase === 'work';
  const arcColor = isWork ? 'var(--accent)' : '#6abf8a';
  const fmt = s => String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
  const label = isWork ? 'Focus' : 'Break';
  body.innerHTML =
    '<div class="pomo-ring-wrap">' +
      '<svg class="pomo-ring" viewBox="0 0 100 100">' +
        '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="7"/>' +
        '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + arcColor + '" stroke-width="7"' +
          ' stroke-dasharray="' + dash.toFixed(2) + ' ' + gap.toFixed(2) + '"' +
          ' stroke-dashoffset="' + (circ * 0.25).toFixed(2) + '"' +
          ' stroke-linecap="round" transform="rotate(-90 50 50)"/>' +
        '<text x="50" y="46" text-anchor="middle" class="pomo-ring-time">' + fmt(state_.remaining) + '</text>' +
        '<text x="50" y="60" text-anchor="middle" class="pomo-ring-label">' + label + '</text>' +
      '</svg>' +
    '</div>' +
    (state_.sessions ? '<div class="pomo-sessions">' + state_.sessions + ' session' + (state_.sessions>1?'s':'') + ' done ✓</div>' : '') +
    '<div class="pomo-controls">' +
      '<button class="pomo-btn" id="pomo-start-' + wid + '">' + (state_.running ? '⏸' : '▶') + '</button>' +
      '<button class="pomo-btn" id="pomo-reset-' + wid + '">↺</button>' +
    '</div>';
  document.getElementById('pomo-start-' + wid).onclick = () => {
    state_.running = !state_.running;
    if (state_.running) {
      state_._iv = setInterval(() => {
        state_.remaining--;
        if (state_.remaining <= 0) {
          clearInterval(state_._iv); state_.running = false;
          if (state_.phase === 'work') { state_.sessions++; state_.phase = 'break'; state_.remaining = breakSecs; }
          else { state_.phase = 'work'; state_.remaining = workSecs; }
        }
        renderPomodoroWidget(wid);
      }, 1000);
    } else {
      clearInterval(state_._iv);
    }
    renderPomodoroWidget(wid);
  };
  document.getElementById('pomo-reset-' + wid).onclick = () => {
    clearInterval(state_._iv); state_.running = false; state_.phase = 'work'; state_.remaining = workSecs;
    renderPomodoroWidget(wid);
  };
}

// ── Habit Tracker ────────────────────────────────────────────────
function renderHabitsWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  const w = state.boardWidgets.find(x => x.id === wid); const opts = w?.opts || {};
  const today = new Date().toDateString();
  if (!state.habits) state.habits = [];
  const checks = state.habitChecks || (state.habitChecks = {});
  if (checks._date !== today) { Object.keys(checks).forEach(k => { if (k !== '_date') delete checks[k]; }); checks._date = today; }

  body.innerHTML = '';
  const done = state.habits.filter(h => !!checks[h.id]).length;
  const total = state.habits.length;
  if (total) {
    const pct = Math.round((done / total) * 100);
    const bar = document.createElement('div'); bar.className = 'habit-progress-wrap';
    bar.innerHTML =
      '<div class="habit-progress-bar"><div class="habit-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="habit-progress-label">' + done + '/' + total + ' today</span>';
    body.appendChild(bar);
  }
  if (!total) {
    body.innerHTML = '<div class="mw-empty">No habits yet.<br><small>Type below to add one.</small></div>';
  }
  state.habits.forEach((h, i) => {
    const checked = !!checks[h.id];
    const row = document.createElement('div'); row.className = 'habit-row' + (checked ? ' habit-done' : '');
    row.innerHTML = '<input type="checkbox" ' + (checked?'checked':'') + ' /><span class="habit-label">' + esc(h.name) + '</span>' +
      '<button class="habit-del" title="Remove">×</button>';
    row.querySelector('input').onchange = e => {
      checks[h.id] = e.target.checked; save(); renderHabitsWidget(wid);
    };
    row.querySelector('.habit-del').onclick = () => {
      state.habits.splice(i,1); save(); renderHabitsWidget(wid);
    };
    body.appendChild(row);
  });

  const addRow = document.createElement('div'); addRow.className = 'habit-add-row';
  addRow.innerHTML = '<input type="text" class="habit-input" placeholder="Add habit…" /><button class="habit-add-btn">+</button>';
  const input = addRow.querySelector('.habit-input');
  const addFn = () => {
    const name = input.value.trim(); if (!name) return;
    if (!state.habits) state.habits = [];
    state.habits.push({ id: uid(), name }); input.value = '';
    save(); renderHabitsWidget(wid);
  };
  addRow.querySelector('.habit-add-btn').onclick = addFn;
  input.addEventListener('keydown', e => e.key === 'Enter' && addFn());
  body.appendChild(addRow);
}

// ── Countdown ────────────────────────────────────────────────────
function renderCountdownWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  if (!state.countdowns) state.countdowns = {};
  const cd = state.countdowns[wid] || (state.countdowns[wid] = { name:'', date:'' });

  if (!cd.date) {
    body.innerHTML =
      '<div class="cd-setup">' +
        '<input class="cd-name-input" placeholder="Event name…" value="' + esc(cd.name) + '" />' +
        '<input class="cd-date-input" type="date" value="' + esc(cd.date) + '" />' +
        '<button class="cd-save-btn">Set</button>' +
      '</div>';
    const nameI = body.querySelector('.cd-name-input');
    const dateI = body.querySelector('.cd-date-input');
    body.querySelector('.cd-save-btn').onclick = () => {
      cd.name = nameI.value.trim(); cd.date = dateI.value;
      save(); renderCountdownWidget(wid);
    };
    return;
  }

  const target = new Date(cd.date + 'T00:00:00');
  const now    = new Date();
  const diff   = target - now;
  const days   = Math.ceil(diff / 86400000);
  const past   = diff < 0;
  body.innerHTML =
    '<div class="cd-name">' + esc(cd.name || 'Countdown') + '</div>' +
    '<div class="cd-days ' + (past?'cd-past':'') + '">' + (past ? Math.abs(days) : days) + '</div>' +
    '<div class="cd-label">' + (past ? 'days ago' : days === 1 ? 'day to go' : 'days to go') + '</div>' +
    '<div class="cd-date-line">' + target.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}) + '</div>' +
    '<button class="cd-reset-btn">Change</button>';
  body.querySelector('.cd-reset-btn').onclick = () => {
    cd.date = ''; save(); renderCountdownWidget(wid);
  };
}

// ── Quote of the Day ─────────────────────────────────────────────
const QUOTES = [
  { text:'She turned her can\'ts into cans and her dreams into plans.', attr:'Kobi Yamada' },
  { text:'You are enough, a thousand times enough.', attr:'' },
  { text:'A flower does not think of competing with the flower next to it. It just blooms.', attr:'' },
  { text:'Do small things with great love.', attr:'Mother Teresa' },
  { text:'Be the energy you want to attract.', attr:'' },
  { text:'Create the things you wish existed.', attr:'' },
  { text:'She believed she could, so she did.', attr:'' },
  { text:'There is always something beautiful to be found if you look.', attr:'' },
  { text:'Let her sleep, for when she wakes, she will move mountains.', attr:'' },
  { text:'Start where you are. Use what you have. Do what you can.', attr:'Arthur Ashe' },
  { text:'Be gentle with yourself, you are a child of the universe.', attr:'Desiderata' },
  { text:'Not all those who wander are lost.', attr:'Tolkien' },
  { text:'You\'ve always had the power, my dear.', attr:'Glinda' },
  { text:'Stay close to anything that makes you glad you are alive.', attr:'Hafiz' },
  { text:'Darling, you are made of starlight.', attr:'' },
  { text:'Make it happen, shock everyone.', attr:'' },
  { text:'Collect beautiful moments.', attr:'' },
  { text:'Everything you need is already inside you.', attr:'' },
  { text:'Her soul is fierce, her heart is brave, her mind is strong.', attr:'' },
  { text:'Good things take time.', attr:'' },
  { text:'The sun is a daily reminder that we too can rise again from the darkness.', attr:'' },
  { text:'Be your own kind of beautiful.', attr:'' },
  { text:'Wild women don\'t get the blues.', attr:'' },
  { text:'In the middle of difficulty lies opportunity.', attr:'Einstein' },
  { text:'The world is yours and everything in it.', attr:'Fitzgerald' },
  { text:'She is clothed in strength and dignity.', attr:'Proverbs 31:25' },
  { text:'Life is short, make it sweet.', attr:'' },
  { text:'Bloom where you are planted.', attr:'' },
  { text:'Every day is a fresh beginning.', attr:'' },
  { text:'She has a galaxy in her eyes and a fire in her soul.', attr:'' },
  { text:'Do more of what makes you happy.', attr:'' },
  { text:'The secret is to enjoy the journey.', attr:'' },
  { text:'Courage, dear heart.', attr:'C.S. Lewis' },
];

function renderQuoteWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  const w = state.boardWidgets.find(x => x.id === wid);
  if (!w.opts) w.opts = {};
  // Pick a quote: persisted index or daily rotation
  const dayIdx = Math.floor(Date.now() / 86400000) % QUOTES.length;
  const idx = w.opts.quoteIdx ?? dayIdx;
  const q = QUOTES[idx];
  body.innerHTML =
    '<div class="quote-wrap">' +
      '<div class="quote-mark">&ldquo;</div>' +
      '<div class="quote-text">' + esc(q.text) + '</div>' +
      (q.attr ? '<div class="quote-attr">&mdash; ' + esc(q.attr) + '</div>' : '') +
      '<div class="quote-controls">' +
        '<button class="quote-btn" id="qprev-' + wid + '">&#8592;</button>' +
        '<button class="quote-btn" id="qrand-' + wid + '">&#9785;</button>' +
        '<button class="quote-btn" id="qnext-' + wid + '">&#8594;</button>' +
      '</div>' +
    '</div>';
  body.querySelector('#qprev-' + wid).onclick = () => { w.opts.quoteIdx = (idx - 1 + QUOTES.length) % QUOTES.length; save(); renderQuoteWidget(wid); };
  body.querySelector('#qnext-' + wid).onclick = () => { w.opts.quoteIdx = (idx + 1) % QUOTES.length; save(); renderQuoteWidget(wid); };
  body.querySelector('#qrand-' + wid).onclick = () => { w.opts.quoteIdx = Math.floor(Math.random() * QUOTES.length); save(); renderQuoteWidget(wid); };
}

// ── Photo Strip ───────────────────────────────────────────────────
function renderPhotoStripWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  const w = state.boardWidgets.find(x => x.id === wid);
  if (!w.opts) w.opts = {};
  const slots = [0,1,2].map(i => w.opts['photo' + i] || '');
  const captions = [0,1,2].map(i => w.opts['caption' + i] || '');
  body.innerHTML =
    '<div class="photostrip-wrap">' +
    slots.map((src, i) =>
      '<div class="ps-slot">' +
        (src
          ? '<div class="ps-photo"><img src="' + esc(src) + '" draggable="false" /><input class="ps-caption" value="' + esc(captions[i]) + '" placeholder="caption…" data-ci="' + i + '" /></div>'
          : '<label class="ps-empty"><input type="text" class="ps-url-input" placeholder="Image URL…" data-slot="' + i + '" /></label>'
        ) +
      '</div>'
    ).join('') +
    '</div>';
  body.querySelectorAll('.ps-url-input').forEach(inp => {
    inp.addEventListener('change', () => {
      w.opts['photo' + inp.dataset.slot] = inp.value.trim();
      save(); renderPhotoStripWidget(wid);
    });
  });
  body.querySelectorAll('.ps-caption').forEach(inp => {
    inp.addEventListener('change', () => {
      w.opts['caption' + inp.dataset.ci] = inp.value;
      save();
    });
  });
  // Long-press/right-click to clear a photo
  body.querySelectorAll('.ps-photo img').forEach((img, i) => {
    img.addEventListener('dblclick', () => {
      w.opts['photo' + i] = '';
      save(); renderPhotoStripWidget(wid);
    });
  });
}

// ── Moon Phase ───────────────────────────────────────────────────
function getMoonPhase(date) {
  // Known new moon: Jan 6 2000 18:14 UTC
  const knownNew = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const cycle = 29.53058867;
  const elapsed = (date - knownNew) / (1000 * 60 * 60 * 24);
  const age = ((elapsed % cycle) + cycle) % cycle; // days into current cycle
  const pct = age / cycle;

  const phases = [
    { name: 'New Moon',        emoji: '🌑', min: 0,     max: 0.033 },
    { name: 'Waxing Crescent', emoji: '🌒', min: 0.033, max: 0.25  },
    { name: 'First Quarter',   emoji: '🌓', min: 0.25,  max: 0.283 },
    { name: 'Waxing Gibbous',  emoji: '🌔', min: 0.283, max: 0.5   },
    { name: 'Full Moon',       emoji: '🌕', min: 0.5,   max: 0.533 },
    { name: 'Waning Gibbous',  emoji: '🌖', min: 0.533, max: 0.75  },
    { name: 'Last Quarter',    emoji: '🌗', min: 0.75,  max: 0.783 },
    { name: 'Waning Crescent', emoji: '🌘', min: 0.783, max: 1     },
  ];
  const phase = phases.find(p => pct >= p.min && pct < p.max) || phases[0];
  const daysLeft = Math.round((1 - pct) * cycle);
  const nextFull = pct < 0.5
    ? Math.round((0.5 - pct) * cycle)
    : Math.round((1.5 - pct) * cycle);
  return { ...phase, age: Math.round(age), daysLeft, nextFull, pct };
}

// ── Vinyl ─────────────────────────────────────────────────────────
const _vinyl = {};
function renderVinylWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  const w = state.boardWidgets.find(x => x.id === wid);
  if (!w.opts) w.opts = {};
  const opts = w.opts;
  if (!_vinyl[wid]) _vinyl[wid] = { spinning: false, editOpen: false };
  const spinning   = _vinyl[wid].spinning;
  const editOpen   = _vinyl[wid].editOpen;

  const title  = opts.vinylTitle  || '';
  const artist = opts.vinylArtist || '';
  const album  = opts.vinylAlbum  || '';
  const color  = opts.vinylColor  || '#9c6b5e';
  const artUrl = opts.vinylArt    || '';
  const labelStyle = artUrl ? 'background:#111' : 'background:' + color;

  body.innerHTML =
    '<div class="vinyl-wrap">' +
      '<div class="vinyl-scene">' +
        '<div class="vinyl-arm' + (spinning ? ' arm-on' : '') + '"></div>' +
        '<div class="vinyl-record' + (spinning ? ' spinning' : '') + '">' +
          '<div class="vinyl-label" style="' + labelStyle + '" id="vl-' + wid + '">' +
            (artUrl ? '<img src="' + esc(artUrl) + '" draggable="false" onerror="this.style.display=\'none\'" />' : '') +
            '<div class="vinyl-center-dot"></div>' +
          '</div>' +
          '<div class="vinyl-shine"></div>' +
        '</div>' +
        '<button class="vinyl-play-btn" id="vpb-' + wid + '">' + (spinning ? '&#9646;&#9646;' : '&#9654;') + '</button>' +
      '</div>' +
      '<div class="vinyl-info">' +
        '<input class="vinyl-field vinyl-title" placeholder="Song title…" value="' + esc(title) + '" data-vfield="vinylTitle" />' +
        '<input class="vinyl-field vinyl-artist" placeholder="Artist…" value="' + esc(artist) + '" data-vfield="vinylArtist" />' +
        '<input class="vinyl-field vinyl-album" placeholder="Album…" value="' + esc(album) + '" data-vfield="vinylAlbum" />' +
      '</div>' +
      '<button class="vinyl-set-art-btn" id="vsa-' + wid + '">' + (editOpen ? 'Close' : 'Set Art / Colour') + '</button>' +
      '<div class="vinyl-edit-row' + (editOpen ? '' : ' hidden') + '" id="vedit-' + wid + '">' +
        '<label class="vinyl-color-wrap" title="Label colour">' +
          '<input type="color" class="vinyl-color-pick" value="' + color + '" />' +
          '<span>Label colour</span>' +
        '</label>' +
        '<input type="text" class="vinyl-art-input" placeholder="Art image URL…" value="' + esc(artUrl) + '" />' +
      '</div>' +
    '</div>';

  body.querySelector('#vpb-' + wid).onclick = () => {
    _vinyl[wid].spinning = !_vinyl[wid].spinning;
    renderVinylWidget(wid);
  };
  body.querySelector('#vsa-' + wid).onclick = () => {
    _vinyl[wid].editOpen = !_vinyl[wid].editOpen;
    renderVinylWidget(wid);
  };
  body.querySelectorAll('.vinyl-field').forEach(input => {
    input.addEventListener('change', () => { w.opts[input.dataset.vfield] = input.value; save(); });
  });
  const colorPick = body.querySelector('.vinyl-color-pick');
  if (colorPick) {
    colorPick.addEventListener('input', e => {
      const lbl = body.querySelector('#vl-' + wid);
      if (lbl && !w.opts.vinylArt) lbl.style.background = e.target.value;
    });
    colorPick.addEventListener('change', e => { w.opts.vinylColor = e.target.value; save(); });
  }
  const artInput = body.querySelector('.vinyl-art-input');
  if (artInput) artInput.addEventListener('change', () => { w.opts.vinylArt = artInput.value.trim(); save(); renderVinylWidget(wid); });
}

function moonPhaseSVG(pct) {
  const r = 36, cx = 40, cy = 40;
  if (pct < 0.02 || pct > 0.98) {
    return '<svg viewBox="0 0 80 80" class="moon-svg"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#1a1f3a" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></svg>';
  }
  if (pct > 0.48 && pct < 0.52) {
    return '<svg viewBox="0 0 80 80" class="moon-svg"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#e8e3d5" stroke="rgba(200,190,170,0.4)" stroke-width="0.5"/><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(r*0.3)+'" ry="'+(r*0.28)+'" fill="rgba(200,185,160,0.18)"/></svg>';
  }
  const isWaxing = pct < 0.5;
  const t = isWaxing ? pct / 0.5 : (1 - pct) / 0.5;
  const rx = Math.abs(Math.cos(t * Math.PI) * r).toFixed(1);
  const litArc = isWaxing ? 1 : 0;
  const termSweep = t < 0.5 ? 0 : 1;
  const path = `M ${cx},${cy-r} A ${r},${r} 0 0,${litArc} ${cx},${cy+r} A ${rx},${r} 0 0,${termSweep} ${cx},${cy-r} Z`;
  return `<svg viewBox="0 0 80 80" class="moon-svg"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a1f3a" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/><path d="${path}" fill="#e8e3d5"/></svg>`;
}

function renderMoonWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  const w = state.boardWidgets.find(x => x.id === wid); const opts = w?.opts || {};
  const m = getMoonPhase(new Date());
  const illumination = Math.round(Math.sin(m.pct * Math.PI) * 100);
  const compact = opts.moonStyle === 'compact';
  let html = '<div class="moon-graphic-wrap">' + moonPhaseSVG(m.pct) + '</div><div class="moon-name">' + m.name + '</div>';
  if (!compact) {
    const stats = [];
    if (opts.moonAge      !== false) stats.push('<div class="moon-stat"><span class="moon-stat-val">' + m.age + '</span><span class="moon-stat-lbl">days old</span></div>');
    if (opts.moonIllum    !== false) stats.push('<div class="moon-stat"><span class="moon-stat-val">' + illumination + '%</span><span class="moon-stat-lbl">lit</span></div>');
    if (opts.moonNextFull !== false) stats.push('<div class="moon-stat"><span class="moon-stat-val">' + m.nextFull + '</span><span class="moon-stat-lbl">to full</span></div>');
    if (stats.length) html += '<div class="moon-stats">' + stats.join('') + '</div>';
  }
  body.innerHTML = html;
}

// ── Hide / restore built-in widgets ─────────────────────────────
window.hideBuiltinWidget = function(id) {
  const el = document.getElementById('widget-' + id);
  if (el) el.classList.add('hidden');
  if (!state.settings.hiddenWidgets) state.settings.hiddenWidgets = [];
  if (!state.settings.hiddenWidgets.includes(id)) state.settings.hiddenWidgets.push(id);
  save();
  updateRestoreBtn();
};

window.restoreBuiltinWidgets = function() {
  state.settings.hiddenWidgets = [];
  ['clock','apps'].forEach(id => {
    const el = document.getElementById('widget-' + id);
    if (el) el.classList.remove('hidden');
  });
  save();
  updateRestoreBtn();
};

function applyHiddenWidgets() {
  const hidden = state.settings.hiddenWidgets || [];
  hidden.forEach(id => {
    const el = document.getElementById('widget-' + id);
    if (el) el.classList.add('hidden');
  });
  updateRestoreBtn();
}

function updateRestoreBtn() {
  const btn = document.getElementById('tad-restore-btn');
  if (!btn) return;
  const hidden = state.settings.hiddenWidgets || [];
  btn.style.display = hidden.length ? '' : 'none';
}

// ═══════════════════════════════════════════════════════════════
// PROJECT NOTES
// ═══════════════════════════════════════════════════════════════

function setupNotes() {
  const newProjBtn = document.getElementById('new-project-btn');
  if (newProjBtn) newProjBtn.addEventListener('click', () => {
    showInlineModal('New project', 'Project name…', name => {
      state.projects.push({ id:uid(), name, notes:[] });
      renderProjects(); refreshAllMiniWidgets('notes'); save();
    });
  });

  const saveBtn   = document.getElementById('save-note-btn');
  const contentEl = document.getElementById('note-content');
  const titleEl   = document.getElementById('note-title');
  const delBtn    = document.getElementById('delete-note-btn');

  if (saveBtn)   saveBtn.addEventListener('click',  saveNote);
  if (contentEl) contentEl.addEventListener('blur', saveNote);
  if (titleEl)   titleEl.addEventListener('blur',   saveNote);
  if (delBtn)    delBtn.addEventListener('click', () => {
    if (!currentProjectId || !currentNoteId) return;
    const proj = state.projects.find(p => p.id === currentProjectId); if (!proj) return;
    proj.notes = proj.notes.filter(n => n.id !== currentNoteId);
    currentNoteId = null; showEditor(false);
    renderProjects(); refreshAllMiniWidgets('notes'); save();
  });
}

function saveNote() {
  if (!currentProjectId || !currentNoteId) return;
  const proj = state.projects.find(p => p.id === currentProjectId);
  const note = proj && proj.notes.find(n => n.id === currentNoteId);
  if (!note) return;
  const titleEl   = document.getElementById('note-title');
  const contentEl = document.getElementById('note-content');
  note.title   = titleEl   ? titleEl.value   : note.title;
  note.content = contentEl ? contentEl.value : note.content;
  renderProjects(); refreshAllMiniWidgets('notes'); save();
}

function showEditor(show) {
  const ph = document.getElementById('notes-placeholder');
  const ed = document.getElementById('notes-editor-inner');
  if (ph) ph.style.display = show ? 'none' : '';
  if (ed) ed.classList.toggle('hidden', !show);
}

function renderProjects() {
  const list = document.getElementById('projects-list'); if (!list) return;
  list.innerHTML = '';
  state.projects.forEach(proj => {
    const wrap = document.createElement('div'); wrap.className = 'project-item';
    const header = document.createElement('div');
    header.className = 'project-header' + (currentProjectId === proj.id ? ' open' : '');
    header.innerHTML = '<span class="project-name">' + esc(proj.name) + '</span>' +
      '<div class="proj-actions">' +
        '<button class="proj-btn" data-a="add">+</button>' +
        '<button class="proj-btn" data-a="rename">&#9998;</button>' +
        '<button class="proj-btn" data-a="delete">&#10005;</button>' +
      '</div>';
    header.querySelector('[data-a="add"]').addEventListener('click', e => {
      e.stopPropagation();
      showInlineModal('New note', 'Note title…', title => {
        const note = { id:uid(), title: title || 'Untitled', content:'' };
        proj.notes.push(note); currentProjectId = proj.id; currentNoteId = note.id;
        const t = document.getElementById('note-title'), c = document.getElementById('note-content');
        if (t) t.value = note.title; if (c) c.value = '';
        showEditor(true); renderProjects(); refreshAllMiniWidgets('notes'); save();
      });
    });
    header.querySelector('[data-a="rename"]').addEventListener('click', e => {
      e.stopPropagation();
      showInlineModal('Rename project', proj.name, name => {
        if (name.trim()) { proj.name = name.trim(); renderProjects(); refreshAllMiniWidgets('notes'); save(); }
      });
    });
    header.querySelector('[data-a="delete"]').addEventListener('click', e => {
      e.stopPropagation();
      showInlineModal('Delete "' + proj.name + '"? Type YES to confirm', '', val => {
        if (val.toUpperCase() !== 'YES') return;
        state.projects = state.projects.filter(p => p.id !== proj.id);
        if (currentProjectId === proj.id) { currentProjectId = null; currentNoteId = null; showEditor(false); }
        renderProjects(); refreshAllMiniWidgets('notes'); save();
      });
    });
    header.addEventListener('click', () => { currentProjectId = currentProjectId === proj.id ? null : proj.id; renderProjects(); });
    wrap.appendChild(header);

    if (currentProjectId === proj.id) {
      const nl = document.createElement('div'); nl.className = 'project-notes-list';
      if (!proj.notes.length) nl.innerHTML = '<div class="note-item" style="font-style:italic;cursor:default">No notes yet</div>';
      proj.notes.forEach(note => {
        const el = document.createElement('div');
        el.className = 'note-item' + (currentNoteId === note.id ? ' active' : '');
        el.textContent = note.title || 'Untitled';
        el.addEventListener('click', () => {
          currentNoteId = note.id;
          const t = document.getElementById('note-title'), c = document.getElementById('note-content');
          if (t) t.value = note.title; if (c) c.value = note.content;
          showEditor(true); renderProjects();
        });
        nl.appendChild(el);
      });
      wrap.appendChild(nl);
    }
    list.appendChild(wrap);
  });
}

// ═══════════════════════════════════════════════════════════════
// TO-DO
// ═══════════════════════════════════════════════════════════════

function setupTodos() {
  const input  = document.getElementById('todo-input');
  const addBtn = document.getElementById('todo-add-btn');
  const pri    = document.getElementById('todo-priority');
  const add = () => {
    if (!input) return;
    const text = input.value.trim(); if (!text) return;
    state.todos.push({ id:uid(), text, done:false, priority:pri ? pri.value : 'normal' });
    input.value = ''; if (pri) pri.value = 'normal';
    renderTodos(); refreshAllMiniWidgets('todo'); save();
  };
  if (addBtn) addBtn.addEventListener('click', add);
  if (input)  input.addEventListener('keydown', e => e.key === 'Enter' && add());
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); todoFilter = btn.dataset.filter; renderTodos();
    });
  });
}

function renderTodos() {
  const list = document.getElementById('todo-list'); if (!list) return;
  list.innerHTML = '';
  const vis = state.todos.filter(t => todoFilter==='all' ? true : todoFilter==='active' ? !t.done : t.done);
  if (!vis.length) { list.innerHTML = '<p style="text-align:center;color:var(--text-3);margin-top:30px;font-size:13px">Nothing here yet.</p>'; return; }
  vis.forEach(todo => {
    const el = document.createElement('div'); el.className = 'todo-item' + (todo.done ? ' done' : '');
    const badge = todo.priority==='high' ? '<span class="todo-badge badge-high">High</span>' :
                  todo.priority==='low'  ? '<span class="todo-badge badge-low">Low</span>'   : '<span class="todo-badge badge-normal"></span>';
    el.innerHTML = '<input type="checkbox" ' + (todo.done?'checked':'') + ' /><span class="todo-text">' + esc(todo.text) + '</span>' + badge + '<button class="todo-del">&#10005;</button>';
    el.querySelector('input').addEventListener('change', e => {
      const t=state.todos.find(t=>t.id===todo.id); if(t){t.done=e.target.checked;} renderTodos(); refreshAllMiniWidgets('todo'); save();
    });
    el.querySelector('.todo-del').addEventListener('click', () => {
      state.todos=state.todos.filter(t=>t.id!==todo.id); renderTodos(); refreshAllMiniWidgets('todo'); save();
    });
    list.appendChild(el);
  });
}

// ═══════════════════════════════════════════════════════════════
// VAULT
// ═══════════════════════════════════════════════════════════════

function setupVault() {
  const pwInput   = document.getElementById('vault-password-input');
  const unlockBtn = document.getElementById('vault-unlock-btn');
  const errorText = document.getElementById('vault-lock-error');

  if (!state.vault.verifier) {
    const t = document.getElementById('vault-lock-title');
    const d = document.getElementById('vault-lock-desc');
    if (t) t.textContent = 'Create a master password';
    if (d) d.textContent = 'Set a password to protect your vault.';
  }

  if (unlockBtn) unlockBtn.addEventListener('click', async () => {
    if (!pwInput) return;
    const pw = pwInput.value; if (errorText) errorText.textContent = '';
    if (!pw) { if (errorText) errorText.textContent = 'Please enter a password.'; return; }
    try {
      if (!state.vault.verifier) {
        state.vault.verifier = await window.hb.encrypt('hb-verify', pw);
        masterPassword = pw; vaultUnlocked = true; pwInput.value = '';
        syncVaultUI(); await save(); renderVaultEntries();
      } else {
        const r = await window.hb.decrypt(state.vault.verifier, pw);
        if (r === 'hb-verify') {
          masterPassword = pw; vaultUnlocked = true; pwInput.value = '';
          syncVaultUI(); renderVaultEntries(); refreshAllMiniWidgets('vault');
        } else {
          if (errorText) errorText.textContent = 'Incorrect password.';
          pwInput.value = ''; pwInput.focus();
        }
      }
    } catch(e) { console.error('Vault error', e); }
  });
  if (pwInput) pwInput.addEventListener('keydown', e => { if (e.key === 'Enter' && unlockBtn) unlockBtn.click(); });

  const lockBtn = document.getElementById('vault-lock-btn');
  if (lockBtn) lockBtn.addEventListener('click', () => {
    vaultUnlocked = false; masterPassword = null; syncVaultUI();
    const t = document.getElementById('vault-lock-title');
    if (t) t.textContent = 'Unlock Vault';
    refreshAllMiniWidgets('vault');
  });

  const addBtn    = document.getElementById('vault-add-btn');
  const searchEl  = document.getElementById('vault-search');
  const saveEBtn  = document.getElementById('vault-save-entry-btn');
  const cancelBtn = document.getElementById('vault-cancel-btn');
  const cancel2   = document.getElementById('vault-cancel-btn2');
  const modal     = document.getElementById('vault-modal');
  const togglePw  = document.getElementById('vault-toggle-pw');
  const genPw     = document.getElementById('vault-gen-pw');

  if (addBtn)    addBtn.addEventListener('click', () => openVaultModal(null));
  if (searchEl)  searchEl.addEventListener('input', e => renderVaultEntries(e.target.value.toLowerCase()));
  if (saveEBtn)  saveEBtn.addEventListener('click', saveVaultEntry);
  if (cancelBtn) cancelBtn.addEventListener('click', closeVaultModal);
  if (cancel2)   cancel2.addEventListener('click',   closeVaultModal);
  if (modal)     modal.addEventListener('click', e => { if (e.target === modal) closeVaultModal(); });

  if (togglePw) togglePw.addEventListener('click', () => {
    const inp = document.getElementById('vault-entry-password');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    togglePw.textContent = inp.type === 'password' ? 'Show' : 'Hide';
  });

  if (genPw) genPw.addEventListener('click', () => {
    const c = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*-_';
    let pw = ''; for (let i = 0; i < 20; i++) pw += c[Math.floor(Math.random()*c.length)];
    const inp = document.getElementById('vault-entry-password');
    if (inp) { inp.value = pw; inp.type = 'text'; }
    if (togglePw) togglePw.textContent = 'Hide';
  });
}

function syncVaultUI() {
  const ls = document.getElementById('vault-lock-screen');
  const vc = document.getElementById('vault-content');
  if (ls) ls.classList.toggle('hidden', vaultUnlocked);
  if (vc) vc.classList.toggle('hidden', !vaultUnlocked);
}

function openVaultModal(id) {
  editingVaultId = id;
  const title = document.getElementById('vault-modal-title');
  if (title) title.textContent = id ? 'Edit Password' : 'Add Password';
  ['vault-entry-name','vault-entry-username','vault-entry-password','vault-entry-notes'].forEach(elId => {
    const el = document.getElementById(elId); if (el) el.value = '';
  });
  const pwEl = document.getElementById('vault-entry-password');
  if (pwEl) pwEl.type = 'password';
  const toggleEl = document.getElementById('vault-toggle-pw');
  if (toggleEl) toggleEl.textContent = 'Show';
  if (id) {
    const entry = state.vault.entries.find(e => e.id === id);
    if (entry) {
      const n = document.getElementById('vault-entry-name');
      const u = document.getElementById('vault-entry-username');
      if (n) n.value = entry.name;
      if (u) u.value = entry.username || '';
    }
  }
  const modal = document.getElementById('vault-modal');
  if (modal) modal.classList.remove('hidden');
  setTimeout(() => { const el = document.getElementById('vault-entry-name'); if (el) el.focus(); }, 50);
}

function closeVaultModal() {
  const modal = document.getElementById('vault-modal');
  if (modal) modal.classList.add('hidden');
  editingVaultId = null;
}

async function saveVaultEntry() {
  const name     = (document.getElementById('vault-entry-name')?.value || '').trim();
  const username = (document.getElementById('vault-entry-username')?.value || '').trim();
  const password = document.getElementById('vault-entry-password')?.value || '';
  const notes    = (document.getElementById('vault-entry-notes')?.value || '').trim();
  if (!name) { alert('Please enter a name.'); return; }
  try {
    const encPw    = password ? await window.hb.encrypt(password, masterPassword) : null;
    const encNotes = notes    ? await window.hb.encrypt(notes,    masterPassword) : null;
    if (editingVaultId) {
      const entry = state.vault.entries.find(e => e.id === editingVaultId);
      if (entry) Object.assign(entry, { name, username, encPassword:encPw, encNotes });
    } else {
      state.vault.entries.push({ id:uid(), name, username, encPassword:encPw, encNotes });
    }
    await save(); closeVaultModal(); renderVaultEntries(); refreshAllMiniWidgets('vault');
  } catch(e) { console.error('Save vault entry error', e); }
}

async function renderVaultEntries(filter) {
  filter = filter || '';
  const list = document.getElementById('vault-list'); if (!list) return;
  list.innerHTML = '';
  const entries = state.vault.entries.filter(e =>
    e.name.toLowerCase().includes(filter) || (e.username||'').toLowerCase().includes(filter)
  );
  if (!entries.length) {
    list.innerHTML = '<div class="vault-empty">' + (filter ? 'No results.' : 'No passwords saved yet.<br>Click <strong>+ Add</strong> to get started.') + '</div>';
    return;
  }
  for (const entry of entries) {
    const el = document.createElement('div'); el.className = 'vault-entry';
    el.innerHTML = '<div class="vault-entry-icon">' + entry.name.charAt(0).toUpperCase() + '</div>' +
      '<div class="vault-entry-info"><div class="vault-entry-name">' + esc(entry.name) + '</div>' +
      '<div class="vault-entry-user">' + esc(entry.username||'—') + '</div></div>' +
      '<div class="vault-entry-actions"><button class="vault-btn copy-btn">Copy</button><button class="vault-btn edit-btn">Edit</button><button class="vault-btn del del-btn">Delete</button></div>';
    el.querySelector('.copy-btn').addEventListener('click', async () => {
      if (!entry.encPassword) return;
      try { const pw=await window.hb.decrypt(entry.encPassword,masterPassword); if(pw){await navigator.clipboard.writeText(pw);const b=el.querySelector('.copy-btn');b.textContent='Copied';setTimeout(()=>{b.textContent='Copy';},2000);} } catch(e){}
    });
    el.querySelector('.edit-btn').addEventListener('click', async () => {
      openVaultModal(entry.id);
      try {
        if(entry.encPassword){const pw=await window.hb.decrypt(entry.encPassword,masterPassword);const el2=document.getElementById('vault-entry-password');if(el2)el2.value=pw||'';}
        if(entry.encNotes){const n=await window.hb.decrypt(entry.encNotes,masterPassword);const el2=document.getElementById('vault-entry-notes');if(el2)el2.value=n||'';}
      } catch(e){}
    });
    el.querySelector('.del-btn').addEventListener('click', () => {
      if (!confirm('Delete "' + entry.name + '"?')) return;
      state.vault.entries = state.vault.entries.filter(e => e.id !== entry.id);
      save(); renderVaultEntries(filter); refreshAllMiniWidgets('vault');
    });
    list.appendChild(el);
  }
}

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// DIARY
// ═══════════════════════════════════════════════════════════════

let journalUnlocked   = false;
let currentJournalId  = null;
let journalAutoSaveTimer = null;

function setupJournal() {
  const pwInput   = document.getElementById('journal-password-input');
  const unlockBtn = document.getElementById('journal-unlock-btn');
  if (!pwInput || !unlockBtn) return;

  // Unlock uses the same vault master password verifier
  unlockBtn.addEventListener('click', () => tryUnlockJournal());
  pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlockJournal(); });

  document.getElementById('journal-new-btn')?.addEventListener('click', createJournalEntry);
  document.getElementById('journal-lock-btn')?.addEventListener('click', lockJournal);
  document.getElementById('journal-save-btn')?.addEventListener('click', () => saveJournalEntry(false));
  document.getElementById('journal-delete-btn')?.addEventListener('click', deleteJournalEntry);
  document.getElementById('journal-done-btn')?.addEventListener('click', async () => {
    await saveJournalEntry(false);
    // Deselect entry, show placeholder
    currentJournalId = null;
    document.getElementById('journal-editor-inner')?.classList.add('hidden');
    document.getElementById('journal-editor-placeholder')?.classList.remove('hidden');
    renderJournalList();
    refreshAllMiniWidgets('journal'); refreshAllMiniWidgets('journal-invite');
    refreshAllMiniWidgets('journal-invite');
  });

  // Update lock screen text to reflect whether a password exists yet
  syncJournalUI();

  // Auto-save on typing
  document.getElementById('journal-text')?.addEventListener('input', () => {
    clearTimeout(journalAutoSaveTimer);
    const status = document.getElementById('journal-save-status');
    if (status) status.textContent = 'Unsaved…';
    journalAutoSaveTimer = setTimeout(() => { saveJournalEntry(true); }, 1500);
  });

  // Mood buttons
  document.getElementById('journal-editor-inner')?.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveJournalEntry(true);
    });
  });
}

async function tryUnlockJournal() {
  const pwInput = document.getElementById('journal-password-input');
  const hint    = document.getElementById('journal-hint');
  const pw = pwInput?.value; if (!pw) return;

  // If vault is already set up, verify against its verifier
  if (state.vault.verifier) {
    try {
      const r = await window.hb.decrypt(state.vault.verifier, pw);
      if (r !== 'hb-verify') {
        if (pwInput) { pwInput.value = ''; pwInput.placeholder = 'Incorrect password'; }
        return;
      }
    } catch(e) {
      if (pwInput) { pwInput.value = ''; pwInput.placeholder = 'Incorrect password'; }
      return;
    }
  } else {
    // No master password yet — set it now (shared with vault)
    state.vault.verifier = await window.hb.encrypt('hb-verify', pw);
    masterPassword = pw; vaultUnlocked = true; await save();
  }

  masterPassword = pw; journalUnlocked = true;
  if (pwInput) pwInput.value = '';
  syncJournalUI();
  renderJournalList();
}

function lockJournal() {
  journalUnlocked   = false;
  currentJournalId  = null;
  syncJournalUI();
}

function syncJournalUI() {
  const lockScreen = document.getElementById('journal-lock-screen');
  const content    = document.getElementById('journal-content');
  const actions    = document.getElementById('journal-topbar-actions');
  if (lockScreen) lockScreen.style.display = journalUnlocked ? 'none' : '';
  if (content)    content.classList.toggle('hidden', !journalUnlocked);
  if (actions)    actions.style.display = journalUnlocked ? '' : 'none';

  const titleEl  = document.getElementById('journal-lock-title');
  const descEl   = document.getElementById('journal-lock-desc');
  const unlockEl = document.getElementById('journal-unlock-btn');
  const noPassword = !state.vault.verifier;
  if (titleEl)  titleEl.textContent  = noPassword ? 'Create a Password' : 'Unlock Journal';
  if (descEl)   descEl.textContent   = noPassword
    ? 'Choose a master password to protect your journal. You\'ll use this same password for the Vault too.'
    : 'Enter your master password to read your journal.';
  if (unlockEl) unlockEl.textContent = noPassword ? 'Set Password & Unlock' : 'Unlock';
}

function fmtJournalDate(isoStr) {
  const d = new Date(isoStr);
  const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months= ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' · ' + hh + ':' + mm;
}

function fmtJournalSidebarDate(isoStr) {
  const d = new Date(isoStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function renderJournalList() {
  const list = document.getElementById('journal-entry-list'); if (!list) return;
  list.innerHTML = '';
  const entries = (state.diary.entries || []).slice().reverse(); // newest first
  if (!entries.length) {
    list.innerHTML = '<div class="journal-empty">No entries yet.<br>Click <b>+ New Entry</b> to begin.</div>';
    return;
  }
  entries.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'journal-list-item' + (entry.id === currentJournalId ? ' active' : '');
    item.dataset.id = entry.id;
    const preview = entry.preview || '(no content)';
    item.innerHTML =
      '<div class="dli-date">' + (entry.mood ? entry.mood + ' ' : '') + fmtJournalSidebarDate(entry.createdAt) + '</div>' +
      '<div class="dli-preview">' + esc(preview) + '</div>';
    item.addEventListener('click', () => openJournalEntry(entry.id));
    list.appendChild(item);
  });
}

async function openJournalEntry(id) {
  const entry = state.diary.entries.find(e => e.id === id); if (!entry) return;
  currentJournalId = id;
  renderJournalList();

  const inner   = document.getElementById('journal-editor-inner');
  const pholder = document.getElementById('journal-editor-placeholder');
  if (inner)   inner.classList.remove('hidden');
  if (pholder) pholder.classList.add('hidden');

  // Decrypt body
  let body = '';
  try {
    if (entry.encBody) body = await window.hb.decrypt(entry.encBody, masterPassword);
  } catch(e) { body = '[Decryption error]'; }

  const dateEl = document.getElementById('journal-entry-datestamp');
  const textEl = document.getElementById('journal-text');
  if (dateEl) dateEl.textContent = fmtJournalDate(entry.createdAt);
  if (textEl) textEl.value = body;

  // Mood
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mood === entry.mood);
  });
  const status = document.getElementById('journal-save-status');
  if (status) status.textContent = '';
}

async function createJournalEntry() {
  const now = new Date().toISOString();
  const entry = { id: uid(), createdAt: now, updatedAt: now, mood: '', encBody: '', preview: '' };
  state.diary.entries.push(entry);
  currentJournalId = entry.id;
  renderJournalList();
  await openJournalEntry(entry.id);
  document.getElementById('journal-text')?.focus();
}

async function saveJournalEntry(silent = false) {
  if (!currentJournalId) return;
  const entry = state.diary.entries.find(e => e.id === currentJournalId); if (!entry) return;
  const textEl = document.getElementById('journal-text');
  const body   = textEl?.value || '';
  const activeMood = document.querySelector('.mood-btn.active');

  try {
    entry.encBody   = await window.hb.encrypt(body, masterPassword);
    entry.updatedAt = new Date().toISOString();
    entry.mood      = activeMood?.dataset.mood || entry.mood || '';
    entry.preview   = body.slice(0, 80).replace(/\n/g, ' ');
    await save();
    const status = document.getElementById('journal-save-status');
    if (status) { status.textContent = 'Saved'; setTimeout(() => { if (status) status.textContent = ''; }, 2000); }
    renderJournalList();
    refreshAllMiniWidgets('journal'); refreshAllMiniWidgets('journal-invite');
  } catch(e) { console.error('Journal save error', e); }
}

function deleteJournalEntry() {
  if (!currentJournalId) return;
  showInlineModal('Delete this entry?', 'Type YES to confirm', async val => {
    if (val.toUpperCase() !== 'YES') return;
    state.diary.entries = state.diary.entries.filter(e => e.id !== currentJournalId);
    currentJournalId = null;
    await save();
    renderJournalList();
    const inner   = document.getElementById('journal-editor-inner');
    const pholder = document.getElementById('journal-editor-placeholder');
    if (inner)   inner.classList.add('hidden');
    if (pholder) pholder.classList.remove('hidden');
    refreshAllMiniWidgets('journal'); refreshAllMiniWidgets('journal-invite');
  });
}

// Mini diary widget
function renderJournalWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  if (!journalUnlocked) {
    body.innerHTML =
      '<div class="mw-vault-lock">' +
        '<div style="font-size:24px;text-align:center;margin-bottom:6px;">📖</div>' +
        '<input type="password" class="mw-vault-pw" id="mwdp-' + wid + '" placeholder="Master password" autocomplete="off" />' +
        '<button class="mw-vault-unlock-btn" id="mwdub-' + wid + '">Unlock</button>' +
      '</div>';
    const inp = document.getElementById('mwdp-' + wid);
    const btn = document.getElementById('mwdub-' + wid);
    const tryUnlock = async () => {
      const pw = inp?.value; if (!pw) return;
      try {
        if (state.vault.verifier) {
          const r = await window.hb.decrypt(state.vault.verifier, pw);
          if (r !== 'hb-verify') { inp.value=''; inp.placeholder='Incorrect'; return; }
        } else {
          state.vault.verifier = await window.hb.encrypt('hb-verify', pw);
          masterPassword = pw; vaultUnlocked = true; await save();
        }
        masterPassword = pw; journalUnlocked = true;
        syncJournalUI();
        refreshAllMiniWidgets('journal'); refreshAllMiniWidgets('journal-invite');
      } catch(e) { inp.value=''; inp.placeholder='Incorrect'; }
    };
    if (btn) btn.onclick = tryUnlock;
    if (inp) inp.onkeydown = e => { if (e.key==='Enter') tryUnlock(); };
    return;
  }

  const entries = (state.diary.entries || []).slice().reverse().slice(0, 4);
  if (!entries.length) {
    body.innerHTML = '<div class="mw-empty">No diary entries yet.</div>';
    return;
  }
  body.innerHTML = '';
  entries.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'journal-mw-row';
    row.innerHTML =
      '<span class="journal-mw-date">' + (entry.mood ? entry.mood + ' ' : '') + fmtJournalSidebarDate(entry.createdAt) + '</span>' +
      '<span class="journal-mw-preview">' + esc(entry.preview || '…') + '</span>';
    row.onclick = () => window.togglePanel('journal');
    body.appendChild(row);
  });
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════

//  Journal invite widget 
function renderJournalInviteWidget(wid) {
  const body = document.getElementById('mw-body-' + wid); if (!body) return;
  const todayStr   = new Date().toDateString();
  const todayEntry = journalUnlocked
    ? (state.diary.entries || []).find(e => new Date(e.createdAt).toDateString() === todayStr)
    : null;

  if (!journalUnlocked) {
    body.innerHTML =
      '<div class="jw-invite locked">' +
        '<div class="jw-invite-icon"></div>' +
        '<div class="jw-invite-text">Unlock your journal to write today\'s entry</div>' +
        '<button class="jw-invite-btn" onclick="window.togglePanel(\'journal\')">Open Journal</button>' +
      '</div>';
    return;
  }

  if (todayEntry) {
    const mood = todayEntry.mood || '';
    body.innerHTML =
      '<div class="jw-done">' +
        '<div class="jw-done-top">' + mood + ' <span>Today\'s entry written</span></div>' +
        '<div class="jw-done-preview">' + esc(todayEntry.preview || '(no preview)') + '</div>' +
        '<button class="jw-invite-btn secondary" onclick="window.openJournalEntryFromWidget(\'' + todayEntry.id + '\')">Edit entry</button>' +
      '</div>';
  } else {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const now  = new Date();
    const h    = now.getHours();
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    body.innerHTML =
      '<div class="jw-invite">' +
        '<div class="jw-invite-icon"></div>' +
        '<div class="jw-invite-prompt">' + greeting + '!<br>How was your ' + days[now.getDay()] + '?</div>' +
        '<button class="jw-invite-btn" onclick="window.newJournalEntryFromWidget()">Write today\'s entry</button>' +
      '</div>';
  }
}

window.newJournalEntryFromWidget = async function() {
  window.togglePanel('journal');
  setTimeout(async () => { if (journalUnlocked) await createJournalEntry(); }, 250);
};
window.openJournalEntryFromWidget = function(id) {
  window.togglePanel('journal');
  setTimeout(() => { if (journalUnlocked) openJournalEntry(id); }, 250);
};

function setupSettings() {
  const s = state.settings;
  const set = (id, val) => { const el=document.getElementById(id); if(el) el[typeof val==='boolean'?'checked':'value']=val; };
  set('setting-startup',      !!s.startWithWindows);
  set('setting-accent',       s.accentColor    || '#9c6b5e');
  set('setting-font',         s.fontFamily     || 'Nunito');
  set('setting-dark-topbar',  s.darkTopbar !== false);
  set('setting-opacity',      Math.round((s.widgetOpacity ?? 0.95) * 100));
  set('setting-blur',         s.widgetBlur !== false);
  set('setting-note-style',   s.noteStyle      || 'classic');
  set('setting-clock-format', s.clockFormat    || '24');
  set('setting-board-tint',   s.boardTintColor || '#000000');
  set('setting-tint-opacity', s.boardTintOpacity ?? 0);

  document.querySelectorAll('.bg-preset').forEach(b => b.classList.toggle('active', b.dataset.bg === s.boardBg));
  if (s.boardBg === 'image' && s.boardImagePath) {
    const row = document.getElementById('bg-image-row'); if (row) row.classList.remove('hidden');
    const name = document.getElementById('bg-image-name'); if (name) name.textContent = 'Custom image loaded';
  }

  const on = (id, ev, fn) => { const el=document.getElementById(id); if(el) el.addEventListener(ev, fn); };
  on('setting-startup',      'change', async e => { s.startWithWindows=e.target.checked; await window.hb.setStartup(e.target.checked); save(); });
  on('setting-accent',       'input',  e => { s.accentColor=e.target.value; applySettings(); save(); });
  on('setting-font',         'change', e => { s.fontFamily=e.target.value; applySettings(); save(); });
  on('setting-dark-topbar',  'change', e => { s.darkTopbar=e.target.checked; applySettings(); save(); });
  on('setting-opacity',      'input',  e => { s.widgetOpacity=parseInt(e.target.value)/100; applySettings(); save(); });
  on('setting-blur',         'change', e => { s.widgetBlur=e.target.checked; applySettings(); save(); });
  on('setting-note-style',   'change', e => { s.noteStyle=e.target.value; applySettings(); save(); });
  on('setting-clock-format', 'change', e => { s.clockFormat=e.target.value; save(); });
  on('setting-board-tint',   'input',  e => { s.boardTintColor=e.target.value; applySettings(); save(); });
  on('setting-tint-opacity', 'input',  e => { s.boardTintOpacity=parseInt(e.target.value); applySettings(); save(); });

  document.querySelectorAll('.bg-preset').forEach(btn => {
    btn.addEventListener('click', async () => {
      const bg = btn.dataset.bg;
      if (bg === 'image') {
        try {
          const path = await window.hb.openImage(); if (!path) return;
          s.boardImagePath = path;
          const nm = document.getElementById('bg-image-name'); if(nm) nm.textContent = 'Custom image loaded';
        } catch(e) {}
      }
      const row = document.getElementById('bg-image-row'); if(row) row.classList.toggle('hidden', bg !== 'image');
      s.boardBg = bg;
      document.querySelectorAll('.bg-preset').forEach(b => b.classList.toggle('active', b === btn));
      applySettings(); save();
    });
  });

  on('upload-bg-btn', 'click', async () => {
    try {
      const path = await window.hb.openImage(); if (!path) return;
      s.boardImagePath = path;
      const nm = document.getElementById('bg-image-name'); if(nm) nm.textContent = 'Image updated';
      applySettings(); save();
    } catch(e) {}
  });

  renderShortcuts();

  // Icon for the shortcut being added: a picked image wins, then a typed emoji, then the app's own icon
  let pendingIcon = null, pendingIsCustom = false;
  const iconBtn = document.getElementById('shortcut-icon-btn');
  const showPendingIcon = () => {
    if (!iconBtn) return;
    iconBtn.innerHTML = pendingIcon ? '<img src="' + esc(pendingIcon) + '" alt="">' : '&#128444;';
  };
  const autoIcon = async () => {
    const p = (document.getElementById('shortcut-path')?.value || '').trim();
    if (pendingIsCustom || !p || !window.hb.fileIcon) return;
    pendingIcon = await window.hb.fileIcon(p); showPendingIcon();
  };
  on('shortcut-icon-btn', 'click', async () => {
    const img = await window.hb.openShortcutIcon(); if (!img) return;
    pendingIcon = img; pendingIsCustom = true; showPendingIcon();
  });
  on('shortcut-icon-btn', 'contextmenu', e => { e.preventDefault(); pendingIsCustom = false; pendingIcon = null; showPendingIcon(); autoIcon(); });
  on('shortcut-path', 'change', autoIcon);
  on('shortcut-browse-btn', 'click', async () => {
    const p = await window.hb.pickApp(); if (!p) return;
    document.getElementById('shortcut-path').value = p;
    const nm = document.getElementById('shortcut-name');
    if (nm && !nm.value.trim()) nm.value = p.split(/[\\/]/).pop().replace(/\.(exe|lnk|bat|url)$/i, '');
    autoIcon();
  });

  on('add-shortcut-btn', 'click', async () => {
    const name  = (document.getElementById('shortcut-name')?.value  || '').trim();
    const emoji = (document.getElementById('shortcut-emoji')?.value || '').trim();
    const path  = (document.getElementById('shortcut-path')?.value  || '').trim();
    if (!name || !path) { alert('Please enter a name and path.'); return; }
    let iconImage = pendingIsCustom ? pendingIcon : null;
    if (!iconImage && !emoji && window.hb.fileIcon) iconImage = pendingIcon || await window.hb.fileIcon(path);
    state.shortcuts.push({ id:uid(), name, emoji:emoji||'📁', iconImage:iconImage||null, path });
    ['shortcut-name','shortcut-emoji','shortcut-path'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    pendingIcon = null; pendingIsCustom = false; showPendingIcon();
    renderShortcuts(); renderApps(); save();
  });

  on('change-master-pw-btn', 'click', async () => {
    if (!vaultUnlocked) { alert('Please unlock your Vault first.'); return; }
    const newPw = prompt('New master password:'); if (!newPw) return;
    const conf  = prompt('Confirm new master password:'); if (newPw !== conf) { alert('Passwords do not match.'); return; }
    if (newPw.length < 4) { alert('Must be at least 4 characters.'); return; }
    try {
      for (const entry of state.vault.entries) {
        if(entry.encPassword){const p=await window.hb.decrypt(entry.encPassword,masterPassword);entry.encPassword=p?await window.hb.encrypt(p,newPw):null;}
        if(entry.encNotes){const n=await window.hb.decrypt(entry.encNotes,masterPassword);entry.encNotes=n?await window.hb.encrypt(n,newPw):null;}
      }
      state.vault.verifier = await window.hb.encrypt('hb-verify', newPw);
      masterPassword = newPw; await save(); alert('Master password changed.');
    } catch(e) { console.error('Change pw error', e); }
  });
}

function renderShortcuts() {
  const list = document.getElementById('shortcuts-list'); if (!list) return;
  list.innerHTML = '';
  if (!state.shortcuts.length) { list.innerHTML = '<p class="muted-text">No shortcuts yet.</p>'; return; }
  state.shortcuts.forEach(s => {
    const el = document.createElement('div'); el.className = 'shortcut-item';
    el.innerHTML = '<button class="s-icon" title="Click to choose an icon image, right-click to use the app icon">' + shortcutIconHtml(s) + '</button><span class="s-name">' + esc(s.name) + '</span><span class="s-path" title="' + esc(s.path) + '">' + esc(s.path) + '</span><button class="s-del">&#10005;</button>';
    el.querySelector('.s-del').addEventListener('click', () => { state.shortcuts=state.shortcuts.filter(x=>x.id!==s.id); renderShortcuts(); renderApps(); save(); });
    const ic = el.querySelector('.s-icon');
    ic.addEventListener('click', async () => {
      const img = await window.hb.openShortcutIcon(); if (!img) return;
      s.iconImage = img; renderShortcuts(); renderApps(); save();
    });
    ic.addEventListener('contextmenu', async e => {
      e.preventDefault();
      s.iconImage = window.hb.fileIcon ? await window.hb.fileIcon(s.path) : null;
      renderShortcuts(); renderApps(); save();
    });
    list.appendChild(el);
  });
}

function applySettings() {
  const s = state.settings, r = document.documentElement;
  r.style.setProperty('--accent',       s.accentColor || '#9c6b5e');
  r.style.setProperty('--accent-hover', adjustColor(s.accentColor || '#9c6b5e', -15));
  r.style.setProperty('--accent-light', hexToRgba(s.accentColor || '#9c6b5e', 0.1));
  const font = (s.fontFamily || 'Nunito') + ', sans-serif';
  r.style.setProperty('--font', font); document.body.style.fontFamily = font;
  document.body.className = document.body.className.replace(/\bnote-\w+/g,'');
  document.body.classList.add('note-' + (s.noteStyle || 'classic'));
  document.body.classList.toggle('topbar-light', !s.darkTopbar);
  r.style.setProperty('--widget-opacity', String(s.widgetOpacity ?? 0.95));
  r.style.setProperty('--widget-blur-px', s.widgetBlur !== false ? '14px' : '0px');
  const bd = document.getElementById('board'); if (!bd) return;
  bd.className = '';
  if (s.boardBg && s.boardBg !== 'cork') bd.classList.add('bg-' + s.boardBg);
  if (s.boardBg === 'image' && s.boardImagePath) bd.style.backgroundImage = 'url("' + s.boardImagePath + '")';
  else bd.style.backgroundImage = '';
  r.style.setProperty('--board-tint',         s.boardTintColor || '#000000');
  r.style.setProperty('--board-tint-opacity',  String((s.boardTintOpacity||0)/100));
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function shortcutIconHtml(s, fallback) {
  if (s.iconImage) return '<img class="sc-img" src="' + esc(s.iconImage) + '" alt="" draggable="false">';
  return esc(s.emoji || fallback || '📁');
}
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function hexToRgba(hex, a) {
  try {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  } catch(e) { return 'rgba(156,107,94,' + a + ')'; }
}
function adjustColor(hex, amt) {
  try {
    const cl=v=>Math.max(0,Math.min(255,v));
    const r=cl(parseInt(hex.slice(1,3),16)+amt), g=cl(parseInt(hex.slice(3,5),16)+amt), b=cl(parseInt(hex.slice(5,7),16)+amt);
    return '#'+r.toString(16).padStart(2,'0')+g.toString(16).padStart(2,'0')+b.toString(16).padStart(2,'0');
  } catch(e) { return hex; }
}

// ═══════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════
init();

