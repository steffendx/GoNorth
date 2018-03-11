using Microsoft.AspNetCore.Mvc.Localization;

namespace GoNorth.Models.FlexFieldDatabaseModels
{
    /// <summary>
    /// Object Form Related Objects Viewmodel
    /// </summary>
    public class ObjectFormRelatedObjectsViewModel
    {
        /// <summary>
        /// Localizer
        /// </summary>
        public IViewLocalizer Localizer { get; set; }

        /// <summary>
        /// true if the Karta related objects should be hidden
        /// </summary>
        public bool HideKarta { get; set; }
    }
}
