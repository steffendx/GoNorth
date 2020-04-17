using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban code condition
    /// </summary>
    public class ScribanCodeConditionRenderer : ScribanConditionBaseRenderer<CodeConditionData, ScribanCodeConditionData>
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanCodeConditionRenderer(IExportCachedDbAccess exportCachedDbAccess, IStringLocalizerFactory localizerFactory) : base(exportCachedDbAccess, null, localizerFactory)
        {
        }


        /// <summary>
        /// Returns the value object to use for scriban exporting
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Value Object</returns>
        protected override Task<ScribanCodeConditionData> GetExportObject(CodeConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ScribanCodeConditionData conditionData = new ScribanCodeConditionData();
            
            conditionData.ScriptName = parsedData.ScriptName;
            conditionData.ScriptCode = parsedData.ScriptCode;

            return Task.FromResult(conditionData);
        }

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected override string GetObjectKey()
        {
            return "condition";
        }

    }
}