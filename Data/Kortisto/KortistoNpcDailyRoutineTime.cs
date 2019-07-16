using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Daily Routine Time
    /// </summary>
    public class KortistoNpcDailyRoutineTime : IImplementationComparable
    {
        /// <summary>
        /// Hours of the time
        /// </summary>
        [ValueCompareAttribute]
        public int Hours { get; set; }
        
        /// <summary>
        /// Minutes of the time
        /// </summary>
        [ValueCompareAttribute]
        public int Minutes { get; set; }
    }
}