const { app, BrowserWindow, ipcMain, shell, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const userDataPath = app.getPath('userData');
const dataPath = path.join(userDataPath, 'homeboard-data.json');
const imagesDir = path.join(userDataPath, 'images');

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const defaultData = {
  boardNotes: [],
  todos: [],
  projects: [],
  vault: { verifier: null, entries: [] },
  shortcuts: [],
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
    boardTint: null,
  },
};

function loadData() {
  if (fs.existsSync(dataPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      return { ...defaultData, ...raw, settings: { ...defaultData.settings, ...(raw.settings || {}) } };
    } catch (e) {}
  }
  return { ...defaultData };
}

function saveData(data) {
  try { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); return true; }
  catch (e) { return false; }
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 680,
    frame: false,
    backgroundColor: '#f4f1ed',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
    show: false,
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });
}

app.whenReady().then(() => {
  createWindow();
  globalShortcut.register('Ctrl+Shift+H', () => {
    if (win) win.webContents.send('go-home');
  });
});
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
app.on('activate', () => !BrowserWindow.getAllWindows().length && createWindow());

ipcMain.handle('data:load', () => loadData());
ipcMain.handle('data:save', (_, data) => { saveData(data); return true; });
ipcMain.handle('app:open', (_, appPath) => shell.openPath(appPath));
ipcMain.handle('window:minimize', () => win && win.minimize());
ipcMain.handle('window:maximize', () => win && (win.isMaximized() ? win.unmaximize() : win.maximize()));
ipcMain.handle('window:close', () => win && win.close());
ipcMain.handle('startup:set', (_, enabled) => {
  const { execSync } = require('child_process');
  const exePath = app.getPath('exe').replace(/\\/g, '\\\\');
  const key = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
  try {
    if (enabled) {
      execSync(`reg add "${key}" /v Homeboard /t REG_SZ /d "${exePath}" /f`);
    } else {
      execSync(`reg delete "${key}" /v Homeboard /f`);
    }
  } catch (e) {}
});

ipcMain.handle('dialog:open-board-image', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Pin an image to the board',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','gif','webp','avif'] }],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const srcPath = result.filePaths[0];
  const ext = path.extname(srcPath);
  const destName = `pin_${Date.now()}${ext}`;
  const destPath = path.join(imagesDir, destName);
  fs.copyFileSync(srcPath, destPath);
  return `file://${destPath.replace(/\\/g, '/')}`;
});

ipcMain.handle('dialog:open-image', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Choose a background image',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'] }],
  });
  if (result.canceled || !result.filePaths.length) return null;

  const srcPath = result.filePaths[0];
  const ext = path.extname(srcPath).toLowerCase();
  const destName = `wallpaper_${Date.now()}${ext}`;
  const destPath = path.join(imagesDir, destName);

  // Clean up old wallpapers
  try {
    fs.readdirSync(imagesDir)
      .filter(f => f.startsWith('wallpaper_'))
      .forEach(f => fs.unlinkSync(path.join(imagesDir, f)));
  } catch (e) {}

  fs.copyFileSync(srcPath, destPath);
  return `file://${destPath.replace(/\\/g, '/')}`;
});

// AES-256-GCM encryption
ipcMain.handle('crypto:encrypt', (_, plaintext, password) => {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return {
    s: salt.toString('base64'),
    i: iv.toString('base64'),
    t: cipher.getAuthTag().toString('base64'),
    d: enc.toString('base64'),
  };
});

ipcMain.handle('crypto:decrypt', (_, obj, password) => {
  try {
    const key = crypto.pbkdf2Sync(password, Buffer.from(obj.s, 'base64'), 100000, 32, 'sha256');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(obj.i, 'base64'));
    decipher.setAuthTag(Buffer.from(obj.t, 'base64'));
    return decipher.update(Buffer.from(obj.d, 'base64')) + decipher.final('utf8');
  } catch { return null; }
});

// Shortcut icons: pick a custom image, or pull the real icon out of an .exe/file
ipcMain.handle('dialog:open-shortcut-icon', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Choose an icon',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'avif'] }],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const srcPath = result.filePaths[0];
  const destPath = path.join(imagesDir, `icon_${Date.now()}${path.extname(srcPath).toLowerCase()}`);
  fs.copyFileSync(srcPath, destPath);
  return `file://${destPath.replace(/\\/g, '/')}`;
});

ipcMain.handle('dialog:open-app', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Choose an app or file',
    properties: ['openFile'],
    filters: [{ name: 'Apps & shortcuts', extensions: ['exe', 'lnk', 'bat', 'url'] }, { name: 'All files', extensions: ['*'] }],
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

ipcMain.handle('app:file-icon', async (_, filePath) => {
  try {
    const img = await app.getFileIcon(filePath, { size: 'large' });
    return img.isEmpty() ? null : img.toDataURL();
  } catch { return null; }
});
