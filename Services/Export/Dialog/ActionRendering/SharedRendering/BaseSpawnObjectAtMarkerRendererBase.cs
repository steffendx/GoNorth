using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Karta;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base Class for rendering a spawn object action
    /// </summary>
    public abstract class BaseSpawnObjectAtMarkerRendererBase : BaseActionRenderer<SpawnObjectActionData>
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        public BaseSpawnObjectAtMarkerRendererBase(IExportCachedDbAccess cachedDbAccess)
        {
            _cachedDbAccess = cachedDbAccess;
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
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, SpawnObjectActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            IFlexFieldExportable valueObject = await GetValueObject(parsedData, flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            KartaMapNamedMarkerQueryResult markerResult = await GetMarker(parsedData);
            if(markerResult == null)
            {
                errorCollection.AddDialogMarkerNotFoundError();
                return string.Empty;
            }

            return await FillPlaceholders(template, errorCollection, parsedData, valueObject, markerResult, flexFieldObject, data, nextStep, exportSettings, stepRenderer);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueObject">Value object</param>
        /// <param name="marker">Marker at which to spawn the object</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, SpawnObjectActionData parsedData, IFlexFieldExportable valueObject, KartaMapNamedMarkerQueryResult marker, 
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
        public override async Task<string> BuildPreviewTextFromParsedData(SpawnObjectActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueObject = await GetValueObject(parsedData, flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            KartaMapNamedMarkerQueryResult markerResult = await GetMarker(parsedData);
            if(markerResult == null)
            {
                return string.Empty;
            }

            return string.Format("Spawn {0} at {0}", valueObject.Name, markerResult.MarkerName);
        }

        /// <summary>
        /// Returns the valid marker
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <returns>Marker</returns>
        private async Task<KartaMapNamedMarkerQueryResult> GetMarker(SpawnObjectActionData parsedData)
        {
            return await _cachedDbAccess.GetMarkerById(parsedData.MapId, parsedData.MarkerId);
        }

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected abstract Task<IFlexFieldExportable> GetValueObject(SpawnObjectActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection);
    }
}