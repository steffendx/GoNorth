namespace GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject
{
    /// <summary>
    /// Game Time Condition Data
    /// </summary>
    public class GameTimeConditionData
    {
        /// <summary>
        /// Compare Operator
        /// </summary>
        public int Operator { get; set; }

        /// <summary>
        /// Hour
        /// </summary>
        public int Hour { get; set; }
        
        /// <summary>
        /// Minutes
        /// </summary>
        public int Minutes { get; set; }


        /// <summary>
        /// Operator Before
        /// </summary>
        public const int Operator_Before = 0;

        /// <summary>
        /// Operator After
        /// </summary>
        public const int Operator_After = 1;
    }
}