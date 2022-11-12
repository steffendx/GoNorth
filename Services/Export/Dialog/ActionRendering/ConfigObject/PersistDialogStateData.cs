namespace GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject
{
    /// <summary>
    /// Persist dialog state action data
    /// </summary>
    public class PersistDialogStateActionData
    {
        /// <summary>
        /// True if the dialog must be ended else false
        /// </summary>
        public bool? EndDialog { get; set; }
    }
}