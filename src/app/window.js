const { BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
    console.log('Creating main window');
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, '../proload.js'),
            nodeIntegration: true,
            contextIsolation: false,    
        },
    });

    win.loadFile(path.join(__dirname, '../../public/ui/remote.html'));
    return win; 
}

module.exports = {
    createMainWindow,
};