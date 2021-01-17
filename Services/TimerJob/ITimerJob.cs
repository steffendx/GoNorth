using System.Threading.Tasks;

namespace GoNorth.Services.TimerJob
{
    /// <summary>
    /// Interface for timer jobs
    /// </summary>
    public interface ITimerJob
    {
        /// <summary>
        /// Returns the optional preferred start time
        /// </summary>
        /// <returns>Preferred Start Time</returns>
        TimerJobRuntimeConfig GetPreferredStartTime();

        /// <summary>
        /// Returns the interval between run events in minutes
        /// </summary>
        /// <returns>Interval</returns>
        int GetRunInterval();

        /// <summary>
        /// Runs the timer job
        /// </summary>
        /// <returns>Task</returns>
        Task RunTimerJob();
    }
}
