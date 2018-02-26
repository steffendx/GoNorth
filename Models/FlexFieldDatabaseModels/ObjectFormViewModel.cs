using Microsoft.AspNetCore.Mvc.Localization;

namespace GoNorth.Models.FlexFieldDatabaseModels
{
    /// <summary>
    /// Object Form Viewmodel
    /// </summary>
    public class ObjectFormViewModel
    {
        /// <summary>
        /// Project Name
        /// </summary>
        public IViewLocalizer Localizer { get; set; }
        
        /// <summary>
        /// Icon of the objects
        /// </summary>
        public string ObjectIcon { get; set; }

        /// <summary>
        /// Name of the api controller
        /// </summary>
        public string ApiControllerName { get; set; }
    }
}
