using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a play animation action
    /// </summary>
    public class ScribanPlayAnimationActionData
    {
        /// <summary>
        /// Npc for which the animation is played
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }

        /// <summary>
        /// Name of the animation
        /// </summary>
        [ScribanExportValueLabel]
        public string Animation { get; set; }

        /// <summary>
        /// Name of the animation without using the escape settings
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedAnimation { get; set; }
    }
}