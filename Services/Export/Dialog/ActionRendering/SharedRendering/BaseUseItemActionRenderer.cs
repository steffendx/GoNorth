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
    /// Class for rendering a use item action
    /// </summary>
    public abstract class BaseUseItemActionRenderer : BaseActionRenderer<UseItemActionData>
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
        private readonly bool _isPickNpc;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="isPlayer">True if the action is for the player, else false</param>
        /// <param name="isPickNpc">True if the action is for a pick npc, else false</param>
        public BaseUseItemActionRenderer(IExportCachedDbAccess cachedDbAccess, bool isPlayer, bool isPickNpc)
        {
            _cachedDbAccess = cachedDbAccess;

            _isPlayer = isPlayer;
            _isPickNpc = isPickNpc;
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
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, UseItemActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            IFlexFieldExportable valueItem = await GetItem(parsedData, errorCollection);
            IFlexFieldExportable valueNpc = await GetNpc(flexFieldObject, parsedData, errorCollection);
            if(valueItem == null || valueNpc == null)
            {
                return string.Empty;
            }

            return await FillPlaceholders(template, errorCollection, parsedData, valueItem, valueNpc, flexFieldObject, data, nextStep, exportSettings, stepRenderer);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueItem">Item to export</param>
        /// <param name="valueNpc">Npc to export</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, UseItemActionData parsedData, IFlexFieldExportable valueItem, IFlexFieldExportable valueNpc, 
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
        public override async Task<string> BuildPreviewTextFromParsedData(UseItemActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueItem = await GetItem(parsedData, errorCollection);
            IFlexFieldExportable valueNpc = await GetNpc(flexFieldObject, parsedData, errorCollection);
            if(valueItem == null || valueNpc == null)
            {
                return string.Empty;
            }

            return valueNpc.Name + " uses " + valueItem.Name;
        }


        /// <summary>
        /// Returns the item use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetItem(UseItemActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
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
        /// Returns the npc use
        /// </summary>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetNpc(FlexFieldObject flexFieldObject, UseItemActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            if(_isPickNpc)
            {
                KortistoNpc npc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
                if(npc == null) 
                {
                    errorCollection.AddDialogItemNotFoundError();
                    return null;
                }

                return npc;
            }
            else if(_isPlayer)
            {
                GoNorthProject curProject = await _cachedDbAccess.GetDefaultProject();
                KortistoNpc npc = await _cachedDbAccess.GetPlayerNpc(curProject.Id);
                if(npc == null)
                {
                    errorCollection.AddNoPlayerNpcExistsError();
                    return null;
                }

                return npc;
            }

            return flexFieldObject;
        }

    }
}