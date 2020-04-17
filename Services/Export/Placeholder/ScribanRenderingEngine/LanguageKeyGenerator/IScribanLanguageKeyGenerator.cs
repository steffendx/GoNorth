using System.Collections.Generic;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator
{
    /// <summary>
    /// Interface for Scriban Language Key Generators
    /// </summary>
    public interface IScribanLanguageKeyGenerator
    {
        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error collection to set</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Returns the Export Template Placeholders for the language key
        /// </summary>
        /// <param name="valuePlaceholdersDesc">Placeholder that is added in the key to describe the possible language keys</param>
        /// <returns>Export Template Placeholder</returns>
        List<ExportTemplatePlaceholder> GetExportTemplatePlaceholders(string valuePlaceholdersDesc);
    }
}