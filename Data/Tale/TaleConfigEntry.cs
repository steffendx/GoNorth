
using System;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Tale config entry
    /// </summary>
    public class TaleConfigEntry : IHasModifiedData
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
        /// Key of the config entry
        /// </summary>
        public string Key { get; set; }

        /// <summary>
        /// Config data
        /// </summary>
        public string ConfigData { get; set; }


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
