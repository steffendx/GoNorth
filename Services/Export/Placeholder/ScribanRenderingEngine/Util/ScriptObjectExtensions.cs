using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Extension methods for script objects
    /// </summary>
    public static class ScriptObjectExtensions
    {
        /// <summary>
        /// Adds or updates a value
        /// </summary>
        /// <param name="scriptObject">Script object that is being updated</param>
        /// <param name="key">Key</param>
        /// <param name="value">Value</param>
        public static void AddOrUpdate(this ScriptObject scriptObject, string key, object value)
        {
            if(scriptObject.ContainsKey(key))
            {
                scriptObject[key] = value;
            }
            else
            {
                scriptObject.Add(key, value);
            }
        }
    }
}