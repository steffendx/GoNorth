using System;
using System.Threading.Tasks;
using GoNorth.Data.LockService;

namespace GoNorth.Services.TimerJob.JobDefinitions
{
    /// <summary>
    /// Class to cleanup locks
    /// </summary>
    public class LockCleanupTimerJob : ILockCleanupTimerJob
    {
        /// <summary>
        /// Lock Database access
        /// </summary>
        private readonly ILockServiceDbAccess _lockDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="lockDbAccess">Lock Database access</param>
        public LockCleanupTimerJob(ILockServiceDbAccess lockDbAccess)
        {
            _lockDbAccess = lockDbAccess;
        }

        /// <summary>
        /// Returns the optional preferred start time
        /// </summary>
        /// <returns>Preferred Start Time</returns>
        public TimerJobRuntimeConfig GetPreferredStartTime()
        {
            return new TimerJobRuntimeConfig(new TimeSpan(23, 0, 0), true);
        }

        /// <summary>
        /// Returns the interval between run events in minutes
        /// </summary>
        /// <returns>Interval</returns>
        public int GetRunInterval()
        {
            return 1440;
        }

        /// <summary>
        /// Runs the timer job
        /// </summary>
        /// <returns>Task</returns>
        public async Task RunTimerJob()
        {
            await _lockDbAccess.DeleteExpiredLocks();
        }
    }
}
