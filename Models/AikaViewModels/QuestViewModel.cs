namespace GoNorth.Models.AikaViewModels
{
    /// <summary>
    /// Quest Aika Viewmodel
    /// </summary>
    public class QuestViewModel : SharedAikaViewModel
    {
        /// <summary>
        /// True if all fields can have script settings
        /// </summary>
        public bool AllowScriptSettingsForAllFieldTypes { get; set; }
    }
}
