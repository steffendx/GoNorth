using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.Util;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a value condition
    /// </summary>
    public class GroupConditionResolver : BaseConditionRenderer<GroupConditionData>
    {        
        /// <summary>
        /// Placeholder for the group content
        /// </summary>
        private const string Placeholder_GroupContent = "Logic_Group_Content";


        /// <summary>
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public GroupConditionResolver(IConditionRenderer conditionRenderer, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _conditionRenderer = conditionRenderer;
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(GroupConditionResolver));
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="template">Export template to use</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override async Task<string> BuildConditionElementFromParsedData(ExportTemplate template, GroupConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            string groupContent = template.Code;
            string operatorContent = await ConditionRenderingUtil.GetGroupOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection);
            string renderedConditionElements = await _conditionRenderer.RenderConditionElements(project, parsedData.ConditionElements, operatorContent, errorCollection, flexFieldObject, exportSettings);
            
            groupContent = ExportUtil.BuildPlaceholderRegex(Placeholder_GroupContent).Replace(groupContent, renderedConditionElements);
            return groupContent;
        }


        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            return new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_GroupContent, _localizer)
            };
        }
    }
}