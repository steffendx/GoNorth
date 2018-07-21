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
    /// Class for Rendering Choices
    /// </summary>
    public class ExportDialogChoiceRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
    {
        /// <summary>
        /// Start of the choices
        /// </summary>
        private const string Placeholder_ChoicesStart = "Tale_Choices_Start";

        /// <summary>
        /// End of the choices
        /// </summary>
        private const string Placeholder_ChoicesEnd = "Tale_Choices_End";

        /// <summary>
        /// Placeholder for the id of the choice
        /// </summary>
        private const string Placeholder_Choice_Id = "Tale_Choice_Id";

        /// <summary>
        /// Placeholder for the index of the choice
        /// </summary>
        private const string Placeholder_Choice_Index = "Tale_Choice_Index";

        /// <summary>
        /// Start of content that is only rendered if the choice has a condition
        /// </summary>
        private const string Placeholder_HasConditionStart = "Tale_Choice_HasCondition_Start";

        /// <summary>
        /// End of content that is only rendered if the choice has a condition
        /// </summary>
        private const string Placeholder_HasConditionEnd = "Tale_Choice_HasCondition_End";

        /// <summary>
        /// Condition for a choice
        /// </summary>
        private const string Placeholder_Condition = "Tale_Choice_Condition";

        /// <summary>
        /// Placeholder for Choice Text
        /// </summary>
        private const string Placeholder_Choice_Text = "Tale_Choice_Text";

        /// <summary>
        /// Placeholder for Choice Text LangKey
        /// </summary>
        private const string Placeholder_Choice_Text_LangKey = "Tale_Choice_Text_LangKey";

        /// <summary>
        /// Placeholder for Choice Text Preview
        /// </summary>
        private const string Placeholder_Choice_Text_Preview = "Tale_Choice_Text_Preview";

        /// <summary>
        /// Placeholder for the start of the content that is rendered if a choice is repeatable
        /// </summary>
        private const string Placeholder_Choice_IsRepeatable_Start = "Tale_Choice_IsRepeatable_Start";

        /// <summary>
        /// Placeholder for the end of the content that is rendered if a choice is repeatable
        /// </summary>
        private const string Placeholder_Choice_IsRepeatable_End = "Tale_Choice_IsRepeatable_End";

        /// <summary>
        /// Placeholder for the start of the content that is rendered if a choice is not repeatable
        /// </summary>
        private const string Placeholder_Choice_IsNotRepeatable_Start = "Tale_Choice_IsNotRepeatable_Start";

        /// <summary>
        /// Placeholder for the end of the content that is rendered if a choice is not repeatable
        /// </summary>
        private const string Placeholder_Choice_IsNotRepeatable_End = "Tale_Choice_IsNotRepeatable_End";


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
        public ExportDialogChoiceRenderer(ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, ILanguageKeyGenerator languageKeyGenerator, 
                                          IConditionRenderer conditionRenderer, IStringLocalizerFactory localizerFactory, ExportSettings exportSettings, GoNorthProject project) : 
                                          base(errorCollection, localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _languageKeyGenerator = languageKeyGenerator;
            _conditionRenderer = conditionRenderer;
            _localizer = localizerFactory.Create(typeof(ExportDialogChoiceRenderer));
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
            TaleChoiceNode choiceNode = data.Choice;
            if(choiceNode == null)
            {
                return null;
            }
            
            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, TemplateType.TaleChoice);
            
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();
            renderResult.StepCode = ReplaceNodeId(template.Code, data);
            renderResult.StepCode = ExportUtil.BuildRangePlaceholderRegex(Placeholder_ChoicesStart, Placeholder_ChoicesEnd).Replace(renderResult.StepCode, m => {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(BuildChoices(m.Groups[1].Value, data, choiceNode, npc), m.Groups[2].Value));
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
        public Task<string> BuildParentTextPreview(ExportDialogData child, ExportDialogData parent, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            TaleChoiceNode choiceNode = parent.Choice;
            if(choiceNode == null)
            {
                return Task.FromResult<string>(null);
            }

            List<string> previewForChoices = new List<string>();
            foreach(TaleChoice curChoice in choiceNode.Choices)
            {
                ExportDialogDataChild childObj = parent.Children.FirstOrDefault(c => c.NodeChildId == curChoice.Id);
                if(childObj == null || childObj.Child != child)
                {
                    continue;
                }
                previewForChoices.Add(ExportUtil.BuildTextPreview(curChoice.Text));
            }
            return Task.FromResult(string.Join(", ", previewForChoices));
        }

        /// <summary>
        /// Builds the list of choices
        /// </summary>
        /// <param name="choiceTemplate">Choice Template</param>
        /// <param name="data">Export dialog data</param>
        /// <param name="choiceNode">Choice node</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Choices as string</returns>
        private string BuildChoices(string choiceTemplate, ExportDialogData data, TaleChoiceNode choiceNode, KortistoNpc npc)
        {
            if(choiceNode.Choices == null)
            {
                return string.Empty;
            }

            string choicesResult = string.Empty;
            for(int curChoice = 0; curChoice < choiceNode.Choices.Count; ++curChoice)
            {
                choicesResult += BuildSingleChoice(choiceTemplate, data, choiceNode.Choices[curChoice], choiceNode, npc, curChoice);
            }

            return choicesResult;
        }

        /// <summary>
        /// Builds a choice
        /// </summary>
        /// <param name="choiceTemplate">Choice Template</param>
        /// <param name="data">Export dialog data</param>
        /// <param name="choiceObj">Choice element</param>
        /// <param name="choiceNode">Choice node</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="choiceIndex">Index of the choice</param>
        /// <returns>Choices as string</returns>
        private string BuildSingleChoice(string choiceTemplate, ExportDialogData data, TaleChoice choiceObj, TaleChoiceNode choiceNode, KortistoNpc npc, int choiceIndex)
        {
            ExportDialogDataChild choice = data.Children.FirstOrDefault(c => c.NodeChildId == choiceObj.Id);
            string choiceContent = ReplaceBaseStepPlaceholders(choiceTemplate, data, choice != null ? choice.Child : null);
            choiceContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Choice_Id).Replace(choiceContent, choiceObj.Id.ToString());
            choiceContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Choice_Index).Replace(choiceContent, choiceIndex.ToString());
            choiceContent = ExportUtil.RenderPlaceholderIfTrue(choiceContent, Placeholder_HasConditionStart, Placeholder_HasConditionEnd, choiceObj.Condition != null && !string.IsNullOrEmpty(choiceObj.Condition.ConditionElements));
            choiceContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Condition).Replace(choiceContent, m => {
                return BuildCondition(choiceObj.Condition, npc);
            });
            choiceContent = ExportUtil.RenderPlaceholderIfTrue(choiceContent, Placeholder_Choice_IsRepeatable_Start, Placeholder_Choice_IsRepeatable_End, choiceObj.IsRepeatable);
            choiceContent = ExportUtil.RenderPlaceholderIfTrue(choiceContent, Placeholder_Choice_IsNotRepeatable_Start, Placeholder_Choice_IsNotRepeatable_End, !choiceObj.IsRepeatable);
            choiceContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Choice_Text).Replace(choiceContent, ExportUtil.EscapeCharacters(choiceObj.Text, _exportSettings.EscapeCharacter, _exportSettings.CharactersNeedingEscaping, _exportSettings.NewlineCharacter));
            choiceContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Choice_Text_Preview).Replace(choiceContent, ExportUtil.BuildTextPreview(choiceObj.Text));
            choiceContent = ExportUtil.BuildPlaceholderRegex(Placeholder_Choice_Text_LangKey).Replace(choiceContent, m => {
                return _languageKeyGenerator.GetDialogTextLineKey(npc.Id, npc.Name, "choice", choiceNode.Id + "_" + choiceObj.Id, choiceObj.Text).Result;
            });

            return choiceContent;
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
        /// Returns if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleChoice;
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
                ExportUtil.CreatePlaceHolder(Placeholder_ChoicesStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ChoicesEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_Id, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_Index, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasConditionStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasConditionEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Condition, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_Text, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_Text_LangKey, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_Text_Preview, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_IsRepeatable_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_IsRepeatable_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_IsNotRepeatable_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Choice_IsNotRepeatable_End, _localizer),
            });

            return placeholders;
        }
    }
}