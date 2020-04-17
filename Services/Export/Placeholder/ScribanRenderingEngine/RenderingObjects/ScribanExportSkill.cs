namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Skills to Scriban
    /// </summary>
    public class ScribanExportSkill : ScribanFlexFieldObject
    {
        /// <summary>
        /// Export object type
        /// </summary>
        public override string ExportObjectType
        {
            get
            {
                return ExportConstants.ExportObjectTypeSkill;
            }
        }
    }
}