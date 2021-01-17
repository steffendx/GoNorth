using GoNorth.Data.Kirja;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export a wiki page
    /// </summary>
    public class ScribanExportWikiPage
    {
        /// <summary>
        /// Name of the wiki page
        /// </summary>
        [ScribanExportValueLabel]
        public string Name { get; set; }

        /// <summary>
        /// Content of the wiki page
        /// </summary>
        [ScribanExportValueLabel]
        public string Content { get; set; }

        /// <summary>
        /// Builds an export wiki page based on a kirja page
        /// </summary>
        /// <param name="page">Wiki page</param>
        public ScribanExportWikiPage(KirjaPage page)
        {
            Name = page.Name;
            Content = page.Content;
        }
    }
}