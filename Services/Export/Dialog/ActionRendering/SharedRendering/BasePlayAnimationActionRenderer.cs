using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base class for rendering a play animation action
    /// </summary>
    public abstract class BasePlayAnimationActionRenderer : BaseActionRenderer<PlayAnimationActionData>
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// true if the renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="isPlayer">true if the renderer is for the player, else false</param>
        public BasePlayAnimationActionRenderer(IExportCachedDbAccess cachedDbAccess, bool isPlayer)
        {
            _cachedDbAccess = cachedDbAccess;
            _isPlayer = isPlayer;
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
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, PlayAnimationActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            IFlexFieldExportable valueObject = await GetNpc(flexFieldObject, errorCollection);
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
        /// <param name="valueObject">Value object to use</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, PlayAnimationActionData parsedData, IFlexFieldExportable valueObject, FlexFieldObject flexFieldObject, 
                                                         ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer);

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(PlayAnimationActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueObject = await GetNpc(flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            return "PlayAnimation (" + valueObject.Name + ", " + ExportUtil.BuildTextPreview(parsedData.AnimationName) + ")";
        }

        /// <summary>
        /// Returns the npc to use
        /// </summary>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetNpc(FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
        {
            if(_isPlayer)
            {
                GoNorthProject curProject = await _cachedDbAccess.GetUserProject();
                flexFieldObject = await _cachedDbAccess.GetPlayerNpc(curProject.Id);
                if(flexFieldObject == null)
                {
                    errorCollection.AddNoPlayerNpcExistsError();
                    return null;
                }
            }

            return flexFieldObject;
        }

    }
}