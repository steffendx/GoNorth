using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.Localization;
using GoNorth.Services.Export.Dialog.StepRenderers;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.NodeGraphExport;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for Rendering an Export Dialog
    /// </summary>
    public class ExportDialogRenderer : NodeGraphBaseRenderer, IExportDialogRenderer
    {
        /// <summary>
        /// Name of the initial function
        /// </summary>
        private const string InitialFunctionName = "DialogStart";

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
        /// <param name="scribanLanguageKeyGenerator">Scriban language key generator</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="legacyDailyRoutineEventPlaceholderResolver">Legacy Daily routine event placeholder resolver</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="actionTranslator">Action translator</param>
        /// <param name="stringLocalizerFactory">String Localizer Factor</param>
        public ExportDialogRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, 
                                    IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IConditionRenderer conditionRenderer, ILegacyDailyRoutineEventPlaceholderResolver legacyDailyRoutineEventPlaceholderResolver, 
                                    IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, IActionTranslator actionTranslator, IStringLocalizerFactory stringLocalizerFactory) :
                                    base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, scribanLanguageKeyGenerator, conditionRenderer, legacyDailyRoutineEventPlaceholderResolver, dailyRoutineFunctionNameGenerator, actionTranslator, stringLocalizerFactory)
        {
            _localizer = stringLocalizerFactory.Create(typeof(ExportDialogRenderer));
        }

        /// <summary>
        /// Renders the dialog steps
        /// </summary>
        /// <param name="exportDialog">Dialog to render</param>
        /// <param name="npc">Npc</param>
        /// <returns>Function code</returns>
        public async Task<List<ExportDialogFunctionCode>> RenderDialogSteps(ExportDialogData exportDialog, KortistoNpc npc)
        {
            _curProject = await _cachedDbAccess.GetDefaultProject();
            _exportSettings = await _cachedDbAccess.GetExportSettings(_curProject.Id);

            SetupStepRenderes();
            
            // Group to Functions
            ExportDialogFunction rootFunction = new ExportDialogFunction(exportDialog);
            AddNodesToFunction(rootFunction, exportDialog);
            List<ExportDialogFunction> additionalFunctions = ExtractAdditionalFunctions(exportDialog);

            // Render functions
            List<ExportDialogFunctionCode> functionCodes = new List<ExportDialogFunctionCode>();
            string startStepCode = await RenderDialogStepList(rootFunction.FunctionSteps, npc);
            functionCodes.Add(new ExportDialogFunctionCode(InitialFunctionName, startStepCode, string.Empty));

            foreach(ExportDialogFunction curAdditionalFunction in additionalFunctions)
            {
                string functionCode =  await RenderDialogStepList(curAdditionalFunction.FunctionSteps, npc);
                functionCodes.Add(new ExportDialogFunctionCode(curAdditionalFunction.RootNode.DialogStepFunctionName, functionCode, await BuildFunctionParentPreview(curAdditionalFunction, npc)));
            }

            return functionCodes;
        }

        /// <summary>
        /// Prepares all step renderes
        /// </summary>
        protected override void SetupStepRenderes()
        {
            _stepRenderers.Clear();
            _stepRenderers.Add(new ExportDialogTextLineRenderer(_cachedDbAccess, _errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _scribanLanguageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject, true));
            _stepRenderers.Add(new ExportDialogTextLineRenderer(_cachedDbAccess, _errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _scribanLanguageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject, false));
            _stepRenderers.Add(new ExportDialogChoiceRenderer(_cachedDbAccess, _errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _scribanLanguageKeyGenerator, _conditionRenderer, _stringLocalizerFactory, _exportSettings, _curProject));
            _stepRenderers.Add(new ExportDialogConditionRenderer(_cachedDbAccess, _errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _conditionRenderer, _stringLocalizerFactory, _exportSettings, _curProject));
            _stepRenderers.Add(new ExportDialogActionRenderer(_errorCollection, _defaultTemplateProvider, _cachedDbAccess, _legacyDailyRoutineEventPlaceholderResolver, _dailyRoutineFunctionNameGenerator, _languageKeyGenerator, _scribanLanguageKeyGenerator, _stringLocalizerFactory, _actionTranslator, _exportSettings, _curProject));

            SetExportTemplatePlaceholderResolverToStepRenderers();
        }

        /// <summary>
        /// Returns true if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            if(templateType == TemplateType.TaleDialogFunction)
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
        /// <param name="renderingEngine">Rendering engine</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine)
        {
            // Since project and export settings are not required for resolving placeholders the renderes are setup without loading the data
            _curProject = _cachedDbAccess.GetDefaultProject().Result;
            SetupStepRenderes();

            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();

            foreach(IExportDialogStepRenderer curRenderer in _stepRenderers)
            {
                placeholders.AddRange(curRenderer.GetPlaceholdersForTemplate(templateType, renderingEngine));
            }

            placeholders.AddRange(_conditionRenderer.GetExportTemplatePlaceholdersForType(templateType, renderingEngine));

            return placeholders;
        }
    }
}