
using System;

namespace GoNorth.Data.ProjectConfig
{
    /// <summary>
    /// Miscellaneous project config, like time settings
    /// </summary>
    public class MiscProjectConfig : IHasModifiedData
    {
        /// <summary>
        /// Id of the config
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the project to which the config belongs
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Hours per day
        /// </summary>
        public int HoursPerDay { get; set; }

        /// <summary>
        /// Minutes per hour
        /// </summary>
        public int MinutesPerHour { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the page
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}
