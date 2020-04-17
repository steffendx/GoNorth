using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.ConditionStep;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers
{
    /// <summary>
    /// Class for Rendering Conditions
    /// </summary>
    public class ExportDialogConditionRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
    {
        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Error collection
        /// </summary>
        private readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// Export Settings
        /// </summary>
        private readonly ExportSettings _exportSettings;

        /// <summary>
        /// String localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Current Project
        /// </summary>
        private readonly GoNorthProject _project;

        /// <summary>
        /// Renderers for the condition
        /// </summary>
        private readonly Dictionary<ExportTemplateRenderingEngine, IConditionStepRenderer> _renderers;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="project">Project</param>
        public ExportDialogConditionRenderer(IExportCachedDbAccess exportCachedDbAccess, ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, ILanguageKeyGenerator languageKeyGenerator, 
                                             IConditionRenderer conditionRenderer, IStringLocalizerFactory localizerFactory, ExportSettings exportSettings, GoNorthProject project)
        {
            _errorCollection = errorCollection;
            _defaultTemplateProvider = defaultTemplateProvider;
            _conditionRenderer = conditionRenderer;
            _exportSettings = exportSettings;
            _localizer = localizerFactory.Create(typeof(ExportDialogConditionRenderer));
            _project = project;

            _renderers = new Dictionary<ExportTemplateRenderingEngine, IConditionStepRenderer> {
                { ExportTemplateRenderingEngine.Legacy, new LegacyConditionStepRenderer(languageKeyGenerator, exportSettings, errorCollection, conditionRenderer, localizerFactory, project) },
                { ExportTemplateRenderingEngine.Scriban, new ScribanConditionStepRenderer(exportCachedDbAccess, exportSettings, errorCollection, conditionRenderer, localizerFactory, project) }
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
            ConditionNode conditionNode = data.Condition;
            if(conditionNode == null)
            {
                return null;
            }
            
            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, TemplateType.TaleCondition);
            if(!_renderers.ContainsKey(template.RenderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ConditionNode", template.RenderingEngine.ToString()));   
            }

            string oldContext = _errorCollection.CurrentErrorContext;
            _errorCollection.CurrentErrorContext = _localizer["ErrorContextCondition"];
            try
            {
                return await _renderers[template.RenderingEngine].RenderDialogStep(template, data, flexFieldObject, conditionNode);
            }
            catch(Exception ex)
            {
                _errorCollection.AddException(ex);
                return new ExportDialogStepRenderResult {
                    StepCode = "<<ERROR_RENDERING_CONDITION>>"
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
        public async Task<string> BuildParentTextPreview(ExportDialogData child, ExportDialogData parent, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
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
                
                string conditionText = await _conditionRenderer.RenderCondition(_project, curCondition, _errorCollection, flexFieldObject, _exportSettings);
                previewForConditions.Add(ExportUtil.BuildTextPreview(conditionText));
            }

            if(parent.Children.Any(c => c.Child == child && c.NodeChildId == ExportConstants.ConditionElseNodeChildId))
            {
                previewForConditions.Add("else");
            }

            return string.Join(", ", previewForConditions);
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
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ConditionNode", renderingEngine.ToString()));   
            }

            return _renderers[renderingEngine].GetPlaceholdersForTemplate(templateType);
        }
    }
}