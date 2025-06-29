using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace ScreenServer
{
    public static class InputSimulator
    {
        // Constants for Windows API input
        private const int MOUSEEVENTF_MOVE = 0x0001;
        private const int MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const int MOUSEEVENTF_LEFTUP = 0x0004;
        private const int MOUSEEVENTF_RIGHTDOWN = 0x0008;
        private const int MOUSEEVENTF_RIGHTUP = 0x0010;
        private const int MOUSEEVENTF_MIDDLEDOWN = 0x0020;
        private const int MOUSEEVENTF_MIDDLEUP = 0x0040;
        private const int MOUSEEVENTF_WHEEL = 0x0800;
        private const int MOUSEEVENTF_ABSOLUTE = 0x8000;

        private const int KEYEVENTF_KEYDOWN = 0x0000;
        private const int KEYEVENTF_KEYUP = 0x0002;

        // Windows API Imports
        [DllImport("user32.dll")]
        private static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, IntPtr dwExtraInfo);

        [DllImport("user32.dll")]
        private static extern void keybd_event(byte bVk, byte bScan, int dwFlags, IntPtr dwExtraInfo);

        [DllImport("user32.dll")]
        private static extern bool SetCursorPos(int x, int y);

        [DllImport("user32.dll")]
        private static extern short VkKeyScan(char ch);

        // MMethods for mouse control
        public static void MoveMouse(int x, int y)
        {
            SetCursorPos(x, y);
        }

        public static void MoveMouseRelative(int deltaX, int deltaY)
        {
            mouse_event(MOUSEEVENTF_MOVE, deltaX, deltaY, 0, IntPtr.Zero);
        }

        public static void LeftClick(int x, int y)
        {
            SetCursorPos(x, y);
            mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, IntPtr.Zero);
            mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, IntPtr.Zero);
        }

        public static void RightClick(int x, int y)
        {
            SetCursorPos(x, y);
            mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, IntPtr.Zero);
            mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, IntPtr.Zero);
        }

        public static void MiddleClick(int x, int y)
        {
            SetCursorPos(x, y);
            mouse_event(MOUSEEVENTF_MIDDLEDOWN, 0, 0, 0, IntPtr.Zero);
            mouse_event(MOUSEEVENTF_MIDDLEUP, 0, 0, 0, IntPtr.Zero);
        }

        public static void MouseDown(int button, int x, int y)
        {
            SetCursorPos(x, y);
            switch (button)
            {
                case 0: // Left
                    mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, IntPtr.Zero);
                    break;
                case 1: // Middle
                    mouse_event(MOUSEEVENTF_MIDDLEDOWN, 0, 0, 0, IntPtr.Zero);
                    break;
                case 2: // Right
                    mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, IntPtr.Zero);
                    break;
            }
        }

        public static void MouseUp(int button, int x, int y)
        {
            SetCursorPos(x, y);
            switch (button)
            {
                case 0: // Left
                    mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, IntPtr.Zero);
                    break;
                case 1: // Middle
                    mouse_event(MOUSEEVENTF_MIDDLEUP, 0, 0, 0, IntPtr.Zero);
                    break;
                case 2: // Right
                    mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, IntPtr.Zero);
                    break;
            }
        }

        public static void MouseWheel(int delta)
        {
            mouse_event(MOUSEEVENTF_WHEEL, 0, 0, delta, IntPtr.Zero);
        }

        // Methods for keyboard control
        public static void KeyDown(Keys key)
        {
            keybd_event((byte)key, 0, KEYEVENTF_KEYDOWN, IntPtr.Zero);
        }

        public static void KeyUp(Keys key)
        {
            keybd_event((byte)key, 0, KEYEVENTF_KEYUP, IntPtr.Zero);
        }

        public static void KeyPress(Keys key)
        {
            KeyDown(key);
            System.Threading.Thread.Sleep(10);
            KeyUp(key);
        }

        public static void TypeText(string text)
        {
            foreach (char c in text)
            {
                short vk = VkKeyScan(c);
                byte virtualKey = (byte)(vk & 0xFF);
                byte shiftKey = (byte)((vk >> 8) & 0xFF);

                if ((shiftKey & 1) != 0) // Shift key needed
                {
                    KeyDown(Keys.ShiftKey);
                }

                KeyPress((Keys)virtualKey);

                if ((shiftKey & 1) != 0)
                {
                    KeyUp(Keys.ShiftKey);
                }

                System.Threading.Thread.Sleep(20);
            }
        }

        // Convert string to Keys enum
        public static Keys StringToKey(string keyString)
        {
            switch (keyString.ToLower())
            {
                case "backspace": return Keys.Back;
                case "tab": return Keys.Tab;
                case "enter": return Keys.Enter;
                case "shift": return Keys.ShiftKey;
                case "control": case "ctrl": return Keys.ControlKey;
                case "alt": return Keys.Alt;
                case "pause": return Keys.Pause;
                case "capslock": return Keys.CapsLock;
                case "escape": case "esc": return Keys.Escape;
                case "space": return Keys.Space;
                case "pageup": return Keys.PageUp;
                case "pagedown": return Keys.PageDown;
                case "end": return Keys.End;
                case "home": return Keys.Home;
                case "arrowleft": case "left": return Keys.Left;
                case "arrowup": case "up": return Keys.Up;
                case "arrowright": case "right": return Keys.Right;
                case "arrowdown": case "down": return Keys.Down;
                case "insert": return Keys.Insert;
                case "delete": return Keys.Delete;
                case "f1": return Keys.F1;
                case "f2": return Keys.F2;
                case "f3": return Keys.F3;
                case "f4": return Keys.F4;
                case "f5": return Keys.F5;
                case "f6": return Keys.F6;
                case "f7": return Keys.F7;
                case "f8": return Keys.F8;
                case "f9": return Keys.F9;
                case "f10": return Keys.F10;
                case "f11": return Keys.F11;
                case "f12": return Keys.F12;
                default:
                    if (keyString.Length == 1)
                    {
                        return (Keys)char.ToUpper(keyString[0]);
                    }
                    return Keys.None;
            }
        }
    }
}
