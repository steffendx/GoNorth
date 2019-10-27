using System.Collections.Generic;

namespace GoNorth.Models.ExportViewModels
{
    /// <summary>
    /// Function generation condition viewmodel
    /// </summary>
    public class FunctionGenerationConditionViewModel
    {
        /// <summary>
        /// Dialog function generation action types
        /// </summary>
        public List<MappedDialogFunctionGenerationActionType> DialogFunctionGenerationActionTypes { get; set; }

        /// <summary>
        /// Node Types
        /// </summary>
        public string[] NodeTypes { get; set; }

        /// <summary>
        /// Lock Id
        /// </summary>
        public string LockId { get; set; }
    }
}