using System.Collections.Generic;

namespace GoNorth.Models.ExportViewModels
{
    /// <summary>
    /// Manage Template Viewmodel
    /// </summary>
    public class ManageTemplateViewModel
    {
        /// <summary>
        /// Code Editor Theme
        /// </summary>
        public string CodeEditorTheme { get; set; }

        /// <summary>
        /// Script Language
        /// </summary>
        public string ScriptLanguage { get; set; }

        /// <summary>
        /// Template Type Urls
        /// </summary>
        public List<ExportTemplateTypeUrl> TemplateTypeUrls { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public ManageTemplateViewModel()
        {
            TemplateTypeUrls = new List<ExportTemplateTypeUrl>();
        }
    }
}