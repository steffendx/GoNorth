using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.StepRenderers.TextLine
{
    /// <summary>
    /// Scriban class for Rendering Text Lines
    /// </summary>
    public class ScribanTextLineRenderer : ScribanBaseStepRenderer, ITextLineRenderer
    {
        /// <summary>
        /// Text line Key
        /// </summary>
        private const string TextLineKey = "text_line";

        /// <summary>
        /// Export cached Db access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _languageKeyGenerator;


        /// <summary>
        /// true if its a player Line, else false
        /// </summary>
        private bool _isPlayerLine;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="isPlayerLine">true if its a player line, else false</param>
        public ScribanTextLineRenderer(IExportCachedDbAccess exportCachedDbAccess, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                       IStringLocalizerFactory localizerFactory, bool isPlayerLine) : 
                                       base(errorCollection, exportSettings, localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
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

            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(template.Code, _errorCollection);
            if (parsedTemplate == null)
            {
                return renderResult;
            }

            _languageKeyGenerator.SetErrorCollection(_errorCollection);

            ScribanTextLine textLineData = BuildDialogRenderObject<ScribanTextLine>(data, data.Children.FirstOrDefault() != null ? data.Children.FirstOrDefault().Child : null, npc);
            textLineData.TextLine = ExportUtil.EscapeCharacters(textNode.Text, _exportSettings.EscapeCharacter, _exportSettings.CharactersNeedingEscaping, _exportSettings.NewlineCharacter);
            textLineData.UnescapedTextLine = textNode.Text;
            textLineData.TextLinePreview = ExportUtil.BuildTextPreview(textNode.Text);
            textLineData.IsPlayerLine = _isPlayerLine;

            TemplateContext context = BuildTemplateContext(textLineData);

            renderResult.StepCode = await parsedTemplate.RenderAsync(context);

            return renderResult;
        }

        /// <summary>
        /// Builds the template context for exporting
        /// </summary>
        /// <param name="textLineData">Textline data to export</param>
        /// <returns>Template context</returns>
        private TemplateContext BuildTemplateContext(ScribanTextLine textLineData)
        {
            ScriptObject exportObject = new ScriptObject();
            exportObject.Add(TextLineKey, textLineData);
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
            List<ExportTemplatePlaceholder> placeholders = _languageKeyGenerator.GetExportTemplatePlaceholders(string.Format("{0}.{1}", TextLineKey, StandardMemberRenamer.Rename(nameof(ScribanTextLine.TextLine))));
            
            placeholders.AddRange(GetNodePlaceholders<ScribanTextLine>(TextLineKey));

            return placeholders;
        }
    }
}