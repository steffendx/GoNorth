using GoNorth.Data.Exporting;

namespace GoNorth.Models.ExportViewModels
{
    /// <summary>
    /// Maps an export template type to a url
    /// </summary>
    public class ExportTemplateTypeUrl
    {
        /// <summary>
        /// Template Type
        /// </summary>
        public TemplateType TemplateType { get; set; }

        /// <summary>
        /// Form Url
        /// </summary>
        public string FormUrl { get; set; }
    }
}