using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.StepRenderers.Choice
{
    /// <summary>
    /// Interface for Rendering Choices
    /// </summary>
    public interface IChoiceRenderer
    {
        /// <summary>
        /// Renders a choice step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="npc">Npc object to which the dialog belongs</param>
        /// <param name="choiceNode">Choice node to render</param>
        /// <returns>Dialog Step Render Result</returns>
        Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, KortistoNpc npc, TaleChoiceNode choiceNode);

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType);
    }
}