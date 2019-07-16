using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.NodeGraphExport;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for Rendering an Export Dialog
    /// </summary>
    public class ExportDialogRenderer : NodeGraphBaseRenderer, IExportDialogRenderer
    {
        /// <summary>
        /// Placeholder for function name
        /// </summary>
        private const string Placeholder_FunctionName = "Tale_FunctionName";

        /// <summary>
        /// Placeholder for the parent preview of a placeholder
        /// </summary>
        private const string Placeholder_Function_ParentPreview = "Tale_Function_ParentPreview";

        /// <summary>
        /// Placeholder for step content
        /// </summary>
        private const string Placeholder_StepContent = "Tale_StepContent";

        /// <summary>
        /// Content of the function
        /// </summary>
        private const string Placeholder_FunctionContent = "Tale_FunctionContent";


        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="dailyRoutineEventPlaceholderResolver">Daily routine event placeholder resolver</param>
        /// <param name="stringLocalizerFactory">String Localizer Factor</param>
        public ExportDialogRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, 
                                    IConditionRenderer conditionRenderer, IDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, IStringLocalizerFactory stringLocalizerFactory)
                                    : base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, conditionRenderer, dailyRoutineEventPlaceholderResolver, stringLocalizerFactory)
        {
            _localizer = stringLocalizerFactory.Create(typeof(ExportDialogRenderer));
        }

        /// <summary>
        /// Renders a dialog
        /// </summary>
        /// <param name="exportDialog">Export Dialog</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Result of rendering the dialog</returns>
        public async Task<ExportDialogRenderResult> RenderDialog(ExportDialogData exportDialog, KortistoNpc npc)
        {
            _curProject = await _cachedDbAccess.GetDefaultProject();
            _exportSettings = await _cachedDbAccess.GetExportSettings(_curProject.Id);

            SetupStepRenderes();

            ExportDialogRenderResult renderResult = new ExportDialogRenderResult();
            renderResult.StartStepCode = string.Empty;
            renderResult.AdditionalFunctionsCode = string.Empty;

            // Group to Functions
            ExportDialogFunction rootFunction = new ExportDialogFunction(exportDialog);
            AddNodesToFunction(rootFunction, exportDialog);
            List<ExportDialogFunction> additionalFunctions = ExtractAdditionalFunctions(exportDialog);

            // Render functions
            string startStepCode = await RenderDialogStepList(rootFunction.FunctionSteps, npc);
            string additionalFunctionsCode = string.Empty;
            foreach(ExportDialogFunction curAdditionalFunction in additionalFunctions)
            {
                additionalFunctionsCode += await RenderDialogFunction(curAdditionalFunction, npc);
            }

            ExportTemplate dialogStepTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(_curProject.Id, TemplateType.TaleDialogStep);
            renderResult.StartStepCode = ExportUtil.BuildPlaceholderRegex(Placeholder_StepContent).Replace(dialogStepTemplate.Code, startStepCode);
            renderResult.AdditionalFunctionsCode = additionalFunctionsCode;

            return renderResult;
        }

        /// <summary>
        /// Builds the dialog function code
        /// </summary>
        /// <param name="additionalFunction">Function</param>
        /// <param name="additionalFunctionsCode">Additional Function Code to wrap</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Function Code</returns>
        protected override async Task<string> BuildDialogFunctionCode(ExportDialogFunction additionalFunction, string additionalFunctionsCode, KortistoNpc npc)
        {
            string functionCode = (await _defaultTemplateProvider.GetDefaultTemplateByType(_curProject.Id, TemplateType.TaleDialogFunction)).Code;
            string functionContentCode = (await _defaultTemplateProvider.GetDefaultTemplateByType(_curProject.Id, TemplateType.TaleDialogStep)).Code;
            functionContentCode = ExportUtil.BuildPlaceholderRegex(Placeholder_StepContent).Replace(functionContentCode, additionalFunctionsCode);

            functionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FunctionName).Replace(functionCode, additionalFunction.RootNode.DialogStepFunctionName);
            functionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Function_ParentPreview).Replace(functionCode, await BuildFunctionParentPreview(additionalFunction, npc));
            functionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FunctionContent, ExportConstants.ListIndentPrefix).Replace(functionCode, m => {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(functionContentCode, m.Groups[1].Value));
            });

            return functionCode;
        }

        /// <summary>
        /// Prepares all step renderes
        /// </summary>
        protected override void SetupStepRenderes()
        {
            _stepRenderers.Clear();
            _stepRenderers.Add(new ExportDialogTextLineRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject, true));
            _stepRenderers.Add(new ExportDialogTextLineRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject, false));
            _stepRenderers.Add(new ExportDialogChoiceRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _conditionRenderer, _stringLocalizerFactory, _exportSettings, _curProject));
            _stepRenderers.Add(new ExportDialogConditionRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _conditionRenderer, _stringLocalizerFactory, _exportSettings, _curProject));
            _stepRenderers.Add(new ExportDialogActionRenderer(_errorCollection, _defaultTemplateProvider, _cachedDbAccess, _dailyRoutineEventPlaceholderResolver, _languageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject));
        }

        /// <summary>
        /// Returns true if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            if(templateType == TemplateType.TaleDialogFunction || templateType == TemplateType.TaleDialogFunction || templateType == TemplateType.TaleDialogStep)
            {
                return true;
            }

            SetupStepRenderes();

            foreach(IExportDialogStepRenderer curRenderer in _stepRenderers)
            {
                if(curRenderer.HasPlaceholdersForTemplateType(templateType))
                {
                    return true;
                }
            }

            if(_conditionRenderer.HasPlaceholdersForTemplateType(templateType))
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            // Since project and export settings are not required for resolving placeholders the renderes are setup without loading the data
            SetupStepRenderes();

            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();
            placeholders.AddRange(CreateExportTemplatePlaceholders(templateType));

            foreach(IExportDialogStepRenderer curRenderer in _stepRenderers)
            {
                placeholders.AddRange(curRenderer.GetPlaceholdersForTemplate(templateType));
            }

            placeholders.AddRange(_conditionRenderer.GetExportTemplatePlaceholdersForType(templateType));

            return placeholders;
        }

        /// <summary>
        /// Creates export template placeholders
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>Export Template placeholders</returns>
        private IEnumerable<ExportTemplatePlaceholder> CreateExportTemplatePlaceholders(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();
            if(templateType == TemplateType.TaleDialogFunction)
            {
                placeholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_FunctionName, _localizer));
                placeholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_Function_ParentPreview, _localizer));
                placeholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_FunctionContent, _localizer));
            }
            else if(templateType == TemplateType.TaleDialogStep)
            {
                placeholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_StepContent, _localizer));
            }

            return placeholders;
        }
    }
}