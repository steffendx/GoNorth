using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.StepRenderers
{
    /// <summary>
    /// Base Class for Rendering Dialog Steps
    /// </summary>
    public class ExportDialogBaseStepRenderer
    {
        /// <summary>
        /// Export template placeholder resolver
        /// </summary>
        protected IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        public ExportDialogBaseStepRenderer()
        {
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public virtual void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver; 
        }
    }
}