using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export language file data to Scriban
    /// </summary>
    public class ScribanExportLanguageFile
    {
        /// <summary>
        /// Flex field object to which the language file belongs
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanFlexFieldObject Object { get; set; }

        /// <summary>
        /// Language keys
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportLanguageKey> LanguageKeys { get; set; }

        /// <summary>
        /// Referenced language keys
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportLanguageKey> ReferencedLanguageKeys { get; set; }
        
        /// <summary>
        /// Dialog language keys
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportLanguageKey> DialogLanguageKeys { get; set; }

        /// <summary>
        /// Language Keys of referenced objects
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportLanguageObject> DialogReferencedObjects { get; set; }
    }
}