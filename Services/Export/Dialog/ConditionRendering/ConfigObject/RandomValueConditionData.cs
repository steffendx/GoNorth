namespace GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject
{
    /// <summary>
    /// Random value Condition Data
    /// </summary>
    public class RandomValueConditionData
    {
        /// <summary>
        /// Compare Operator
        /// </summary>
        public string Operator { get; set; }

        /// <summary>
        /// Min Value
        /// </summary>
        public float MinValue { get; set; }
        
        /// <summary>
        /// Max Value
        /// </summary>
        public float MaxValue { get; set; }
        
        /// <summary>
        /// Compare Value
        /// </summary>
        public float CompareValue { get; set; }
    }
}