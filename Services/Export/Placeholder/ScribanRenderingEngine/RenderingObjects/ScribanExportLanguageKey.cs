using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export language key data to Scriban
    /// </summary>
    public class ScribanExportLanguageKey
    {
        /// <summary>
        /// Key of the language key
        /// </summary>
        [ScribanExportValueLabel]
        public string Key { get; set; }

        /// <summary>
        /// Text of the key
        /// </summary>
        [ScribanExportValueLabel]
        public string Text { get; set; }
        
        /// <summary>
        /// Text of the key without using the language key escape settings
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedText { get; set; }
    }
}