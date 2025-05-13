const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  processVideo: (filePath) => ipcRenderer.invoke('process-video', filePath)
});
