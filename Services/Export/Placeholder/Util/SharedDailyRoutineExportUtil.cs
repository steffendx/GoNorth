using System.Collections.Generic;
using GoNorth.Data.Kortisto;

namespace GoNorth.Services.Export.Placeholder.Util
{
    /// <summary>
    /// Util class for daily routine exporting
    /// </summary>
    public static class SharedDailyRoutineExportUtil
    {
        /// <summary>
        /// Sorts the daily routine of an npc
        /// </summary>
        /// <param name="dailyRoutine">Daily routine to sort</param>
        public static void SortDailyRoutine(List<KortistoNpcDailyRoutineEvent> dailyRoutine)
        {
            if(dailyRoutine == null)
            {
                return;
            }

            dailyRoutine.Sort((d1, d2) =>
            {
                if (d1.EarliestTime == null && d2.EarliestTime != null)
                {
                    return -1;
                }
                else if (d1.EarliestTime != null && d2.EarliestTime == null)
                {
                    return 1;
                }
                else if (d1.EarliestTime == null && d2.EarliestTime == null)
                {
                    return 0;
                }

                if (d1.EarliestTime.Hours < d2.EarliestTime.Hours)
                {
                    return -1;
                }
                else if (d2.EarliestTime.Hours < d1.EarliestTime.Hours)
                {
                    return 1;
                }

                if (d1.EarliestTime.Minutes < d2.EarliestTime.Minutes)
                {
                    return -1;
                }
                else if (d2.EarliestTime.Minutes < d1.EarliestTime.Minutes)
                {
                    return 1;
                }

                return 0;
            });
        }
    }
}