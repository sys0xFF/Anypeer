const { app } = require('electron');
const { createMainWindow } = require('./app/window');

app.whenReady().then(() => {
 console.log('App is ready');
 createMainWindow();
});

app.on('windows-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

