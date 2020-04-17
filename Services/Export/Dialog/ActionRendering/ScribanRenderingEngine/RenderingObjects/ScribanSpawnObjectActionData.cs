using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for spawning an object
    /// </summary>
    public class ScribanSpawnObjectActionData
    {
        /// <summary>
        /// Object that is being spawned
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanFlexFieldObject Object { get; set; }
        
        /// <summary>
        /// Name of the target marker
        /// </summary>
        [ScribanExportValueLabel]
        public string TargetMarkerName { get; set; }
        
        /// <summary>
        /// Name of the target marker without using escape setting
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedTargetMarkerName { get; set; }

        /// <summary>
        /// Pitch of the rotation
        /// </summary>
        [ScribanExportValueLabel]
        public float Pitch { get; set; }
        
        /// <summary>
        /// Yaw of the rotation
        /// </summary>
        [ScribanExportValueLabel]
        public float Yaw { get; set; }
        
        /// <summary>
        /// Roll of the rotation
        /// </summary>
        [ScribanExportValueLabel]
        public float Roll { get; set; }
    }
}