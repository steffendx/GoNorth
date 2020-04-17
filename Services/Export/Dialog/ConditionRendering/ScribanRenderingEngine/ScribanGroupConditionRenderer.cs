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
    /// Class for rendering a scriban group condition
    /// </summary>
    public class ScribanGroupConditionRenderer : ScribanConditionBaseRenderer<GroupConditionData, ScribanGroupConditionData>
    {
        /// <summary>
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanGroupConditionRenderer(IConditionRenderer conditionRenderer, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IStringLocalizerFactory localizerFactory) : 
                                             base(cachedDbAccess, null, localizerFactory)
        {
            _conditionRenderer = conditionRenderer;
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
        protected override async Task<ScribanGroupConditionData> GetExportObject(GroupConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ScribanGroupConditionData conditionData = new ScribanGroupConditionData();
            
            string operatorContent = await ConditionRenderingUtil.GetGroupOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection);
            string renderedConditionElements = await _conditionRenderer.RenderConditionElements(project, parsedData.ConditionElements, operatorContent, errorCollection, flexFieldObject, exportSettings);

            conditionData.Content = renderedConditionElements;

            return conditionData;   
        }

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected override string GetObjectKey()
        {
            return "logic_group";
        }

    }
}