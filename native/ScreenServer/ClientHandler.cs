using System;
using System.Net.Sockets;
using System.Threading;

namespace ScreenServer
{
    class ClientHandler
    {
        private TcpClient client;
        private NetworkStream stream;

        public ClientHandler(TcpClient client)
        {
            this.client = client;
            this.stream = client.GetStream();
        }

        public void Start()
        {
            new Thread(Handle).Start();
        }

        private void Handle()
        {
            try
            {
                while (client.Connected)
                {
                    byte[] frame = ScreenCapturer.CaptureAsJpeg(60); // JPEG qualidade 60%
                    byte[] lengthPrefix = new byte[4];
                    int len = frame.Length;
                    lengthPrefix[0] = (byte)((len >> 24) & 0xFF);
                    lengthPrefix[1] = (byte)((len >> 16) & 0xFF);
                    lengthPrefix[2] = (byte)((len >> 8) & 0xFF);
                    lengthPrefix[3] = (byte)(len & 0xFF);

                    stream.Write(lengthPrefix, 0, 4);
                    stream.Write(frame, 0, frame.Length);

                    Thread.Sleep(1000 / 15); // ~15 FPS
                }
            }
            catch
            {
                client.Close();
                Console.WriteLine("Cliente desconectado.");
            }
        }
    }
}
