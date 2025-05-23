// Socket client for receiving screen frames
// Protocol: [4 bytes length][JPEG buffer]
// Handles framing, connection, and disconnection


const net = require('net');

let currentClient = null;

function connectToPeer(ip, onFrameReceived, port = 4444) {
  const client = net.createConnection({ host: ip, port }, () => {
    console.log(`[Socket] Connected to ${ip}:${port}`);
  });

  currentClient = client;

  let buffer = Buffer.alloc(0);
  let expectedLength = null;

  client.on('data', data => {
    buffer = Buffer.concat([buffer, data]);

    while (true) {
      if (expectedLength === null) {
        if (buffer.length < 4) break;
        expectedLength = buffer.readUInt32BE(0);
        buffer = buffer.slice(4);
      }

      if (buffer.length < expectedLength) break;

      const frame = buffer.slice(0, expectedLength);
      onFrameReceived(frame);
      buffer = buffer.slice(expectedLength);
      expectedLength = null;
    }
  });

  client.on('end', () => {
    console.log(`[Socket] Disconnected.`);
  });

  client.on('error', err => {
    console.error(`[Socket] Error: ${err.message}`);
  });

  return client;
}

function disconnectPeer() {
  if (currentClient) {
    currentClient.end();
    currentClient.destroy();
    currentClient = null;
  }
}

module.exports = {
  connectToPeer,
  disconnectPeer,
};
