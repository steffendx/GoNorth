using GoNorth.Models.FlexFieldDatabaseModels;

namespace GoNorth.Models.StyrViewModels
{
    /// <summary>
    /// Item Form Viewmodel
    /// </summary>
    public class ItemViewModel : DetailFormViewModel
    {
        /// <summary>
        /// True if items in items are disabled
        /// </summary>
        public bool DisableItemInventory { get; set; }
    }
}
