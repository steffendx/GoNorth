using GoNorth.Data.Exporting;
using Microsoft.AspNetCore.Mvc.Localization;

namespace GoNorth.Models.FlexFieldDatabaseModels
{
    /// <summary>
    /// Object Form Buttons Viewmodel
    /// </summary>
    public class ObjectFormButtonsViewModel
    {
        /// <summary>
        /// Localizer
        /// </summary>
        public IViewLocalizer Localizer { get; set; }

        /// <summary>
        /// Export Template Type
        /// </summary>
        public TemplateType ExportTemplateType { get; set; }
    }
}
