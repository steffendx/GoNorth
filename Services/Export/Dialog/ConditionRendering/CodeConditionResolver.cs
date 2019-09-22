using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Class for rendering a code condition
    /// </summary>
    public class CodeConditionResolver :  BaseConditionRenderer<CodeConditionResolver.CodeConditionData>
    {
        /// <summary>
        /// Code Condition Data
        /// </summary>
        public class CodeConditionData
        {
            /// <summary>
            /// Script Name
            /// </summary>
            public string ScriptName { get; set; }
            
            /// <summary>
            /// Script Code
            /// </summary>
            public string ScriptCode { get; set; }
        }


        /// <summary>
        /// Placeholder for the script name
        /// </summary>
        private const string Placeholder_ScriptName = "Tale_Condition_ScriptName";

        /// <summary>
        /// Placeholder for the script code
        /// </summary>
        private const string Placeholder_ScriptCode = "Tale_Condition_ScriptCode";


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
        public CodeConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(CodeConditionResolver));
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override string BuildConditionElementFromParsedData(CodeConditionResolver.CodeConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate conditionTemplate = _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleConditionCode).Result;
            
            string conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptName).Replace(conditionTemplate.Code, !string.IsNullOrEmpty(parsedData.ScriptName) ? parsedData.ScriptName : string.Empty);
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptCode).Replace(conditionCode, !string.IsNullOrEmpty(parsedData.ScriptCode) ? parsedData.ScriptCode : string.Empty);

            return conditionCode;
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleConditionCode;
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