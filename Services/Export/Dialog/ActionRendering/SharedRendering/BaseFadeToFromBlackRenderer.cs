using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base class for rendering a fade to / from black action
    /// </summary>
    public abstract class BaseFadeToFromBlackRenderer : BaseActionRenderer<FadeToFromBlackActionData>
    {
        /// <summary>
        /// true if the renderer is for an action fading to black, false for an action fading back from black
        /// </summary>
        protected readonly bool _isFadingToBlack;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="isFadingToBlack">true if the renderer is for an action fading to black, false for an action fading back from black</param>
        public BaseFadeToFromBlackRenderer(bool isFadingToBlack)
        {
            _isFadingToBlack = isFadingToBlack;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(FadeToFromBlackActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            string label = _isFadingToBlack ? "FadeToBlack" : "FadeFromBlack";
            return Task.FromResult(label + " (" + parsedData.FadeTime.ToString() + ")");
        } 
    }
}