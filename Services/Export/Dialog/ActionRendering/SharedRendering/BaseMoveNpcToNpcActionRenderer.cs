using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base class for rendering a move npc to npc action
    /// </summary>
    public abstract class BaseMoveNpcToNpcActionRenderer : BaseActionRenderer<MoveNpcToNpcActionData>
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
        /// true if an npc was picked, else false
        /// </summary>
        protected readonly bool _isPickedNpc;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="isTeleport">true if the movement is a teleporation, else false</param>
        /// <param name="isPickedNpc">true if the npc was picked, else false</param>
        public BaseMoveNpcToNpcActionRenderer(IExportCachedDbAccess cachedDbAccess, bool isTeleport, bool isPickedNpc)
        {
            _cachedDbAccess = cachedDbAccess;

            _isTeleport = isTeleport;
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
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, MoveNpcToNpcActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            KortistoNpc foundNpc = await GetNpc(parsedData, flexFieldObject);
            if(foundNpc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return string.Empty;
            }
            
            KortistoNpc targetResult = await GetTargetNpc(parsedData);
            if(targetResult == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return string.Empty;
            }

            string directContinueFunction = string.Empty;
            if (data.Children != null)
            {
                ExportDialogDataChild directStep = data.Children.FirstOrDefault(c => c.NodeChildId == DirectContinueFunctionNodeId);
                directContinueFunction = directStep != null ? directStep.Child.DialogStepFunctionName : string.Empty;
            }

            return await FillPlaceholders(template, errorCollection, parsedData, foundNpc, targetResult, directContinueFunction, flexFieldObject, data, nextStep, exportSettings, stepRenderer);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="npc">Npc to move</param>
        /// <param name="targetNpc">Target npc</param>
        /// <param name="directContinueFunction">Direct continue function</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, MoveNpcToNpcActionData parsedData, KortistoNpc npc, KortistoNpc targetNpc, string directContinueFunction, 
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
        public override async Task<string> BuildPreviewTextFromParsedData(MoveNpcToNpcActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
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

            KortistoNpc targetNpc = await GetTargetNpc(parsedData);
            if(targetNpc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return string.Empty;
            }
            return string.Format("{0} {1} to {2}", verb, npcName, targetNpc.Name);
        }

        /// <summary>
        /// Returns the currently valid npc for the action
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <returns>Npc</returns>
        private async Task<KortistoNpc> GetNpc(MoveNpcToNpcActionData parsedData, FlexFieldObject flexFieldObject)
        {
            if(_isPickedNpc)
            {
                return await _cachedDbAccess.GetNpcById(parsedData.ObjectId);
            }

            return flexFieldObject as KortistoNpc;
        }

        /// <summary>
        /// Returns the target npc
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <returns>Npc</returns>
        private async Task<KortistoNpc> GetTargetNpc(MoveNpcToNpcActionData parsedData)
        {
            return await _cachedDbAccess.GetNpcById(parsedData.NpcId);
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