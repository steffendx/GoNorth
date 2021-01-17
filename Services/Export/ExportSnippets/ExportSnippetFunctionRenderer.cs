using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
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

namespace GoNorth.Services.Export.ExportSnippets
{
    /// <summary>
    /// Service class to render export snippet functions
    /// </summary>
    public class ExportSnippetFunctionRenderer : NodeGraphBaseRenderer, IExportSnippetFunctionRenderer
    {
        /// <summary>
        /// Node Graph parser
        /// </summary>
        private readonly INodeGraphParser _nodeGraphParser;

        /// <summary>
        /// Node graph function generator
        /// </summary>
        private IExportSnippetNodeGraphFunctionGenerator _nodeGraphFunctionGenerator;

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
        public ExportSnippetFunctionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator,
                                             IConditionRenderer conditionRenderer, ILegacyDailyRoutineEventPlaceholderResolver legacyDailyRoutineEventPlaceholderResolver, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, 
                                             IActionTranslator actionTranslator, INodeGraphParser nodeGraphParser, IExportSnippetNodeGraphFunctionGenerator nodeGraphFunctionGenerator, IStringLocalizerFactory stringLocalizerFactory) :
                                             base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, scribanLanguageKeyGenerator, conditionRenderer, legacyDailyRoutineEventPlaceholderResolver, dailyRoutineFunctionNameGenerator, actionTranslator, stringLocalizerFactory)
        {
            _nodeGraphParser = nodeGraphParser;
            _nodeGraphFunctionGenerator = nodeGraphFunctionGenerator;
        }


        /// <summary>
        /// Renders a list of export snippet functions
        /// </summary>
        /// <param name="exportSnippet">Export snippet to render</param>
        /// <param name="flexFieldObject">Object to which the snippets belong</param>
        /// <returns>List of export snippet functions</returns>
        public async Task<List<ExportSnippetFunction>> RenderExportSnippetFunctions(ObjectExportSnippet exportSnippet, FlexFieldObject flexFieldObject)
        {
            if(exportSnippet == null || exportSnippet.ScriptType == ExportConstants.ScriptType_None)
            {
                return new List<ExportSnippetFunction>();
            }

            if(exportSnippet.ScriptType == ExportConstants.ScriptType_Code)
            {
                return RenderCodeFunction(exportSnippet);
            }
            else if(exportSnippet.ScriptType == ExportConstants.ScriptType_NodeGraph)
            {
                return await RenderExportSnippetNodeGraph(exportSnippet.SnippetName, exportSnippet.ScriptNodeGraph, flexFieldObject);
            }

            return new List<ExportSnippetFunction>();
        }

        /// <summary>
        /// Renders a daily routine event node graph
        /// </summary>
        /// <param name="snippetName">Snippet name</param>
        /// <param name="scriptNodeGraph">Node graph to render</param>
        /// <param name="flexFieldObject">Npc to which the events belong</param>
        /// <returns>Task</returns>
        private async Task<List<ExportSnippetFunction>> RenderExportSnippetNodeGraph(string snippetName, NodeGraphSnippet scriptNodeGraph, FlexFieldObject flexFieldObject)
        {
            _nodeGraphParser.SetErrorCollection(_errorCollection);

            _curProject = await _cachedDbAccess.GetUserProject();
            _exportSettings = await _cachedDbAccess.GetExportSettings(_curProject.Id);

            SetupStepRenderes();

            ExportDialogData exportData = _nodeGraphParser.ParseNodeGraph(scriptNodeGraph);
            if(exportData == null)
            {
                return new List<ExportSnippetFunction>();
            }

            exportData = await _nodeGraphFunctionGenerator.GenerateFunctions(flexFieldObject.ProjectId, flexFieldObject.Id, exportData, _errorCollection);

            ExportDialogFunction rootFunction = new ExportDialogFunction(exportData);
            AddNodesToFunction(rootFunction, exportData);
            List<ExportDialogFunction> additionalFunctions = ExtractAdditionalFunctions(exportData);

            List<ExportSnippetFunction> snippetFunctions = new List<ExportSnippetFunction>();
            ExportSnippetFunction snippetRootFunction = new ExportSnippetFunction();
            snippetRootFunction.FunctionName = snippetName;
            snippetRootFunction.Code = await RenderDialogStepList(rootFunction.FunctionSteps, flexFieldObject);
            snippetRootFunction.ParentPreviewText = "";
            snippetFunctions.Add(snippetRootFunction);

            foreach(ExportDialogFunction curAdditionalFunction in additionalFunctions)
            {
                ExportSnippetFunction additionalFunction = new ExportSnippetFunction();
                additionalFunction.FunctionName = curAdditionalFunction.RootNode.DialogStepFunctionName;
                additionalFunction.ParentPreviewText = await BuildFunctionParentPreview(curAdditionalFunction, flexFieldObject);
                string functionContent = await RenderDialogStepList(curAdditionalFunction.FunctionSteps, flexFieldObject);
                additionalFunction.Code = functionContent;

                snippetFunctions.Add(additionalFunction);
            }

            return snippetFunctions;
        }

        /// <summary>
        /// Renders a code function
        /// </summary>
        /// <param name="exportSnippet">Export snippet to render the code for</param>
        /// <returns>Export snippet function</returns>
        private List<ExportSnippetFunction> RenderCodeFunction(ObjectExportSnippet exportSnippet)
        {
            ExportSnippetFunction function = new ExportSnippetFunction();
            function.FunctionName = exportSnippet.SnippetName;
            function.Code = exportSnippet.ScriptCode;
            function.ParentPreviewText = "";

            return new List<ExportSnippetFunction> { function };
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