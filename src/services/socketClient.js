// Socket client for receiving screen frames and sending control commands
// Protocol: [1 byte type][4 bytes length][data]
// Type 0: Screen frame (JPEG buffer)
// Type 1+: Control commands (JSON)

const net = require('net');

let currentClient = null;

function connectToPeer(ip, onFrameReceived, port = 4444) {
  const client = net.createConnection({ host: ip, port }, () => {
    console.log(`[Socket] Connected to ${ip}:${port}`);
  });

  currentClient = client;

  let buffer = Buffer.alloc(0);
  let expectedLength = null;
  let messageType = null;

  client.on('data', data => {
    buffer = Buffer.concat([buffer, data]);

    while (true) {
      // Read the message type (1 byte)
      if (messageType === null) {
        if (buffer.length < 1) break;
        messageType = buffer.readUInt8(0);
        buffer = buffer.slice(1);
      }

      // Read the length (4 bytes)
      if (expectedLength === null) {
        if (buffer.length < 4) break;
        expectedLength = buffer.readUInt32BE(0);
        buffer = buffer.slice(4);
      }

      // Read the data
      if (buffer.length < expectedLength) break;

      const payload = buffer.slice(0, expectedLength);

      // If it's a screen frame (type 0)
      if (messageType === 0) {
        onFrameReceived(payload);
      }
      // Other types can be added here in the future

      buffer = buffer.slice(expectedLength);
      expectedLength = null;
      messageType = null;
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

function sendControlCommand(messageType, data) {
  if (!currentClient || currentClient.destroyed) {
    console.warn('[Socket] No active connection for control command');
    return false;
  }

  try {
    const jsonData = JSON.stringify(data);
    const jsonBuffer = Buffer.from(jsonData, 'utf8');

    // Create the header: [1 byte type][4 bytes length]
    const header = Buffer.alloc(5);
    header.writeUInt8(messageType, 0);
    header.writeUInt32BE(jsonBuffer.length, 1);

    // Send header + data
    currentClient.write(Buffer.concat([header, jsonBuffer]));
    return true;
  } catch (error) {
    console.error('[Socket] Error sending control command:', error);
    return false;
  }
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
  sendControlCommand,
  disconnectPeer,
};
