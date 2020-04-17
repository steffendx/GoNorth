using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for group condition data
    /// </summary>
    public class ScribanGroupConditionData
    {
        /// <summary>
        /// Content of the group
        /// </summary>
        [ScribanExportValueLabel]
        public string Content { get; set; }
    }
}