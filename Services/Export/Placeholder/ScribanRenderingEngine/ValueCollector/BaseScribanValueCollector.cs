using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Interface for Scriban value collectors
    /// </summary>
    public abstract class BaseScribanValueCollector : IScribanExportValueCollector
    {
        /// <summary>
        /// Error Collection
        /// </summary>
        protected ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        public BaseScribanValueCollector()
        {
            _errorCollection = null;
        }

        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error collection to set</param>
        public void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection)
        {
            // Ensure to use most outer error collection
            if(_errorCollection == null)
            {
                _errorCollection = errorCollection;
            }
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public abstract bool IsValidForTemplateType(TemplateType templateType);

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public abstract Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data);

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public abstract List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType);
    }
}