using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.LanguageKeyGeneration;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Dialog Export Template Placeholder Resolver
    /// </summary>
    public class DialogExportTemplatePlaceholderResolver : BaseExportPlaceholderResolver, IExportTemplateTopicPlaceholderResolver
    {
        /// <summary>
        /// Start of the condition of the npc having a dialog
        /// </summary>
        private const string Placeholder_HasDialog_Start = "Dialog_HasDialog_Start";

        /// <summary>
        /// End of the condition of the npc having a dialog
        /// </summary>
        private const string Placeholder_HasDialog_End = "Dialog_HasDialog_End";

        /// <summary>
        /// Placeholder for the start of the dialog
        /// </summary>
        private const string Placeholder_Start = "Dialog_Start";

        /// <summary>
        /// Placeholder for additional dialog functions
        /// </summary>
        private const string Placeholder_Additional_Functions = "Dialog_Additional_Functions";


        /// <summary>
        /// Export Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Tale Db Access
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Dialog Parser
        /// </summary>
        private readonly IExportDialogParser _dialogParser;

        /// <summary>
        /// Dialog Function Generator
        /// </summary>
        private readonly IExportDialogFunctionGenerator _dialogFunctionGenerator;

        /// <summary>
        /// Dialog Renderer
        /// </summary>
        private readonly IExportDialogRenderer _dialogRenderer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="taleDbAccess">Dialog Db Access</param>
        /// <param name="dialogParser">Dialog Parser</param>
        /// <param name="dialogFunctionGenerator">Dialog Function Generator</param>
        /// <param name="dialogRenderer">Dialog Renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public DialogExportTemplatePlaceholderResolver(IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, ITaleDbAccess taleDbAccess, IExportDialogParser dialogParser, 
                                                       IExportDialogFunctionGenerator dialogFunctionGenerator, IExportDialogRenderer dialogRenderer, IStringLocalizerFactory localizerFactory) : 
                                                       base(localizerFactory.Create(typeof(DialogExportTemplatePlaceholderResolver)))
        {
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _taleDbAccess = taleDbAccess;
            _dialogParser = dialogParser;
            _dialogFunctionGenerator = dialogFunctionGenerator;
            _dialogRenderer = dialogRenderer;
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public async Task<string> FillPlaceholders(string code, ExportObjectData data)
        {
            // Check Data
            if(!data.ExportData.ContainsKey(ExportConstants.ExportDataObject))
            {
                return code;
            }

            KortistoNpc npc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if(npc == null)
            {
                return code;
            }

            // Replace Dialog Placeholders
            return await FillDialogPlaceholders(code, npc);
        }

        /// <summary>
        /// Fills the dialog placeholders
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="npc">Npc</param>
        /// <returns>Filled code</returns>
        private async Task<string> FillDialogPlaceholders(string code, KortistoNpc npc)
        {
            GoNorthProject project = await _cachedDbAccess.GetDefaultProject();
            TaleDialog dialog = await _taleDbAccess.GetDialogByRelatedObjectId(npc.Id);

            _dialogParser.SetErrorCollection(_errorCollection);
            _dialogRenderer.SetErrorCollection(_errorCollection);
            ExportDialogData exportDialog = null;
            bool hasValidDialog = HasValidDialog(dialog);
            if(hasValidDialog)
            {
                exportDialog = _dialogParser.ParseDialog(dialog);
                if(exportDialog == null)
                {
                    return string.Empty;
                }
                exportDialog = await _dialogFunctionGenerator.GenerateFunctions(project.Id, exportDialog, _errorCollection);
            }

            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasDialog_Start, Placeholder_HasDialog_End, hasValidDialog);

            code = await RenderDialog(project, code, exportDialog, dialog, npc);

            return code;
        }

        /// <summary>
        /// Returns true if a valid dialog exists, else false
        /// </summary>
        /// <param name="dialog">Dialog to check</param>
        /// <returns>true if a valid dialog exists, else false</returns>
        private bool HasValidDialog(TaleDialog dialog)
        {
            if(dialog == null)
            {
                return false;
            }

            if(!dialog.NpcText.Any() && !dialog.PlayerText.Any() && !dialog.Choice.Any() && !dialog.Condition.Any() && !dialog.Action.Any())
            {
                return false;
            }

            return true;
        }
        
        /// <summary>
        /// Renders the dialog
        /// </summary>
        /// <param name="project">Current Project</param>
        /// <param name="code">Template code</param>
        /// <param name="exportDialog">Export dialog data</param>
        /// <param name="dialog">Dialog</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Filled code</returns>
        private async Task<string> RenderDialog(GoNorthProject project, string code, ExportDialogData exportDialog, TaleDialog dialog, KortistoNpc npc)
        {
            if(exportDialog == null)
            {
                code = ExportUtil.BuildPlaceholderRegex(Placeholder_Start).Replace(code, string.Empty);
                code = ExportUtil.BuildPlaceholderRegex(Placeholder_Additional_Functions).Replace(code, string.Empty);
                return code;
            }

            ExportDialogRenderResult dialogRenderResult = await _dialogRenderer.RenderDialog(exportDialog, npc);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_Start, ExportConstants.ListIndentPrefix).Replace(code, m => {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(dialogRenderResult.StartStepCode, m.Groups[1].Value));
            });
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_Additional_Functions, ExportConstants.ListIndentPrefix).Replace(code, m => {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(dialogRenderResult.AdditionalFunctionsCode, m.Groups[1].Value));
            });

            return code;
        }

        /// <summary>
        /// Returns if the placeholder resolver is valid for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is valid for the template type</returns>
        public bool IsValidForTemplateType(TemplateType templateType)
        {
            if(templateType == TemplateType.ObjectNpc)
            {
                return true;
            }

            return _dialogRenderer.HasPlaceholdersForTemplateType(templateType);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            if(templateType == TemplateType.ObjectNpc)
            {
                return new List<ExportTemplatePlaceholder>() {
                    CreatePlaceHolder(Placeholder_HasDialog_Start),
                    CreatePlaceHolder(Placeholder_HasDialog_End),
                    CreatePlaceHolder(Placeholder_Start),
                    CreatePlaceHolder(Placeholder_Additional_Functions)
                };
            }

            return _dialogRenderer.GetExportTemplatePlaceholdersForType(templateType);
        }
    }
}