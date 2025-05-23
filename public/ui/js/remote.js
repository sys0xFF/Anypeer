const { ipcRenderer } = require('electron');
const canvas = document.getElementById('screenCanvas');
const ctx = canvas.getContext('2d');

let frameCount = 0;
let bytesTransferred = 0;
let lastFrameTime = Date.now();

setInterval(() => {
  document.querySelector('.status-item-fps').innerHTML = `📊 FPS: ${frameCount}`;
  frameCount = 0;

  const mbps = (bytesTransferred / 1024 / 1024).toFixed(2);
  document.querySelector('.status-item-bandwidth').innerHTML = `📈 Data: ${mbps} MB/s`;
  bytesTransferred = 0;
}, 1000);

ipcRenderer.on('new-frame', (event, buffer) => {
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  const now = Date.now();
  const latency = now - lastFrameTime;
  lastFrameTime = now;
  document.querySelector('.status-item-latency').innerHTML = `📶 Latency: ${latency} ms`;

  frameCount++;
  bytesTransferred += buffer.byteLength;

  img.onload = () => {
    const ratio = img.width / img.height;
    const targetWidth = canvas.parentElement.clientWidth;
    const targetHeight = targetWidth / ratio;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
  };

  img.src = url;
  console.log('Drawn frame:', buffer.byteLength);
});

document.getElementById('mouseToggle').addEventListener('change', function () {
  console.log('Mouse control:', this.checked ? 'enabled' : 'disabled');
});

document.getElementById('keyboardToggle').addEventListener('change', function () {
  console.log('Keyboard control:', this.checked ? 'enabled' : 'disabled');
});

document.getElementById('soundToggle').addEventListener('change', function () {
  console.log('Sound:', this.checked ? 'enabled' : 'disabled');
});

document.getElementById('disconnectBtn').addEventListener('click', async function () {
  if (confirm('Are you sure you want to disconnect?')) {
    await ipcRenderer.invoke('disconnect-from-peer'); 
    window.location.href = 'index.html';
  }
});

document.getElementById('fullscreenBtn').addEventListener('click', function () {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
    this.textContent = '🔍';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      this.textContent = '🔍';
    }
  }
});

document.getElementById('qualitySelect').addEventListener('change', function () {
  console.log('Quality changed to:', this.value);
});

canvas.addEventListener('mousemove', function (e) {
  if (document.getElementById('mouseToggle').checked) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    console.log('Mouse move:', x, y);
  }
});

canvas.addEventListener('click', function (e) {
  if (document.getElementById('mouseToggle').checked) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    console.log('Mouse click:', x, y);
  }
});

document.addEventListener('keydown', function (e) {
  if (document.getElementById('keyboardToggle').checked) {
    console.log('Key down:', e.key);
  }
});

document.addEventListener('keyup', function (e) {
  if (document.getElementById('keyboardToggle').checked) {
    console.log('Key up:', e.key);
  }
});

document.querySelectorAll('.glass').forEach(element => {
  element.style.backdropFilter = 'blur(12px)';
  element.style.webkitBackdropFilter = 'blur(12px)';
}); 
