const { app, ipcMain } = require('electron');
const { createMainWindow } = require('./app/window');
const { generatePeerId } = require('./utils/generatePeerId');

app.whenReady().then(() => {
 console.log('App is ready');
 createMainWindow();
});

app.on('windows-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


// Generate a unique peer ID for the user
let userPeerId = generatePeerId();

ipcMain.handle('get-peer-id', () => {
    return userPeerId;
  });