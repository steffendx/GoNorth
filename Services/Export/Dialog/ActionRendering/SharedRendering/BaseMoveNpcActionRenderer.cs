using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Karta;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base class for rendering a move npc action
    /// </summary>
    public abstract class BaseMoveNpcActionRenderer : BaseActionRenderer<MoveNpcActionData>
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Id of the direct continue node
        /// </summary>
        private const int DirectContinueFunctionNodeId = 1;


        /// <summary>
        /// true if a teleportation happens, false if its a movement
        /// </summary>
        protected readonly bool _isTeleport;

        /// <summary>
        /// true if the player must be moved
        /// </summary>
        protected readonly bool _isPlayer;

        /// <summary>
        /// true if an npc was picked, else false
        /// </summary>
        protected readonly bool _isPickedNpc;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="isTeleport">true if the movement is a teleporation, else false</param>
        /// <param name="isPlayer">true if the player is moved, else false</param>
        /// <param name="isPickedNpc">true if the npc was picked, else false</param>
        public BaseMoveNpcActionRenderer(IExportCachedDbAccess cachedDbAccess, bool isTeleport, bool isPlayer, bool isPickedNpc)
        {
            _cachedDbAccess = cachedDbAccess;

            _isTeleport = isTeleport;
            _isPlayer = isPlayer;
            _isPickedNpc = isPickedNpc;
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
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, MoveNpcActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            KortistoNpc foundNpc = await GetNpc(parsedData, flexFieldObject);
            if(foundNpc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return string.Empty;
            }
            
            KartaMapNamedMarkerQueryResult markerResult = await GetMarker(parsedData);
            if(markerResult == null)
            {
                errorCollection.AddDialogMarkerNotFoundError();
                return string.Empty;
            }

            string directContinueFunction = string.Empty;
            if (data.Children != null)
            {
                ExportDialogDataChild directStep = data.Children.FirstOrDefault(c => c.NodeChildId == DirectContinueFunctionNodeId);
                directContinueFunction = directStep != null ? directStep.Child.DialogStepFunctionName : string.Empty;
            }

            return await FillPlaceholders(template, errorCollection, parsedData, foundNpc, markerResult.MarkerName, directContinueFunction, flexFieldObject, data, nextStep, exportSettings, stepRenderer);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="npc">Npc to move</param>
        /// <param name="markerName">Target marker name</param>
        /// <param name="directContinueFunction">Direct continue function</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, MoveNpcActionData parsedData, KortistoNpc npc, string markerName, string directContinueFunction, 
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
        public override async Task<string> BuildPreviewTextFromParsedData(MoveNpcActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            string verb = "Move";
            if(_isTeleport)
            {
                verb = "Teleport";
            }

            if(!_isTeleport && parent != null && parent.Children != null && child != null)
            {
                ExportDialogDataChild actionChild = parent.Children.FirstOrDefault(c => c.Child.Id == child.Id);
                if(actionChild != null && actionChild.NodeChildId == DirectContinueFunctionNodeId)
                {
                    verb = "Direct Continue On Move";
                }
            }

            string npcName = "npc";
            if(_isPickedNpc)
            {
                KortistoNpc foundNpc = await GetNpc(parsedData, flexFieldObject);
                if(foundNpc == null)
                {
                    errorCollection.AddDialogNpcNotFoundError();
                    return string.Empty;
                }

                npcName = foundNpc.Name;
            }
            else if(_isPlayer)
            {
                npcName = "player";
            }

            KartaMapNamedMarkerQueryResult queryResult = await GetMarker(parsedData);
            string target = queryResult.MarkerName != null ? queryResult.MarkerName : string.Empty;

            return string.Format("{0} {1} to {2}", verb, npcName, target);
        }

        /// <summary>
        /// Returns the currently valid npc for the action
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <returns>Npc</returns>
        private async Task<KortistoNpc> GetNpc(MoveNpcActionData parsedData, FlexFieldObject flexFieldObject)
        {
            if(_isPickedNpc)
            {
                return await _cachedDbAccess.GetNpcById(parsedData.ObjectId);
            }

            if(_isPlayer) 
            {
                GoNorthProject project = await _cachedDbAccess.GetUserProject();
                return await _cachedDbAccess.GetPlayerNpc(project.Id);
            }

            return flexFieldObject as KortistoNpc;
        }

        /// <summary>
        /// Returns the valid marker
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <returns>Marker</returns>
        private async Task<KartaMapNamedMarkerQueryResult> GetMarker(MoveNpcActionData parsedData)
        {
            return await _cachedDbAccess.GetMarkerById(parsedData.MapId, parsedData.MarkerId);
        }

        /// <summary>
        /// Returns the next step from a list of children
        /// </summary>
        /// <param name="children">Children to read</param>
        /// <returns>Next Step</returns>
        public override ExportDialogDataChild GetNextStep(List<ExportDialogDataChild> children)
        {
            return children.FirstOrDefault(c => c.NodeChildId != DirectContinueFunctionNodeId);
        }
    }
}