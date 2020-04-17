using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base class for rendering an inventory action
    /// </summary>
    public abstract class BaseInventoryActionRenderer : BaseActionRenderer<InventoryActionData>
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// true if the action renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// true if the action renderer is for a transfer, else false
        /// </summary>
        private readonly bool _isTransfer;
        
        /// <summary>
        /// true if the action renderer is for a removal, else false
        /// </summary>
        private readonly bool _isRemoval;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="isPlayer">True if the action is for the player, else false</param>
        /// <param name="isTransfer">True if the action is for a transfer, false for spawn</param>
        /// <param name="isRemoval">True if the action is for a removal, else false</param>
        public BaseInventoryActionRenderer(IExportCachedDbAccess cachedDbAccess, bool isPlayer, bool isTransfer, bool isRemoval)
        {
            _cachedDbAccess = cachedDbAccess;

            _isPlayer = isPlayer;
            _isTransfer = isTransfer;
            _isRemoval = isRemoval;
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="template">Template to export</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, InventoryActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            IFlexFieldExportable valueObject = await GetItem(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            return await FillPlaceholders(template, errorCollection, parsedData, valueObject, flexFieldObject, data, nextStep, exportSettings, stepRenderer);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueObject">Value object to export</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, InventoryActionData parsedData, IFlexFieldExportable valueObject, FlexFieldObject flexFieldObject, ExportDialogData curStep, 
                                                         ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer);

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(InventoryActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueObject = await GetItem(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string prefix = "";
            if(_isPlayer) 
            {
                prefix = _isRemoval ? "RemoveItemFromPlayerInventory" : (_isTransfer ? "TransferItemToPlayer" :  "SpawnItemInPlayerInventory");
            }
            else
            {
                prefix = _isRemoval ? "RemoveItemFromNpcInventory" : (_isTransfer ? "TransferItemToNpc" :  "SpawnItemInNpcInventory");
            }

            return prefix + " (" + valueObject.Name + ")";
        }

        /// <summary>
        /// Returns the item use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetItem(InventoryActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            StyrItem item = await _cachedDbAccess.GetItemById(parsedData.ItemId);
            if(item == null) 
            {
                errorCollection.AddDialogItemNotFoundError();
                return null;
            }

            return item;
        }

    }
}