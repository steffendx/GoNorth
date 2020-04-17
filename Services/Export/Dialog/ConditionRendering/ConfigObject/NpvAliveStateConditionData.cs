namespace GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject
{
    /// <summary>
    /// Npc Alive  State Condition Data
    /// </summary>
    public class NpvAliveStateConditionData
    {
        /// <summary>
        /// Npc Id
        /// </summary>
        public string NpcId { get; set; }

        /// <summary>
        /// Npc State
        /// </summary>
        public int State { get; set; }

        
        /// <summary>
        /// Alive state
        /// </summary>
        public const int State_Alive = 0;

        /// <summary>
        /// Dead state
        /// </summary>
        public const int State_Dead = 1;
    }
}