using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a code action
    /// </summary>
    public class CodeActionRenderer : BaseCodeActionRenderer
    {
        /// <summary>
        /// Placeholder for the Script Name
        /// </summary>
        private const string Placeholder_ScriptName = "Tale_Action_ScriptName";

        /// <summary>
        /// Placeholder for the Script Code
        /// </summary>
        private const string Placeholder_ScriptCode = "Tale_Action_ScriptCode";


        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public CodeActionRenderer(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(CodeActionRenderer));
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, CodeActionData parsedData, FlexFieldObject flexFieldObject, ExportDialogData curStep, 
                                                               ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptName).Replace(template.Code, ExportUtil.EscapeCharacters(parsedData.ScriptName, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptCode).Replace(actionCode, parsedData.ScriptCode);
            
            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
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