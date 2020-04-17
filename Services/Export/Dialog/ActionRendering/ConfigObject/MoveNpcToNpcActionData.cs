namespace GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject
{
    /// <summary>
    /// Move npc to npc action data
    /// </summary>
    public class MoveNpcToNpcActionData
    {
        /// <summary>
        /// Object id
        /// </summary>
        public string ObjectId { get; set; }
        
        /// <summary>
        /// Npc id
        /// </summary>
        public string NpcId { get; set; }

        /// <summary>
        /// Movement State
        /// </summary>
        public string MovementState { get; set; }
    }
}