using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Extensions;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers.TextLine
{
    /// <summary>
    /// Legacy class for Rendering Text Lines
    /// </summary>
    public class LegacyTextLineRenderer : LegacyBaseStepRenderer, ITextLineRenderer
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
        /// true if its a player Line, else false
        /// </summary>
        private bool _isPlayerLine;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="isPlayerLine">true if its a player line, else false</param>
        public LegacyTextLineRenderer(ILanguageKeyGenerator languageKeyGenerator, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection, IStringLocalizerFactory localizerFactory, bool isPlayerLine) : 
                                      base(errorCollection, localizerFactory)
        {
            _languageKeyGenerator = languageKeyGenerator;
            _exportSettings = exportSettings;
            _localizer = localizerFactory.Create(typeof(LegacyTextLineRenderer));
            _isPlayerLine = isPlayerLine;
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="npc">Npc object to which the dialog belongs</param>
        /// <param name="textNode">Text node to render</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, KortistoNpc npc, TextNode textNode)
        {
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();
            renderResult.StepCode = ReplaceBaseStepPlaceholders(template.Code, data, data.Children.FirstOrDefault() != null ? data.Children.FirstOrDefault().Child : null);
            renderResult.StepCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TextLine).Replace(renderResult.StepCode, ExportUtil.EscapeCharacters(textNode.Text, _exportSettings.EscapeCharacter, _exportSettings.CharactersNeedingEscaping, _exportSettings.NewlineCharacter));
            renderResult.StepCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TextLine_Preview).Replace(renderResult.StepCode, ExportUtil.BuildTextPreview(textNode.Text));
            renderResult.StepCode = await ExportUtil.BuildPlaceholderRegex(Placeholder_TextLine_LangKey).ReplaceAsync(renderResult.StepCode, async m => {
                return await _languageKeyGenerator.GetDialogTextLineKey(npc.Id, npc.Name, _isPlayerLine ? ExportConstants.LanguageKeyTypePlayer : ExportConstants.LanguageKeyTypeNpc, textNode.Id, textNode.Text);
            });

            return renderResult;
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
                ExportUtil.CreatePlaceHolder(Placeholder_TextLine, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_TextLine_LangKey, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_TextLine_Preview, _localizer)
            });

            return placeholders;
        }
    }
}