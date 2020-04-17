using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Tale;
using GoNorth.Extensions;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder.Util;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder.LegacyRenderingEngine
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
        /// Placeholder for function name
        /// </summary>
        private const string Placeholder_FunctionName = "Tale_FunctionName";

        /// <summary>
        /// Placeholder for the parent preview of a placeholder
        /// </summary>
        private const string Placeholder_Function_ParentPreview = "Tale_Function_ParentPreview";

        /// <summary>
        /// Content of the function
        /// </summary>
        private const string Placeholder_FunctionContent = "Tale_FunctionContent";


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
        /// Default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Dialog Renderer
        /// </summary>
        private readonly IExportDialogRenderer _dialogRenderer;
        
        /// <summary>
        /// Placeholder resolver
        /// </summary>
        private IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="taleDbAccess">Dialog Db Access</param>
        /// <param name="dialogParser">Dialog Parser</param>
        /// <param name="dialogFunctionGenerator">Dialog Function Generator</param>
        /// <param name="dialogRenderer">Dialog Renderer</param>
        /// <param name="defaultTemplateProvider">Default Template provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public DialogExportTemplatePlaceholderResolver(IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, ITaleDbAccess taleDbAccess, IExportDialogParser dialogParser, 
                                                       IExportDialogFunctionGenerator dialogFunctionGenerator, IExportDialogRenderer dialogRenderer, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                                       IStringLocalizerFactory localizerFactory) : 
                                                       base(localizerFactory.Create(typeof(DialogExportTemplatePlaceholderResolver)))
        {
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _taleDbAccess = taleDbAccess;
            _dialogParser = dialogParser;
            _dialogFunctionGenerator = dialogFunctionGenerator;
            _defaultTemplateProvider = defaultTemplateProvider;
            _dialogRenderer = dialogRenderer;
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="placeholderResolver">Placeholder Resolver</param>
        public void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver placeholderResolver)
        {
            _templatePlaceholderResolver = placeholderResolver;
            _dialogRenderer.SetExportTemplatePlaceholderResolver(placeholderResolver);
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
            if(npc != null)
            {
                // Replace Dialog Placeholders
                return await FillDialogPlaceholders(code, npc);
            }

            ExportDialogFunctionCode dialogFunction = data.ExportData[ExportConstants.ExportDataObject] as ExportDialogFunctionCode;
            if(dialogFunction != null)
            {
                // Replace Dialog Function
                GoNorthProject project = await _cachedDbAccess.GetDefaultProject();
                return await RenderDialogFunction(project, dialogFunction);
            }
            
            return code;
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

            try
            {
                _errorCollection.CurrentErrorContext = _localizer["DialogErrorContext"].Value;
                _dialogParser.SetErrorCollection(_errorCollection);
                _dialogRenderer.SetErrorCollection(_errorCollection);
                ExportDialogData exportDialog = null;
                bool hasValidDialog = SharedDialogExportUtil.HasValidDialog(dialog);
                if(hasValidDialog)
                {
                    exportDialog = _dialogParser.ParseDialog(dialog);
                    if(exportDialog == null)
                    {
                        return string.Empty;
                    }
                    exportDialog = await _dialogFunctionGenerator.GenerateFunctions(project.Id, npc.Id, exportDialog, _errorCollection);
                }

                code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasDialog_Start, Placeholder_HasDialog_End, hasValidDialog);

                code = await RenderDialog(project, code, exportDialog, dialog, npc);
            }
            finally
            {
                _errorCollection.CurrentErrorContext = "";
            }

            return code;
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

            List<ExportDialogFunctionCode> dialogRenderResult = await _dialogRenderer.RenderDialogSteps(exportDialog, npc);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_Start, ExportConstants.ListIndentPrefix).Replace(code, m => {
                if(dialogRenderResult.Any())
                {
                    return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(dialogRenderResult[0].Code, m.Groups[1].Value));
                }

                return string.Empty;
            });
            code = await ExportUtil.BuildPlaceholderRegex(Placeholder_Additional_Functions, ExportConstants.ListIndentPrefix).ReplaceAsync(code, async m => {
                string finalCode = string.Empty;
                foreach(ExportDialogFunctionCode curFunction in dialogRenderResult.Skip(1)) {
                    finalCode += await RenderFunctionForList(project, curFunction);
                }
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(finalCode, m.Groups[1].Value));
            });

            return code;
        }

        /// <summary>
        /// Renders a function for a list
        /// </summary>
        /// <param name="project">Current Project</param>
        /// <param name="functionCode">Function code to use</param>
        /// <returns>Function</returns>
        public async Task<string> RenderFunctionForList(GoNorthProject project, ExportDialogFunctionCode functionCode)
        {
            ExportTemplate functionTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleDialogFunction);
            
            ExportObjectData objectData = new ExportObjectData();
            objectData.ExportData.Add(ExportConstants.ExportDataObject, functionCode);

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.TaleDialogFunction, functionTemplate.Code, objectData, functionTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return fillResult.Code;
        }

        /// <summary>
        /// Renders a dialog function
        /// </summary>
        /// <param name="project">Current Project</param>
        /// <param name="functionCode">Function code to use</param>
        /// <returns>Rendered dialog function</returns>
        public async Task<string> RenderDialogFunction(GoNorthProject project, ExportDialogFunctionCode functionCode)
        {
            string renderedCode = (await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleDialogFunction)).Code;
            renderedCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FunctionName).Replace(renderedCode, functionCode.FunctionName);
            renderedCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Function_ParentPreview).Replace(renderedCode, functionCode.ParentPreviewText);
            renderedCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FunctionContent, ExportConstants.ListIndentPrefix).Replace(renderedCode, m => {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(functionCode.Code, m.Groups[1].Value));
            });

            return renderedCode;
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

            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();
            if(templateType == TemplateType.TaleDialogFunction)
            {
                placeholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_FunctionName, _localizer));
                placeholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_Function_ParentPreview, _localizer));
                placeholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_FunctionContent, _localizer));
            }

            placeholders.AddRange(_dialogRenderer.GetExportTemplatePlaceholdersForType(templateType, ExportTemplateRenderingEngine.Legacy));

            return placeholders;
        }
    }
}