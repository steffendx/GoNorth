using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering a code action
    /// </summary>
    public class CodeActionRenderer : BaseActionRenderer<CodeActionRenderer.CodeActionData>
    {
        /// <summary>
        /// Code action data
        /// </summary>
        public class CodeActionData
        {
            /// <summary>
            /// Script name
            /// </summary>
            public string ScriptName { get; set; }

            /// <summary>
            /// Script code
            /// </summary>
            public string ScriptCode { get; set; }
        }

        /// <summary>
        /// Placeholder for the Script Name
        /// </summary>
        private const string Placeholder_ScriptName = "Tale_Action_ScriptName";

        /// <summary>
        /// Placeholder for the Script Code
        /// </summary>
        private const string Placeholder_ScriptCode = "Tale_Action_ScriptCode";


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
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public CodeActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(CodeActionRenderer));
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(CodeActionRenderer.CodeActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
           
            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptName).Replace(actionTemplate.Code, ExportUtil.EscapeCharacters(parsedData.ScriptName, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptCode).Replace(actionCode, parsedData.ScriptCode);
            actionCode = BuildFinalScriptCode(actionCode);
            
            return actionCode;
        }

        /// <summary>
        /// Builds the final script code to export
        /// </summary>
        /// <param name="scriptCode">Script code</param>
        /// <returns>Final script code</returns>
        private string BuildFinalScriptCode(string scriptCode) 
        {
            if(string.IsNullOrEmpty(scriptCode)) 
            {
                return string.Empty;
            }

            // Normalize linebreaks
            return scriptCode.Replace("\r\n", "\n").Replace("\n", "\r\n"); 
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(CodeActionRenderer.CodeActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            return Task<string>.FromResult("Script (" + ExportUtil.BuildTextPreview(parsedData.ScriptName) + ")");
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionCodeAction);
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleActionCodeAction;
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptCode, _localizer)
            };

            return exportPlaceholders;
        }
    }
}