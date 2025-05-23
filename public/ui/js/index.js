const { ipcRenderer } = require('electron');

(async () => {
  const userCodeEl = document.getElementById('user-code');
  const peerId = await ipcRenderer.invoke('get-peer-id');
  userCodeEl.textContent = peerId;

  const connections = await ipcRenderer.invoke('get-recent-connections');
  renderRecentConnections(connections);

  const listening = await ipcRenderer.invoke('get-listening-state');
  if (listening) {
    isListening = true;
    ipInput.value = listening.ip;
    portInput.value = listening.port;
    ipInput.disabled = true;
    portInput.disabled = true;
    listenBtn.innerHTML = '<i>⏹️</i> Stop Listening';
    listenBtn.classList.remove('btn-disabled', 'btn-success');
    listenBtn.classList.add('btn-danger');
    listeningStatus.classList.add('active');
    listeningStatus.innerHTML = `<div class="status-dot"></div> Listening on ${listening.ip}:${listening.port}`;
  }
})();

function renderRecentConnections(connections) {
  const container = document.querySelector('.connections-list');
  container.innerHTML = '';

  connections.forEach(c => {
    const item = document.createElement('div');
    item.className = 'connection-item';
    item.innerHTML = `
      <div class="connection-info">
        <div class="connection-icon">💻</div>
        <div class="connection-details">
          <div class="connection-name">${c.name}</div>
          <div class="connection-id">${c.ip}</div>
        </div>
      </div>
      <div class="connection-actions">
        <button class="action-btn primary" data-ip="${c.ip}" data-name="${c.name}">🔗</button>
      </div>
    `;
    container.appendChild(item);
  });

  document.querySelectorAll('.action-btn.primary').forEach(button => {
    button.addEventListener('click', async function () {
      const ip = this.dataset.ip;
      const name = this.dataset.name;

      const loadingOverlay = document.getElementById('loadingOverlay');
      const progressBar = document.getElementById('progressBar');
      const loadingText = document.querySelector('.loading-text');

      loadingOverlay.classList.add('active');
      loadingText.textContent = `Connecting to ${name} (${ip})...`;

      let progress = 0;
      let connected = false;

      try {
        await ipcRenderer.invoke('connect-to-peer', ip);
        connected = true;
      } catch (err) {
        console.error('[Connect] Failed to connect:', err.message);
        loadingText.textContent = 'Error connecting to remote device.';
      }

      const interval = setInterval(() => {
        if (!connected) {
          clearInterval(interval);
          progressBar.style.width = '0%';
          return;
        }

        progress += Math.random() * 15;

        if (progress >= 100) {
          clearInterval(interval);
          progressBar.style.width = '100%';
          setTimeout(() => {
            window.location.href = 'remote.html';
          }, 500);
        } else {
          progressBar.style.width = `${progress}%`;
        }
      }, 300);
    });
  });
}

const ipInput = document.getElementById('ipInput');
const portInput = document.getElementById('portInput');
const listenBtn = document.getElementById('listenBtn');
const listeningStatus = document.getElementById('listeningStatus');
let isListening = false;

function checkInputs() {
  if (ipInput.value.trim() && portInput.value.trim()) {
    listenBtn.classList.remove('btn-disabled');
    listenBtn.classList.add('btn-success');
  } else {
    listenBtn.classList.add('btn-disabled');
    listenBtn.classList.remove('btn-success');
  }
}

ipInput.addEventListener('input', checkInputs);
portInput.addEventListener('input', checkInputs);

listenBtn.addEventListener('click', async function () {
  if (this.classList.contains('btn-disabled')) return;

  if (!isListening) {
    isListening = true;
    this.innerHTML = '<i>⏹️</i> Stop Listening';
    this.classList.remove('btn-success');
    this.classList.add('btn-danger');
    listeningStatus.classList.add('active');
    listeningStatus.innerHTML = `<div class="status-dot"></div> Listening on ${ipInput.value}:${portInput.value}`;
    ipInput.disabled = true;
    portInput.disabled = true;

    await ipcRenderer.invoke('start-listening', {
      ip: ipInput.value,
      port: parseInt(portInput.value)
    });

  } else {
    isListening = false;
    this.innerHTML = '<i>📡</i> Start Listening';
    this.classList.remove('btn-danger');
    this.classList.add('btn-success');
    listeningStatus.classList.remove('active');
    listeningStatus.innerHTML = `<div class="status-dot"></div> Not Listening`;
    ipInput.disabled = false;
    portInput.disabled = false;

    await ipcRenderer.invoke('stop-listening');
  }
});

document.getElementById('connectBtn').addEventListener('click', async function () {
  const input = document.querySelector('.connect-input');
  const code = input.value.trim();

  if (!code) return alert("Please enter a code or IP address.");

  const loadingOverlay = document.getElementById('loadingOverlay');
  const progressBar = document.getElementById('progressBar');
  loadingOverlay.classList.add('active');

  try {
    await ipcRenderer.invoke('connect-to-peer', code);
  } catch (err) {
    alert("Error connecting: " + err.message);
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        window.location.href = 'remote.html';
      }, 500);
    }
    progressBar.style.width = `${progress}%`;
  }, 300);
});

document.getElementById('user-code').addEventListener('click', function () {
  const code = this.textContent;
  navigator.clipboard.writeText(code).then(() => {
    this.textContent = 'Copied!';
    setTimeout(() => {
      this.textContent = code;
    }, 1500);
  });
});

document.querySelectorAll('.glass').forEach(el => {
  el.style.backdropFilter = 'blur(12px)';
  el.style.webkitBackdropFilter = 'blur(12px)';
});
