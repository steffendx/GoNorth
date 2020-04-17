using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a fade to / from black action
    /// </summary>
    public class ScribanFadeToFromBlackActionData
    {
        /// <summary>
        /// Amount of time that is used for fading
        /// </summary>
        [ScribanExportValueLabel]
        public int FadeTime { get; set; }
    }
}