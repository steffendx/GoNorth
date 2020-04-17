namespace GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject
{
    /// <summary>
    /// Quest State Condition Data
    /// </summary>
    public class QuestStateConditionData
    {
        /// <summary>
        /// Quest Id
        /// </summary>
        public string QuestId { get; set; }

        /// <summary>
        /// State
        /// </summary>
        public int State { get; set; }

        
        /// <summary>
        /// Quest State Not Started
        /// </summary>
        public const int QuestState_NotStarted = 0;

        /// <summary>
        /// Quest State In Progress
        /// </summary>
        public const int QuestState_InProgress = 1;

        /// <summary>
        /// Quest State Success
        /// </summary>
        public const int QuestState_Success = 2;

        /// <summary>
        /// Quest State Failed
        /// </summary>
        public const int QuestState_Failed = 3;
    }
}