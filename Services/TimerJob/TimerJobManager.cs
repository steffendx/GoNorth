using System;
using System.Collections.Generic;
using System.Threading;
using GoNorth.Services.TimerJob.JobDefinitions;
using Microsoft.Extensions.Logging;

namespace GoNorth.Services.TimerJob
{
    /// <summary>
    /// Manager for Timerjobs
    /// </summary>
    public class TimerJobManager : ITimerJobManager
    {
        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger<TimerJobManager> _logger;

        /// <summary>
        /// Timer jobs
        /// </summary>
        private readonly List<ITimerJob> _timerJobs;

        /// <summary>
        /// Job Timers
        /// </summary>
        private List<Timer> _timers;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="lockCleanUpTimerJob">Timer job to clean locks</param>
        /// <param name="logger">Logger</param>
        public TimerJobManager(ILockCleanupTimerJob lockCleanUpTimerJob, ILogger<TimerJobManager> logger)
        {
            _timerJobs = new List<ITimerJob>
            {
                lockCleanUpTimerJob
            };

            _logger = logger;
        }

        /// <summary>
        /// Destructor
        /// </summary>
        ~TimerJobManager()
        {
            CleanUpTimerJobs();
        }

        /// <summary>
        /// Cleans up all timer jobs
        /// </summary>
        private void CleanUpTimerJobs()
        {
            if (_timers == null)
            {
                return;
            }

            foreach (Timer curTimer in _timers)
            {
                curTimer.Dispose();
            }
            _timers.Clear();
        }

        /// <summary>
        /// Initializes the timer jobs
        /// </summary>
        public void InitializeTimerJobs()
        {
            CleanUpTimerJobs();

            _timers = new List<Timer>();
            foreach (ITimerJob curTimerJob in _timerJobs)
            {
                TimeSpan offset = TimeSpan.FromSeconds(0);
                TimerJobRuntimeConfig runtimeConfig = curTimerJob.GetPreferredStartTime();
                if(runtimeConfig != null)
                {
                    if(!runtimeConfig.IsAbsoluteTime)
                    {
                        offset = runtimeConfig.Time;
                    }
                    else
                    {
                        offset = GetTimeSpanFromAbsoluteTime(runtimeConfig.Time);
                    }
                }

                Timer jobTimer = new Timer(async (state) =>
                {
                    try
                    {
                        await ((ITimerJob)state).RunTimerJob();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error running timerjob: {0}", curTimerJob.GetType().ToString());
                    }
                }, curTimerJob, offset, TimeSpan.FromMinutes(curTimerJob.GetRunInterval()));

                _timers.Add(jobTimer);
            }
        }

        /// <summary>
        /// Returns the offset for an absolut time
        /// </summary>
        /// <param name="time">Target Time</param>
        /// <returns>Timespan for absolut Time</returns>
        private TimeSpan GetTimeSpanFromAbsoluteTime(TimeSpan time)
        {
            DateTime now = DateTime.Now;
            DateTime refTime = new DateTime(now.Year, now.Month, now.Day, time.Hours, time.Minutes, 0);
            if (time.Hours < now.Hour || (time.Hours == now.Hour && time.Minutes < now.Minute))
            {
                refTime = refTime.AddDays(1);
            }

            TimeSpan runtimeOffset = refTime - now;
            if(runtimeOffset.Ticks < 0)
            {
                return TimeSpan.FromSeconds(0);
            }

            return runtimeOffset;
        }
    }
}
