using System.Collections.Generic;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Flex Field Dictionary. Used to provide better feedback to the user if a wrong field is used
    /// </summary>
    public class ScribanFlexFieldDictionary : ScribanExportDefaultableDictionary<ScribanFlexFieldField>
    {
        /// <summary>
        /// Parent object
        /// </summary>
        private readonly ScribanFlexFieldObject _parentObject;

        /// <summary>
        /// Error collection
        /// </summary>
        private ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Builds a missing field that can be returned
        /// </summary>
        /// <param name="key">Key of the field</param>
        /// <returns>Field</returns>
        protected override ScribanFlexFieldField BuildDefaultvalue(string key)
        {
            string missingLabel = "<<" + _parentObject.Name + "[" + key + "] MISSING>>";
            ScribanMissingFlexFieldField field = new ScribanMissingFlexFieldField(missingLabel, key, _parentObject, _errorCollection);
            field.DontExportToScript = false;
            field.Exists = false;

            return field;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="parentObject">Parent object</param>
        /// <param name="errorCollection">Error collection</param>
        public ScribanFlexFieldDictionary(ScribanFlexFieldObject parentObject, ExportPlaceholderErrorCollection errorCollection)
        {
            _parentObject = parentObject;
            _errorCollection = errorCollection;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="parentObject">Parent object</param>
        /// <param name="errorCollection">Error collection</param>
        /// <param name="existingFields">Existing fields to use</param>
        public ScribanFlexFieldDictionary(ScribanFlexFieldObject parentObject, ExportPlaceholderErrorCollection errorCollection, IDictionary<string, ScribanFlexFieldField> existingFields) : base(existingFields)
        {
            _parentObject = parentObject;
            _errorCollection = errorCollection;
        }
    }
}