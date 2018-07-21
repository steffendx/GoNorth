using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for Rendering an Export Dialog
    /// </summary>
    public class ExportDialogRenderer : IExportDialogRenderer
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
        /// Error Collection
        /// </summary>
        private ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// String Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _stringLocalizerFactory;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Step Rendereres
        /// </summary>
        private List<IExportDialogStepRenderer> _stepRenderers;

        /// <summary>
        /// Current Project
        /// </summary>
        private GoNorthProject _curProject;

        /// <summary>
        /// Export Settings
        /// </summary>
        private ExportSettings _exportSettings;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="stringLocalizerFactory">String Localizer Factor</param>
        public ExportDialogRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, 
                                    IConditionRenderer conditionRenderer, IStringLocalizerFactory stringLocalizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _conditionRenderer = conditionRenderer;
            _stringLocalizerFactory = stringLocalizerFactory;
            _localizer = _stringLocalizerFactory.Create(typeof(ExportDialogRenderer));
            _stepRenderers = new List<IExportDialogStepRenderer>();
        }

        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        public void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection)
        {
            _errorCollection = errorCollection;
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
        /// Extracts all additional dialog functions
        /// </summary>
        /// <param name="exportDialog">Dialog data</param>
        /// <returns>Additional dialog functions</returns>
        private List<ExportDialogFunction> ExtractAdditionalFunctions(ExportDialogData exportDialog)
        {
            List<ExportDialogFunction> additionalDialogFunctions = new List<ExportDialogFunction>();
            HashSet<ExportDialogData> usedNodesForFunctions = new HashSet<ExportDialogData>();
            Queue<ExportDialogData> dataForFunctions = new Queue<ExportDialogData>();
            foreach (ExportDialogDataChild curChild in exportDialog.Children)
            {
                dataForFunctions.Enqueue(curChild.Child);
                usedNodesForFunctions.Add(curChild.Child);
            }

            while (dataForFunctions.Any())
            {
                ExportDialogData curDialogData = dataForFunctions.Dequeue();
                if (!string.IsNullOrEmpty(curDialogData.DialogStepFunctionName))
                {
                    ExportDialogFunction curAdditionalDialogFunction = new ExportDialogFunction(curDialogData);
                    AddNodesToFunction(curAdditionalDialogFunction, curDialogData);
                    additionalDialogFunctions.Add(curAdditionalDialogFunction);
                }

                foreach (ExportDialogDataChild curChild in curDialogData.Children)
                {
                    if (!usedNodesForFunctions.Contains(curChild.Child))
                    {
                        dataForFunctions.Enqueue(curChild.Child);
                        usedNodesForFunctions.Add(curChild.Child);
                    }
                }
            }

            return additionalDialogFunctions;
        }

        /// <summary>
        /// Adds all nodes that do not start a new function to a dialog function
        /// </summary>
        /// <param name="targetFunction">Target Function</param>
        /// <param name="exportDialog">Dialog step to check</param>
        private void AddNodesToFunction(ExportDialogFunction targetFunction, ExportDialogData exportDialog)
        {
            if(targetFunction.FunctionSteps.Contains(exportDialog))
            {
                return;
            }

            targetFunction.FunctionSteps.Add(exportDialog);
            foreach(ExportDialogDataChild curChild in exportDialog.Children)
            {
                if (string.IsNullOrEmpty(curChild.Child.DialogStepFunctionName))
                {
                    AddNodesToFunction(targetFunction, curChild.Child);
                }
            }
        }

        /// <summary>
        /// Renders a dialog function
        /// </summary>
        /// <param name="additionalFunction">additionalFunction</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Dialog function code</returns>
        private async Task<string> RenderDialogFunction(ExportDialogFunction additionalFunction, KortistoNpc npc)
        {
            string functionCode = await RenderDialogStepList(additionalFunction.FunctionSteps, npc);
            return await BuildDialogFunctionCode(additionalFunction, functionCode, npc);
        }

        /// <summary>
        /// Renders a list of dialog steps
        /// </summary>
        /// <param name="functionSteps">Steps to render</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Renderd code for list of dialog steps</returns>
        private async Task<string> RenderDialogStepList(List<ExportDialogData> functionSteps, KortistoNpc npc)
        {
            string stepListCode = string.Empty;
            foreach(ExportDialogData curData in functionSteps)
            {
                ExportDialogStepRenderResult renderResult = await RenderDialogStep(curData, npc);
                stepListCode += renderResult.StepCode;
            }
            return stepListCode;
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="exportDialog">Cur Data to render</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Result of the rendering of the step</returns>
        private async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportDialogData exportDialog, KortistoNpc npc)
        {
            foreach(IExportDialogStepRenderer curRenderer in _stepRenderers)
            {
                ExportDialogStepRenderResult result = await curRenderer.RenderDialogStep(exportDialog, npc);
                if(result != null)
                {
                    return result;
                }
            }
            
            _errorCollection.AddUnknownDialogStepError();
            return null;
        }

        /// <summary>
        /// Builds the dialog function code
        /// </summary>
        /// <param name="additionalFunction">Function</param>
        /// <param name="additionalFunctionsCode">Additional Function Code to wrap</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Function Code</returns>
        private async Task<string> BuildDialogFunctionCode(ExportDialogFunction additionalFunction, string additionalFunctionsCode, KortistoNpc npc)
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
        /// Builds a preview for the parents of a function
        /// </summary>
        /// <param name="additionalFunction">Function</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Preview of the parents of the function</returns>
        private async Task<string> BuildFunctionParentPreview(ExportDialogFunction additionalFunction, KortistoNpc npc)
        {
            if(additionalFunction.RootNode.Parents == null)
            {
                return string.Empty;
            }

            List<string> previewLines = new List<string>();
            foreach(ExportDialogData curParent in additionalFunction.RootNode.Parents)
            {
                foreach(IExportDialogStepRenderer curRenderer in _stepRenderers)
                {
                    string stepPreview = await curRenderer.BuildParentTextPreview(additionalFunction.RootNode, curParent, npc, _errorCollection);
                    if(stepPreview != null)
                    {
                        previewLines.Add(stepPreview);
                        continue;
                    }
                }
            }
            return string.Join(", ", previewLines);
        }


        /// <summary>
        /// Prepares all step renderes
        /// </summary>
        private void SetupStepRenderes()
        {
            _stepRenderers.Clear();
            _stepRenderers.Add(new ExportDialogTextLineRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject, true));
            _stepRenderers.Add(new ExportDialogTextLineRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject, false));
            _stepRenderers.Add(new ExportDialogChoiceRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _conditionRenderer, _stringLocalizerFactory, _exportSettings, _curProject));
            _stepRenderers.Add(new ExportDialogConditionRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _conditionRenderer, _stringLocalizerFactory, _exportSettings, _curProject));
            _stepRenderers.Add(new ExportDialogActionRenderer(_errorCollection, _defaultTemplateProvider, _cachedDbAccess, _languageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject));
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