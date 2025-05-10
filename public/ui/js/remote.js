 // Canvas setup
        const canvas = document.getElementById('screenCanvas');
        const ctx = canvas.getContext('2d');
        
        // Draw placeholder content on canvas
        function drawPlaceholderScreen() {
            // Set background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw some placeholder UI elements
            // Header bar
            ctx.fillStyle = '#16213e';
            ctx.fillRect(0, 0, canvas.width, 40);
            
            // Sidebar
            ctx.fillStyle = '#16213e';
            ctx.fillRect(0, 40, 200, canvas.height - 40);
            
            // Content area with some boxes
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = '#0f3460';
                ctx.fillRect(220, 60 + (i * 120), 400, 100);
                
                ctx.fillStyle = '#0f3460';
                ctx.fillRect(640, 60 + (i * 120), 400, 100);
            }
            
            // Add some text
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.fillText('Remote Desktop - Development Server', 20, 25);
            
            // Add cursor
            const cursorX = canvas.width / 2;
            const cursorY = canvas.height / 2;
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(cursorX, cursorY);
            ctx.lineTo(cursorX + 15, cursorY + 10);
            ctx.lineTo(cursorX + 5, cursorY + 15);
            ctx.fill();
        }
        
        // Initial draw
        drawPlaceholderScreen();
        
        // Toggle controls
        document.getElementById('mouseToggle').addEventListener('change', function() {
            console.log('Mouse control:', this.checked ? 'enabled' : 'disabled');
        });
        
        document.getElementById('keyboardToggle').addEventListener('change', function() {
            console.log('Keyboard control:', this.checked ? 'enabled' : 'disabled');
        });
        
        document.getElementById('soundToggle').addEventListener('change', function() {
            console.log('Sound:', this.checked ? 'enabled' : 'disabled');
        });
        
        // Disconnect button
        document.getElementById('disconnectBtn').addEventListener('click', function() {
            if (confirm('Are you sure you want to disconnect?')) {
                window.location.href = 'index.html';
            }
        });
        
        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', function() {
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
        
        // Quality selector
        document.getElementById('qualitySelect').addEventListener('change', function() {
            console.log('Quality changed to:', this.value);
        });
        
        // Canvas mouse events for remote control
        canvas.addEventListener('mousemove', function(e) {
            if (document.getElementById('mouseToggle').checked) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
                const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
                
                // In a real app, you would send these coordinates to the remote machine
                console.log('Mouse move:', x, y);
            }
        });
        
        canvas.addEventListener('click', function(e) {
            if (document.getElementById('mouseToggle').checked) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
                const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
                
                // In a real app, you would send a click event to the remote machine
                console.log('Mouse click:', x, y);
            }
        });
        
        // Keyboard events for remote control
        document.addEventListener('keydown', function(e) {
            if (document.getElementById('keyboardToggle').checked) {
                // In a real app, you would send the key event to the remote machine
                console.log('Key down:', e.key);
            }
        });
        
        document.addEventListener('keyup', function(e) {
            if (document.getElementById('keyboardToggle').checked) {
                // In a real app, you would send the key event to the remote machine
                console.log('Key up:', e.key);
            }
        });
        
        // Add glass effect to elements
        document.querySelectorAll('.glass').forEach(element => {
            element.style.backdropFilter = 'blur(12px)';
            element.style.webkitBackdropFilter = 'blur(12px)';
        });
        
        // Simulate screen updates
        function updateScreen() {
            // In a real app, you would receive screen updates from the remote machine
            // For this demo, we'll just redraw the placeholder with slight changes
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Redraw with slight modifications
            drawPlaceholderScreen();
            
            // Add some random elements to simulate changes
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`;
            ctx.fillRect(
                Math.random() * canvas.width, 
                Math.random() * canvas.height, 
                Math.random() * 100 + 50, 
                Math.random() * 100 + 50
            );
            
            // Schedule next update
            setTimeout(updateScreen, 1000);
        }
        
        // Start screen updates
        updateScreen();