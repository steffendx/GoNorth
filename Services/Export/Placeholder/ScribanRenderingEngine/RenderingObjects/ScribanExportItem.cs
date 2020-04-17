namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Items to Scriban
    /// </summary>
    public class ScribanExportItem : ScribanFlexFieldObject
    {
        /// <summary>
        /// Export object type
        /// </summary>
        public override string ExportObjectType
        {
            get
            {
                return ExportConstants.ExportObjectTypeItem;
            }
        }
    }
}