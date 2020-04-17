using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a move npc action data
    /// </summary>
    public class ScribanMoveNpcToNpcActionData : ScribanMoveNpcToNpcActionBaseData
    {
        /// <summary>
        /// Movement state
        /// </summary>
        [ScribanExportValueLabel]
        public string MovementState { get; set; }
        
        /// <summary>
        /// Movement state without using escape setting
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedMovementState { get; set; }

        /// <summary>
        /// Direct continue function
        /// </summary>
        [ScribanExportValueLabel]
        public string DirectContinueFunction { get; set; }
    }
}