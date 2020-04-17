using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.StepRenderers.TextLine
{
    /// <summary>
    /// Interface for Rendering Text Lines
    /// </summary>
    public interface ITextLineRenderer
    {
        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="npc">Npc object to which the dialog belongs</param>
        /// <param name="textNode">Text node to render</param>
        /// <returns>Dialog Step Render Result</returns>
        Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, KortistoNpc npc, TextNode textNode);

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType);
    }
}