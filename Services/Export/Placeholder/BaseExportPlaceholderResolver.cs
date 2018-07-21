using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// BaseExport Placeholder Resolver
    /// </summary>
    public class BaseExportPlaceholderResolver 
    {
        /// <summary>
        /// Localizer
        /// </summary>
        protected readonly IStringLocalizer _localizer;

        /// <summary>
        /// Error Collection
        /// </summary>
        protected ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizer">Localizer</param>
        public BaseExportPlaceholderResolver(IStringLocalizer localizer)
        {
            _localizer = localizer;
            _errorCollection = null;
        }

        /// <summary>
        /// Sets the error message collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        public void SetErrorMessageCollection(ExportPlaceholderErrorCollection errorCollection)
        {
            _errorCollection = errorCollection;
        }

        /// <summary>
        /// Creates a new placeholder
        /// </summary>
        /// <param name="placeholderName">Placeholder Name</param>
        /// <returns>Export Template Placeholder</returns>
        protected ExportTemplatePlaceholder CreatePlaceHolder(string placeholderName)
        {
            return ExportUtil.CreatePlaceHolder(placeholderName, _localizer);
        }
    }
}