using System;
using System.Net.Sockets;
using System.Threading;
using System.Text;
using System.IO;

namespace ScreenServer
{
    class ClientHandler
    {
        private TcpClient client;
        private NetworkStream stream;
        private bool isRunning = true;

        public ClientHandler(TcpClient client)
        {
            this.client = client;
            this.stream = client.GetStream();
        }

        public void Start()
        {
            new Thread(SendFrames).Start();
            new Thread(ReceiveCommands).Start();
        }

        private void SendFrames()
        {
            try
            {
                while (client.Connected && isRunning)
                {
                    byte[] frame = ScreenCapturer.CaptureAsJpeg(60); // JPEG quality 60%
                    
                    // Prefix indicating that it is a screen frame (type 0)
                    byte[] header = new byte[5];
                    header[0] = 0; // MessageType.ScreenFrame
                    
                    int len = frame.Length;
                    header[1] = (byte)((len >> 24) & 0xFF);
                    header[2] = (byte)((len >> 16) & 0xFF);
                    header[3] = (byte)((len >> 8) & 0xFF);
                    header[4] = (byte)(len & 0xFF);

                    stream.Write(header, 0, 5);
                    stream.Write(frame, 0, frame.Length);

                    Thread.Sleep(1000 / 15); // ~15 FPS
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending frames: {ex.Message}");
                Cleanup();
            }
        }

        private void ReceiveCommands()
        {
            try
            {
                while (client.Connected && isRunning)
                {
                    // Read the message type (1 byte)
                    byte[] typeBuffer = new byte[1];
                    int bytesRead = stream.Read(typeBuffer, 0, 1);
                    if (bytesRead == 0) break;

                    byte messageType = typeBuffer[0];

                    // If it's a control command (not a frame)
                    if (messageType != 0)
                    {
                        // Read the message length (4 bytes)
                        byte[] lengthBuffer = new byte[4];
                        bytesRead = stream.Read(lengthBuffer, 0, 4);
                        if (bytesRead == 0) break;

                        int messageLength = (lengthBuffer[0] << 24) | 
                                          (lengthBuffer[1] << 16) | 
                                          (lengthBuffer[2] << 8) | 
                                          lengthBuffer[3];

                        // Read the JSON message
                        byte[] messageBuffer = new byte[messageLength];
                        int totalBytesRead = 0;
                        while (totalBytesRead < messageLength)
                        {
                            bytesRead = stream.Read(messageBuffer, totalBytesRead, messageLength - totalBytesRead);
                            if (bytesRead == 0) break;
                            totalBytesRead += bytesRead;
                        }

                        string jsonMessage = Encoding.UTF8.GetString(messageBuffer);
                        MessageProcessor.ProcessMessage(jsonMessage);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error receiving commands: {ex.Message}");
                Cleanup();
            }
        }

        private void Cleanup()
        {
            try
            {
                isRunning = false;
                client?.Close();
                Console.WriteLine("Client disconnected.");
            }
            catch { }
        }
    }
}
