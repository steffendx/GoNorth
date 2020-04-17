using System.Linq;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export a list of export snippets to Scriban
    /// </summary>
    public class ScribanExportSnippetsData
    {
        /// <summary>
        /// returns true if any snippet exists, else false
        /// </summary>
        [ScribanExportValueLabel]
        public bool HasAnySnippet
        {
            get
            {
                return Snippets.Any();
            }
        }

        /// <summary>
        /// List of snippets to export
        /// </summary>
        [ScribanKeyCollectionLabel("<SNIPPET_NAME>", typeof(ScribanExportSnippet), true)]
        public ScribanExportSnippetDictionary Snippets { get; set; }
    }
}