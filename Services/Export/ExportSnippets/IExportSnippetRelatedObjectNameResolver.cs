using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.ExportSnippets
{
    /// <summary>
    /// Interface for classes that can resolve names for related objects of export snippets
    /// </summary>
    public interface IExportSnippetRelatedObjectNameResolver
    {
        /// <summary>
        /// Resolves the reference for object export snippets
        /// </summary>
        /// <param name="exportSnippets">Export snippets</param>
        /// <param name="includeNpcs">True if the npcs should be included</param>
        /// <param name="includeItems">True if the items should be included</param>
        /// <param name="includeSkills">True if the skills should be included</param>
        /// <returns>References</returns>
        Task<List<ObjectExportSnippetReference>> ResolveExportSnippetReferences(List<ObjectExportSnippet> exportSnippets, bool includeNpcs, bool includeItems, bool includeSkills);
    }
}