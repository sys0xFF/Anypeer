﻿using System;
using System.Net;
using System.Net.Sockets;

namespace ScreenServer
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Capture server started on port 4444...");
            TcpListener listener = new TcpListener(IPAddress.Any, 4444);
            listener.Start();

            while (true)
            {
                TcpClient client = listener.AcceptTcpClient();
                Console.WriteLine("Client connected: " + client.Client.RemoteEndPoint);
                new ClientHandler(client).Start();
            }
        }
    }
}
