const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.on('go-home', () => {
  if (window.goHome) window.goHome();
});

contextBridge.exposeInMainWorld('hb', {
  loadData:    () => ipcRenderer.invoke('data:load'),
  saveData:    (data) => ipcRenderer.invoke('data:save', data),
  saveDataSync: (data) => ipcRenderer.sendSync('data:save-sync', data),
  exportData:  (json) => ipcRenderer.invoke('data:export', json),
  importData:  () => ipcRenderer.invoke('data:import'),
  openBackups: () => ipcRenderer.invoke('data:open-backups'),
  openApp:     (p) => ipcRenderer.invoke('app:open', p),
  minimize:    () => ipcRenderer.invoke('window:minimize'),
  maximize:    () => ipcRenderer.invoke('window:maximize'),
  close:       () => ipcRenderer.invoke('window:close'),
  setStartup:  (e) => ipcRenderer.invoke('startup:set', e),
  openImage:       () => ipcRenderer.invoke('dialog:open-image'),
  openBoardImage:  () => ipcRenderer.invoke('dialog:open-board-image'),
  openShortcutIcon: () => ipcRenderer.invoke('dialog:open-shortcut-icon'),
  pickApp:         () => ipcRenderer.invoke('dialog:open-app'),
  fileIcon:        (p) => ipcRenderer.invoke('app:file-icon', p),
  encrypt:     (t, p) => ipcRenderer.invoke('crypto:encrypt', t, p),
  decrypt:     (o, p) => ipcRenderer.invoke('crypto:decrypt', o, p),
});
