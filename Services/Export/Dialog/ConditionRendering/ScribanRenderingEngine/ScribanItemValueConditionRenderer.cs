using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban item value condition
    /// </summary>
    public class ScribanItemValueConditionRenderer : ScribanValueConditionBaseRenderer
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="languageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanItemValueConditionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                                 IStringLocalizerFactory localizerFactory) : base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
        }

        /// <summary>
        /// Returns the scriban flex field object for the export
        /// </summary>
        /// <param name="parsedData">Parsed condition</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Scriban export object</returns>
        protected override Task<ScribanFlexFieldObject> GetScribanFlexFieldObject(ValueFieldConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ScribanExportItem convertedItem = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportItem>(null, null, flexFieldObject, exportSettings, errorCollection);
            return Task.FromResult<ScribanFlexFieldObject>(convertedItem);
        }

    }
}