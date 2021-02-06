using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.StateMachines;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Dialog.ActionRendering.Localization;
using GoNorth.Services.Export.Dialog.StepRenderers;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.NodeGraphExport;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.StateMachines
{
    /// <summary>
    /// Class for rendering Export state machiens
    /// </summary>
    public class StateMachineFunctionRenderer : NodeGraphBaseRenderer, IStateMachineFunctionRenderer
    {
        /// <summary>
        /// Node Graph parser
        /// </summary>
        private readonly INodeGraphParser _nodeGraphParser;

        /// <summary>
        /// Node graph function generator
        /// </summary>
        private readonly IStateMachineNodeGraphFunctionGenerator _nodeGraphFunctionGenerator;

        /// <summary>
        /// State Machine Function Name Generator
        /// </summary>
        private readonly IStateMachineFunctionNameGenerator _stateMachineFunctionNameGenerator;

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
        /// <param name="stateMachineFunctionNameGenerator">State Machine function name generator</param>
        /// <param name="stringLocalizerFactory">String Localizer Factor</param>
        public StateMachineFunctionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator,
                                            IConditionRenderer conditionRenderer, ILegacyDailyRoutineEventPlaceholderResolver legacyDailyRoutineEventPlaceholderResolver, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, 
                                            IActionTranslator actionTranslator, INodeGraphParser nodeGraphParser, IStateMachineNodeGraphFunctionGenerator nodeGraphFunctionGenerator, IStateMachineFunctionNameGenerator stateMachineFunctionNameGenerator, 
                                            IStringLocalizerFactory stringLocalizerFactory) :
                                            base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, scribanLanguageKeyGenerator, conditionRenderer, legacyDailyRoutineEventPlaceholderResolver, dailyRoutineFunctionNameGenerator, actionTranslator, stringLocalizerFactory)
        {
            _nodeGraphParser = nodeGraphParser;
            _nodeGraphFunctionGenerator = nodeGraphFunctionGenerator;
            _stateMachineFunctionNameGenerator = stateMachineFunctionNameGenerator;
        }

        /// <summary>
        /// Renders a list of state functions
        /// </summary>
        /// <param name="state">State to render</param>
        /// <param name="flexFieldObject">Npc to which the events belong</param>
        /// <returns>List of state functions</returns>
        public async Task<List<StateFunction>> RenderStateFunctions(StateMachineState state, FlexFieldObject flexFieldObject)
        {
            if(state == null)
            {
                return new List<StateFunction>();
            }

            _nodeGraphParser.SetErrorCollection(_errorCollection);

            _curProject = await _cachedDbAccess.GetUserProject();
            _exportSettings = await _cachedDbAccess.GetExportSettings(_curProject.Id);

            SetupStepRenderes();

            List<StateFunction> functions = new List<StateFunction>();
            if(state.ScriptType == ExportConstants.ScriptType_None)
            {
                return functions;
            }

            StateFunction function = new StateFunction();
            functions.Add(function);

            function.FunctionName = await _stateMachineFunctionNameGenerator.GetNewStateMachineStepFunction(_curProject.Id, flexFieldObject.Id, state.Id);
            function.ParentPreviewText = "";
            if(state.ScriptType == ExportConstants.ScriptType_Code)
            {
                function.Code = state.ScriptCode;
            }
            else
            {
                await RenderStateMachineEventNodeGraph(functions, state.ScriptNodeGraph, flexFieldObject, function);
            }

            return functions;
        }

        /// <summary>
        /// Renders a state machine event node graph
        /// </summary>
        /// <param name="functions">Functions array to fill</param>
        /// <param name="scriptNodeGraph">Node graph to render</param>
        /// <param name="flexFieldObject">Npc to which the events belong</param>
        /// <param name="rootStateMachineFunction">Root state machine function to fill</param>
        /// <returns>Task</returns>
        private async Task RenderStateMachineEventNodeGraph(List<StateFunction> functions, NodeGraphSnippet scriptNodeGraph, FlexFieldObject flexFieldObject, StateFunction rootStateMachineFunction)
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

            rootStateMachineFunction.Code = await RenderDialogStepList(rootFunction.FunctionSteps, flexFieldObject);
            foreach(ExportDialogFunction curAdditionalFunction in additionalFunctions)
            {
                StateFunction additionalFunction = new StateFunction();
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
            _stepRenderers.Add(new ExportReferenceRenderer(_cachedDbAccess, _errorCollection, _defaultTemplateProvider, _dailyRoutineFunctionNameGenerator, _scribanLanguageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject));
        
            SetExportTemplatePlaceholderResolverToStepRenderers();
        }
    }
}