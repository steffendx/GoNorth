using System.Collections.Generic;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject
{
    /// <summary>
    /// Group Condition Data
    /// </summary>
    public class GroupConditionData
    {
        /// <summary>
        /// Operator
        /// </summary>
        public int Operator { get; set; }

        /// <summary>
        /// Condition Elements
        /// </summary>
        public List<ParsedConditionData> ConditionElements { get; set; }
    }
}