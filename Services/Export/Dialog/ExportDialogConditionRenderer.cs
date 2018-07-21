using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for Rendering Conditions
    /// </summary>
    public class ExportDialogConditionRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
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
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Export Settings
        /// </summary>
        private ExportSettings _exportSettings;

        /// <summary>
        /// Current Project
        /// </summary>
        private GoNorthProject _project;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="project">Project</param>
        public ExportDialogConditionRenderer(ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, ILanguageKeyGenerator languageKeyGenerator, 
                                             IConditionRenderer conditionRenderer, IStringLocalizerFactory localizerFactory, ExportSettings exportSettings, GoNorthProject project) : 
                                             base(errorCollection, localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _languageKeyGenerator = languageKeyGenerator;
            _conditionRenderer = conditionRenderer;
            _localizer = localizerFactory.Create(typeof(ExportDialogConditionRenderer));
            _exportSettings = exportSettings;
            _project = project;
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportDialogData data, KortistoNpc npc)
        {
            ConditionNode conditionNode = data.Condition;
            if(conditionNode == null)
            {
                return null;
            }
            
            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, TemplateType.TaleCondition);
            
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();
            renderResult.StepCode = ReplaceNodeId(template.Code, data);
            renderResult.StepCode = ExportUtil.BuildRangePlaceholderRegex(Placeholder_ConditionsStart, Placeholder_ConditionsEnd).Replace(renderResult.StepCode, m => {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(BuildConditions(m.Groups[1].Value, data, conditionNode, npc, false), m.Groups[2].Value));
            });
            renderResult.StepCode = ExportUtil.BuildRangePlaceholderRegex(Placeholder_AllConditionsStart, Placeholder_AllConditionsEnd).Replace(renderResult.StepCode, m => {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(BuildConditions(m.Groups[1].Value, data, conditionNode, npc, true), m.Groups[2].Value));
            });
            renderResult.StepCode = ExportUtil.BuildRangePlaceholderRegex(Placeholder_ElseStart, Placeholder_ElseEnd).Replace(renderResult.StepCode, m => {
                return ExportUtil.IndentListTemplate(BuildElsePart(m.Groups[1].Value, data), m.Groups[2].Value);
            });

            return renderResult;
        }
    
        /// <summary>
        /// Builds a parent text preview for the a dialog step
        /// </summary>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Parent text preview for the dialog step</returns>
        public async Task<string> BuildParentTextPreview(ExportDialogData child, ExportDialogData parent, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            ConditionNode conditionNode = parent.Condition;
            if(conditionNode == null)
            {
                return null;
            }

            List<string> previewForConditions = new List<string>();
            foreach(Condition curCondition in conditionNode.Conditions)
            {
                ExportDialogDataChild childObj = parent.Children.FirstOrDefault(c => c.NodeChildId == curCondition.Id);
                if(childObj == null || childObj.Child != child)
                {
                    continue;
                }
                
                string conditionText = await _conditionRenderer.RenderCondition(_project, curCondition, _errorCollection, npc, _exportSettings);
                previewForConditions.Add(ExportUtil.BuildTextPreview(conditionText));
            }

            if(parent.Children.Any(c => c.Child == child && c.NodeChildId == ExportConstants.ConditionElseNodeChildId))
            {
                previewForConditions.Add("else");
            }

            return string.Join(", ", previewForConditions);
        }

        /// <summary>
        /// Builds the list of conditions
        /// </summary>
        /// <param name="conditionTemplate">Condition Template</param>
        /// <param name="data">Export dialog data</param>
        /// <param name="conditionNode">Condition node</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="includeConditionsWithoutChild">true if conditions without a child should be included, else false</param>
        /// <returns>Conditions as string</returns>
        private string BuildConditions(string conditionTemplate, ExportDialogData data, ConditionNode conditionNode, KortistoNpc npc, bool includeConditionsWithoutChild)
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
                
                conditionsResult += BuildSingleCondition(conditionTemplate, data, curCondition, conditionNode, conditionChild, npc, conditionIndex);
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
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="conditionIndex">Index of the condition</param>
        /// <returns>Conditions as string</returns>
        private string BuildSingleCondition(string conditionTemplate, ExportDialogData data, Condition conditionObj, ConditionNode conditionNode, ExportDialogDataChild condition, KortistoNpc npc, int conditionIndex)
        {
            string conditionContent = ReplaceBaseStepPlaceholders(conditionTemplate, data, condition != null ? condition.Child : null);
            conditionContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Condition_Id).Replace(conditionContent, conditionObj.Id.ToString());
            conditionContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Condition_Index).Replace(conditionContent, conditionIndex.ToString());
            conditionContent = ExportUtil.RenderPlaceholderIfTrue(conditionContent, Placeholder_Condition_IsFirst_Start, Placeholder_Condition_IsFirst_End, conditionIndex == 0);
            conditionContent = ExportUtil.RenderPlaceholderIfTrue(conditionContent, Placeholder_Condition_IsNotFirst_Start, Placeholder_Condition_IsNotFirst_End, conditionIndex != 0);
            conditionContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Condition).Replace(conditionContent, m => {
                return BuildCondition(conditionObj, npc);
            });

            return conditionContent;
        }

        /// <summary>
        /// Builds a condition string
        /// </summary>
        /// <param name="condition">Condition</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Condition string</returns>
        private string BuildCondition(Condition condition, KortistoNpc npc)
        {
            if(condition == null || string.IsNullOrEmpty(condition.ConditionElements))
            {
                _errorCollection.AddDialogConditionMissing();
                return string.Empty;
            }

            return _conditionRenderer.RenderCondition(_project, condition, _errorCollection, npc, _exportSettings).Result;
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
        /// Returns if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleCondition;
        }

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType)
        {
            if(!HasPlaceholdersForTemplateType(templateType))
            {
                return new List<ExportTemplatePlaceholder>();
            }

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