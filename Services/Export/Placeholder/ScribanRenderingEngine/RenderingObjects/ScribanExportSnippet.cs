using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export export snippets to Scriban
    /// </summary>
    public class ScribanExportSnippet
    {
        /// <summary>
        /// Name of the snippet
        /// </summary>
        [ScribanExportValueLabel]
        public string Name { get; set; }

        /// <summary>
        /// true if the export snippet exists, else false
        /// </summary>
        [ScribanExportValueLabel]
        public bool Exists { get; set; }

        /// <summary>
        /// Initial snippet Function
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportSnippetFunction InitialFunction { get; set; }

        /// <summary>
        /// Additional functions besides the initial dialog
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportSnippetFunction> AdditionalFunctions { get; set; }

        /// <summary>
        /// All dialog functions
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportSnippetFunction> AllFunctions { get; set; }
    }
}