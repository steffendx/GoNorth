using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Extensions;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ConditionStep
{
    /// <summary>
    /// Legacy class for Rendering Condition steps
    /// </summary>
    public class LegacyConditionStepRenderer : LegacyBaseStepRenderer, IConditionStepRenderer
    {
        /// <summary>
        /// Start of the conditions
        /// </summary>
        private const string Placeholder_ConditionsStart = "Tale_Conditions_Start";

        /// <summary>
        /// End of the conditions
        /// </summary>
        private const string Placeholder_ConditionsEnd = "Tale_Conditions_End";

        /// <summary>
        /// Start of the conditions, including the ones without a child
        /// </summary>
        private const string Placeholder_AllConditionsStart = "Tale_AllConditions_Start";

        /// <summary>
        /// End of the conditions, including the ones without a child
        /// </summary>
        private const string Placeholder_AllConditionsEnd = "Tale_AllConditions_End";

        /// <summary>
        /// Start of the content for the else part
        /// </summary>
        private const string Placeholder_ElseStart = "Tale_Conditions_Else_Start";

        /// <summary>
        /// End of the content for the else part
        /// </summary>
        private const string Placeholder_ElseEnd = "Tale_Conditions_Else_End";

        /// <summary>
        /// Placeholder for the id of the condition
        /// </summary>
        private const string Placeholder_Condition_Id = "Tale_Condition_Id";

        /// <summary>
        /// Placeholder for the index of the condition
        /// </summary>
        private const string Placeholder_Condition_Index = "Tale_Condition_Index";

        /// <summary>
        /// Start of content that is only rendered if the condition is the first one
        /// </summary>
        private const string Placeholder_Condition_IsFirst_Start = "Tale_Condition_IsFirst_Start";

        /// <summary>
        /// End of content that is only rendered if the condition is the first one
        /// </summary>
        private const string Placeholder_Condition_IsFirst_End = "Tale_Condition_IsFirst_End";

        /// <summary>
        /// Start of content that is only rendered if the condition is not the first one
        /// </summary>
        private const string Placeholder_Condition_IsNotFirst_Start = "Tale_Condition_IsNotFirst_Start";

        /// <summary>
        /// End of content that is only rendered if the condition is not the first one
        /// </summary>
        private const string Placeholder_Condition_IsNotFirst_End = "Tale_Condition_IsNotFirst_End";

        /// <summary>
        /// Condition for the condition
        /// </summary>
        private const string Placeholder_Condition = "Tale_Condition";
        
        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Export Settings
        /// </summary>
        private ExportSettings _exportSettings;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// Current Project
        /// </summary>
        private readonly GoNorthProject _project;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="project">Project</param>
        public LegacyConditionStepRenderer(ILanguageKeyGenerator languageKeyGenerator, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection, IConditionRenderer conditionRenderer, IStringLocalizerFactory localizerFactory, GoNorthProject project) :
                                           base(errorCollection, localizerFactory)
        {
            _languageKeyGenerator = languageKeyGenerator;
            _exportSettings = exportSettings;
            _conditionRenderer = conditionRenderer;
            _localizer = localizerFactory.Create(typeof(LegacyConditionStepRenderer));
            _project = project;
        }

        /// <summary>
        /// Renders a condition step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="conditionNode">Condition node to render</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, FlexFieldObject flexFieldObject, ConditionNode conditionNode)
        {
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();
            renderResult.StepCode = ReplaceNodeId(template.Code, data);
            renderResult.StepCode = await ExportUtil.BuildRangePlaceholderRegex(Placeholder_ConditionsStart, Placeholder_ConditionsEnd).ReplaceAsync(renderResult.StepCode, async m => {
                string conditionData = await BuildConditions(m.Groups[1].Value, data, conditionNode, flexFieldObject, false);
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(conditionData, m.Groups[2].Value));
            });
            renderResult.StepCode = await ExportUtil.BuildRangePlaceholderRegex(Placeholder_AllConditionsStart, Placeholder_AllConditionsEnd).ReplaceAsync(renderResult.StepCode, async m => {
                string conditionData = await BuildConditions(m.Groups[1].Value, data, conditionNode, flexFieldObject, true);
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(conditionData, m.Groups[2].Value));
            });
            renderResult.StepCode = ExportUtil.BuildRangePlaceholderRegex(Placeholder_ElseStart, Placeholder_ElseEnd).Replace(renderResult.StepCode, m => {
                return ExportUtil.IndentListTemplate(BuildElsePart(m.Groups[1].Value, data), m.Groups[2].Value);
            });

            return renderResult;
        }

        /// <summary>
        /// Builds the list of conditions
        /// </summary>
        /// <param name="conditionTemplate">Condition Template</param>
        /// <param name="data">Export dialog data</param>
        /// <param name="conditionNode">Condition node</param>
        /// <param name="flexFieldObject">Flex field to which the dialog belongs</param>
        /// <param name="includeConditionsWithoutChild">true if conditions without a child should be included, else false</param>
        /// <returns>Conditions as string</returns>
        private async Task<string> BuildConditions(string conditionTemplate, ExportDialogData data, ConditionNode conditionNode, FlexFieldObject flexFieldObject, bool includeConditionsWithoutChild)
        {
            if(conditionNode.Conditions == null)
            {
                return string.Empty;
            }

            int conditionIndex = 0;
            string conditionsResult = string.Empty;
            foreach(Condition curCondition in conditionNode.Conditions)
            {
                ExportDialogDataChild conditionChild = data.Children.FirstOrDefault(c => c.NodeChildId == curCondition.Id);
                if(conditionChild == null && !includeConditionsWithoutChild)
                {
                    continue;
                }
                
                conditionsResult += await BuildSingleCondition(conditionTemplate, data, curCondition, conditionNode, conditionChild, flexFieldObject, conditionIndex);
                ++conditionIndex;
            }

            return conditionsResult;
        }

        /// <summary>
        /// Builds a condition
        /// </summary>
        /// <param name="conditionTemplate">Condition Template</param>
        /// <param name="data">Export dialog data</param>
        /// <param name="conditionObj">Condition object</param>
        /// <param name="conditionNode">Condition node</param>
        /// <param name="condition">Export dialog data for the condition</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="conditionIndex">Index of the condition</param>
        /// <returns>Conditions as string</returns>
        private async Task<string> BuildSingleCondition(string conditionTemplate, ExportDialogData data, Condition conditionObj, ConditionNode conditionNode, ExportDialogDataChild condition, FlexFieldObject flexFieldObject, int conditionIndex)
        {
            string conditionContent = ReplaceBaseStepPlaceholders(conditionTemplate, data, condition != null ? condition.Child : null);
            conditionContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Condition_Id).Replace(conditionContent, conditionObj.Id.ToString());
            conditionContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Condition_Index).Replace(conditionContent, conditionIndex.ToString());
            conditionContent = ExportUtil.RenderPlaceholderIfTrue(conditionContent, Placeholder_Condition_IsFirst_Start, Placeholder_Condition_IsFirst_End, conditionIndex == 0);
            conditionContent = ExportUtil.RenderPlaceholderIfTrue(conditionContent, Placeholder_Condition_IsNotFirst_Start, Placeholder_Condition_IsNotFirst_End, conditionIndex != 0);
            conditionContent = await ExportUtil.BuildPlaceholderRegex(Placeholder_Condition).ReplaceAsync(conditionContent, async m => {
                return await BuildCondition(conditionObj, flexFieldObject);
            });

            return conditionContent;
        }

        /// <summary>
        /// Builds a condition string
        /// </summary>
        /// <param name="condition">Condition</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Condition string</returns>
        private async Task<string> BuildCondition(Condition condition, FlexFieldObject flexFieldObject)
        {
            if(condition == null || string.IsNullOrEmpty(condition.ConditionElements))
            {
                _errorCollection.AddDialogConditionMissing();
                return string.Empty;
            }

            return await _conditionRenderer.RenderCondition(_project, condition, _errorCollection, flexFieldObject, _exportSettings);
        }

        /// <summary>
        /// Builds the else part
        /// </summary>
        /// <param name="elseTemplate">Else template</param>
        /// <param name="data">Dialog data</param>
        /// <returns>Else part</returns>
        private string BuildElsePart(string elseTemplate, ExportDialogData data) 
        {
            ExportDialogDataChild elseChild = data.Children.FirstOrDefault(c => c.NodeChildId == ExportConstants.ConditionElseNodeChildId);
            if(elseChild == null)
            {
                return string.Empty;
            }

            return ReplaceBaseStepPlaceholders(elseTemplate, data, elseChild.Child);
        }

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = GetBasePlaceholdersForTemplate();
            placeholders.AddRange(new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_ConditionsStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ConditionsEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_AllConditionsStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_AllConditionsEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ElseStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ElseEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Condition_Id, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Condition_Index, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Condition_IsFirst_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Condition_IsFirst_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Condition_IsNotFirst_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Condition_IsNotFirst_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Condition, _localizer),
            });

            return placeholders;
        }
    }
}