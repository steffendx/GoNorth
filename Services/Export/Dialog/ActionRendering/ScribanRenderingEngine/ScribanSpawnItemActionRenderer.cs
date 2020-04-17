using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a spawn item action with scriban
    /// </summary>
    public class ScribanSpawnItemActionRenderer : ScribanSpawnObjectAtMarkerActionRenderer
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban Language Key Generator</param>
        /// <param name="localizerFactory">String localizer factor</param>
        public ScribanSpawnItemActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory) : 
                                              base(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)
        {
        }

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected override async Task<IFlexFieldExportable> GetValueObject(SpawnObjectActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
        {
            StyrItem foundItem = await _cachedDbAccess.GetItemById(parsedData.ObjectId);
            if(foundItem == null)
            {
                errorCollection.AddDialogItemNotFoundError();
                return null;
            }

            return foundItem;
        }

    }
}