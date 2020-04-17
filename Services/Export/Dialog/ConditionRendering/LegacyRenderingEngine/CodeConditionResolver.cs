using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a code condition
    /// </summary>
    public class CodeConditionResolver :  BaseConditionRenderer<CodeConditionData>
    {

        /// <summary>
        /// Placeholder for the script name
        /// </summary>
        private const string Placeholder_ScriptName = "Tale_Condition_ScriptName";

        /// <summary>
        /// Placeholder for the script code
        /// </summary>
        private const string Placeholder_ScriptCode = "Tale_Condition_ScriptCode";


        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public CodeConditionResolver(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(CodeConditionResolver));
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
        public override Task<string> BuildConditionElementFromParsedData(ExportTemplate template, CodeConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            string conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptName).Replace(template.Code, !string.IsNullOrEmpty(parsedData.ScriptName) ? parsedData.ScriptName : string.Empty);
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptCode).Replace(conditionCode, !string.IsNullOrEmpty(parsedData.ScriptCode) ? parsedData.ScriptCode : string.Empty);

            return Task.FromResult(conditionCode);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            return new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptCode, _localizer)
            };
        }
    }
}