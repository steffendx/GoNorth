using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.Choice;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers
{
    /// <summary>
    /// Class for Rendering Choices
    /// </summary>
    public class ExportDialogChoiceRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
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
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// String localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Current Project
        /// </summary>
        private readonly GoNorthProject _project;

        /// <summary>
        /// Renderers for the choice
        /// </summary>
        private readonly Dictionary<ExportTemplateRenderingEngine, IChoiceRenderer> _renderers;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban Language key generator</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="project">Project</param>
        public ExportDialogChoiceRenderer(IExportCachedDbAccess exportCachedDbAccess, ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, ILanguageKeyGenerator languageKeyGenerator, 
                                          IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IConditionRenderer conditionRenderer, IStringLocalizerFactory localizerFactory, ExportSettings exportSettings, 
                                          GoNorthProject project)
        {
            _errorCollection = errorCollection;
            _defaultTemplateProvider = defaultTemplateProvider;
            _conditionRenderer = conditionRenderer;
            _localizer = localizerFactory.Create(typeof(ExportDialogChoiceRenderer));
            _project = project;

            _renderers = new Dictionary<ExportTemplateRenderingEngine, IChoiceRenderer> {
                { ExportTemplateRenderingEngine.Legacy, new LegacyChoiceRenderer(languageKeyGenerator, exportSettings, errorCollection, conditionRenderer, localizerFactory, project) },
                { ExportTemplateRenderingEngine.Scriban, new ScribanChoiceRenderer(exportCachedDbAccess, exportSettings, errorCollection, scribanLanguageKeyGenerator, conditionRenderer, localizerFactory, project) }
            };
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _conditionRenderer.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
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

            TaleChoiceNode choiceNode = data.Choice;
            if(choiceNode == null)
            {
                return null;
            }
            
            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, TemplateType.TaleChoice);
            if(!_renderers.ContainsKey(template.RenderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ChoiceNode", template.RenderingEngine.ToString()));   
            }

            string oldContext = _errorCollection.CurrentErrorContext;
            _errorCollection.CurrentErrorContext = _localizer["ErrorContextChoice"];
            try
            {
                return await _renderers[template.RenderingEngine].RenderDialogStep(template, data, npc, choiceNode);
            }
            catch(Exception ex)
            {
                _errorCollection.AddException(ex);
                return new ExportDialogStepRenderResult {
                    StepCode = "<<ERROR_RENDERING_CHOICE>>"
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
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Parent text preview for the dialog step</returns>
        public Task<string> BuildParentTextPreview(ExportDialogData child, ExportDialogData parent, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
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
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ChoiceNode", renderingEngine.ToString()));   
            }

            return _renderers[renderingEngine].GetPlaceholdersForTemplate(templateType);
        }
    }
}