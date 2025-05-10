const { app } = require('electorn');
const { createMainWindow } = require('./app/window');

app.whenReady().then(() => {
    const mainWindow = createMainWindow();
}

app.on('windows-all-closed', () => {
    if (process.platform !== 'darwin') app.quit*();
});

