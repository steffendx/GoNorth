namespace GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject
{
    /// <summary>
    /// Set quest state action data
    /// </summary>
    public class SetQuestStateActionData
    {
        /// <summary>
        /// Quest Id
        /// </summary>
        public string QuestId { get; set; }

        /// <summary>
        /// Quest State
        /// </summary>
        public string QuestState { get; set; }


        /// <summary>
        /// Quest State Not Started
        /// </summary>
        public const string QuestState_NotStarted = "0";

        /// <summary>
        /// Quest State In Progress
        /// </summary>
        public const string QuestState_InProgress = "1";

        /// <summary>
        /// Quest State Success
        /// </summary>
        public const string QuestState_Success = "2";

        /// <summary>
        /// Quest State Failed
        /// </summary>
        public const string QuestState_Failed = "3";
    }
}