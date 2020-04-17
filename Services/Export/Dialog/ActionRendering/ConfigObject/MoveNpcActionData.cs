namespace GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject
{
    /// <summary>
    /// Move npc action data
    /// </summary>
    public class MoveNpcActionData
    {
        /// <summary>
        /// Object id
        /// </summary>
        public string ObjectId { get; set; }
        
        /// <summary>
        /// Map id
        /// </summary>
        public string MapId { get; set; }
        
        /// <summary>
        /// Marker id
        /// </summary>
        public string MarkerId { get; set; }

        /// <summary>
        /// Movement State
        /// </summary>
        public string MovementState { get; set; }
    }

}