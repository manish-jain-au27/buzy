const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electron', {
  onIdleTimeExceeded: (callback) => ipcRenderer.on('idle-time-exceeded', (event, idleTime) => callback(idleTime))
});