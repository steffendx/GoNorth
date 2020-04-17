using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Class for rendering a set target npc state action
    /// </summary>
    public abstract class BaseChangeTargetNpcStateActionRenderer : BaseActionRenderer<ChangeTargetNpcStateActionData>
    {
        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(ChangeTargetNpcStateActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueObject = flexFieldObject as IFlexFieldExportable;
            if(valueObject == null)
            {
                return Task.FromResult(string.Empty);
            }

            return Task.FromResult("SetTargetNpcState (" + valueObject.Name + ", " + ExportUtil.BuildTextPreview(parsedData.ObjectState) + ")");
        }

    }
}