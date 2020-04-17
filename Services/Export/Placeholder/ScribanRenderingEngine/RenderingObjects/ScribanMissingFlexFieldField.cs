namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Flex Field Data to export to scriban for a missing field
    /// </summary>
    public class ScribanMissingFlexFieldField : ScribanFlexFieldField
    {
        /// <summary>
        /// Name of the field that is missing
        /// </summary>
        private readonly string _missingFieldName;

        /// <summary>
        /// Error collection
        /// </summary>
        private ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Error value to return
        /// </summary>
        public string ErrorValue { get; private set; }

        /// <summary>
        /// Id of the field
        /// </summary>
        public override string Id { get { return ReturnErrorValue(); } set {} }

        /// <summary>
        /// Name of the field
        /// </summary>
        public override string Name { get { return ReturnErrorValue(); } set {} }

        /// <summary>
        /// Value of the field
        /// </summary>
        public override object Value { get { return ReturnErrorValue(); } set {} }

        /// <summary>
        /// Unescaped Value of the field
        /// </summary>
        public override object UnescapedValue { get { return ReturnErrorValue(); } set {} }
        
        /// <summary>
        /// Type of the field
        /// </summary>
        public override string Type { get { return "MISSING"; } set {} }

        /// <summary>
        /// True if the field exists, else false
        /// </summary>
        public override bool Exists { get { return false; } set {} }

        /// <summary>
        /// Returns an error value
        /// </summary>
        /// <returns>Error value</returns>
        private string ReturnErrorValue()
        {
            _errorCollection.AddErrorFlexField(_missingFieldName, ParentObject.Name);
            return ErrorValue;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="errorValue">Error value</param>
        /// <param name="missingFieldName">Missing field name for the error collection</param>
        /// <param name="parentObject">Parent scriban object</param>
        /// <param name="errorCollection">Error collection</param>
        public ScribanMissingFlexFieldField(string errorValue, string missingFieldName, ScribanFlexFieldObject parentObject, ExportPlaceholderErrorCollection errorCollection) : base(parentObject)
        {
            ErrorValue = errorValue;
            _missingFieldName = missingFieldName;
            _errorCollection = errorCollection;
            Exists = false;
        }
    }
}