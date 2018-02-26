using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Kortisto;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Attribute to flag a property as implementation compare relevant
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ValueCompareAttribute : Attribute
    {
        /// <summary>
        /// Language Key used for the label, "" to use default by propertyname
        /// </summary>
        public string LabelKey { get; set; }

        /// <summary>
        /// Language Key used for the text, "" to use default
        /// </summary>
        public string TextKey { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="labelKey">Language Key used for the label, "" to use default by propertyname</param>
        /// <param name="textKey">Language Key used for the text, "" to use default</param>
        public ValueCompareAttribute(string labelKey = "", string textKey = "")
        {
            LabelKey = labelKey;
            TextKey = textKey;
        }
    }
}