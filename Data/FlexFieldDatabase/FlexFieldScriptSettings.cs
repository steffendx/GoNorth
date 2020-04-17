using System;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Script Settings
    /// </summary>
    public class FlexFieldScriptSettings : IImplementationComparable, ICloneable
    {
        /// <summary>
        /// true if the value should not be exported to a script, else false
        /// </summary>
        [ValueCompareAttribute]
        public bool DontExportToScript { get; set; }

        /// <summary>
        /// Additional Script Names
        /// </summary>
        [ValueCompareAttribute]
        public string AdditionalScriptNames { get; set; }

        /// <summary>
        /// Clones the flex field script settings
        /// </summary>
        /// <returns>Cloned settings</returns>
        public object Clone()
        {
            return new FlexFieldScriptSettings {
                DontExportToScript = this.DontExportToScript,
                AdditionalScriptNames = this.AdditionalScriptNames
            };
        }
    }
}