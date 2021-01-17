using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ReferenceRenderer
{
    /// <summary>
    /// Interface for Rendering Reference Nodes
    /// </summary>
    public interface IReferenceStepRenderer
    {
        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="project">Project for which the epxort is running</param>
        /// <param name="referenceNodeData">Reference node data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Dialog Step Render Result</returns>
        Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, GoNorthProject project, ReferenceNodeData referenceNodeData, FlexFieldObject flexFieldObject);

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType);
    }
}