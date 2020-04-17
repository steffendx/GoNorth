using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export NPCs to Scriban
    /// </summary>
    public class ScribanExportNpc : ScribanFlexFieldObject
    {
        /// <summary>
        /// true if the npc is the player npc, else false
        /// </summary>
        [ScribanExportValueLabel]
        public bool IsPlayer { get; set; }

        /// <summary>
        /// Export object type
        /// </summary>
        public override string ExportObjectType
        {
            get
            {
                return ExportConstants.ExportObjectTypeNpc;
            }
        }
    }
}