namespace GoNorth.Models.FlexFieldDatabaseModels
{
    /// <summary>
    /// Detail Form Viewmodel
    /// </summary>
    public class DetailFormViewModel
    {
        /// <summary>
        /// True if auto save is disabled
        /// </summary>
        public bool DisableAutoSaving { get; set; }

        /// <summary>
        /// True if all fields can have script settings
        /// </summary>
        public bool AllowScriptSettingsForAllFieldTypes { get; set; }
    }
}
