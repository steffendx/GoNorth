using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.StepRenderers.Choice
{
    /// <summary>
    /// Scriban class for Rendering Choices
    /// </summary>
    public class ScribanChoiceRenderer : ScribanBaseStepRenderer, IChoiceRenderer
    {
        /// <summary>
        /// Choice Key
        /// </summary>
        private const string ChoiceKey = "choice";
        
        /// <summary>
        /// Export cached Db access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Condition renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// Current Project
        /// </summary>
        private readonly GoNorthProject _project;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="project">Project</param>
        public ScribanChoiceRenderer(IExportCachedDbAccess exportCachedDbAccess, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                     IConditionRenderer conditionRenderer, IStringLocalizerFactory localizerFactory, GoNorthProject project) : 
                                     base(errorCollection, exportSettings, localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _conditionRenderer = conditionRenderer;
            _project = project;
        }

        /// <summary>
        /// Renders a choice step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="npc">Npc object to which the dialog belongs</param>
        /// <param name="choiceNode">Choice node to render</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, KortistoNpc npc, TaleChoiceNode choiceNode)
        {
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();

            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(template.Code, _errorCollection);
            if (parsedTemplate == null)
            {
                return renderResult;
            }

            _languageKeyGenerator.SetErrorCollection(_errorCollection);

            ScribanChoice choiceData = new ScribanChoice();
            SetRenderObjectBaseDataFromFlexFieldObject(choiceData, data, npc);
            choiceData.Choices = await BuildChoiceOptions(data, choiceNode, npc, choiceData);

            TemplateContext context = BuildTemplateContext(choiceData);

            renderResult.StepCode = await parsedTemplate.RenderAsync(context);

            return renderResult;
        }

        /// <summary>
        /// Builds the export choices
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="choiceNode">Choice node</param>
        /// <param name="npc">Npc object to which the dialog belongs</param>
        /// <param name="parentChoiceData">Choice data to which the choices belong</param>
        /// <returns>List of choice options</returns>
        private async Task<List<ScribanChoiceOption>> BuildChoiceOptions(ExportDialogData data, TaleChoiceNode choiceNode, KortistoNpc npc, ScribanChoice parentChoiceData)
        {
            if(choiceNode.Choices == null)
            {
                return new List<ScribanChoiceOption>();
            }

            List<ScribanChoiceOption> choiceOptions = new List<ScribanChoiceOption>();
            foreach(TaleChoice curChoice in choiceNode.Choices)
            {
                ScribanChoiceOption curChoiceOption = await MapSingleChoice(data, curChoice, npc, parentChoiceData);
                choiceOptions.Add(curChoiceOption);
            }

            return choiceOptions;
        }

        /// <summary>
        /// Maps a single choice
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="choice">Choice to map</param>
        /// <param name="npc">Npc object to which the dialog belongs</param>
        /// <param name="parentChoiceData">Choice data to which the choices belong</param>
        /// <returns>Mapped choice</returns>
        private async ValueTask<ScribanChoiceOption> MapSingleChoice(ExportDialogData data, TaleChoice choice, KortistoNpc npc, ScribanChoice parentChoiceData)
        {
            ExportDialogDataChild choiceData = data.Children.FirstOrDefault(c => c.NodeChildId == choice.Id);
            ScribanDialogStepBaseData childRenderData = null;
            if(choiceData != null && choiceData.Child != null)
            {
                childRenderData = new ScribanDialogStepBaseData();
                SetRenderObjectBaseDataFromFlexFieldObject(childRenderData, choiceData.Child, npc);
            }

            ScribanChoiceOption choiceOption = new ScribanChoiceOption();
            choiceOption.ChildNode = childRenderData;
            choiceOption.Id = choice.Id;
            choiceOption.Text = ExportUtil.EscapeCharacters(choice.Text, _exportSettings.EscapeCharacter, _exportSettings.CharactersNeedingEscaping, _exportSettings.NewlineCharacter);
            choiceOption.UnescapedText = choice.Text;
            choiceOption.TextPreview = ExportUtil.BuildTextPreview(choice.Text);
            choiceOption.IsRepeatable = choice.IsRepeatable;
            choiceOption.Condition = null;
            if(choice.Condition != null && !string.IsNullOrEmpty(choice.Condition.ConditionElements))
            {
                choiceOption.Condition = await _conditionRenderer.RenderCondition(_project, choice.Condition, _errorCollection, npc, _exportSettings);
            }
            choiceOption.ParentChoice = parentChoiceData;

            return choiceOption;
        }

        /// <summary>
        /// Builds the template context for exporting
        /// </summary>
        /// <param name="choiceData">Choice data to export</param>
        /// <returns>Template context</returns>
        private TemplateContext BuildTemplateContext(ScribanChoice choiceData)
        {
            ScriptObject exportObject = new ScriptObject();
            exportObject.Add(ChoiceKey, choiceData);
            exportObject.Add(ExportConstants.ScribanLanguageKeyName, _languageKeyGenerator);
            TemplateContext context = new TemplateContext();
            context.TemplateLoader = new ScribanIncludeTemplateLoader(_exportCachedDbAccess, _errorCollection);
            context.PushGlobal(exportObject);
            return context;
        }

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = _languageKeyGenerator.GetExportTemplatePlaceholders(string.Format("{0}.{1}", ExportConstants.ScribanChoiceOptionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanChoiceOption.Text))));
            
            placeholders.AddRange(GetNodePlaceholders<ScribanChoice>(ChoiceKey));

            return placeholders;
        }
    }
}