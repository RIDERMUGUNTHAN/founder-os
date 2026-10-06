const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('founderDesktop', {
  isElectron: true,
  platform: 'win32',
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
