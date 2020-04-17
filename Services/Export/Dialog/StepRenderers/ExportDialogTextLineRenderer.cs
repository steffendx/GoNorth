using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.TextLine;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers
{
    /// <summary>
    /// Class for Rendering Text Lines
    /// </summary>
    public class ExportDialogTextLineRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
    {
        /// <summary>
        /// Error collection
        /// </summary>
        private readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;
        
        /// <summary>
        /// String localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Current Project
        /// </summary>
        private readonly GoNorthProject _project;

        /// <summary>
        /// true if its a player Line, else false
        /// </summary>
        private readonly bool _isPlayerLine;

        /// <summary>
        /// Renderers for the text lines
        /// </summary>
        private readonly Dictionary<ExportTemplateRenderingEngine, ITextLineRenderer> _renderers;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="project">Project</param>
        /// <param name="isPlayerLine">true if its a player line, else false</param>
        public ExportDialogTextLineRenderer(IExportCachedDbAccess exportCachedDbAccess, ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, ILanguageKeyGenerator languageKeyGenerator, 
                                            IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, ExportSettings exportSettings, GoNorthProject project, 
                                            bool isPlayerLine)
        {
            _errorCollection = errorCollection;
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(ExportDialogTextLineRenderer));
            _project = project;
            _isPlayerLine = isPlayerLine;

            _renderers = new Dictionary<ExportTemplateRenderingEngine, ITextLineRenderer> {
                { ExportTemplateRenderingEngine.Legacy, new LegacyTextLineRenderer(languageKeyGenerator, exportSettings, errorCollection, localizerFactory, isPlayerLine) },
                { ExportTemplateRenderingEngine.Scriban, new ScribanTextLineRenderer(exportCachedDbAccess, exportSettings, errorCollection, scribanLanguageKeyGenerator, localizerFactory, isPlayerLine) }
            };
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
            if(!_renderers.ContainsKey(template.RenderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for TextNode", template.RenderingEngine.ToString()));   
            }

            string oldContext = _errorCollection.CurrentErrorContext;
            _errorCollection.CurrentErrorContext = _localizer[_isPlayerLine ? "ErrorContextPlayerLine" : "ErrorContextNpcLine"];
            try
            {
                return await _renderers[template.RenderingEngine].RenderDialogStep(template, data, npc, textNode);
            }
            catch(Exception ex)
            {
                _errorCollection.AddException(ex);
                return new ExportDialogStepRenderResult {
                    StepCode = _isPlayerLine ? "<<ERROR_RENDERING_PLAYER_TEXTLINE>>" : "<<ERROR_RENDERING_NPC_TEXTLINE>>"
                };
            }
            finally
            {
                _errorCollection.CurrentErrorContext = oldContext;
            }
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
        /// <param name="renderingEngine">Rendering engine</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine)
        {
            if(!HasPlaceholdersForTemplateType(templateType))
            {
                return new List<ExportTemplatePlaceholder>();
            }

            if(!_renderers.ContainsKey(renderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for TextNode", renderingEngine.ToString()));   
            }

            return _renderers[renderingEngine].GetPlaceholdersForTemplate(templateType);
        }
    }
}