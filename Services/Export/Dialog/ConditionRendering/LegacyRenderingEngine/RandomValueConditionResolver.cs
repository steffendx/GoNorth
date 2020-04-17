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
    /// Class for rendering a random value condition
    /// </summary>
    public class RandomValueConditionResolver :  BaseConditionRenderer<RandomValueConditionData>
    {
        /// <summary>
        /// Placeholder for the compare operator of the random value condition
        /// </summary>
        private const string Placeholder_Operator = "Tale_Condition_RandomValue_Operator";

        /// <summary>
        /// Placeholder for the min value
        /// </summary>
        private const string Placeholder_MinValue = "Tale_Condition_RandomValue_MinValue";

        /// <summary>
        /// Placeholder for the max value
        /// </summary>
        private const string Placeholder_MaxValue = "Tale_Condition_RandomValue_MaxValue";

        /// <summary>
        /// Placeholder for the compare value
        /// </summary>
        private const string Placeholder_CompareValue = "Tale_Condition_RandomValue_CompareValue";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public RandomValueConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(RandomValueConditionResolver));
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
        public override async Task<string> BuildConditionElementFromParsedData(ExportTemplate template, RandomValueConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            string conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(template.Code, await ConditionRenderingUtil.GetCompareOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection));
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_MinValue).Replace(conditionCode, parsedData.MinValue.ToString());
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_MaxValue).Replace(conditionCode, parsedData.MaxValue.ToString());
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CompareValue).Replace(conditionCode, parsedData.CompareValue.ToString());

            return conditionCode;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            return new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_Operator, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_MinValue, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_MaxValue, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_CompareValue, _localizer)
            };
        }
    }
}