const { ipcRenderer } = require('electron');
const canvas = document.getElementById('screenCanvas');
const ctx = canvas.getContext('2d');

let frameCount = 0;
let bytesTransferred = 0;
let lastFrameTime = Date.now();
let isMouseControlEnabled = true;
let isKeyboardControlEnabled = true;
let pressedKeys = new Set();

// Controles de toggle
const mouseToggle = document.getElementById('mouseToggle');
const keyboardToggle = document.getElementById('keyboardToggle');

mouseToggle.addEventListener('change', function() {
  isMouseControlEnabled = this.checked;
  console.log('Mouse control:', this.checked ? 'enabled' : 'disabled');
});

keyboardToggle.addEventListener('change', function() {
  isKeyboardControlEnabled = this.checked;
  console.log('Keyboard control:', this.checked ? 'enabled' : 'disabled');
});

// Estatísticas
setInterval(() => {
  document.querySelector('.status-item-fps').innerHTML = `📊 FPS: ${frameCount}`;
  frameCount = 0;

  const mbps = (bytesTransferred / 1024 / 1024).toFixed(2);
  document.querySelector('.status-item-bandwidth').innerHTML = `📈 Data: ${mbps} MB/s`;
  bytesTransferred = 0;
}, 1000);

// Recebimento de frames
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
});

// Function to convert canvas coordinates to screen coordinates
function getScreenCoordinates(canvasX, canvasY) {
  // Assuming 1920x1080 resolution for conversion
  // In a more robust implementation, this should come from the server
  const screenWidth = 1920;
  const screenHeight = 1080;
  
  const x = (canvasX / canvas.width) * screenWidth;
  const y = (canvasY / canvas.height) * screenHeight;
  
  return { x: Math.round(x), y: Math.round(y) };
}

// ===== MOUSE CONTROL =====

canvas.addEventListener('mousemove', function(e) {
  if (!isMouseControlEnabled) return;
  
  const rect = canvas.getBoundingClientRect();
  const canvasX = e.clientX - rect.left;
  const canvasY = e.clientY - rect.top;
  
  const { x, y } = getScreenCoordinates(canvasX, canvasY);
  
  ipcRenderer.invoke('send-mouse-move', x, y);
});

canvas.addEventListener('mousedown', function(e) {
  if (!isMouseControlEnabled) return;
  e.preventDefault();
  
  const rect = canvas.getBoundingClientRect();
  const canvasX = e.clientX - rect.left;
  const canvasY = e.clientY - rect.top;
  
  const { x, y } = getScreenCoordinates(canvasX, canvasY);
  
  ipcRenderer.invoke('send-mouse-down', x, y, e.button);
});

canvas.addEventListener('mouseup', function(e) {
  if (!isMouseControlEnabled) return;
  e.preventDefault();
  
  const rect = canvas.getBoundingClientRect();
  const canvasX = e.clientX - rect.left;
  const canvasY = e.clientY - rect.top;
  
  const { x, y } = getScreenCoordinates(canvasX, canvasY);
  
  ipcRenderer.invoke('send-mouse-up', x, y, e.button);
});

canvas.addEventListener('click', function(e) {
  if (!isMouseControlEnabled) return;
  e.preventDefault();
  
  const rect = canvas.getBoundingClientRect();
  const canvasX = e.clientX - rect.left;
  const canvasY = e.clientY - rect.top;
  
  const { x, y } = getScreenCoordinates(canvasX, canvasY);
  
  ipcRenderer.invoke('send-mouse-click', x, y, e.button);
});

canvas.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // Prevent context menu
});

canvas.addEventListener('wheel', function(e) {
  if (!isMouseControlEnabled) return;
  e.preventDefault();
  
  const delta = e.deltaY > 0 ? -120 : 120; // Invert scroll direction
  ipcRenderer.invoke('send-mouse-wheel', delta);
});

// ===== KEYBOARD CONTROL =====

// Map special JavaScript keys to names understood by C#
function mapKeyName(key) {
  const keyMap = {
    ' ': 'space',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'Backspace': 'backspace',
    'Tab': 'tab',
    'Enter': 'enter',
    'Shift': 'shift',
    'Control': 'ctrl',
    'Alt': 'alt',
    'Escape': 'esc',
    'PageUp': 'pageup',
    'PageDown': 'pagedown',
    'End': 'end',
    'Home': 'home',
    'Insert': 'insert',
    'Delete': 'delete',
    'CapsLock': 'capslock',
    'F1': 'f1', 'F2': 'f2', 'F3': 'f3', 'F4': 'f4',
    'F5': 'f5', 'F6': 'f6', 'F7': 'f7', 'F8': 'f8',
    'F9': 'f9', 'F10': 'f10', 'F11': 'f11', 'F12': 'f12'
  };
  
  return keyMap[key] || key.toLowerCase();
}

document.addEventListener('keydown', function(e) {
  if (!isKeyboardControlEnabled) return;

  // Prevent default browser actions
  e.preventDefault();
  
  const keyName = mapKeyName(e.key);

  // Avoid key repetition
  if (pressedKeys.has(keyName)) return;
  pressedKeys.add(keyName);
  
  console.log('Key down:', keyName);
  ipcRenderer.invoke('send-key-down', keyName);
});

document.addEventListener('keyup', function(e) {
  if (!isKeyboardControlEnabled) return;
  
  e.preventDefault();
  
  const keyName = mapKeyName(e.key);
  pressedKeys.delete(keyName);
  
  console.log('Key up:', keyName);
  ipcRenderer.invoke('send-key-up', keyName);
});

// Function to type text (useful for clipboard in the future)
function typeText(text) {
  if (!isKeyboardControlEnabled) return;
  
  console.log('Typing text:', text);
  ipcRenderer.invoke('send-type-text', text);
}

// ===== OTHER CONTROLS =====

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

// Glassmorphism effect
document.querySelectorAll('.glass').forEach(element => {
  element.style.backdropFilter = 'blur(12px)';
  element.style.webkitBackdropFilter = 'blur(12px)';
}); 

// Focus the canvas to capture keyboard events
canvas.focus();
canvas.setAttribute('tabindex', '0');

// Function to expose globally (for debugging)
window.typeText = typeText;
