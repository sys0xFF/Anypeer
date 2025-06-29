using System;
using System.Text;
using Newtonsoft.Json;

namespace ScreenServer
{
    public enum MessageType
    {
        ScreenFrame = 0,
        MouseMove = 1,
        MouseClick = 2,
        MouseDown = 3,
        MouseUp = 4,
        MouseWheel = 5,
        KeyDown = 6,
        KeyUp = 7,
        KeyPress = 8,
        TypeText = 9
    }

    public class Message
    {
        public MessageType Type { get; set; }
        public object Data { get; set; }
    }

    public class MouseData
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Button { get; set; } // 0=Left, 1=Middle, 2=Right
        public int DeltaX { get; set; }
        public int DeltaY { get; set; }
        public int WheelDelta { get; set; }
    }

    public class KeyboardData
    {
        public string Key { get; set; }
        public string Text { get; set; }
        public bool Shift { get; set; }
        public bool Ctrl { get; set; }
        public bool Alt { get; set; }
    }

    public static class MessageProcessor
    {
        public static void ProcessMessage(string jsonMessage)
        {
            try
            {
                var message = JsonConvert.DeserializeObject<Message>(jsonMessage);
                
                switch (message.Type)
                {
                    case MessageType.MouseMove:
                        ProcessMouseMove(message.Data);
                        break;
                    case MessageType.MouseClick:
                        ProcessMouseClick(message.Data);
                        break;
                    case MessageType.MouseDown:
                        ProcessMouseDown(message.Data);
                        break;
                    case MessageType.MouseUp:
                        ProcessMouseUp(message.Data);
                        break;
                    case MessageType.MouseWheel:
                        ProcessMouseWheel(message.Data);
                        break;
                    case MessageType.KeyDown:
                        ProcessKeyDown(message.Data);
                        break;
                    case MessageType.KeyUp:
                        ProcessKeyUp(message.Data);
                        break;
                    case MessageType.KeyPress:
                        ProcessKeyPress(message.Data);
                        break;
                    case MessageType.TypeText:
                        ProcessTypeText(message.Data);
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing message...: {ex.Message}");
            }
        }

        private static void ProcessMouseMove(object data)
        {
            var mouseData = JsonConvert.DeserializeObject<MouseData>(data.ToString());
            InputSimulator.MoveMouse(mouseData.X, mouseData.Y);
        }

        private static void ProcessMouseClick(object data)
        {
            var mouseData = JsonConvert.DeserializeObject<MouseData>(data.ToString());
            switch (mouseData.Button)
            {
                case 0:
                    InputSimulator.LeftClick(mouseData.X, mouseData.Y);
                    break;
                case 1:
                    InputSimulator.MiddleClick(mouseData.X, mouseData.Y);
                    break;
                case 2:
                    InputSimulator.RightClick(mouseData.X, mouseData.Y);
                    break;
            }
        }

        private static void ProcessMouseDown(object data)
        {
            var mouseData = JsonConvert.DeserializeObject<MouseData>(data.ToString());
            InputSimulator.MouseDown(mouseData.Button, mouseData.X, mouseData.Y);
        }

        private static void ProcessMouseUp(object data)
        {
            var mouseData = JsonConvert.DeserializeObject<MouseData>(data.ToString());
            InputSimulator.MouseUp(mouseData.Button, mouseData.X, mouseData.Y);
        }

        private static void ProcessMouseWheel(object data)
        {
            var mouseData = JsonConvert.DeserializeObject<MouseData>(data.ToString());
            InputSimulator.MouseWheel(mouseData.WheelDelta);
        }

        private static void ProcessKeyDown(object data)
        {
            var keyData = JsonConvert.DeserializeObject<KeyboardData>(data.ToString());
            var key = InputSimulator.StringToKey(keyData.Key);
            if (key != System.Windows.Forms.Keys.None)
            {
                InputSimulator.KeyDown(key);
            }
        }

        private static void ProcessKeyUp(object data)
        {
            var keyData = JsonConvert.DeserializeObject<KeyboardData>(data.ToString());
            var key = InputSimulator.StringToKey(keyData.Key);
            if (key != System.Windows.Forms.Keys.None)
            {
                InputSimulator.KeyUp(key);
            }
        }

        private static void ProcessKeyPress(object data)
        {
            var keyData = JsonConvert.DeserializeObject<KeyboardData>(data.ToString());
            var key = InputSimulator.StringToKey(keyData.Key);
            if (key != System.Windows.Forms.Keys.None)
            {
                InputSimulator.KeyPress(key);
            }
        }

        private static void ProcessTypeText(object data)
        {
            var keyData = JsonConvert.DeserializeObject<KeyboardData>(data.ToString());
            InputSimulator.TypeText(keyData.Text);
        }
    }
}
