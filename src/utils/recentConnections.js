const WinReg = require('winreg');

const regKey = new WinReg({
  hive: WinReg.HKCU,
  key: '\\Software\\AnyPeer\\RecentConnections'
});

function saveRecentConnection(name, ip) {
  checkIfExists(ip, exists => {
    if (!exists) {
      regKey.set(name, WinReg.REG_SZ, ip, err => {
        if (err) console.error('Failed to save to registry:', err);
        else console.log(`Saved: ${name} → ${ip}`);
      });
    } else {
      console.log(`IP ${ip} is already saved. Skipping.`);
    }
  });
}

function loadRecentConnections(callback) {
  regKey.values((err, items) => {
    if (err) {
      console.error('Failed to load recent connections:', err);
      callback([]);
    } else {
      const list = items.map(entry => ({
        name: entry.name,
        ip: entry.value
      }));
      callback(list);
    }
  });
}

function checkIfExists(ip, callback) {
  loadRecentConnections(list => {
    const exists = list.some(item => item.ip === ip);
    callback(exists);
  });
}

module.exports = {
  saveRecentConnection,
  loadRecentConnections,
  checkIfExists
};
