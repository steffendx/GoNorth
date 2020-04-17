namespace GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject
{
    /// <summary>
    /// Spawn object action data
    /// </summary>
    public class SpawnObjectActionData
    {
        /// <summary>
        /// Object Id
        /// </summary>
        public string ObjectId { get; set; }
        
        /// <summary>
        /// Map Id
        /// </summary>
        public string MapId { get; set; }
        
        /// <summary>
        /// Marker Id
        /// </summary>
        public string MarkerId { get; set; }
        
        /// <summary>
        /// Marker Type
        /// </summary>
        public string MarkerType { get; set; }
        
        /// <summary>
        /// Pitch
        /// </summary>
        public float Pitch { get; set; }
        
        /// <summary>
        /// Yaw
        /// </summary>
        public float Yaw { get; set; }
        
        /// <summary>
        /// Roll
        /// </summary>
        public float Roll { get; set; }
    }
}