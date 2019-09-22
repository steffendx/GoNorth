using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.NodeGraphExport;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Class to render an export snippet node graph
    /// </summary>
    public class ExportSnippetNodeGraphRenderer : NodeGraphBaseRenderer, IExportSnippetNodeGraphRenderer
    {
        /// <summary>
        /// Placeholder for function name
        /// </summary>
        private const string Placeholder_FunctionName = "ExportSnippet_ScriptFunctionName";

        /// <summary>
        /// Placeholder for the parent preview of a placeholder
        /// </summary>
        private const string Placeholder_Function_ParentPreview = "ExportSnippet_Function_ParentPreview";

        /// <summary>
        /// Content of the function
        /// </summary>
        private const string Placeholder_FunctionContent = "ExportSnippet_ScriptContent";


        /// <summary>
        /// Localizer
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
        public ExportSnippetNodeGraphRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, 
                                              IConditionRenderer conditionRenderer, IDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, IStringLocalizerFactory stringLocalizerFactory) 
                                              : base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, conditionRenderer, dailyRoutineEventPlaceholderResolver, stringLocalizerFactory)
        {
            _localizer = stringLocalizerFactory.Create(typeof(ExportSnippetNodeGraphRenderer));
        }

        /// <summary>
        /// Renders a node graph
        /// </summary>
        /// <param name="exportNodeGraph">Node graph snippet to parse</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Result of parsing the node graph</returns>
        public async Task<ExportNodeGraphRenderResult> RenderNodeGraph(ExportDialogData exportNodeGraph, FlexFieldObject flexFieldObject)
        {
            _curProject = await _cachedDbAccess.GetDefaultProject();
            _exportSettings = await _cachedDbAccess.GetExportSettings(_curProject.Id);

            SetupStepRenderes();

            ExportNodeGraphRenderResult renderResult = new ExportNodeGraphRenderResult();
            renderResult.StartStepCode = string.Empty;
            renderResult.AdditionalFunctionsCode = string.Empty;

            // Group to Functions
            ExportDialogFunction rootFunction = new ExportDialogFunction(exportNodeGraph);
            AddNodesToFunction(rootFunction, exportNodeGraph);
            List<ExportDialogFunction> additionalFunctions = ExtractAdditionalFunctions(exportNodeGraph);

            // Render functions
            string startStepCode = await RenderDialogStepList(rootFunction.FunctionSteps, flexFieldObject);
            string additionalFunctionsCode = string.Empty;
            foreach(ExportDialogFunction curAdditionalFunction in additionalFunctions)
            {
                additionalFunctionsCode += await RenderDialogFunction(curAdditionalFunction, flexFieldObject);
            }

            renderResult.StartStepCode = startStepCode;
            renderResult.AdditionalFunctionsCode = additionalFunctionsCode;

            return renderResult;
        }

        /// <summary>
        /// Builds the dialog function code
        /// </summary>
        /// <param name="additionalFunction">Function</param>
        /// <param name="additionalFunctionsCode">Additional Function Code to wrap</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Function Code</returns>
        protected override async Task<string> BuildDialogFunctionCode(ExportDialogFunction additionalFunction, string additionalFunctionsCode, FlexFieldObject flexFieldObject)
        {
            string functionContentCode = (await _defaultTemplateProvider.GetDefaultTemplateByType(_curProject.Id, TemplateType.ObjectExportSnippetFunction)).Code;

            functionContentCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FunctionName).Replace(functionContentCode, additionalFunction.RootNode.DialogStepFunctionName);
            functionContentCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Function_ParentPreview).Replace(functionContentCode, await BuildFunctionParentPreview(additionalFunction, flexFieldObject));
            functionContentCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FunctionContent, ExportConstants.ListIndentPrefix).Replace(functionContentCode, m =>
            {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(additionalFunctionsCode, m.Groups[1].Value));
            });

            return functionContentCode;
        }

        /// <summary>
        /// Prepares all step renderes
        /// </summary>
        protected override void SetupStepRenderes()
        {
            _stepRenderers.Clear();
            _stepRenderers.Add(new ExportDialogConditionRenderer(_errorCollection, _defaultTemplateProvider, _languageKeyGenerator, _conditionRenderer, _stringLocalizerFactory, _exportSettings, _curProject));
            _stepRenderers.Add(new ExportDialogActionRenderer(_errorCollection, _defaultTemplateProvider, _cachedDbAccess, _dailyRoutineEventPlaceholderResolver, _languageKeyGenerator, _stringLocalizerFactory, _exportSettings, _curProject));
        }


        /// <summary>
        /// Returns the export template placeholders
        /// </summary>
        /// <returns>Export Template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholders()
        {
            return new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_FunctionName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Function_ParentPreview, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_FunctionContent, _localizer),
            };
        }
    }
}