const { BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
    console.log('Creating main window');
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            nodeIntegration: true,
            contextIsolation: false,    
        },
    });
    win.loadFile(path.join(__dirname, '../../public/ui/index.html'));
    return win; 
}

module.exports = {
    createMainWindow,
};