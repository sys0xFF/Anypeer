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

  // Control Commands
  sendMouseMove: (x, y) => ipcRenderer.invoke('send-mouse-move', x, y),
  sendMouseClick: (x, y, button) => ipcRenderer.invoke('send-mouse-click', x, y, button),
  sendMouseDown: (x, y, button) => ipcRenderer.invoke('send-mouse-down', x, y, button),
  sendMouseUp: (x, y, button) => ipcRenderer.invoke('send-mouse-up', x, y, button),
  sendMouseWheel: (delta) => ipcRenderer.invoke('send-mouse-wheel', delta),
  sendKeyDown: (key) => ipcRenderer.invoke('send-key-down', key),
  sendKeyUp: (key) => ipcRenderer.invoke('send-key-up', key),
  sendKeyPress: (key) => ipcRenderer.invoke('send-key-press', key),
  sendTypeText: (text) => ipcRenderer.invoke('send-type-text', text),
});