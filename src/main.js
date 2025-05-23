const path = require('path');
const { app, ipcMain, BrowserWindow } = require('electron');
const { createMainWindow } = require('./app/window');

const WinReg = require('winreg');
const { spawn, exec } = require('child_process');
const { setFirebaseSession, resolvePeerId } = require('./services/firebase');
const { saveRecentConnection, loadRecentConnections } = require('./utils/recentConnections');
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');
const { connectToPeer } = require('./services/socketClient');
const { generatePeerId } = require('./utils/generatePeerId');

const REG_PATH_STATE = '\\Software\\AnyPeer\\State';

let userPeerId = generatePeerId();
let currentClient = null;

app.whenReady().then(() => {
  console.log('[AnyPeer] App is ready.');
  createMainWindow();
  checkIfAlreadyListening();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ------------------ Peer ------------------

ipcMain.handle('get-peer-id', () => userPeerId);

// ------------------ Connections ------------------

ipcMain.handle('connect-to-peer', async (event, input) => {
  const win = BrowserWindow.getAllWindows()[0];
  let ip = input;
  let port = 4444;

  if (/^\d{3}-\d{3}-\d{3}$/.test(input)) {
    try {
      const data = await resolvePeerId(input);
      ip = data.ip;
      port = data.port || 4444;
      console.log(`[Firebase] Resolved ID ${input} → ${ip}:${port}`);
    } catch (err) {
      console.error('[Peer] Failed to resolve ID:', err.message);
      throw new Error('Peer code not found in Firebase');
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const name = generateRandomName();
      saveRecentConnection(name, input);
      currentClient = connectToPeer(ip, buffer => {
        win.webContents.send('new-frame', buffer);
      }, port);
      resolve(true);
    } catch (err) {
      console.error('[Peer] Connection failed:', err.message);
      reject(new Error('Connection failed'));
    }
  });
});

ipcMain.handle('disconnect-from-peer', () => {
  if (currentClient) {
    currentClient.end();
    currentClient.destroy();
    currentClient = null;
    console.log('[Peer] Disconnected manually.');
  }
});

ipcMain.handle('get-recent-connections', () => {
  return new Promise(resolve => {
    loadRecentConnections(resolve);
  });
});

// ------------------ Listener ------------------

ipcMain.handle('start-listening', async (event, { ip, port }) => {
  const id = userPeerId;

  try {
    await setFirebaseSession(id, { ip, port });

    const reg = new WinReg({
      hive: WinReg.HKCU,
      key: REG_PATH_STATE
    });

    const encoded = Buffer.from(JSON.stringify({ ip, port, id }), 'utf-8').toString('base64');

    reg.set('Listening', WinReg.REG_SZ, encoded, err => {
      if (err) console.error('[Listener] Failed to save listening state to registry:', err);
    });

    const exePath = path.join(process.cwd(), 'ScreenServer.exe');
    const child = spawn(exePath, [], { detached: true, stdio: 'ignore' });
    child.unref();

    console.log(`[Listener] Started at ${ip}:${port} | ID: ${id}`);
    return true;
  } catch (err) {
    console.error('[Listener] Failed to start:', err);
    throw err;
  }
});

ipcMain.handle('stop-listening', async () => {
  const reg = new WinReg({
    hive: WinReg.HKCU,
    key: REG_PATH_STATE
  });

  reg.remove('Listening', err => {
    if (err) console.error('[Listener] Failed to remove registry state:', err);
    else console.log('[Listener] Listening state removed from registry.');
  });

  exec('taskkill /IM ScreenServer.exe /F', (err) => {
    if (err) console.error('[Listener] Failed to terminate ScreenServer:', err.message);
    else console.log('[Listener] ScreenServer.exe terminated.');
  });

  return true;
});

ipcMain.handle('get-listening-state', () => {
  return new Promise(resolve => {
    const reg = new WinReg({
      hive: WinReg.HKCU,
      key: REG_PATH_STATE
    });

    reg.get('Listening', (err, item) => {
      if (err || !item || !item.value) return resolve(null);

      try {
        const decoded = Buffer.from(item.value, 'base64').toString('utf-8');
        const state = JSON.parse(decoded);
        resolve(state);
      } catch (e) {
        console.warn('[Listener] Invalid JSON in registry. Ignoring.');
        resolve(null);
      }
    });
  });
});

// ------------------ Restore Previous Listening ------------------

async function checkIfAlreadyListening() {
  const reg = new WinReg({
    hive: WinReg.HKCU,
    key: REG_PATH_STATE
  });

  reg.get('Listening', async (err, item) => {
    if (err || !item || !item.value) return;

    try {
      const decoded = Buffer.from(item.value, 'base64').toString('utf-8');
      const { ip, port, id } = JSON.parse(decoded);

      if (!ip || !port || !id) return;

      await setFirebaseSession(id, { ip, port });

      console.log(`[AutoRestore] Restoring listening session at ${ip}:${port}...`);

      const exePath = path.join(process.cwd(), 'ScreenServer.exe');
      const child = spawn(exePath, [], { detached: true, stdio: 'ignore' });
      child.unref();

    } catch (e) {
      console.error('[AutoRestore] Failed to restore listening session:', e);
    }
  });
}

// ------------------ Utils ------------------

function generateRandomName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
    style: 'capital'
  });
}
