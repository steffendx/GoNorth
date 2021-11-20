using System;
using System.Threading;

namespace Installer.Util
{
    /// <summary>
    /// Keyboard
    /// </summary>
    public static class KeyboardHelper
    {
        /// <summary>
        /// Waits for a keypress
        /// </summary>
        public static void WaitForKeyPress()
        {
            try
            {
                Console.ReadKey();
            }
            catch(Exception)
            {
                // Fallback for debugger
                Thread.Sleep(1000);
            }
        }

        /// <summary>
        /// Reads a config value
        /// </summary>
        /// <param name="message">Message to show</param>
        /// <param name="defaultValue">Default value if left blank</param>
        /// <returns>Config value</returns>
        public static string ReadConfigValue(string message, string defaultValue)
        {
            Console.Write(message);
            string configValue = Console.ReadLine();

            if(string.IsNullOrEmpty(configValue))
            {
                return defaultValue;
            }

            return configValue;
        }
        
        /// <summary>
        /// Reads a config value
        /// </summary>
        /// <param name="message">Message to show</param>
        /// <returns>Config value</returns>
        public static string ReadConfigValueMandatory(string message)
        {
            string configValue = string.Empty;
            do
            {
                configValue = ReadConfigValue(message, string.Empty);
            }
            while(string.IsNullOrEmpty(configValue));

            return configValue;
        }
        
        /// <summary>
        /// Reads a masked value
        /// </summary>
        /// <param name="message">Message to show</param>
        /// <returns>Config value</returns>
        public static string ReadMaskedValue(string message)
        {
            Console.Write(message);

            string maskedValue = string.Empty;
            ConsoleKey key;
            do
            {
                ConsoleKeyInfo keyInfo = Console.ReadKey(true);
                key = keyInfo.Key;

                if (key == ConsoleKey.Backspace && maskedValue.Length > 0)
                {
                    Console.Write("\b \b");
                    maskedValue = maskedValue.Substring(0, maskedValue.Length - 1);
                }
                else if (!char.IsControl(keyInfo.KeyChar))
                {
                    Console.Write("*");
                    maskedValue += keyInfo.KeyChar;
                }
            } while (key != ConsoleKey.Enter);

            Console.Write(Environment.NewLine);

            return maskedValue;
        }
        
        
        /// <summary>
        /// Reads a mandatory masked value
        /// </summary>
        /// <param name="message">Message to show</param>
        /// <returns>Config value</returns>
        public static string ReadMaskedValueMandatory(string message)
        {
            string configValue = string.Empty;
            do
            {
                configValue = ReadMaskedValue(message);
            }
            while(string.IsNullOrEmpty(configValue));

            return configValue;
        }
    }
}