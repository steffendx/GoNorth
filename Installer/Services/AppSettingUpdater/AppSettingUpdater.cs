using System;
using System.IO;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using GoNorth.Config;

namespace Installer.Services.AppSettingUpdater
{
    /// <summary>
    /// Helper Class to update appsettings
    /// </summary>
    public static class AppSettingUpdater
    {
        /// <summary>
        /// Adds or updates an appsetting
        /// </summary>
        /// <param name="updateConfig">Callback to update config</param>
        public static void AddOrUpdateAppSetting(Action<ConfigurationData> updateConfig)
        {
            string filePath = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
            string json = File.ReadAllText(filePath, Encoding.UTF8);
            ConfigurationData config = JsonSerializer.Deserialize<ConfigurationData>(json);

            updateConfig(config);

            string output = JsonSerializer.Serialize(config, new JsonSerializerOptions {
                WriteIndented = true,
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
            File.WriteAllText(filePath, output, Encoding.UTF8);
        }
    }
}