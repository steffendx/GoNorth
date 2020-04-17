using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ConditionStep
{
    /// <summary>
    /// Interface for Rendering Condition steps
    /// </summary>
    public interface IConditionStepRenderer
    {
        /// <summary>
        /// Renders a condition step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="conditionNode">Condition node to render</param>
        /// <returns>Dialog Step Render Result</returns>
        Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, FlexFieldObject flexFieldObject, ConditionNode conditionNode);

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType);
    }
}