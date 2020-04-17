using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Dialog.ActionRendering.Localization;
using GoNorth.Services.Export.Dialog.StepRenderers;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.NodeGraphExport;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.DailyRoutine
{
    /// <summary>
    /// Interface for generating Export Daily Routine Function Names
    /// </summary>
    public class DailyRoutineFunctionRenderer : NodeGraphBaseRenderer, IDailyRoutineFunctionRenderer
    {
        /// <summary>
        /// Node Graph parser
        /// </summary>
        private readonly INodeGraphParser _nodeGraphParser;

        /// <summary>
        /// Node graph function generator
        /// </summary>
        private IDailyRoutineNodeGraphFunctionGenerator _nodeGraphFunctionGenerator;

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
        /// <param name="nodeGraphParser">Node graph parser</param>
        /// <param name="nodeGraphFunctionGenerator">Node graph function generator</param>
        /// <param name="stringLocalizerFactory">String Localizer Factor</param>
        public DailyRoutineFunctionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator,
                                            IConditionRenderer conditionRenderer, ILegacyDailyRoutineEventPlaceholderResolver legacyDailyRoutineEventPlaceholderResolver, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, 
                                            IActionTranslator actionTranslator, INodeGraphParser nodeGraphParser, IDailyRoutineNodeGraphFunctionGenerator nodeGraphFunctionGenerator, IStringLocalizerFactory stringLocalizerFactory) :
                                            base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, scribanLanguageKeyGenerator, conditionRenderer, legacyDailyRoutineEventPlaceholderResolver, dailyRoutineFunctionNameGenerator, actionTranslator, stringLocalizerFactory)
        {
            _nodeGraphParser = nodeGraphParser;
            _nodeGraphFunctionGenerator = nodeGraphFunctionGenerator;
        }

        /// <summary>
        /// Renders a list of daily routine functions
        /// </summary>
        /// <param name="dailyRoutineEvents">Daily routine events</param>
        /// <param name="flexFieldObject">Npc to which the events belong</param>
        /// <returns>List of daily routine functions</returns>
        public async Task<List<DailyRoutineFunction>> RenderDailyRoutineFunctions(List<KortistoNpcDailyRoutineEvent> dailyRoutineEvents, FlexFieldObject flexFieldObject)
        {
            if(dailyRoutineEvents == null || !dailyRoutineEvents.Any())
            {
                return new List<DailyRoutineFunction>();
            }

            _nodeGraphParser.SetErrorCollection(_errorCollection);

            _curProject = await _cachedDbAccess.GetDefaultProject();
            _exportSettings = await _cachedDbAccess.GetExportSettings(_curProject.Id);

            SetupStepRenderes();

            List<DailyRoutineFunction> functions = new List<DailyRoutineFunction>();
            foreach(KortistoNpcDailyRoutineEvent curEvent in dailyRoutineEvents)
            {
                if(curEvent.ScriptType == ExportConstants.ScriptType_None)
                {
                    continue;
                }

                DailyRoutineFunction function = new DailyRoutineFunction();
                functions.Add(function);

                function.FunctionName = await _dailyRoutineFunctionNameGenerator.GetNewDailyRoutineStepFunction(_curProject.Id, flexFieldObject.Id, curEvent.EventId);
                function.ParentPreviewText = "";
                if(curEvent.ScriptType == ExportConstants.ScriptType_Code)
                {
                    function.Code = curEvent.ScriptCode;
                }
                else
                {
                    await RenderDailyRoutineEventNodeGraph(functions, curEvent.ScriptNodeGraph, flexFieldObject, function);
                }
            }

            return functions;
        }

        /// <summary>
        /// Renders a daily routine event node graph
        /// </summary>
        /// <param name="functions">Functions array to fill</param>
        /// <param name="scriptNodeGraph">Node graph to render</param>
        /// <param name="flexFieldObject">Npc to which the events belong</param>
        /// <param name="rootDailyRoutineFunction">Root daily routine function to fill</param>
        /// <returns>Task</returns>
        private async Task RenderDailyRoutineEventNodeGraph(List<DailyRoutineFunction> functions, NodeGraphSnippet scriptNodeGraph, FlexFieldObject flexFieldObject, DailyRoutineFunction rootDailyRoutineFunction)
        {
            _nodeGraphParser.SetErrorCollection(_errorCollection);
            ExportDialogData exportData = _nodeGraphParser.ParseNodeGraph(scriptNodeGraph);
            if(exportData == null)
            {
                return;
            }

            exportData = await _nodeGraphFunctionGenerator.GenerateFunctions(flexFieldObject.ProjectId, flexFieldObject.Id, exportData, _errorCollection);

            ExportDialogFunction rootFunction = new ExportDialogFunction(exportData);
            AddNodesToFunction(rootFunction, exportData);
            List<ExportDialogFunction> additionalFunctions = ExtractAdditionalFunctions(exportData);

            rootDailyRoutineFunction.Code = await RenderDialogStepList(rootFunction.FunctionSteps, flexFieldObject);
            foreach(ExportDialogFunction curAdditionalFunction in additionalFunctions)
            {
                DailyRoutineFunction additionalFunction = new DailyRoutineFunction();
                additionalFunction.FunctionName = curAdditionalFunction.RootNode.DialogStepFunctionName;
                additionalFunction.ParentPreviewText = await BuildFunctionParentPreview(curAdditionalFunction, flexFieldObject);
                string functionContent = await RenderDialogStepList(curAdditionalFunction.FunctionSteps, flexFieldObject);
                additionalFunction.Code = functionContent;

                functions.Add(additionalFunction);
            }
        }

        /// <summary>
        /// Prepares all step renderes
        /// </summary>
        protected override void SetupStepRenderes()
        {
            _stepRenderers.Clear();
            _stepRenderers.Add(new ExportDialogConditionRenderer(_cachedDbAccess, _errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _conditionRenderer, _stringLocalizerFactory, _exportSettings, _curProject));
            _stepRenderers.Add(new ExportDialogActionRenderer(_errorCollection, _defaultTemplateProvider, _cachedDbAccess, _legacyDailyRoutineEventPlaceholderResolver, _dailyRoutineFunctionNameGenerator, _languageKeyGenerator, _scribanLanguageKeyGenerator, _stringLocalizerFactory, _actionTranslator, _exportSettings, _curProject));
        
            SetExportTemplatePlaceholderResolverToStepRenderers();
        }
    }
}