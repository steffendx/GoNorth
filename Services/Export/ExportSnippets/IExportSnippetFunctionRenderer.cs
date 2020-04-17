using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.ExportSnippets
{
    /// <summary>
    /// Interface for Services that render export snippet functions
    /// </summary>
    public interface IExportSnippetFunctionRenderer
    {
        /// <summary>
        /// Sets the error colllection
        /// </summary>
        /// <param name="errorCollection">Error collection</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);
        
        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver);

        /// <summary>
        /// Renders a list of export snippet functions
        /// </summary>
        /// <param name="exportSnippet">Export snippet to render</param>
        /// <param name="flexFieldObject">Object to which the snippets belong</param>
        /// <returns>List of export snippet functions</returns>
        Task<List<ExportSnippetFunction>> RenderExportSnippetFunctions(ObjectExportSnippet exportSnippet, FlexFieldObject flexFieldObject);
    }
}