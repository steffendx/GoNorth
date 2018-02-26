using System;
using System.Collections.Generic;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Flex Field Api Util
    /// </summary>
    public static class FlexFieldApiUtil
    {
        /// <summary>
        /// Sets the field ids for new fields
        /// </summary>
        /// <param name="flexFields">Flex Fields</param>
        public static void SetFieldIdsForNewFields(List<FlexField> flexFields)
        {
            foreach(FlexField curField in flexFields)
            {
                if(string.IsNullOrEmpty(curField.Id))
                {
                    curField.Id = Guid.NewGuid().ToString();
                }
            }
        }

    }
}