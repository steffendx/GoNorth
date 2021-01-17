using System;

namespace GoNorth.Services.TimerJob
{
    /// <summary>
    /// Configuration for the runtime of timerjobs
    /// </summary>
    public class TimerJobRuntimeConfig
    {
        /// <summary>
        /// Time component
        /// </summary>
        public TimeSpan Time { get; set; }

        /// <summary>
        /// True if the time component is a time, else its an offset
        /// </summary>
        public bool IsAbsoluteTime { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="time">Time Component</param>
        /// <param name="isAbsoluteTime">True if the time component is a time, else its an offset</param>
        public TimerJobRuntimeConfig(TimeSpan time, bool isAbsoluteTime)
        {
            Time = time;
            IsAbsoluteTime = isAbsoluteTime;
        }
    }
}
