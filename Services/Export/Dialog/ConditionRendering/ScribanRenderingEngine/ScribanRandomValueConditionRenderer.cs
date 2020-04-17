using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.ConditionRendering.Util;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban random value condition
    /// </summary>
    public class ScribanRandomValueConditionRenderer : ScribanConditionBaseRenderer<RandomValueConditionData, ScribanRandomValueConditionData>
    {
        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="defaultTemplateProvider">Cached database access</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanRandomValueConditionRenderer(IExportCachedDbAccess cachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory) : base(cachedDbAccess, null, localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
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
        protected override async Task<ScribanRandomValueConditionData> GetExportObject(RandomValueConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ScribanRandomValueConditionData conditionData = new ScribanRandomValueConditionData();
            conditionData.Operator = await ConditionRenderingUtil.GetCompareOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection);
            conditionData.OriginalOperator = parsedData.Operator;
            conditionData.MinValue = parsedData.MinValue;
            conditionData.MaxValue = parsedData.MaxValue;
            conditionData.CompareValue = parsedData.CompareValue;

            return conditionData;   
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