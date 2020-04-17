using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.Placeholder.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class for Dialog Scriban value collectors
    /// </summary>
    public class DialogValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Export template placeholder resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Export cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Export cached default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Dialog database access
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
        /// Language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="taleDbAccess">Dialog database access</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="dialogParser">Dialog Parser</param>
        /// <param name="dialogFunctionGenerator">Dialog Function Generator</param>
        /// <param name="dialogRenderer">Dialog Renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public DialogValueCollector(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, ITaleDbAccess taleDbAccess, 
                                    IScribanLanguageKeyGenerator languageKeyGenerator, IExportDialogParser dialogParser, IExportDialogFunctionGenerator dialogFunctionGenerator, IExportDialogRenderer dialogRenderer,
                                    IStringLocalizerFactory localizerFactory)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _taleDbAccess = taleDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _dialogParser = dialogParser;
            _dialogFunctionGenerator = dialogFunctionGenerator;
            _dialogRenderer = dialogRenderer;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc || _dialogRenderer.HasPlaceholdersForTemplateType(templateType);
        }

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public override async Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            KortistoNpc inputNpc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if (inputNpc == null)
            {
                return;
            }

            _languageKeyGenerator.SetErrorCollection(_errorCollection);

            GoNorthProject project = await _exportCachedDbAccess.GetDefaultProject();
            TaleDialog dialog = await _taleDbAccess.GetDialogByRelatedObjectId(inputNpc.Id);

            ExportDialogData parsedDialog = await ParseDialog(inputNpc, project, dialog);
            ScribanExportDialog exportDialog = await BuildExportDialog(parsedDialog, inputNpc);

            scriptObject.Add(ExportConstants.ScribanDialogKey, exportDialog);
            scriptObject.Add(DialogFunctionRenderer.DialogFunctionName, new DialogFunctionRenderer(_templatePlaceholderResolver, _exportCachedDbAccess, _defaultTemplateProvider, _errorCollection, data));
        }

        /// <summary>
        /// Parses a dialog
        /// </summary>
        /// <param name="inputNpc">Input npc</param>
        /// <param name="project">Project</param>
        /// <param name="dialog">Dialog</param>
        /// <returns>Export dialog data</returns>
        private async Task<ExportDialogData> ParseDialog(KortistoNpc inputNpc, GoNorthProject project, TaleDialog dialog)
        {
            ExportDialogData parsedDialog = null;
            IStringLocalizer localizer = _localizerFactory.Create(typeof(DialogValueCollector));
            try
            {
                _errorCollection.CurrentErrorContext = localizer["DialogErrorContext"].Value;
                _dialogParser.SetErrorCollection(_errorCollection);
                _dialogRenderer.SetErrorCollection(_errorCollection);
                bool hasValidDialog = SharedDialogExportUtil.HasValidDialog(dialog);
                if (hasValidDialog)
                {
                    parsedDialog = _dialogParser.ParseDialog(dialog);
                    if (parsedDialog != null)
                    {
                        parsedDialog = await _dialogFunctionGenerator.GenerateFunctions(project.Id, inputNpc.Id, parsedDialog, _errorCollection);
                    }
                }
            }
            finally
            {
                _errorCollection.CurrentErrorContext = "";
            }

            return parsedDialog;
        }

        /// <summary>
        /// Builds an export dailog
        /// </summary>
        /// <param name="parsedDialog">Parsed dialog</param>
        /// <param name="inputNpc">Input npc</param>
        /// <returns>Export dialog</returns>
        private async Task<ScribanExportDialog> BuildExportDialog(ExportDialogData parsedDialog, KortistoNpc inputNpc)
        {
            if(parsedDialog == null)
            {
                return null;
            }

            List<ExportDialogFunctionCode> steps = await _dialogRenderer.RenderDialogSteps(parsedDialog, inputNpc);

            ScribanExportDialog exportDialog = new ScribanExportDialog();
            exportDialog.InitialFunction = new ScribanExportDialogFunction(steps.FirstOrDefault());
            exportDialog.AdditionalFunctions = steps.Skip(1).Select(s => new ScribanExportDialogFunction(s)).ToList();
            exportDialog.AllFunctions = steps.Select(s => new ScribanExportDialogFunction(s)).ToList();

            return exportDialog;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            bool hasDialogRendererPlaceholders = _dialogRenderer.HasPlaceholdersForTemplateType(templateType);
            if(templateType != TemplateType.ObjectNpc && !hasDialogRendererPlaceholders)
            {
                return new List<ExportTemplatePlaceholder>();
            }

            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();

            if(templateType == TemplateType.ObjectNpc)
            {
                exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportDialog>(_localizerFactory, ExportConstants.ScribanDialogKey));
                exportPlaceholders.AddRange(DialogFunctionRenderer.GetPlaceholders(_localizerFactory));
                exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportDialogFunction>(_localizerFactory, ExportConstants.ScribanDialogFunctionKey));
            }
            
            exportPlaceholders.AddRange(_dialogRenderer.GetExportTemplatePlaceholdersForType(templateType, ExportTemplateRenderingEngine.Scriban));

            return exportPlaceholders;
        }
    }
}