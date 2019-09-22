using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for Rendering Text Lines
    /// </summary>
    public class ExportDialogTextLineRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
    {
        /// <summary>
        /// Placeholder for Text Lines
        /// </summary>
        private const string Placeholder_TextLine = "Tale_TextLine";

        /// <summary>
        /// Placeholder for Text Lines LangKey
        /// </summary>
        private const string Placeholder_TextLine_LangKey = "Tale_TextLine_LangKey";

        /// <summary>
        /// Placeholder for Text Lines Preview
        /// </summary>
        private const string Placeholder_TextLine_Preview = "Tale_TextLine_Preview";


        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

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
        /// true if its a player Line, else false
        /// </summary>
        private bool _isPlayerLine;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="project">Project</param>
        /// <param name="isPlayerLine">true if its a player line, else false</param>
        public ExportDialogTextLineRenderer(ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, ILanguageKeyGenerator languageKeyGenerator, 
                                            IStringLocalizerFactory localizerFactory, ExportSettings exportSettings, GoNorthProject project, bool isPlayerLine) : 
                                            base(errorCollection, localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _languageKeyGenerator = languageKeyGenerator;
            _localizer = localizerFactory.Create(typeof(ExportDialogTextLineRenderer));
            _exportSettings = exportSettings;
            _project = project;
            _isPlayerLine = isPlayerLine;
        }

        /// <summary>
        /// Returns the valid text node
        /// </summary>
        /// <param name="data">Dialog step data</param>
        /// <returns>Valid text node</returns>
        private TextNode GetValidTextNode(ExportDialogData data)
        {
            TextNode textNode = data.PlayerText;
            if(!_isPlayerLine)
            {
                textNode = data.NpcText;
            }

            return textNode;
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportDialogData data, FlexFieldObject flexFieldObject)
        {
            KortistoNpc npc = flexFieldObject as KortistoNpc;
            if(npc == null)
            {
                return null;
            }

            TextNode textNode = GetValidTextNode(data);
            if(textNode == null)
            {
                return null;
            }
            
            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, _isPlayerLine ? TemplateType.TalePlayerTextLine : TemplateType.TaleNpcTextLine);
            
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();
            renderResult.StepCode = ReplaceBaseStepPlaceholders(template.Code, data, data.Children.FirstOrDefault() != null ? data.Children.FirstOrDefault().Child : null);
            renderResult.StepCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TextLine).Replace(renderResult.StepCode, ExportUtil.EscapeCharacters(textNode.Text, _exportSettings.EscapeCharacter, _exportSettings.CharactersNeedingEscaping, _exportSettings.NewlineCharacter));
            renderResult.StepCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TextLine_Preview).Replace(renderResult.StepCode, ExportUtil.BuildTextPreview(textNode.Text));
            renderResult.StepCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TextLine_LangKey).Replace(renderResult.StepCode, m => {
                return _languageKeyGenerator.GetDialogTextLineKey(npc.Id, npc.Name, _isPlayerLine ? ExportConstants.LanguageKeyTypePlayer : ExportConstants.LanguageKeyTypeNpc, textNode.Id, textNode.Text).Result;
            });

            return renderResult;
        }

        /// <summary>
        /// Builds a parent text preview for the a dialog step
        /// </summary>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <param name="flexFieldObject">Flex field to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Parent text preview for the dialog step</returns>
        public Task<string> BuildParentTextPreview(ExportDialogData child, ExportDialogData parent, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
        {
            KortistoNpc npc = flexFieldObject as KortistoNpc;
            if(npc == null)
            {
                return Task.FromResult<string>(null);
            }

            TextNode textNode = GetValidTextNode(parent);
            if(textNode == null)
            {
                return Task.FromResult<string>(null);
            }

            return Task.FromResult(ExportUtil.BuildTextPreview(textNode.Text));
        }

        /// <summary>
        /// Returns if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (templateType == TemplateType.TalePlayerTextLine && _isPlayerLine) || (templateType == TemplateType.TaleNpcTextLine && !_isPlayerLine);
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
                ExportUtil.CreatePlaceHolder(Placeholder_TextLine, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_TextLine_LangKey, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_TextLine_Preview, _localizer)
            });

            return placeholders;
        }
    }
}