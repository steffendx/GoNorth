using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Interface for Rendering an Export Dialog
    /// </summary>
    public interface IExportDialogRenderer
    {
        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Renders a dialog
        /// </summary>
        /// <param name="exportDialog">Dialog to render</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Result of rendering the dialog</returns>
        Task<ExportDialogRenderResult> RenderDialog(ExportDialogData exportDialog, KortistoNpc npc);
        
        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType);

        /// <summary>
        /// Returns if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        bool HasPlaceholdersForTemplateType(TemplateType templateType);
    }
}