using System.Collections.Generic;
using GoNorth.Services.Export.Dialog.ActionRendering.Localization;

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
        /// Action Translator
        /// </summary>
        public IActionTranslator ActionTranslator { get; set; }

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