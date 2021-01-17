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

        /// <summary>
        /// Formats the time as a string
        /// </summary>
        /// <param name="format">Time format</param>
        /// <returns>Formatted Time Value</returns>
        public string ToString(string format)
        {
            return format.Replace("hh", Hours.ToString().PadLeft(2, '0')).Replace("mm", Minutes.ToString().PadLeft(2, '0'));
        }
    }
}