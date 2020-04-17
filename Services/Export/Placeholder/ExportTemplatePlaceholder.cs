namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Export Template Placeholder
    /// </summary>
    public class ExportTemplatePlaceholder
    {
        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// true if the placeholder must be ignored for autocomplete, else false
        /// </summary>
        public bool IgnoreForAutocomplete { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public ExportTemplatePlaceholder()
        {
            Name = string.Empty;
            Description = string.Empty;
            IgnoreForAutocomplete = false;
        }
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="name">Name of the placeholder</param>
        /// <param name="description">Description of the placeholder</param>
        /// <param name="ignoreForAutocomplete">true if the placeholder must be ignored for autocomplete, else false</param>
        public ExportTemplatePlaceholder(string name, string description, bool ignoreForAutocomplete = false)
        {
            Name = name;
            Description = description;
            IgnoreForAutocomplete = ignoreForAutocomplete;
        }
    }
}