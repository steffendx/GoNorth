using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// class for dispatching action rendering to the different rendering engines
    /// </summary>
    public class ActionRendererDispatcher
    {
        /// <summary>
        /// Template Type of the action renderer
        /// </summary>
        private readonly TemplateType _templateType;

        /// <summary>
        /// Export template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _templateProvider;

        /// <summary>
        /// Action renderers
        /// </summary>
        private readonly Dictionary<ExportTemplateRenderingEngine, IActionRenderer> _renderers;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templateType">Template type that is used for the dispatching</param>
        /// <param name="templateProvider">Export template provider</param>
        /// <param name="legacyRenderer">Legacy action renderer</param>
        /// <param name="scribanRenderer">Scriban action renderer</param>
        public ActionRendererDispatcher(TemplateType templateType, ICachedExportDefaultTemplateProvider templateProvider, IActionRenderer legacyRenderer, IActionRenderer scribanRenderer)
        {
            _templateType = templateType;
            _templateProvider = templateProvider;

            _renderers = new Dictionary<ExportTemplateRenderingEngine, IActionRenderer> {
                { ExportTemplateRenderingEngine.Legacy, legacyRenderer },
                { ExportTemplateRenderingEngine.Scriban, scribanRenderer }
            };
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) 
        {
            foreach(IActionRenderer curRenderer in _renderers.Values)
            {
                curRenderer.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
            }
        }

        /// <summary>
        /// Builds an action
        /// </summary>
        /// <param name="action">Current action</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Action Build Result</returns>
        public async Task<string> BuildActionElement(ActionNode action, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            ExportTemplate template = await _templateProvider.GetDefaultTemplateByType(project.Id, _templateType);

            if(!_renderers.ContainsKey(template.RenderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for Action {1}", template.RenderingEngine.ToString(), _templateType.ToString()));   
            }

            return await _renderers[template.RenderingEngine].BuildActionElement(template, action, data, project, errorCollection, flexFieldObject, exportSettings, stepRenderer);
        }

         /// <summary>
        /// Builds the preview text for an action
        /// </summary>
        /// <param name="action">Action</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview Text</returns>
        public async Task<string> BuildPreviewText(ActionNode action, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            return await _renderers[ExportTemplateRenderingEngine.Scriban].BuildPreviewText(action, flexFieldObject, errorCollection, child, parent);
        }

        /// <summary>
        /// Returns true if the renderer has placeholders for a template
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>true if the renderer has placeholders, else false</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return _templateType == templateType;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="renderingEngine">Rendering engine</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine)
        {
            if(!_renderers.ContainsKey(renderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for Action {1}", renderingEngine.ToString(), _templateType.ToString()));   
            }

            return _renderers[renderingEngine].GetExportTemplatePlaceholdersForType(templateType);
        }

        /// <summary>
        /// Returns the next step from a list of children
        /// </summary>
        /// <param name="children">Children to read</param>
        /// <returns>Next Step</returns>
        public ExportDialogDataChild GetNextStep(List<ExportDialogDataChild> children)
        {
            return _renderers[ExportTemplateRenderingEngine.Scriban].GetNextStep(children);
        }
    }
}