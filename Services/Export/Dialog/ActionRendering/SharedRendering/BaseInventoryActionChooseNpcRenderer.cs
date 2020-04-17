using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base class for rendering an inventory action where the target npc gets choosen
    /// </summary>
    public abstract class BaseInventoryActionChooseNpcRenderer : BaseActionRenderer<InventoryChooseNpcActionData>
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// true if the action renderer is for a removal, else false
        /// </summary>
        private readonly bool _isRemoval;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="isRemoval">True if the action is for a removal, else false</param>
        public BaseInventoryActionChooseNpcRenderer(IExportCachedDbAccess cachedDbAccess, bool isRemoval)
        {
            _cachedDbAccess = cachedDbAccess;

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
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, InventoryChooseNpcActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            IFlexFieldExportable itemObject = await GetItem(parsedData, errorCollection);
            if(itemObject == null)
            {
                return string.Empty;
            }
            IFlexFieldExportable npcObject = await GetNpc(parsedData, errorCollection);
            if(npcObject == null)
            {
                return string.Empty;
            }

            return await FillPlaceholders(template, errorCollection, parsedData, itemObject, npcObject, flexFieldObject, data, nextStep, exportSettings, stepRenderer);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="itemObject">Item that was selected</param>
        /// <param name="npcObject">Npc that was selected</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, InventoryChooseNpcActionData parsedData, IFlexFieldExportable itemObject, IFlexFieldExportable npcObject,
                                                         FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer);

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(InventoryChooseNpcActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable itemObject = await GetItem(parsedData, errorCollection);
            if(itemObject == null)
            {
                return string.Empty;
            }
            
            IFlexFieldExportable npcObject = await GetNpc(parsedData, errorCollection);
            if(npcObject == null)
            {
                return string.Empty;
            }

            string prefix = "";
            if(_isRemoval) 
            {
                prefix = "RemoveItemFromChooseNpcInventory";
            }
            else
            {
                prefix = "SpawnItemFromChooseNpcInventory";
            }

            return prefix + " (" + itemObject.Name + " in " + npcObject.Name + ")";
        }


        /// <summary>
        /// Returns the item to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetItem(InventoryChooseNpcActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            StyrItem item = await _cachedDbAccess.GetItemById(parsedData.ItemId);
            if(item == null) 
            {
                errorCollection.AddDialogItemNotFoundError();
                return null;
            }

            return item;
        }
        
        /// <summary>
        /// Returns the npc to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetNpc(InventoryChooseNpcActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            KortistoNpc npc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
            if(npc == null) 
            {
                errorCollection.AddDialogNpcNotFoundError();
                return null;
            }

            return npc;
        }
    }
}