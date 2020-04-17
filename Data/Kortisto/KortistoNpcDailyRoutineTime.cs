using System;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Daily Routine Time
    /// </summary>
    public class KortistoNpcDailyRoutineTime : IImplementationComparable, ICloneable
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

        /// <summary>
        /// Clones the time
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            return new KortistoNpcDailyRoutineTime {
                Hours = this.Hours,
                Minutes = this.Minutes
            };
        }
    }
}