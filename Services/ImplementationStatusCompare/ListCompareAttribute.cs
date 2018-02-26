using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Kortisto;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Attribute to flag a property as a list which is implementation compare relevant
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ListCompareAttribute : Attribute
    {
        /// <summary>
        /// Language Key used for the label, "" to use default by propertyname
        /// </summary>
        public string LabelKey { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="labelKey">Language Key used for the label, "" to use default by propertyname</param>
        public ListCompareAttribute(string labelKey = "")
        {
            LabelKey = labelKey;
        }
    }
}