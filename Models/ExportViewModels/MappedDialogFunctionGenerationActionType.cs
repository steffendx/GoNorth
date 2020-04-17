using GoNorth.Services.Export.Dialog.ActionRendering;

namespace GoNorth.Models.ExportViewModels
{
    /// <summary>
    /// Mapped Function Generation Action Type
    /// </summary>
    public class MappedDialogFunctionGenerationActionType
    {
        /// <summary>
        /// Action Type
        /// </summary>
        public ActionType OriginalActionType { get; set; }

        /// <summary>
        /// Value of the Action Type
        /// </summary>
        public int Value { get; set; }

        /// <summary>
        /// Name of the Action Type
        /// </summary>
        public string Name { get; set; }
    }
}