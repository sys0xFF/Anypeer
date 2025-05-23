const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Peer and Connection
  getPeerId: () => ipcRenderer.invoke('get-peer-id'),
  connectToPeer: (input) => ipcRenderer.invoke('connect-to-peer', input),
  disconnectPeer: () => ipcRenderer.invoke('disconnect-from-peer'),
  getRecentConnections: () => ipcRenderer.invoke('get-recent-connections'),

  // Listening
  startListening: (config) => ipcRenderer.invoke('start-listening', config),
  stopListening: () => ipcRenderer.invoke('stop-listening'),
  getListeningState: () => ipcRenderer.invoke('get-listening-state'),

  // Stream
  onNewFrame: (callback) => ipcRenderer.on('new-frame', (_, buffer) => callback(buffer)),
});