namespace GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject
{
    /// <summary>
    /// Wait action data
    /// </summary>
    public class WaitActionData
    {
        /// <summary>
        /// Wait Amount
        /// </summary>
        public int WaitAmount { get; set; }

        /// <summary>
        /// Wait Type (Realtime or Gametime)
        /// </summary>
        public string WaitType { get; set; }

        /// <summary>
        /// Wait Unit
        /// </summary>
        public string WaitUnit { get; set; }

        
        /// <summary>
        /// Wait Type for Waiting in Real Time
        /// </summary>
        public const string WaitTypeRealTime = "0";

        /// <summary>
        /// Wait Type for Waiting in Game Time
        /// </summary>
        public const string WaitTypeGameTime = "1";

        /// <summary>
        /// Wait unit for milliseconds
        /// </summary>
        public const string WaitUnitMilliseconds = "0";

        /// <summary>
        /// Wait unit for seconds
        /// </summary>
        public const string WaitUnitSeconds = "1";
        
        /// <summary>
        /// Wait unit for minutes
        /// </summary>
        public const string WaitUnitMinutes = "2";

        /// <summary>
        /// Wait unit for hours
        /// </summary>
        public const string WaitUnitHours = "3";
        
        /// <summary>
        /// Wait unit for days
        /// </summary>
        public const string WaitUnitDays = "4";
    }
}