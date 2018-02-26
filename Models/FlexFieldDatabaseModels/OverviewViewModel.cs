using Microsoft.AspNetCore.Mvc.Localization;

namespace GoNorth.Models.FlexFieldDatabaseModels
{
    /// <summary>
    /// Overview model
    /// </summary>
    public class OverviewViewModel
    {
        /// <summary>
        /// Project Name
        /// </summary>
        public IViewLocalizer Localizer { get; set; }

        /// <summary>
        /// true if the current user has template permissions, else false
        /// </summary>
        public bool HasTemplatePermissions { get; set; }

        /// <summary>
        /// Icon of the objects
        /// </summary>
        public string ObjectIcon { get; set; }

        /// <summary>
        /// Name of the controller
        /// </summary>
        public string ControllerName { get; set; }

        /// <summary>
        /// Name of the api controller
        /// </summary>
        public string ApiControllerName { get; set; }
    }
}
