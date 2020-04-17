using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// class for dispatching condition rendering to the different rendering engines
    /// </summary>
    public class ConditionRendererDispatcher
    {
        /// <summary>
        /// Template Type of the condition renderer
        /// </summary>
        private readonly TemplateType _templateType;

        /// <summary>
        /// Export template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _templateProvider;

        /// <summary>
        /// Condition renderers
        /// </summary>
        private readonly Dictionary<ExportTemplateRenderingEngine, IConditionElementRenderer> _renderers;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templateType">Template type that is used for the dispatching</param>
        /// <param name="templateProvider">Export template provider</param>
        /// <param name="legacyRenderer">Legacy condition renderer</param>
        /// <param name="scribanRenderer">Scriban condition renderer</param>
        public ConditionRendererDispatcher(TemplateType templateType, ICachedExportDefaultTemplateProvider templateProvider, IConditionElementRenderer legacyRenderer, IConditionElementRenderer scribanRenderer)
        {
            _templateType = templateType;
            _templateProvider = templateProvider;

            _renderers = new Dictionary<ExportTemplateRenderingEngine, IConditionElementRenderer> {
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
            foreach(IConditionElementRenderer curRenderer in _renderers.Values)
            {
                curRenderer.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
            }
        }

        /// <summary>
        /// Builds a single condition element
        /// </summary>
        /// <param name="condition">Current Condition</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition Build Result</returns>
        public async Task<string> BuildSingleConditionElement(ParsedConditionData condition, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate template = await _templateProvider.GetDefaultTemplateByType(project.Id, _templateType);

            if(!_renderers.ContainsKey(template.RenderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for Condition {1}", template.RenderingEngine.ToString(), _templateType.ToString()));   
            }

            return await _renderers[template.RenderingEngine].BuildSingleConditionElement(template, condition, project, errorCollection, flexFieldObject, exportSettings);
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
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for Condition {1}", renderingEngine.ToString(), _templateType.ToString()));   
            }

            return _renderers[renderingEngine].GetExportTemplatePlaceholdersForType(templateType);
        }
    }
}