using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a inventory condition data
    /// </summary>
    public class ScribanInventoryConditionData
    {
        /// <summary>
        /// Npc that contains the item
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }

        /// <summary>
        /// Item that was selected for the condition
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportItem SelectedItem { get; set; }

        /// <summary>
        /// Operator
        /// </summary>
        [ScribanExportValueLabel]
        public string Operator { get; set; }

        /// <summary>
        /// Operator that was not resolved using the templates
        /// </summary>
        [ScribanExportValueLabel]
        public string OriginalOperator { get; set; }

        /// <summary>
        /// Quantity
        /// </summary>
        [ScribanExportValueLabel]
        public int Quantity { get; set; }
    }
}