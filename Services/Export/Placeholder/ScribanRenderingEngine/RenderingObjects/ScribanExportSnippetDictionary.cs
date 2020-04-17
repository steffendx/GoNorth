using System.Collections.Generic;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Export snippet Dictionary. Used to provide better feedback to the user if a wrong field is used
    /// </summary>
    public class ScribanExportSnippetDictionary : ScribanExportDefaultableDictionary<ScribanExportSnippet>
    {
        /// <summary>
        /// Builds a missing field that can be returned
        /// </summary>
        /// <param name="key">Key of the field</param>
        /// <returns>Field</returns>
        protected override ScribanExportSnippet BuildDefaultvalue(string key)
        {
            ScribanExportSnippet exportSnippet = new ScribanExportSnippet();
            exportSnippet.Name = key;
            exportSnippet.Exists = false;
            exportSnippet.AllFunctions = new List<ScribanExportSnippetFunction>();
            exportSnippet.InitialFunction = new ScribanExportSnippetFunction();
            exportSnippet.AdditionalFunctions = new List<ScribanExportSnippetFunction>();

            return exportSnippet;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public ScribanExportSnippetDictionary()
        {
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="existingFields">Existing fields to use</param>
        public ScribanExportSnippetDictionary(IDictionary<string, ScribanExportSnippet> existingFields) : base(existingFields)
        {
        }
    }
}