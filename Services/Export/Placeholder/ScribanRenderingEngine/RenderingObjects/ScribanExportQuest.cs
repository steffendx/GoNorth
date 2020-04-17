namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Quests to Scriban
    /// </summary>
    public class ScribanExportQuest : ScribanFlexFieldObject
    {
        /// <summary>
        /// Export object type
        /// </summary>
        public override string ExportObjectType
        {
            get
            {
                return ExportConstants.ExportObjectTypeQuest;
            }
        }
    }
}