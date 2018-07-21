using System.Collections.Generic;
using GoNorth.Services.Export.Dialog.ActionRendering;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Dialog Node Function Generation Condition Element
    /// </summary>
    public class DialogFunctionGenerationConditionElement
    {
        /// <summary>
        /// Condition Type
        /// </summary>
        public DialogFunctionGenerationConditionType ConditionType { get; set; }

        /// <summary>
        /// Node Type
        /// </summary>
        public string NodeType { get; set; }

        /// <summary>
        /// Action Type
        /// </summary>
        public ActionType ActionType { get; set; }

        /// <summary>
        /// Group Operator
        /// </summary>
        /// <value></value>
        public DialogFunctionGenerationConditionGroupOperator GroupOperator { get; set; }

        /// <summary>
        /// Condition Elements
        /// </summary>
        public List<DialogFunctionGenerationConditionElement> ConditionElements { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public DialogFunctionGenerationConditionElement()
        {
            ConditionElements = new List<DialogFunctionGenerationConditionElement>();
        }
    };
}