window.electronAPI = require ? require('electron').ipcRenderer : window.electronAPI;

(async () => {
  const userCodeEl = document.getElementById('user-code');
  if (window.electronAPI?.invoke) {
    const peerId = await window.electronAPI.invoke('get-peer-id');
    userCodeEl.textContent = peerId;
  }
})();

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Connect button functionality
        document.querySelector('.btn-primary').addEventListener('click', function() {
            const input = document.querySelector('.connect-input');
            if (input.value.trim()) {
                alert(`Connecting to: ${input.value}`);
                input.value = '';
            } else {
                alert('Please enter an ID or IP address');
            }
        });

        // Action buttons functionality
        document.querySelectorAll('.action-btn').forEach(button => {
            button.addEventListener('click', function() {
                const action = this.textContent.trim();
                const connectionName = this.closest('.connection-item').querySelector('.connection-name').textContent;
                
                if (action === '🔗') {
                    alert(`Connecting to ${connectionName}`);
                } else if (action === '📁') {
                    alert(`Opening file transfer with ${connectionName}`);
                } else if (action === '💬') {
                    alert(`Opening chat with ${connectionName}`);
                }
            });
        });

        // Add glass effect to elements
        document.querySelectorAll('.glass').forEach(element => {
            element.style.backdropFilter = 'blur(12px)';
            element.style.webkitBackdropFilter = 'blur(12px)';
        });

        // Make user code copyable
        document.getElementById('user-code').addEventListener('click', function() {
            const code = this.textContent;
            navigator.clipboard.writeText(code).then(() => {
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = code;
                }, 1500);
            });
        });