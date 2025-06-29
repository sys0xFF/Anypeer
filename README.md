# AnyPeer – Remote Desktop via Electron & C#

![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Electron](https://img.shields.io/badge/built%20with-Electron-47848F)
![CSharp](https://img.shields.io/badge/backend-C%23-239120)
![Firebase](https://img.shields.io/badge/realtime-Firebase-FFA611)
![License](https://img.shields.io/github/license/sys0xFF/Anypeer)
![Status](https://img.shields.io/badge/status-in%20progress-yellow)

**AnyPeer** is a high-performance remote desktop system built from scratch using Electron and C#, featuring peer-to-peer connectivity, screen streaming via JPEG frames, dynamic peer code resolution using Firebase, and registry-based session persistence.

This project is a full-stack implementation of a cross-platform remote control application — modular, scalable, and designed with precision from the ground up.



![AnyPeer Screenshot](https://i.imgur.com/SVEIdzZ.png)

---

## Features

- Peer-to-peer desktop sharing over TCP
- Unique Peer Code generation (e.g., `321-654-789`)
- Firebase integration for peer resolution and live session lookup
- Native Windows screen capture via C# + Electron bridge
- Session auto-restore via Windows Registry (base64 encoded)
- Modular architecture (Electron main process, renderer, C# ScreenServer)
- Recent Connections stored with friendly identifiers
- Glassmorphism-inspired dark UI design

---

## In Progress

This is a work in progress. The following features are under active development:

- [x] Remote mouse control (relative and absolute positioning)
- [x] Keyboard input simulation (key press and release)
- [ ] Optional audio streaming (PCM or compressed format)
- [ ] Session control panel with logs and activity
- [ ] Build pipeline with installer

---

## Architecture Overview

```
+-------------------+       WebSocket/TCP       +---------------------+
|   AnyPeer Client  |  <--------------------->  |  ScreenServer.exe   |
|  (Electron App)   |                           |   (C# .NET Server)  |
+-------------------+                           +---------------------+
        |                                                  |
        |             Firebase Realtime DB                 |
        +----------------------------------------------->  |
                        (session/{peerId})               
```

---

## Project Structure

```
├── src/
│   ├── main.js                 # Electron main process
│   ├── window.js               # Window creation logic
│   ├── preload.js              # Context-bridged APIs
│   ├── services/
│   │   └── firebase.js         # Firebase init + peer resolution
│   ├── utils/
│   │   ├── generatePeerId.js   # Unique ID generator
│   │   └── recentConnections.js# Registry-based recent peers
│   ├── socketClient.js         # TCP client for receiving frames
├── public/
│   ├── ui/
│   │   ├── index.html
│   │   ├── remote.html
│   │   └── css/ + js/
├── ScreenServer/               # C# console app for screen capture
```

---

## Getting Started

> Requirements:
- Node.js (v18+)
- .NET Framework (C# compiler)
- Firebase Realtime Database setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set your Firebase config

Edit `services/firebase.js` and replace the config object with your Firebase credentials.

### 3. Build & run

```bash
npm start
```

Make sure `ScreenServer.exe` is present in the project root. The Electron app will spawn it automatically when listening.

---

## Roadmap

- Auto updater
- Logging panel
- Remote clipboard sync
- WebRTC version (experimental)
- Linux/Mac capture backend

---

## License

MIT License. For educational and demonstration purposes only. Not intended for unauthorized access or unethical use.

---

## Author

Developed by [Anthony Sforzin](https://github.com/sys0xFF) – Software Engineering student at FIAP. First semester. This is only the beginning.
